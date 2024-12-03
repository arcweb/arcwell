import db from '@adonisjs/lucid/services/db'
import string from '@adonisjs/core/helpers/string'
import { throwCustomHttpError } from '#exceptions/handler_helper'

export interface DataObject {
  id: string
  type_key: string
  key: string
  value: string
}

export interface TransformedDataObject {
  id: string
  type_key: string
  [key: string]: string
}

export enum DimensionOperatorEnum {
  eq = 'eq',
  gt = 'gt',
  gte = 'gte',
  lt = 'lt',
  lte = 'lte',
  ne = 'ne',
}

function getSqlOperator(operator: string) {
  let result: string = ''
  switch (operator) {
    case DimensionOperatorEnum.eq:
      result = '='
      break
    case DimensionOperatorEnum.gt:
      result = '>'
      break
    case DimensionOperatorEnum.gte:
      result = '>='
      break
    case DimensionOperatorEnum.lt:
      result = '<'
      break
    case DimensionOperatorEnum.lte:
      result = '<='
      break
    case DimensionOperatorEnum.ne:
      result = '<>'
      break
    default:
      throwCustomHttpError(
        {
          title: 'Bad Request',
          code: 'E_BAD_REQUEST',
          detail: 'Unimplemented operator type: ' + operator,
        },
        400
      )
  }
  return result
}

/**
 * Parses filter parameters from a nested object structure and returns an array of parsed filters.
 * Each filter contains a field, operator, and value.
 *
 * @private
 * @param {Record<string, Record<string, string | undefined> | string>} filter - The raw filter object to parse.
 * @returns {{ field: string; operator: string; value: string }[]} - Parsed filter conditions.
 */
export function parseFilters(
  filter: Record<string, Record<string, any | undefined> | string>
): { field: string; operator: string; value: string }[] {
  const result: { field: string; operator: string; value: string }[] = []

  for (const field in filter) {
    if (filter.hasOwnProperty(field)) {
      const operators = filter[field]

      if (typeof operators === 'string') {
        // If operators is a string, it means the operator is missing, so use 'eq' as default
        result.push({ field, operator: 'eq', value: operators })
      } else {
        for (const operator in operators) {
          if (operators.hasOwnProperty(operator) && operators[operator] !== undefined) {
            // TODO: This is to handle arrays for having more than one of the same operator on the same
            // field. We should probably use IN/NOT IN eventually or OR clauses.
            if (Array.isArray(operators[operator])) {
              // Multiple values for an operator. They should be broken out into their own
              // AND clauses, ie, name <> 's' AND name <> 't'
              for (const value of operators[operator]) {
                result.push({ field, operator, value })
              }
            } else {
              const value = operators[operator]!
              result.push({ field, operator, value })
            }
          }
        }
      }
    }
  }

  return result
}

export async function getIdsByDimensionQuery(
  tableName: string,
  typeTableName: string,
  filters: Record<string, any>,
  dims: Record<string, any>
): Promise<string[]> {
  const parsedFilters = filters ? parseFilters(filters) : []
  const parsedDims = dims ? parseFilters(dims) : []

  let rawQueryString = `
    SELECT
      ${tableName}.id AS id
    FROM ${tableName}`
  // TODO: This is causing the query to return no matches if there are just filters and no "dims".
  // Confirm if we need this when we do dimension filtering.
  // JOIN LATERAL jsonb_array_elements(${tableName}.dimensions) AS dimension_element ON true

  let whereClause = ''
  let bindings: Record<string, any> = {}
  let paramIndex = 1

  // Handle standard filters
  for (let filterItem of parsedFilters) {
    const fieldName = string.snakeCase(filterItem.field)
    const paramName = `fieldValue${paramIndex}`

    // TODO: Do we want case insensitivity with strings on eq/ne?
    const sqlOperator = getSqlOperator(filterItem.operator)
    whereClause += whereClause.length === 0 ? ' WHERE ' : ' AND '
    whereClause += `${tableName}.${fieldName} ${sqlOperator} :${paramName}`

    bindings[paramName] = filterItem.value
    paramIndex++
  }

  // Handle dimension filters
  for (let dimItem of parsedDims) {
    const fieldParam = `fieldKey${paramIndex}`
    const valueParam = `fieldValue${paramIndex}`

    // Fetch all possible data types for the dimension key
    const dataTypesResult = await db.rawQuery(
      `
        SELECT DISTINCT schema_element ->> 'dataType' AS data_type
        FROM ${typeTableName},
             jsonb_array_elements(${typeTableName}.dimension_schemas) AS schema_element
        WHERE schema_element ->> 'key' = :dimensionKey
      `,
      { dimensionKey: dimItem.field }
    )

    const dataTypes = dataTypesResult.rows.map((row: { data_type: any }) => row.data_type)

    if (dataTypes.length === 0) {
      throwCustomHttpError(
        {
          title: 'Bad Request',
          code: 'E_BAD_REQUEST',
          detail: `Unknown dimension key: ${dimItem.field}`,
        },
        400
      )
    }

    const sqlOperator = getSqlOperator(dimItem.operator)

    let dataTypeConditions = dataTypes.map((dataType: string) => {
      let valueExpression: string
      const currentValueParam = `${valueParam}_${dataType}` // Unique parameter name per data type

      if (dataType === 'number') {
        const regexPatternParam = `regexPattern${paramIndex}_${dataType}`
        bindings[regexPatternParam] = '^\\d+(\\.\\d+)?$'

        valueExpression = `
          CASE
            WHEN (inner_element ->> 'value') ~ :${regexPatternParam} THEN
              (inner_element ->> 'value')::numeric ${sqlOperator} :${currentValueParam}
            ELSE FALSE
          END
        `
        bindings[currentValueParam] = Number(dimItem.value)
      } else if (dataType === 'boolean') {
        const regexPatternParam = `regexPattern${paramIndex}_${dataType}`
        bindings[regexPatternParam] = '^(true|false)$'

        valueExpression = `
                              CASE
                                WHEN lower(inner_element ->> 'value') ~ :${regexPatternParam} THEN
                                  (inner_element ->> 'value')::boolean ${sqlOperator} :${currentValueParam}
                                ELSE FALSE
                              END
                            `
        // Bind the value as a boolean
        bindings[currentValueParam] = dimItem.value.toLowerCase() === 'true'
      } else if (dataType === 'date') {
        const regexPatternParam = `regexPattern${paramIndex}_${dataType}`
        bindings[regexPatternParam] =
          '^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(Z|[+-]\\d{2}:\\d{2})?)?$'

        valueExpression = `
                              CASE
                                WHEN (inner_element ->> 'value') ~ :${regexPatternParam} THEN
                                  (inner_element ->> 'value')::timestamp ${sqlOperator} :${currentValueParam}
                                ELSE FALSE
                              END
                            `
        bindings[currentValueParam] = dimItem.value
      } else {
        // For strings, no change needed
        valueExpression = `(inner_element ->> 'value') ${sqlOperator} :${currentValueParam}`
        bindings[currentValueParam] = dimItem.value
      }

      return valueExpression
    })

    const combinedDataTypeConditions = dataTypeConditions.join(' OR ')

    whereClause += whereClause.length === 0 ? ' WHERE ' : ' AND '
    whereClause += `
      EXISTS (
        SELECT 1
        FROM jsonb_array_elements(${tableName}.dimensions) AS inner_element
        WHERE
          inner_element ->> 'key' = :${fieldParam}
          AND (${combinedDataTypeConditions})
      )
    `

    bindings[fieldParam] = dimItem.field
    paramIndex++
  }

  // Combine the base query with the dynamically generated WHERE clause
  rawQueryString += whereClause

  // Execute the query using the database client with bindings as an object
  const result = await db.rawQuery(rawQueryString, bindings, {
    mode: 'read',
  })

  return result.rows.map((row: { id: string }) => row.id)
}

import { paramsTripleObjectUUIDValidator, paramsUUIDValidator } from '#validators/common'
import { insertDataFactValidator, updateDataFactValidator } from '#validators/fact'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import string from '@adonisjs/core/helpers/string'
import FactType from '#models/fact_type'

import { throwCustomHttpError } from '#exceptions/handler_helper'
import FactService from '#services/fact_service'
import { validateDimensions } from '#validators/dimension'

interface DataFact {
  fact_id: string
  type_key: string
  observed_at: string
  key: string
  value: string
}

interface TransformedDataFact {
  fact_id: string
  type_key: string
  observed_at: string
  [key: string]: string
}

enum SqlOperatorEnum {
  eq = 'eq',
  gt = 'gt',
  gte = 'gte',
  lt = 'lt',
  lte = 'lte',
  ne = 'ne',
}

/**
 * Transforms the array of DataFact objects into a more structured format where
 * the key-value pairs are grouped under each fact using the fact_id.
 *
 * @private
 * @param {DataFact[]} dataFact - Array of data fact objects.
 * @returns {TransformedDataFact[]} - Transformed array where each fact has the corresponding key-value pairs.
 */
function transformDataFactResponse(dataFact: DataFact[]): TransformedDataFact[] {
  const transformedData: TransformedDataFact[] = []

  dataFact.forEach((item) => {
    // Check if there is an existing transformed fact with the same fact_id
    let existingFact = transformedData.find((fact) => fact.fact_id === item.fact_id)

    // If not, create a new fact and add it to the array
    if (!existingFact) {
      existingFact = {
        fact_id: item.fact_id,
        type_key: item.type_key,
        observed_at: item.observed_at,
      }
      transformedData.push(existingFact)
    }

    // Append the key-value pair to the existing fact
    existingFact[item.key] = item.value
  })

  return transformedData
}

/**
 * Parses filter parameters from a nested object structure and returns an array of parsed filters.
 * Each filter contains a field, operator, and value.
 *
 * @private
 * @param {Record<string, Record<string, string | undefined> | string>} filter - The raw filter object to parse.
 * @returns {{ field: string; operator: string; value: string }[]} - Parsed filter conditions.
 */
function parseFilters(
  filter: Record<string, Record<string, string | undefined> | string>
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
            const value = operators[operator]!
            result.push({ field, operator, value })
          }
        }
      }
    }
  }

  return result
}

export default class DataFactsController {
  /**
   * @insert
   * @summary Insert Fact
   * @description Accepts new Fact data including dimensions for storage in Arcwell data system.
   * Validates the dimensions against the fact's dimension schemas before saving.
   *
   * @async
   * @param {HttpContext} context - The HTTP context containing authentication and request information.
   * @returns {Promise<object>} - Returns the newly created fact along with all related data.
   */
  async insert({ request }: HttpContext): Promise<object> {
    await request.validateUsing(insertDataFactValidator)
    const cleanRequest = request.only([
      'typeKey',
      'observedAt',
      'dimensions',
      'personId',
      'resourceId',
      'eventId',
    ])

    const factType = await FactType.query().where('key', cleanRequest.typeKey).firstOrFail()

    const validationErrorMessage = await validateDimensions(
      cleanRequest.dimensions,
      factType.dimensionSchemas
    )

    if (validationErrorMessage) {
      throwCustomHttpError(
        {
          title: 'Dimension validation failed',
          code: 'E_VALIDATION_ERROR',
          detail: validationErrorMessage,
        },
        400
      )
    }

    return db.transaction(async (trx) => {
      // TODO: Should tags be added?  If so should they delete any that aren't included or just add provided.  (should remove, i believe)
      // TODO: What if empty tags are added, do we delete, or is that considered a "just ignore tags"
      const newFact = await FactService.createFact(trx, cleanRequest)
      return { data: await FactService.getFullFact(newFact.id, trx) }
    })
  }

  /**
   * @update
   * @summary Insert Fact
   * @description Accepts new Fact data including dimensions for storage in Arcwell data system.
   * Validates the dimensions against the fact's dimension schemas before saving updates.
   *
   * @async
   * @param {HttpContext} context - The HTTP context containing authentication, request, and params information.
   * @returns {Promise<object>} - Returns the updated fact along with all related data.
   */
  async update({ request, params }: HttpContext) {
    await request.validateUsing(updateDataFactValidator)
    await paramsUUIDValidator.validate(params)

    const cleanRequest = request.only([
      'typeKey',
      'observedAt',
      'dimensions',
      'personId',
      'resourceId',
      'eventId',
    ])

    if (cleanRequest.dimensions) {
      const factType = await FactType.query().where('key', cleanRequest.typeKey).firstOrFail()

      const validationErrorMessage = await validateDimensions(
        cleanRequest.dimensions,
        factType.dimensionSchemas
      )

      if (validationErrorMessage) {
        throwCustomHttpError(
          {
            title: 'Dimension validation failed',
            code: 'E_VALIDATION_ERROR',
            detail: validationErrorMessage,
          },
          400
        )
        return
      }
    }

    return db.transaction(async (trx) => {
      // TODO: Should tags be added?  If so should they delete any that aren't included or just add provided.  (should remove, i believe)
      // TODO: What if empty tags are added, do we delete, or is that considered a "just ignore tags"
      const updatedFact = await FactService.updateFact(trx, params.id, cleanRequest)
      return { data: await FactService.getFullFact(updatedFact.id, trx) }
    })
  }

  /**
   *
   * @query
   * @summary Query Facts -Handles the retrieval of facts and associated dimensions based on filter and dimension conditions.
   * Supports filtering by both fact attributes and dimension values with various operators.
   * @description Returns facts with dimensions matching search queries.
   * @paramUse(sortable, filterable)
   *
   * @async
   * @param dim Filtering by dimenion
   *
   * Example of params:
   *
   *  /data/query?filter[person_id][eq]=08379671-17e8-42cc-872d-6bac65599eb4&dim[diastolic][gt]=64&dim[systolic][lte]=1000
   *  /data/query?filter[person_id]=d81fb1c5-3d24-45a2-83e2-13e0b08a6a2b&dim[hr][eq]=123123312&dim[systolic][gt]=90&filter[type_key]=blood_pressure_demo_44
   *
   * Use filter[KEY]= or filter[KEY][eq]= for columns on the fact
   * use dim[KEY][OPERATOR]= for dimension key query logic
   *
   * See {SqlOperatorEnum} for valid operators
   *
   *
   * @returns {Promise<object>} - Returns an object containing the filtered facts and their dimensions.
   * @throws {Error} - Throws an error if an unsupported operator is provided or validation fails.
   */
  async query({ request }: HttpContext): Promise<object> {
    const params = request.qs()
    await paramsTripleObjectUUIDValidator.validate(params)

    const filter = params['filter']
    const dim = params['dim']

    const parsedFilters = filter ? parseFilters(filter) : []
    const parsedDims = dim ? parseFilters(dim) : []

    let rawQueryString = `
    SELECT
      facts.id AS fact_id,
      facts.type_key,
      facts.observed_at,
      dimension_element ->> 'key' AS key,
      dimension_element ->> 'value' AS value
    FROM facts
    JOIN LATERAL jsonb_array_elements(facts.dimensions) AS dimension_element ON true
  `

    let whereClause = ''
    let bindings: Record<string, any> = {}
    let paramIndex = 1

    // Handle standard filters
    for (let filterItem of parsedFilters) {
      const fieldName = string.snakeCase(filterItem.field)
      const paramName = `fieldValue${paramIndex}`

      whereClause += whereClause.length === 0 ? ' WHERE ' : ' AND '
      whereClause += `facts.${fieldName} = :${paramName}`

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
        FROM fact_types,
             jsonb_array_elements(fact_types.dimension_schemas) AS schema_element
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

      let sqlOperator: string
      switch (dimItem.operator) {
        case SqlOperatorEnum.eq:
          sqlOperator = '='
          break
        case SqlOperatorEnum.gt:
          sqlOperator = '>'
          break
        case SqlOperatorEnum.gte:
          sqlOperator = '>='
          break
        case SqlOperatorEnum.lt:
          sqlOperator = '<'
          break
        case SqlOperatorEnum.lte:
          sqlOperator = '<='
          break
        case SqlOperatorEnum.ne:
          sqlOperator = '<>'
          break
        default:
          throwCustomHttpError(
            {
              title: 'Bad Request',
              code: 'E_BAD_REQUEST',
              detail: 'Unimplemented operator type: ' + dimItem.operator,
            },
            400
          )
      }

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
        FROM jsonb_array_elements(facts.dimensions) AS inner_element
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

    const transformedData = transformDataFactResponse(result.rows)

    return { data: transformedData }
  }
}

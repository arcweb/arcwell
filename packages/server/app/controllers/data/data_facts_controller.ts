import Fact from '#models/fact'
import { paramsTripleObjectUUIDValidator } from '#validators/common'
import { insertDataFactValidator, updateDataFactValidator } from '#validators/fact'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getFullFact } from '#controllers/facts_controller'
import string from '@adonisjs/core/helpers/string'
import FactType from '#models/fact_type'

import Dimension from '#models/dimension'
import { throwCustomHttpError } from '#exceptions/handler_helper'
import vine from '@vinejs/vine'
import DimensionSchema from '#models/dimension_schema'

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

enum DimensionDataTypeEnum {
  boolean = 'boolean',
  number = 'number',
  date = 'date',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  string = 'string',
}
// Validations
const vineDateUtcSchema = vine.compile(vine.date({ formats: { utc: true } }))
// const vineDateSchema = vine.compile(vine.date())
const vineNumberStringSchema = vine.compile(vine.number({ strict: true }))
const vineBooleanSchema = vine.compile(vine.boolean())

/**
 * Validates a dimension value against its expected data type.
 *
 * @async
 * @param {string} value - The dimension value to validate.
 * @param {string} dataType - The expected data type of the dimension (e.g., 'string', 'boolean', 'number', 'date'). See {DimensionDataTypeEnum}
 * @returns {Promise<string[]>} - Returns an array of error messages if validation fails, or an empty array if the value is valid.
 * @throws {Error} - Throws an error if the data type is unrecognized.
 */
async function validateDimensionSchema(value: string, dataType: string): Promise<string[]> {
  const errors: string[] = []

  switch (dataType.toLowerCase()) {
    case DimensionDataTypeEnum.string:
      if (!vine.helpers.isString(value)) {
        errors.push(`Expected string but got '${value}'`)
      }
      break
    case DimensionDataTypeEnum.boolean:
      try {
        await vineBooleanSchema.validate(value)
      } catch {
        errors.push(`Expected boolean but got '${value}'`)
      }
      break
    case DimensionDataTypeEnum.number:
      try {
        await vineNumberStringSchema.validate(value)
      } catch {
        errors.push(`Expected number but got '${value}'`)
      }
      break
    case DimensionDataTypeEnum.date:
      try {
        await vineDateUtcSchema.validate(value)
      } catch {
        errors.push(`Expected date but got '${value}'`)
      }
      break
    default:
      errors.push(`Unknown data type: '${dataType}'`)
  }

  return errors
}

/**
 * Validates the schema of each dimension against the provided dimension schemas.
 * Ensures required keys are present and values match their expected data types.
 *
 * @private
 * @async
 * @param {Dimension[]} dimensions - Array of dimension objects to validate.
 * @param {DimensionSchema[]} dimensionSchemas - Array of schema objects describing valid dimensions.
 * @returns {Promise<string | null>} - Returns an error message string if validation fails, otherwise null.
 */
async function validateDimensions(
  dimensions: Dimension[],
  dimensionSchemas: DimensionSchema[]
): Promise<string | null> {
  const errors: string[] = []

  // Get all the valid keys from the dimensionSchemas
  const validKeys = dimensionSchemas.map((item) => item.key)

  // Check for missing required keys
  const requiredKeys = dimensionSchemas.filter((item) => item.isRequired).map((item) => item.key)
  const missingKeys = requiredKeys.filter((key) => !dimensions.some((data) => data.key === key))

  if (missingKeys.length > 0) {
    errors.push(`Missing required fields: ${missingKeys.join(', ')}`)
  }

  // Validate each dimension
  for (const dimension of dimensions) {
    // Check if the dimension key exists in the validKeys
    if (!validKeys.includes(dimension.key)) {
      errors.push(`Unexpected dimension key: '${dimension.key}'`)
    } else {
      // If the key is valid, validate its value against the schema
      const dimensionSchema = dimensionSchemas.find((item) => item.key === dimension.key)
      if (dimensionSchema) {
        const validationErrors = await validateDimensionSchema(
          dimension.value,
          dimensionSchema.dataType
        )
        if (validationErrors && validationErrors.length > 0) {
          errors.push(
            `Validation failed for key '${dimension.key}': ${validationErrors.join(', ')}`
          )
        }
      }
    }
  }

  // Return the collected errors, or null if no errors were found
  return errors.length > 0 ? errors.join('; ') : null
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

    let newFact = null as Fact | null

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

    await db.transaction(async (trx) => {
      newFact = new Fact().fill(cleanRequest).useTransaction(trx)
      await newFact.save()

      // TODO: Should tags be added?  If so should they delete any that aren't included or just add provided.  (should remove, i believe)
      // TODO: What if empty tags are added, do we delete, or is that considered a "just ignore tags"
    })

    // Load the full object to return
    let newCreatedFact = null
    if (newFact) {
      newCreatedFact = await getFullFact(newFact.id)
    }

    return { data: newCreatedFact }
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
  async update({ request, params }: HttpContext): Promise<object> {
    await request.validateUsing(updateDataFactValidator)
    const cleanRequest = request.only([
      'typeKey',
      'observedAt',
      'dimensions',
      'personId',
      'resourceId',
      'eventId',
    ])

    let updatedFact = null as Fact | null

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

    await db.transaction(async (trx) => {
      const currentFact = await Fact.findOrFail(params.id)
      updatedFact = await currentFact.merge(cleanRequest).useTransaction(trx).save()

      // TODO: Should tags be added?  If so should they delete any that aren't included or just add provided.  (should remove, i believe)
      // TODO: What if empty tags are added, do we delete, or is that considered a "just ignore tags"
    })

    // Load the full object to return
    let newUpdatedFact = null
    if (updatedFact) {
      newUpdatedFact = await getFullFact(updatedFact.id)
    }

    return { data: newUpdatedFact }
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

    console.log('params=', params)

    const filter = params['filter']
    const dim = params['dim']

    // TODO: The following is the raw query I used, because LATERAL is not supported in knex/lucid. Would prefer query builder support.  See GROUP BY example below
    // SELECT
    //    facts.id AS fact_id,
    //    facts.type_key,
    //    facts.observed_at,
    //    dimension_element ->> 'key' AS key,
    //    dimension_element ->> 'value' AS value
    // FROM facts
    // JOIN LATERAL jsonb_array_elements(facts.dimensions) AS dimension_element ON true
    // WHERE
    //     facts.person_id = 'd81fb1c5-3d24-45a2-83e2-13e0b08a6a2b'
    //     AND EXISTS (
    //         SELECT 1
    //         FROM jsonb_array_elements(facts.dimensions) AS inner_element
    //         WHERE
    //             inner_element ->> 'key' = 'diastolic'
    //             AND (inner_element -> 'value')::numeric > 70.1

    // You can do the same with group but not sure if the selects will work with json commands, e.g. dimension_element ->> 'key' AS key
    // and query building this seems complicated.
    // Here is the equivalent non-literal SQL
    // SELECT
    //    facts.id AS fact_id,
    //    facts.type_key,
    //    facts.observed_at,
    //    dimension_element ->> 'key' AS key,
    //    dimension_element ->> 'value' AS value
    // FROM facts,
    //    jsonb_array_elements(facts.dimensions) AS dimension_element
    // WHERE
    //     facts.person_id = 'd81fb1c5-3d24-45a2-83e2-13e0b08a6a2b'
    //     AND facts.id IN (
    //         SELECT facts.id
    //         FROM facts,
    //             jsonb_array_elements(facts.dimensions) AS inner_element
    //         WHERE
    //             facts.person_id = 'd81fb1c5-3d24-45a2-83e2-13e0b08a6a2b' -- Repeat condition to filter on person_id
    //             AND inner_element ->> 'key' = 'diastolic'
    //             AND (inner_element -> 'value')::numeric > 70.1
    //     )
    // GROUP BY
    //     facts.id,
    //     facts.type_key,
    //     facts.observed_at,
    //     key,
    //     value;

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
    let paramIndex = 1 // Counter to generate unique binding names

    // Handle standard filters
    const parsedFilters = filter ? parseFilters(filter) : []

    for (let filterItem of parsedFilters) {
      const fieldName = string.snakeCase(filterItem.field)
      const paramName = `fieldValue${paramIndex}` // Generate a unique parameter name

      whereClause += whereClause.length === 0 ? ' WHERE ' : ' AND '
      whereClause += `facts.${fieldName} = :${paramName}`

      bindings[paramName] = filterItem.value
      paramIndex++
    }

    // Handle dimension filters
    const parsedDims = dim ? parseFilters(dim) : []

    for (let dimItem of parsedDims) {
      let sqlOperator: string = '='

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
              detail: 'Unimplemented operator type:' + dimItem.operator,
            },
            400
          )
      }

      const fieldParam = `fieldKey${paramIndex}`
      const valueParam = `fieldValue${paramIndex}`

      whereClause += whereClause.length === 0 ? ' WHERE ' : ' AND '
      whereClause += `
                      EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements(facts.dimensions) AS inner_element
                        WHERE
                          inner_element ->> 'key' = :${fieldParam}
                          AND inner_element -> 'value' ${sqlOperator} :${valueParam}
                      )
                    `

      bindings[fieldParam] = dimItem.field
      bindings[valueParam] = dimItem.value
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

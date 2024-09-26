import Fact from '#models/fact'
import { paramsTripleObjectUUIDValidator } from '#validators/common'
import { insertFactValidator } from '#validators/fact'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getFullFact } from '#controllers/facts_controller'
import string from '@adonisjs/core/helpers/string'
import FactType, { DimensionType } from '#models/fact_type'
import Dimension from '#models/dimension'
import { throwCustomHttpError } from '#exceptions/handler_helper'
import vine from '@vinejs/vine'

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

//TODO: Currently returns after first validation error.  Would be better to collect all validation errors and return in the response
export default class DataFactsController {
  private async validateDimensions(
    dimensions: Dimension[],
    dimensionTypes: DimensionType[]
  ): Promise<string | null> {
    const requiredKeys = dimensionTypes.filter((item) => item.isRequired).map((item) => item.key)
    const missingKeys = requiredKeys.filter((key) => !dimensions.some((data) => data.key === key))

    if (missingKeys.length > 0) {
      return `Dimension Validation Failed: Missing required fields: ${missingKeys.join(', ')}`
    }

    for (const dimension of dimensions) {
      const dimensionType = dimensionTypes.find((item) => item.key === dimension.key)
      if (dimensionType) {
        const typeError = await this.validateDimensionType(dimension.value, dimensionType.dataType)
        if (typeError) {
          return `Dimension Validation Failed: ${typeError} for dimension key: ${dimension.key}`
        }
      }
    }

    return null
  }

  vineDateUtcSchema = vine.compile(vine.date({ formats: { utc: true } }))
  vineDateSchema = vine.compile(vine.date())
  vineNumberStringSchema = vine.compile(vine.number({ strict: false }))

  private async validateDimensionType(value: string, dataType: string): Promise<string | null> {
    switch (dataType.toLowerCase()) {
      case 'string':
        // Likely don't need to check for string, since type is string by default.
        if (vine.helpers.isString(value)) {
          return null
        } else {
          return `Expected string but got '${value}'`
        }

      case 'number':
        try {
          await this.vineNumberStringSchema.validate(value)
        } catch (error) {
          return `Expected number but got '${value}'`
        }
        return null

      // TODO: Currently is strict on format.  e.g. 2024-09-20T16:31:13.692+00:00
      // TODO Write a custom validator that is accepting to all date formats we want considered valid?
      case 'date':
        try {
          await this.vineDateUtcSchema.validate(value)
        } catch (error) {
          return `Expected date but got '${value}'`
        }
        return null

      default:
        return `Unknown data type: '${dataType}'`
    }
  }

  private transformDataFact(dataFact: DataFact[]): TransformedDataFact[] {
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

  private parseFilters(filter: Record<string, Record<string, string>>) {
    const result: { field: string; operator: string; value: string }[] = []

    for (const field in filter) {
      if (filter.hasOwnProperty(field)) {
        const operators = filter[field]
        for (const operator in operators) {
          if (operators.hasOwnProperty(operator)) {
            const value = operators[operator]
            result.push({ field, operator, value })
          }
        }
      }
    }

    return result
  }

  /**
   * Handle form submission for the non-admin full features insert  action
   */
  async insert({ auth, request }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(insertFactValidator)
    const cleanRequest = request.only([
      'typeKey',
      'observedAt',
      'info',
      'dimensions',
      'personId',
      'resourceId',
      'eventId',
    ])

    let newFact = null as Fact | null

    const factType = await FactType.query().where('key', cleanRequest.typeKey).firstOrFail()

    const validationErrorMessage = await this.validateDimensions(
      cleanRequest.dimensions,
      factType.dimensionTypes
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

      if (cleanRequest.dimensions) {
        for (const dimension of cleanRequest.dimensions) {
          await newFact.related('dimensions').create(dimension)
        }
      }

      // TODO: Should tags be added?  If so should they delete any that aren't included or just add provided.  (should remove, i beleive)
      // TODO: What if empty tags are added, do we delete, or is that considered a "just ignore tags"
    })

    // Load the full object to return
    let newCreatedFact = null
    if (newFact) {
      newCreatedFact = await getFullFact(newFact.id)
    }

    return { data: newCreatedFact }
  }

  // OLD WAY - {{base_url}}/data/query?person_id=08379671-17e8-42cc-872d-6bac65599eb4
  // NEW WAY - {{base_url}}/data/query?filter=[person_id][eq]=08379671-17e8-42cc-872d-6bac65599eb4
  // DIM - {{base_url}}/data/query?filter[person_id][eq]=08379671-17e8-42cc-872d-6bac65599eb4&dim[diastolic][gt]=64&dim[systolic][lte]=1000

  // https://www.mongodb.com/docs/manual/reference/operator/query/

  // TODO: Update to support numbers and dates, now that validation for those types was added
  async getDimensionsByObjects({ auth, request }: HttpContext) {
    await auth.authenticate()
    const params = request.qs()
    await paramsTripleObjectUUIDValidator.validate(params)

    console.log('params=', params)

    const filter = params['filter']
    const dim = params['dim']

    const dataQuery = db
      .from('dimensions')
      .join('facts', 'dimensions.fact_id', '=', 'facts.id')
      .select(
        'facts.id as fact_id',
        'facts.type_key',
        'facts.observed_at',
        'dimensions.key',
        'dimensions.value'
      )

    console.log('filter=', filter)
    const parsedFilters = filter ? this.parseFilters(filter) : []

    for (let filterItem of parsedFilters) {
      console.log('filterItem=', filterItem)
      console.log('filterItem.field=', filterItem.field)
      const fieldName = string.snakeCase(filterItem.field)
      dataQuery.andWhere(`facts.${fieldName}`, `${filterItem.value}`)
    }

    const parsedDims = dim ? this.parseFilters(dim) : []
    for (let dimItem of parsedDims) {
      // TODO: Check for any SQL injection issues
      const dimFieldName = string.snakeCase(dimItem.field)
      const dimValueNumber = +dimItem.value

      // Works assuming number
      switch (dimItem.operator) {
        case 'eq':
          dataQuery.andWhereIn(
            'facts.id',
            db
              .from('dimensions')
              .select('fact_id')
              .andWhereRaw('key = ? AND CAST("value" as numeric) = ?', [
                dimFieldName,
                dimValueNumber,
              ])
          )
          break
        case 'gt':
          dataQuery.andWhereIn(
            'facts.id',
            db
              .from('dimensions')
              .select('fact_id')
              .andWhereRaw('key = ? AND CAST("value" as numeric) > ?', [
                dimFieldName,
                dimValueNumber,
              ])
          )
          break
        case 'gte':
          dataQuery.andWhereIn(
            'facts.id',
            db
              .from('dimensions')
              .select('fact_id')
              .andWhereRaw('key = ? AND CAST("value" as numeric) >= ?', [
                dimFieldName,
                dimValueNumber,
              ])
          )
          break
        case 'lt':
          dataQuery.andWhereIn(
            'facts.id',
            db
              .from('dimensions')
              .select('fact_id')
              .andWhereRaw('key = ? AND CAST("value" as numeric) < ?', [
                dimFieldName,
                dimValueNumber,
              ])
          )
          break
        case 'lte':
          dataQuery.andWhereIn(
            'facts.id',
            db
              .from('dimensions')
              .select('fact_id')
              .andWhereRaw('key = ? AND CAST("value" as numeric) <= ?', [
                dimFieldName,
                dimValueNumber,
              ])
          )
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
    }

    const result = await dataQuery
    const transformedData = this.transformDataFact(result)

    return { data: transformedData }
  }
}

import Fact from '#models/fact'
import { paramsTripleObjectUUIDValidator } from '#validators/common'
import { insertFactValidator } from '#validators/fact'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getFullFact } from '#controllers/facts_controller'
import string from '@adonisjs/core/helpers/string'

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

export default class DataFactsController {
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

  transformData(data: DataFact[]): TransformedDataFact[] {
    const transformed: Record<string, TransformedDataFact> = {}

    data.forEach((item) => {
      if (!transformed[item.fact_id]) {
        transformed[item.fact_id] = {
          fact_id: item.fact_id,
          type_key: item.type_key,
          observed_at: item.observed_at,
        }
      }

      // Append the key-value pair in the transformed object
      // TODO: We might want to put these under a subgroup for organization and no chance of collision with other root level items
      transformed[item.fact_id][item.key] = item.value
    })

    // Convert the object of transformed facts into an array
    return Object.values(transformed)
  }

  parseFilters(filter: Record<string, Record<string, string>>) {
    const result: { field: string; operator: string; value: string }[] = []

    // Iterate over each field in the filter object
    for (const field in filter) {
      if (filter.hasOwnProperty(field)) {
        const operators = filter[field]
        // Iterate over each operator for the current field
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

  // OLD WAY - {{base_url}}/data/query?person_id=08379671-17e8-42cc-872d-6bac65599eb4
  // NEW WAY - {{base_url}}/data/query?filter=[person_id][eq]=08379671-17e8-42cc-872d-6bac65599eb4

  // https://www.mongodb.com/docs/manual/reference/operator/query/

  // e.g. {{base_url}}/data/query?filter[person_id][eq]=08379671-17e8-42cc-872d-6bac65599eb4&dim[diastolic][gt]=64&dim[systolic][lt]=1000

  async getDimensionsByObjects({ auth, request }: HttpContext) {
    await auth.authenticate()
    const params = request.qs()
    await paramsTripleObjectUUIDValidator.validate(params)

    console.log('params=', params)

    const filter = params['filter']
    const dim = params['dim']

    //
    // const personId = params['person_id']
    // const eventId = params['event_id']
    // const resourceId = params['resource_id']

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
          // dataQuery.andWhereIn(
          //   'facts.id',
          //   db
          //     .from('dimensions')
          //     .select('fact_id')
          //     .where('key', dimFieldName)
          //     .andWhere('value', '>', dimValueNumber)
          // )

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
          throw new Error('Unimplemented operator type:' + dimItem.operator)
      }
    }

    // {{base_url}}/data/query?filter[person_id][eq]=08379671-17e8-42cc-872d-6bac65599eb4&dim[diastolic][gt]=65

    const result = await dataQuery
    const transformedData = this.transformData(result)

    return { data: transformedData }
  }
}

import Fact from '#models/fact'
import FactType from '#models/fact_type'
import { paramsUUIDValidator } from '#validators/common'
import { createFactValidator, updateFactValidator } from '#validators/fact'
import type { HttpContext } from '@adonisjs/core/http'
import { buildApiQuery, buildFactsSort, setTagsForObject } from '#helpers/query_builder'
import db from '@adonisjs/lucid/services/db'

export async function getFullFact(id: string) {
  return Fact.query()
    .where('id', id)
    .preload('factType')
    .preload('tags')
    .preload('person', (person) => {
      person.preload('tags')
      person.preload('user', (user) => {
        user.preload('tags')
      })
    })
    .preload('resource', (resource) => {
      resource.preload('tags')
    })
    .preload('event', (event) => {
      event.preload('tags')
    })
    .firstOrFail()
}

export default class FactsController {
  /**
   * @count
   * @summary Count facts
   * @description Returns the count of total facts
   */
  async count({ auth }: HttpContext) {
    await auth.authenticate()

    const countQuery = db.from('facts').count('*')
    const queryCount = await countQuery.count('*')

    return {
      data: {
        count: +queryCount[0].count,
      },
    }
  }

  /**
   * @index
   * @summary List Facts
   * @description Retrieve a list of Fact records. This method is best used for administrative and management functions. Consider the Data API for querying facts with dimension for statistical and review purposes.
   * @paramUse(sortable, filterable)
   */
  async index({ request, auth }: HttpContext) {
    await auth.authenticate()
    const queryData = request.qs()
    const typeKey = queryData['typeKey']

    let [query, countQuery] = buildApiQuery(Fact.query(), queryData, 'facts')

    query
      .preload('factType')
      .preload('tags')
      .preload('person', (person: any) => {
        person.preload('tags')
        person.preload('user', (user: any) => {
          user.preload('tags')
        })
      })
      .preload('resource', (resource: any) => {
        resource.preload('tags')
      })
      .preload('event', (event: any) => {
        event.preload('tags')
      })

    if (typeKey) {
      const factType = await FactType.findByOrFail('key', typeKey)
      query.where('typeKey', factType.key)
      // DB context use sql column names
      countQuery.where('type_key', factType.key)
    }
    buildFactsSort(query, queryData)

    const queryCount = await countQuery.count('*')

    return {
      data: await query,
      meta: {
        count: +queryCount[0].count,
      },
    }
  }

  /**
   * @store
   * @summary Create Fact
   * @description Create a Fact within Arcwell's data system. This method is intended for administrative and management use. Consider the Data API for inserting facts with dimension for application and statistical purposes.
   */
  async store({ request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createFactValidator)
    const responseFact = await db.transaction(async (trx) => {
      const newFact = new Fact().fill(request.body()).useTransaction(trx)
      await newFact.save()

      const tags = request.only(['tags'])
      if (tags.tags && tags.tags.length > 0) {
        await setTagsForObject(trx, newFact.id, 'facts', tags.tags, false)
      }
      return newFact
    })
    return { data: await getFullFact(responseFact.id) }
  }

  /**
   * @show
   * @summary Get Fact
   * @description Retrieve an individual Fact record. This method is best used for administrative and management functions. Consider the Data API for querying facts with dimension for statistical and review purposes.
   */
  async show({ params, auth }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)

    return {
      data: await getFullFact(params.id),
    }
  }

  /**
   * @update
   * @summary Update Fact
   * @description Update an existing Fact record. This method is best used for administrative and management functions. Consider the Data API for inserting and manipulating facts with dimension for statistical and review purposes.
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    const cleanRequest = await request.validateUsing(updateFactValidator)

    await paramsUUIDValidator.validate(params)
    // const cleanRequest = request.only(['typeKey', 'observedAt', 'dimensions', 'tags'])
    let updatedFact = null
    await db.transaction(async (trx) => {
      const fact = await Fact.findOrFail(params.id)
      fact.useTransaction(trx)
      updatedFact = await fact.merge(cleanRequest).save()

      if (cleanRequest.tags) {
        await setTagsForObject(trx, fact.id, 'facts', cleanRequest.tags)
      }
    })
    return { data: await getFullFact(updatedFact.id) }
  }

  /**
   * @destroy
   * @summary Delete Fact
   * @description Remove a Fact record. This method is best used for administrative and management functions. Consider the Data API for data set manipulation.
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const fact = await Fact.findOrFail(params.id)
    await fact.delete()
    response.status(204).send('')
  }

  // TODO: Temporarily removing this until we have the api endpoint discussion
  // async insertWithFactType({ auth, params, request }: HttpContext) {
  //   await auth.authenticate()
  //
  //   const cleanRequest = request.only([
  //     'typeKey',
  //     'observedAt',
  //     'info',
  //     'dimensions',
  //     'personId',
  //     'resourceId',
  //     'eventId',
  //   ])
  //
  //   // TODO Not needed, since it will fail on foreign key constraint
  //   // const factType = FactType.findByOrFail('type_key', params.fact_type_key)
  //
  //   let newFact = null as Fact | null
  //
  //   await db.transaction(async (trx) => {
  //     newFact = new Fact()
  //       .fill({ ...cleanRequest, typeKey: params.fact_type_key })
  //       .useTransaction(trx)
  //     await newFact.save()
  //
  //     if (cleanRequest.dimensions) {
  //       for (const dimension of cleanRequest.dimensions) {
  //         await newFact.related('dimensions').create(dimension)
  //       }
  //     }
  //
  //     // TODO: Should tags be added?  If so should they delete any that aren't included or just add provided.  (should remove, i beleive)
  //     // TODO: What if empty tags are added, do we delete, or is that considered a "just ignore tags"
  //   })
  //
  //   // Load the full object to return
  //   let newCreatedFact = null
  //   if (newFact) {
  //     newCreatedFact = await getFullFact(newFact.id)
  //   }
  //
  //   return { data: newCreatedFact }
  // }
}

import Tag from '#models/tag'
import { createTagValidator, setTagsValidator, updateTagValidator } from '#validators/tag'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { paramsUUIDValidator } from '#validators/common'
import {
  buildApiQuery,
  buildEventsSort,
  buildFactsSort,
  buildPeopleSort,
  buildResourcesSort,
  setTagsForObject,
} from '#helpers/query_builder'

export default class TagsController {
  // TODO: Same as in query_builder. Should these return the query object?
  private eventsSubQuery(query: any, queryData: Record<string, any>) {
    let [eventsQuery] = buildApiQuery(query, queryData, 'events')
    eventsQuery.preload('eventType')
    eventsQuery.preload('resource')
    eventsQuery.preload('person')
    buildEventsSort(eventsQuery, queryData)
  }

  private factsSubQuery(query: any, queryData: Record<string, any>) {
    let [factsQuery] = buildApiQuery(query, queryData, 'facts')
    factsQuery.preload('factType')
    factsQuery.preload('resource')
    factsQuery.preload('person')
    factsQuery.preload('event')
    buildFactsSort(query, queryData)
  }

  private peopleSubQuery(query: any, queryData: Record<string, any>) {
    let [peopleQuery] = buildApiQuery(query, queryData, 'people')
    peopleQuery.preload('personType')
    buildPeopleSort(peopleQuery, queryData)
  }

  private resourcesSubQuery(query: any, queryData: Record<string, any>) {
    let [resourcesQuery] = buildApiQuery(query, queryData, 'resources')
    resourcesQuery.preload('resourceType')
    buildResourcesSort(resourcesQuery, queryData)
  }

  private usersSubQuery(query: any, queryData: Record<string, any>) {
    let [usersQuery] = buildApiQuery(query, queryData, 'users')
    usersQuery.preload('role')
    usersQuery.preload('person')
    usersQuery.orderBy('email', 'asc')
  }

  private tagQueryWithAllRelated(id: string, queryData: Record<string, any>) {
    // Get all the related types at once. This will usually be just for the first time
    // the View Tag screen is loaded or an update. Any subsequent pagination requests will just utilize
    // the single type options above. This will be the default if the value does not match
    // any of the types above, but using the conventional 'all' is recommended (ie, /tags/{tagId}/all)
    return Tag.query()
      .where('id', id)
      .withCount('events')
      .withCount('facts')
      .withCount('people')
      .withCount('resources')
      .withCount('users')
      .preload('events', (relatedQuery) => {
        this.eventsSubQuery(relatedQuery, queryData)
      })
      .preload('facts', (relatedQuery) => {
        this.factsSubQuery(relatedQuery, queryData)
      })
      .preload('people', (relatedQuery) => {
        this.peopleSubQuery(relatedQuery, queryData)
      })
      .preload('resources', (relatedQuery) => {
        this.resourcesSubQuery(relatedQuery, queryData)
      })
      .preload('users', (relatedQuery) => {
        this.usersSubQuery(relatedQuery, queryData)
      })
      .firstOrFail()
  }

  /**
   * @count
   * @summary Count People
   * @description Returns the count of total people
   */
  async count({ auth }: HttpContext) {
    await auth.authenticate()

    const countQuery = db.from('tags').count('*')
    const queryCount = await countQuery.count('*')

    return {
      data: {
        count: +queryCount[0].count,
      },
    }
  }

  /**
   * @index
   * @summary List Tags
   * @description Returns a list of Tags.
   * @paramUse(sortable, filterable)
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const parentStr = queryData['parentStr']

    let [query, countQuery] = buildApiQuery(Tag.query(), queryData, 'tags', 'pathname')

    query.orderBy('pathname', 'asc')

    if (parentStr) {
      query.where('parent', parentStr)
      countQuery.where('parent', parentStr)
    }

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
   * @summary Create Tag
   * @description Create a new Tag within Arcwell
   */
  async store({ request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createTagValidator)
    const newTag = await Tag.create(request.body())
    return { data: newTag }
  }

  /**
   * @show
   * @summary Get Tag
   * @description Return details about an individual Tag
   */
  async show({ params }: HttpContext) {
    return {
      data: await Tag.query().where('id', params.id).firstOrFail(),
    }
  }

  /**
   * @showRelated
   * @summary Return details about individual Tag along with its related objects
   * of the given object_type
   * @description Return details about an individual Tag along with related data
   */
  async showRelated({ params, request }: HttpContext) {
    const queryData = request.qs()

    let query
    const acceptableTypes = ['events', 'facts', 'people', 'resources', 'users']

    if (acceptableTypes.includes(params.object_name)) {
      query = Tag.query()
        .where('id', params.id)
        .withCount(params.object_name)
        .preload(params.object_name, (relatedQuery) => {
          switch (params.object_name) {
            case 'people':
              this.peopleSubQuery(relatedQuery, queryData)
              break
            case 'resources':
              this.resourcesSubQuery(relatedQuery, queryData)
              break
            case 'events':
              this.eventsSubQuery(relatedQuery, queryData)
              break
            case 'facts':
              this.factsSubQuery(relatedQuery, queryData)
              break
            case 'users':
              this.usersSubQuery(relatedQuery, queryData)
              break
          }
        })
        .firstOrFail()
    } else {
      query = this.tagQueryWithAllRelated(params.id, queryData)
    }

    return {
      data: await query,
    }
  }

  /**
   * @update
   * @summary Update Tag
   * @description Update an existing Tag
   * Show the related records of the tag for the given object type
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateTagValidator)
    const cleanRequest = request.only(['pathname'])
    const tag = await Tag.findOrFail(params.id)
    await tag.merge(cleanRequest).save()
    return {
      data: await this.tagQueryWithAllRelated(params.id, {
        limit: 10,
        offset: 0,
      }),
    }
  }

  /**
   * @destroy
   * @summary Delete Tag
   * @description Remove the indicated Tag from Arcwell
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    const tag = await Tag.findOrFail(params.id)
    await tag.delete()
    response.status(204).send('')
  }

  /**
   * @getStrings
   * @summary List Tags (Simple)
   * @description Return a list of Tags within Arcwell as text strings
   * @paramUse(filterable, sortable)
   */
  async getStrings({ request }: HttpContext) {
    const queryData = request.qs()
    const parentStr = queryData['parentStr']
    const limit = queryData['limit']
    const offset = queryData['offset']
    const search = queryData['search']

    let query = Tag.query().orderBy('pathname', 'asc')

    if (parentStr) {
      query.where('parent', parentStr)
    }

    if (search) {
      const searchString = '%' + search + '%'
      query.whereILike('pathname', searchString)
    }

    if (limit) {
      query.limit(limit)
    }
    if (offset) {
      query.offset(offset)
    }

    const queryTags = await query

    return {
      data: queryTags.map((tag) => tag.pathname),
    }
  }

  /**
   * @setTags
   * @summary Set Tags
   * @description Set the tags associated with a given Arcwell object
   */
  async setTags({ params, response, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(setTagsValidator)
    await paramsUUIDValidator.validate(params)
    const cleanRequest = request.only(['objectType', 'tags'])

    await db.transaction(async (trx) => {
      await setTagsForObject(trx, params.id, cleanRequest.objectType, cleanRequest.tags)
    })

    response.status(204).send('')
  }
}

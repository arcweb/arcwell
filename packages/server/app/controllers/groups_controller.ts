import Group from '#models/group'
import { createGroupValidator, setGroupsValidator, updateGroupValidator } from '#validators/group'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { paramsUUIDValidator } from '#validators/common'
import {
  buildApiQuery,
  buildEventsSort,
  buildFactsSort,
  buildPeopleSort,
  buildResourcesSort,
  setGroupsForObject,
} from '#helpers/query_builder'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import GroupService from '#services/group_service'

export default class GroupsController {
  // TODO: Same as in query_builder. Should these return the query object?
  private async eventsSubQuery(query: any, queryData: Record<string, any>) {
    let [eventsQuery] = await buildApiQuery({
      modelQuery: query,
      queryData,
      tableName: 'events',
    })
    eventsQuery.preload('eventType')
    eventsQuery.preload('resource')
    eventsQuery.preload('person')
    buildEventsSort(eventsQuery, queryData)
  }

  private async factsSubQuery(query: any, queryData: Record<string, any>) {
    let [factsQuery] = await buildApiQuery({
      modelQuery: query,
      queryData,
      tableName: 'facts',
    })
    factsQuery.preload('factType')
    factsQuery.preload('resource')
    factsQuery.preload('person')
    factsQuery.preload('event')
    buildFactsSort(query, queryData)
  }

  private async peopleSubQuery(query: any, queryData: Record<string, any>) {
    let [peopleQuery] = await buildApiQuery({
      modelQuery: query,
      queryData,
      tableName: 'people',
    })
    peopleQuery.preload('personType')
    buildPeopleSort(peopleQuery, queryData)
  }

  private async resourcesSubQuery(query: any, queryData: Record<string, any>) {
    let [resourcesQuery] = await buildApiQuery({
      modelQuery: query,
      queryData,
      tableName: 'resources',
    })
    resourcesQuery.preload('resourceType')
    buildResourcesSort(resourcesQuery, queryData)
  }

  private async usersSubQuery(query: any, queryData: Record<string, any>) {
    let [usersQuery] = await buildApiQuery({
      modelQuery: query,
      queryData,
      tableName: 'users',
    })
    usersQuery.preload('role')
    usersQuery.preload('person')
    usersQuery.orderBy('email', 'asc')
  }

  private groupQueryWithAllRelated(
    id: string,
    queryData: Record<string, any>,
    trx?: TransactionClientContract
  ) {
    // Get all the related types at once. This will usually be just for the first time
    // the View Group screen is loaded or an update. Any subsequent pagination requests will just utilize
    // the single type options above. This will be the default if the value does not match
    // any of the types above, but using the conventional 'all' is recommended (ie, /groups/{groupId}/all)
    return Group.query(trx ? { client: trx } : {})
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
  async count({}: HttpContext) {
    const countQuery = db.from('groups').count('*')
    const queryCount = await countQuery.count('*')

    return {
      data: {
        count: +queryCount[0].count,
      },
    }
  }

  /**
   * @index
   * @summary List Groups
   * @description Returns a list of Groups.
   * @paramUse(sortable, filterable)
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const parentStr = queryData['parentStr']

    let [query, countQuery] = await buildApiQuery({
      modelQuery: Group.query(),
      queryData,
      tableName: 'groups',
    })

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
   * @summary Create Group
   * @description Create a new Group within Arcwell
   */
  async store({ request }: HttpContext) {
    await request.validateUsing(createGroupValidator)

    return db.transaction(async (trx) => {
      const newGroup = await GroupService.createGroup(trx, request.body())
      return { data: newGroup }
    })
  }

  /**
   * @show
   * @summary Get Group
   * @description Return details about an individual Group
   */
  async show({ params }: HttpContext) {
    return {
      data: await Group.query().where('id', params.id).firstOrFail(),
    }
  }

  /**
   * @showRelated
   * @summary Return details about individual Group along with its related objects
   * of the given object_type
   * @description Return details about an individual Group along with related data
   */
  async showRelated({ params, request }: HttpContext) {
    const queryData = request.qs()

    let query
    const acceptableTypes = ['events', 'facts', 'people', 'resources', 'users']

    if (acceptableTypes.includes(params.object_name)) {
      query = Group.query()
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
      query = this.groupQueryWithAllRelated(params.id, queryData)
    }

    return {
      data: await query,
    }
  }

  /**
   * @update
   * @summary Update Group
   * @description Update an existing Group
   * Show the related records of the group for the given object type
   */
  async update({ params, request }: HttpContext) {
    console.log('using this to test linter1')
    await request.validateUsing(updateGroupValidator)
    await paramsUUIDValidator.validate(params)

    const cleanRequest = request.only(['pathname'])

    return db.transaction(async (trx) => {
      const updatedGroup = await GroupService.updateGroup(trx, params.id, cleanRequest)
      return {
        data: await this.groupQueryWithAllRelated(updatedGroup.id, { limit: 10, offset: 0 }, trx),
      }
    })
  }

  /**
   * @destroy
   * @summary Delete Group
   * @description Remove the indicated Group from Arcwell
   */
  async destroy({ params, response }: HttpContext) {
    const group = await Group.findOrFail(params.id)
    await group.delete()
    response.status(204).send('')
  }

  /**
   * @getStrings
   * @summary List Groups (Simple)
   * @description Return a list of Groups within Arcwell as text strings
   * @paramUse(filterable, sortable)
   */
  async getStrings({ request }: HttpContext) {
    const queryData = request.qs()
    const parentStr = queryData['parentStr']
    const limit = queryData['limit']
    const offset = queryData['offset']
    const search = queryData['search']

    let query = Group.query().orderBy('pathname', 'asc')

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

    const queryGroups = await query

    return {
      data: queryGroups.map((group) => group.name),
    }
  }

  /**
   * @setGroups
   * @summary Set Groups
   * @description Set the groups associated with a given Arcwell object
   */
  async setGroups({ params, response, request }: HttpContext) {
    await request.validateUsing(setGroupsValidator)
    await paramsUUIDValidator.validate(params)
    const cleanRequest = request.only(['objectType', 'groups'])

    await db.transaction(async (trx) => {
      await setGroupsForObject(trx, params.id, cleanRequest.objectType, cleanRequest.groups)
    })

    response.status(204).send('')
  }
}

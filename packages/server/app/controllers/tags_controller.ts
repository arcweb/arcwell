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
} from '#helpers/query_builder'
import string from '@adonisjs/core/helpers/string'

export default class TagsController {
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
   * @update
   * @summary Return details about individual Tag along with its related objects
   * of the given object_type
   * @description Return details about an individual Tag along with related data
   */
  async showRelated({ params, request }: HttpContext) {
    const queryData = request.qs()

    const query = Tag.query()
      .where('id', params.id)
      .withCount(params.object_name)
      .preload(params.object_name, (query) => {
        switch (params.object_name) {
          case 'people':
            let [peopleQuery] = buildApiQuery(query, queryData, 'people')
            peopleQuery.preload('personType')
            buildPeopleSort(peopleQuery, queryData)
            break
          case 'resources':
            let [resourcesQuery] = buildApiQuery(query, queryData, 'resources')
            resourcesQuery.preload('resourceType')
            buildResourcesSort(resourcesQuery, queryData)
            break
          case 'events':
            let [eventsQuery] = buildApiQuery(query, queryData, 'events')
            eventsQuery.preload('eventType')
            eventsQuery.preload('resource')
            eventsQuery.preload('person')
            buildEventsSort(eventsQuery, queryData)
            break
          case 'facts':
            let [factsQuery] = buildApiQuery(query, queryData, 'facts')
            factsQuery.preload('factType')
            factsQuery.preload('resource')
            factsQuery.preload('person')
            factsQuery.preload('event')
            buildFactsSort(query, queryData)
            break
          case 'users':
            let [usersQuery] = buildApiQuery(query, queryData, 'users')
            usersQuery.preload('role')
            usersQuery.preload('person')
            usersQuery.orderBy('email', 'asc')
            break
        }
      })
      .firstOrFail()

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
    const updatedTag = await tag.merge(cleanRequest).save()
    return { data: updatedTag }
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
      await trx.rawQuery(
        'delete from tag_object where object_id = :id and object_type = :objectType',
        {
          id: params.id,
          objectType: cleanRequest.objectType,
        }
      )

      for (let tagString of cleanRequest.tags) {
        let dbTag = await Tag.findBy('pathname', tagString)
        if (!dbTag) {
          const newTag = new Tag()
          newTag.pathname = tagString
          newTag.useTransaction(trx)
          dbTag = await newTag.save()
        }

        await trx.rawQuery(
          `INSERT INTO public.tag_object
            (id, tag_id, object_id, object_type, created_at, updated_at)
            VALUES(gen_random_uuid(), :tagId, :objectId, :objectType, now(), now());`,
          {
            tagId: dbTag.id,
            objectId: params.id,
            objectType: cleanRequest.objectType,
          }
        )
      }
    })

    response.status(204).send('')
  }
}

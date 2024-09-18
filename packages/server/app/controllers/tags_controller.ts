import Tag from '#models/tag'
import { createTagValidator, setTagsValidator, updateTagValidator } from '#validators/tag'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { paramsUUIDValidator } from '#validators/common'

export default class TagsController {
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const parentStr = queryData['parentStr']
    const limit = queryData['limit']
    const offset = queryData['offset']
    const search = queryData['search']

    let countQuery = db.from('tags')

    let query = Tag.query().orderBy('pathname', 'asc')

    if (parentStr) {
      query.where('parent', parentStr)
      countQuery.where('parent', parentStr)
    }

    if (search) {
      const searchString = '%' + search + '%'
      query.whereILike('pathname', searchString)
      countQuery.whereILike('pathname', searchString)
    }

    if (limit) {
      query.limit(limit)
    }
    if (offset) {
      query.offset(offset)
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
   * Handle form submission for the create action
   */
  async store({ request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createTagValidator)
    const newTag = await Tag.create(request.body())
    return { data: newTag }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return {
      data: await Tag.query().where('id', params.id).firstOrFail(),
    }
  }

  /**
   * Handle form submission for the edit action
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
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    const tag = await Tag.findOrFail(params.id)
    await tag.delete()
    response.status(204).send('')
  }

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

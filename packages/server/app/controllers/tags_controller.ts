import Tag from '#models/tag'
import { createTagValidator, updateTagValidator } from '#validators/tag'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class TagsController {
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const limit = queryData['limit']
    const offset = queryData['offset']

    let countQuery = db.from('people')

    let query = Tag.query()

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
    const cleanRequest = request.only(['parent', 'basename'])
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
}

import Form from '#models/form'
import { paramsUUIDValidator } from '#validators/common'
import { createFormValidator, updateFormValidator } from '#validators/form'
import type { HttpContext } from '@adonisjs/core/http'
import { buildApiQuery } from '#helpers/query_builder'
import db from '@adonisjs/lucid/services/db'
import FormService from '#services/form_service'
import { ExtractScopes } from '@adonisjs/lucid/types/model'

export default class FormsController {
  /**
   * @count
   * @summary Count forms
   * @description Returns the count of total forms
   */
  async count({}: HttpContext) {
    const countQuery = db.from('forms').count('*')
    const queryCount = await countQuery.count('*')

    return {
      data: {
        count: +queryCount[0].count,
      },
    }
  }

  /**
   * @index
   * @summary List Forms
   * @description Retrieve a list of Form records. This method is best used for administrative and management functions. Consider the Data API for querying forms with dimension for statistical and review purposes.
   * @paramUse(sortable, filterable)
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()

    let [query, countQuery] = await buildApiQuery({
      modelQuery: Form.query(),
      queryData,
      tableName: 'forms',
    })

    query.apply((scopes: ExtractScopes<typeof Form>) => scopes.fullForm())
    query.orderBy('name', 'asc').preload('tags')

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
   * @summary Create Form
   * @description Create a Form within Arcwell's data system. This method is intended for administrative and management use. Consider the Data API for inserting forms with dimension for application and statistical purposes.
   */
  async store({ request }: HttpContext) {
    await request.validateUsing(createFormValidator)

    const cleanRequest = request.only(['name', 'sections'])

    return db.transaction(async (trx) => {
      const newForm = await FormService.createForm(trx, cleanRequest, request.input('tags'))
      return { data: await FormService.getFullForm(newForm.id, trx) }
    })
  }

  /**
   * @show
   * @summary Get Form
   * @description Retrieve an individual Form record. This method is best used for administrative and management functions. Consider the Data API for querying forms with dimension for statistical and review purposes.
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)

    return {
      data: await FormService.getFullForm(params.id),
    }
  }

  /**
   * @update
   * @summary Update Form
   * @description Update an existing Form record. This method is best used for administrative and management functions. Consider the Data API for inserting and manipulating forms with dimension for statistical and review purposes.
   */
  async update({ params, request }: HttpContext) {
    await request.validateUsing(updateFormValidator)
    await paramsUUIDValidator.validate(params)

    const cleanRequest = request.only(['name', 'sections'])

    return db.transaction(async (trx) => {
      const updatedForm = await FormService.updateForm(
        trx,
        params.id,
        cleanRequest,
        request.input('tags')
      )
      return { data: await FormService.getFullForm(updatedForm.id, trx) }
    })
  }

  /**
   * @destroy
   * @summary Delete Form
   * @description Remove a Form record. This method is best used for administrative and management functions. Consider the Data API for data set manipulation.
   */
  async destroy({ params, response }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    const form = await Form.findOrFail(params.id)
    await form.delete()
    response.status(204).send('')
  }
}

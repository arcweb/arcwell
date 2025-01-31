import { buildApiQuery } from '#helpers/query_builder'
import FileType from '#models/file_type'
import FileTypeService from '#services/file_type_service'
import { paramsUUIDValidator } from '#validators/common'
import { createFileTypeValidator, updateFileTypeValidator } from '#validators/file_type'
import string from '@adonisjs/core/helpers/string'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class FileTypesController {
  /**
   * @index
   * @summary List FileTypes
   * @description Retrieve a list of type definitions and schemas for Files
   * @paramUse(sortable, filterable)
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const sort = queryData['sort']
    const order = queryData['order']

    let [query, countQuery] = await buildApiQuery({
      modelQuery: FileType.query(),
      queryData,
      tableName: 'file_types',
    })

    query.preload('tags')

    if (sort && order) {
      const camelSortStr = string.camelCase(sort)
      query.orderBy(camelSortStr, order)
    } else {
      query.orderBy('name', 'asc')
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
   * @summary Create FileType
   * @description Create a new type definition and schema for Files
   */
  async store({ request }: HttpContext) {
    await request.validateUsing(createFileTypeValidator)

    return db.transaction(async (trx) => {
      const newFileType = await FileTypeService.createFileType(
        trx,
        request.body(),
        request.input('tags')
      )

      return newFileType
    })
  }

  /**
   * @show
   * @summary Show FileType
   * @description Retrieve a single type definition and schema for Files
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)

    return {
      data: await FileType.query().where('id', params.id).preload('tags').firstOrFail(),
    }
  }

  /**
   * @update
   * @summary Update FileType
   * @description Update an existing type definition and schema for Files
   */
  async update({ request, params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    await request.validateUsing(updateFileTypeValidator)

    const cleanRequest = request.only(['name'])

    return db.transaction(async (trx) => {
      const updatedFileTyoe = await FileTypeService.updateFileType(
        trx,
        params.id,
        cleanRequest,
        request.input('tags')
      )

      return { data: await FileTypeService.getFullFileType(updatedFileTyoe.id, trx) }
    })
  }

  /**
   * @destroy
   * @summary Delete FileType
   * @description Delete a type definition and schema for Files
   */
  async destroy({ params, response }: HttpContext) {
    await paramsUUIDValidator.validate(params)

    const fileType = await FileType.findOrFail(params.id)
    await fileType.delete()
    response.status(204).send('')
  }
}

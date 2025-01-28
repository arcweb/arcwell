import { buildApiQuery, buildResourcesSort } from '#helpers/query_builder'
import File from '#models/file'
import FileType from '#models/file_type'
import { fileUploadValidator, fileAccessValidator } from '#validators/file'
import { HttpContext } from '@adonisjs/core/http'

export default class FilesController {
  /**
   * @upload
   * @summary Allows upload of files that are not specific
   * @description Upload a file
   */
  async upload({ auth, params, response, request }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(fileUploadValidator)
    const file = request.file('file')

    response.status(201).send('')
  }

  /**
   * @download
   * @summary Allows download of files in the system
   * @description Download a file
   */
  async download({ auth, params, response, request }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(fileAccessValidator)
    const cleanRequest = request.only(['name'])

    const file = await File.findByOrFail('name', cleanRequest.name)

    return { data: file }
  }

  /**
   * @delete
   * @summary Allows deletion of a file
   * @description Delete a file
   */
  async delete({ auth, params, response, request }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(fileAccessValidator)
    const cleanRequest = request.only(['name'])

    const file = await File.findByOrFail('name', cleanRequest.name)
    await file.delete()
    response.status(204).send('')
  }

  /**
   * @list
   * @summary List all files
   * @description List all files
   */
  async index({ auth, response, request }: HttpContext) {
    await auth.authenticate()
    const queryData = request.qs()
    const typeKey = queryData['typeKey']

    let [query, countQuery] = await buildApiQuery({
      modelQuery: File.query(),
      queryData,
      tableName: 'files',
    })

    if (typeKey) {
      const fileType = await FileType.findByOrFail('key', typeKey)
      query.where('typeKey', fileType.key)
      countQuery.where('type_key', fileType.key)
    }
    buildResourcesSort(query, queryData)
    const queryCount = await countQuery.count('*')

    return {
      data: await query,
      meta: {
        count: +queryCount[0].count,
      },
    }
  }

  /**
   * @show
   * @summary Show a file
   * @description Show a file
   */
  async show({ auth, params, response, request }: HttpContext) {
    await auth.authenticate()
    const file = await File.findOrFail(params.id)
    return { data: file }
  }
}

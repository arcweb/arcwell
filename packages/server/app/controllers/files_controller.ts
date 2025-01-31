import { fileAccessValidator, fileUpdateValidator, fileUploadValidator } from '#validators/file'
import { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs'
import File from '#models/file'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import { normalize } from 'node:path'
import FileType from '#models/file_type'
import { buildApiQuery } from '#helpers/query_builder'
import { paramsUUIDValidator } from '#validators/common'
import FileService from '#services/file_service'

export default class FilesController {
  /**
   * @count
   * @summary Count Files
   * @description Returns the count of total files
   */
  async count({}: HttpContext) {
    const countQuery = db.from('files').count('*')
    const queryCount = await countQuery.count('*')

    return {
      data: {
        count: +queryCount[0].count,
      },
    }
  }

  /**
   * @index
   * @summary List Files
   * @description Returns a list of File objects and their details. Sortable and filterable.
   * @paramUse(sortable, filterable)
   */
  async index({ request }: HttpContext) {
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
    // biuldFilesSort(query, queryData)

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
   * @summary Show a single file
   * @description Returns a single file object
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await File.findOrFail(params.id),
    }
  }

  /**
   * @update
   * @summary Update a file
   * @description Update an exsisting file name
   */
  async update({ params, request }: HttpContext) {
    await request.validateUsing(fileUpdateValidator)
    await paramsUUIDValidator.validate(params)

    const cleanRequest = request.only(['name'])

    return db.transaction(async (trx) => {
      const updatedFile = await FileService.updateFile(
        trx,
        params.id,
        cleanRequest.name,
        request.input('tags')
      )
      return { data: updatedFile }
    })
  }

  /**
   * @upload
   * @summary Allows upload of files that are not specific
   * @description Upload a file
   */
  async upload({ auth, request }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(fileUploadValidator)
    const file = request.file('file')
    const typeKey = request.input('typeKey')
    const name = request.input('name')

    if (file) {
      await file.move(app.makePath(`uploads/${typeKey}`))
      return db.transaction(async (trx) => {
        const newFile = await File.create({
          name: name,
          size: file.size.toString(),
          extension: file.extname,
          url: file.filePath ?? file.tmpPath,
          typeKey: typeKey,
        })
        return { data: newFile }
      })
    }
  }

  /**
   * @download
   * @summary Allows download of files in the system
   * @description Download a file
   */
  async download({ auth, response, request }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(fileAccessValidator)
    const cleanRequest = request.only(['name'])

    const file = await File.findByOrFail('name', cleanRequest.name)

    // TODO: the path will need to be investigated
    const absPath = app.makePath('downloaded', normalize(file.url))

    return response.download(absPath)
  }

  /**
   * @delete
   * @summary Allows deletion of a file
   * @description Delete a file
   */
  async delete({ auth, response, request }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(fileAccessValidator)
    const cleanRequest = request.only(['name'])

    const file = await File.findByOrFail('name', cleanRequest.name)

    await fs.unlinkSync(file.url)
    await file.delete()

    response.status(204).send('')
  }
}

import { fileDownloadValidator, fileUploadValidator } from '#validators/file'
import { HttpContext } from '@adonisjs/core/http'
import File from '#models/file'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import { normalize } from 'node:path'

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
    // TODO: organize the files directory and assign to file
    // file.move()

    return db.transaction(async (trx) => {
      const newFile = await File.create({
        name: file.fileName,
        size: file.size.toString(),
        extension: file.extname,
        url: file.filePath ?? file.tmpPath,
      })
      return { data: newFile }
    })
  }

  /**
   * @download
   * @summary Allows download of files in the system
   * @description Download a file
   */
  async download({ auth, params, response, request }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(fileDownloadValidator)
    const cleanRequest = request.only(['name'])

    const file = await File.findByOrFail('name', cleanRequest.name)

    // TODO: the path will need to be investigated
    const absPath = app.makePath('downloaded', normalize(file.url))

    return response.download(absPath)
  }
}

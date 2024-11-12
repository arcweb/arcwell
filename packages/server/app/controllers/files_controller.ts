export default class FilesController {
  /**
   * @upload
   * @summary Allows upload of files that are not specific
   * @description Upload a file
   */
  async upload({ auth, params, response }: HttpContext) {
    await auth.authenticate()
  }

  /**
   * @download
   * @summary Allows download of files in the system
   * @description Download a file
   */
  async download({ auth, params, response }: HttpContext) {
    await auth.authenticate()
  }
}

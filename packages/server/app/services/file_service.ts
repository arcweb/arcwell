import { setTagsForObject } from '#helpers/query_builder'
import File from '#models/file'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

/**
 * This is the arcwell FilesController.
 * Mangages file information in the DB but not the actual files held in adonis
 */

export default class FileService {
  /**
   * Retrieves a full File record by ID with its associated tags.
   *
   * @param id - The ID of the File to retrieve.
   * @param trx - Optional transaction object.
   * @returns A Promise that resolves to the File with preloaded tags.
   * @throws Will throw an error if the File is not found.
   */
  public static async getFullFile(id: string, trx?: TransactionClientContract): Promise<File> {
    return File.query(trx ? { client: trx } : {})
      .where('id', id)
      .withScopes((scopes) => scopes.fullFile())
      .firstOrFail()
  }

  /**
   * Creates a new File record in the database.
   *
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the File.
   * @tags - An array of tags to associate with the File.
   * @returns A Promise that resolves to the newly created File.
   */
  public static async createFile(
    trx: TransactionClientContract,
    createData: any,
    tags?: string[]
  ): Promise<File> {
    const newFile = new File().fill(createData).useTransaction(trx)
    await newFile.save()

    if (tags && tags.length > 0) {
      await setTagsForObject(trx, newFile.id, 'files', tags, false)
    }

    return newFile
  }

  /**
   * Updates an existing File record in the database.
   *
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the File to update.
   * @param updateData - The data to update the File.
   * @param tags - An array of tags to update or associate with the File.
   * @returns A Promise that resolves to the updated File.
   * @throws Will throw an error if the File is not found.
   */
  public static async updateFile(
    trx: TransactionClientContract,
    id: string,
    updateData: any,
    tags?: string[]
  ): Promise<File> {
    const file = await File.findOrFail(id)
    file.useTransaction(trx)

    const updatedFile = await file.merge(updateData).save()

    if (tags) {
      await setTagsForObject(trx, file.id, 'files', tags)
    }

    return updatedFile
  }
}

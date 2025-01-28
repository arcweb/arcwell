import { setTagsForObject } from '#helpers/query_builder'
import FileType from '#models/file_type'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class FileTypeService {
  /**
   * Find or create a FileType by its key
   *
   * @param trx - Transaction client
   * @param fileTypeData - Data to find or create the file type
   * @returns - The found or created FileType
   */
  public static async findOrCreateFileTypeByKey(
    trx: TransactionClientContract,
    fileTypeData: any
  ): Promise<FileType> {
    let fileType = await FileType.findBy('key', fileTypeData.key)

    if (!fileType) {
      fileType = await this.createFileType(trx, fileTypeData)
    }

    return fileType
  }

  /**
   * Create a new FileType
   *
   * @param trx - Transaction client
   * @param createData - Data to create the file type
   * @returns - The newly created FileType
   */
  public static async createFileType(
    trx: TransactionClientContract,
    createData: any,
    tags?: string[]
  ): Promise<FileType> {
    const newFileType = new FileType().fill(createData).useTransaction(trx)
    await newFileType.save()

    return newFileType
  }

  /**
   * Get a FileType by its ID
   *
   * @param id - The ID of the FileType to retrieve
   * @param trx - Optional transaction object
   * @returns - The FileType with the given ID
   */
  public static async getFullFileType(
    id: string,
    trx?: TransactionClientContract
  ): Promise<FileType> {
    return FileType.query(trx ? { client: trx } : {})
      .where('id', id)
      .preload('tags')
      .firstOrFail()
  }

  /**
   * Updates an existing FileType and optionally updates its associated tags.
   *
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the FileType to update.
   * @param updateData - The data to update the FileType.
   * @param tags - An array of tags to update or associate with the FileType.
   * @returns A Promise that resolves to the updated FileType.
   * @throws Will throw an error if the FileType is not found.
   */
  public static async updateFileType(
    trx: TransactionClientContract,
    id: string,
    updateData: any,
    tags?: string[]
  ): Promise<FileType> {
    const fileType = await FileType.findOrFail(id)
    fileType.useTransaction(trx)

    const updatedFileType = await fileType.merge(updateData).save()

    if (tags) {
      await setTagsForObject(trx, fileType.id, 'file_types', tags)
    }

    return updatedFileType
  }
}

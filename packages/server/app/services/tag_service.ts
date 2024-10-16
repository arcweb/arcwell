import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Tag from '#models/tag'

export default class TagService {
  /**
   * Finds a Tag by its pathname.
   * 
   * @param pathname - The pathname of the Tag to find.
   * @returns A Promise that resolves to the found Tag or null if not found.
   */
  public static async findOrCreateTag(trx: TransactionClientContract, tagData: any): Promise<Tag> {
    let tag = await Tag.findBy('pathname', tagData.pathname)

    if (!tag) {
      tag = await this.createTag(trx, tagData)
    }

    return tag
  }

  /**
   * Creates a new Tag in the database.
   *
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the Tag.
   * @returns A Promise that resolves to the newly created Tag.
   */
  public static async createTag(trx: TransactionClientContract, createData: any): Promise<Tag> {
    const newTag = new Tag().fill(createData).useTransaction(trx)
    await newTag.save()
    return newTag
  }

  /**
   * Updates an existing Tag in the database.
   *
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the Tag to update.
   * @param updateData - The data to update the Tag.
   * @returns A Promise that resolves to the updated Tag.
   * @throws Will throw an error if the Tag is not found.
   */
  public static async updateTag(
    trx: TransactionClientContract,
    id: string,
    updateData: any
  ): Promise<Tag> {
    const tag = await Tag.findOrFail(id)
    tag.useTransaction(trx)
    return tag.merge(updateData).save()
  }
}

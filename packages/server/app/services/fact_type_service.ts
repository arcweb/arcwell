import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import FactType from '#models/fact_type';
import { setTagsForObject } from '#helpers/query_builder';

export default class FactTypeService {
  /**
   * Retrieves a full FactType record by ID with its associated tags.
   * 
   * @param id - The ID of the FactType to retrieve.
   * @param trx - Optional transaction object.
   * @returns A Promise that resolves to the FactType with preloaded tags.
   * @throws Will throw an error if the FactType is not found.
   */
  public static async getFullFactType(id: string, trx?: TransactionClientContract): Promise<FactType> {
    return FactType.query(trx ? { client: trx } : {})
      .where('id', id)
      .preload('tags')
      .firstOrFail();
  }

  /**
   * Creates a new FactType and optionally associates tags with it.
   * 
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the FactType.
   * @param tags - An array of tags to associate with the FactType.
   * @returns A Promise that resolves to the newly created FactType.
   */
  public static async createFactType(
    trx: TransactionClientContract,
    createData: any,
    tags?: string[]
  ): Promise<FactType> {
    const newFactType = new FactType().fill(createData).useTransaction(trx);
    await newFactType.save();

    if (tags && tags.length > 0) {
      await setTagsForObject(trx, newFactType.id, 'fact_types', tags, false);
    }

    return newFactType;
  }

  /**
   * Updates an existing FactType and optionally updates its associated tags.
   * 
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the FactType to update.
   * @param updateData - The data to update the FactType.
   * @param tags - An array of tags to update or associate with the FactType.
   * @returns A Promise that resolves to the updated FactType.
   * @throws Will throw an error if the FactType is not found.
   */
  public static async updateFactType(
    trx: TransactionClientContract,
    id: string,
    updateData: any,
    tags?: string[]
  ): Promise<FactType> {
    const factType = await FactType.findOrFail(id);
    factType.useTransaction(trx);

    const updatedFactType = await factType.merge(updateData).save();

    if (tags) {
      await setTagsForObject(trx, factType.id, 'fact_types', tags);
    }

    return updatedFactType;
  }
}

import { setTagsForObject } from '#helpers/query_builder'
import Fact from '#models/fact'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class FactService {
  /**
   * Retrieves a full Fact record by ID with its associated tags.
   *
   * @param id - The ID of the Fact to retrieve.
   * @param trx - Optional transaction object.
   * @returns A Promise that resolves to the Fact with preloaded tags.
   * @throws Will throw an error if the Fact is not found.
   */
  public static async getFullFact(id: string, trx?: TransactionClientContract): Promise<Fact> {
    return Fact.query(trx ? { client: trx } : {})
      .where('id', id)
      .withScopes((scopes) => scopes.fullFact())
      .firstOrFail()
  }

  /**
   * Creates a new Fact and optionally associates tags with it.
   *
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the Fact.
   * @param tags - An array of tags to associate with the Fact.
   * @returns A Promise that resolves to the newly created Fact.
   */
  public static async createFact(
    trx: TransactionClientContract,
    createData: any,
    tags?: string[]
  ): Promise<Fact> {
    const fact = new Fact().fill(createData).useTransaction(trx)
    await fact.save()

    if (tags && tags.length > 0) {
      await setTagsForObject(trx, fact.id, 'facts', tags, false)
    }

    return fact
  }

  /**
   * Updates an existing Fact and optionally updates its associated tags.
   *
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the Fact to update.
   * @param updateData - The data to update the Fact.
   * @param tags - An array of tags to update or associate with the Fact.
   * @returns A Promise that resolves to the updated Fact.
   * @throws Will throw an error if the Fact is not found.
   */
  public static async updateFact(
    trx: TransactionClientContract,
    id: string,
    updateData: any,
    tags?: string[]
  ): Promise<Fact> {
    const fact = await Fact.findOrFail(id)
    fact.merge(updateData)
    await fact.save()

    if (tags && tags.length > 0) {
      await setTagsForObject(trx, fact.id, 'facts', tags, true)
    }

    return fact
  }
}

import { setTagsForObject } from '#helpers/query_builder'
import Resource from '#models/resource'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class ResourceService {
  /**
   * Retrieves a full Resource record by ID with associated tags and resourceType.
   *
   * @param id - The ID of the Resource to retrieve.
   * @param trx - Optional transaction object.
   * @returns A Promise that resolves to the Resource with preloaded relationships.
   * @throws Will throw an error if the Resource is not found.
   */
  public static async getFullResource(
    id: string,
    trx?: TransactionClientContract
  ): Promise<Resource> {
    return Resource.query(trx ? { client: trx } : {})
      .where('id', id)
      .withScopes((scopes) => scopes.fullResource())
      .firstOrFail()
  }

  /**
   * Creates a new Resource and optionally associates tags with it.
   *
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the Resource.
   * @returns A Promise that resolves to the newly created Resource.
   */
  public static async createResource(
    trx: TransactionClientContract,
    createData: any
  ): Promise<Resource> {
    const newResource = new Resource().fill(createData).useTransaction(trx)
    await newResource.save()

    const tags = createData.tags
    if (tags && tags.length > 0) {
      await setTagsForObject(trx, newResource.id, 'resources', tags, false)
    }

    return newResource
  }

  /**
   * Updates an existing Resource and optionally updates its associated tags.
   *
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the Resource to update.
   * @param updateData - The data to update the Resource.
   * @returns A Promise that resolves to the updated Resource.
   * @throws Will throw an error if the Resource is not found.
   */
  public static async updateResource(
    trx: TransactionClientContract,
    id: string,
    updateData: any
  ): Promise<Resource> {
    const resource = await Resource.findOrFail(id)
    resource.useTransaction(trx)

    const updatedResouce = await resource.merge(updateData).save()

    if (updateData.tags) {
      await setTagsForObject(trx, resource.id, 'resources', updateData.tags)
    }

    return updatedResouce
  }
}

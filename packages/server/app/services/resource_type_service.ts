import { TransactionClientContract } from '@adonisjs/lucid/types/database';
import ResourceType from '#models/resource_type';
import { setTagsForObject } from '#helpers/query_builder';

export default class ResourceTypeService {
  /**
   * Retrieves a full ResourceType record by ID with its associated tags.
   * 
   * @param id - The ID of the ResourceType to retrieve.
   * @param trx - Optional transaction object.
   * @returns A Promise that resolves to the ResourceType with preloaded tags.
   * @throws Will throw an error if the ResourceType is not found.
   */
  public static async getFullResourceType(id: string, trx?: TransactionClientContract): Promise<ResourceType> {
    return ResourceType.query(trx ? { client: trx } : {})
      .where('id', id)
      .preload('tags')
      .firstOrFail();
  }

  /**
   * Creates a new ResourceType and optionally associates tags with it.
   * 
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the ResourceType.
   * @param tags - An array of tags to associate with the ResourceType.
   * @returns A Promise that resolves to the newly created ResourceType.
   */
  public static async createResourceTypeWithTags(trx: TransactionClientContract, createData: any, tags: string[]): Promise<ResourceType> {
    const newResourceType = new ResourceType().fill(createData).useTransaction(trx);
    await newResourceType.save();

    if (tags && tags.length > 0) {
      await setTagsForObject(trx, newResourceType.id, 'resource_types', tags, false);
    }

    return newResourceType;
  }

  /**
   * Updates an existing ResourceType and optionally updates its associated tags.
   * 
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the ResourceType to update.
   * @param updateData - The data to update the ResourceType.
   * @param tags - An array of tags to update or associate with the ResourceType.
   * @returns A Promise that resolves to the updated ResourceType.
   * @throws Will throw an error if the ResourceType is not found.
   */
  public static async updateResourceTypeWithTags(trx: TransactionClientContract, id: string, updateData: any, tags: string[]): Promise<ResourceType> {
    const resourceType = await ResourceType.findOrFail(id);
    resourceType.useTransaction(trx);

    const updatedResourceType = await resourceType.merge(updateData).save();

    if (tags) {
      await setTagsForObject(trx, resourceType.id, 'resource_types', tags);
    }

    return updatedResourceType;
  }
}

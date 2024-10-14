import { TransactionClientContract } from '@adonisjs/lucid/types/database';
import PersonType from '#models/person_type';
import { setTagsForObject } from '#helpers/query_builder';

export default class PersonTypeService {
  /**
   * Retrieves a full PersonType record by ID with its associated tags.
   * 
   * @param id - The ID of the PersonType to retrieve.
   * @param trx - Optional transaction object.
   * @returns A Promise that resolves to the PersonType with preloaded tags.
   * @throws Will throw an error if the PersonType is not found.
   */
  public static async getFullPersonType(id: string, trx?: TransactionClientContract): Promise<PersonType> {
    return PersonType.query(trx ? { client: trx } : {})
      .where('id', id)
      .preload('tags')
      .firstOrFail();
  }

  /**
   * Creates a new PersonType and optionally associates tags with it.
   * 
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the PersonType.
   * @param tags - An array of tags to associate with the PersonType.
   * @returns A Promise that resolves to the newly created PersonType.
   */
  public static async createPersonTypeWithTags(trx: TransactionClientContract, createData: any, tags: string[]): Promise<PersonType> {
    const newPersonType = new PersonType().fill(createData).useTransaction(trx);
    await newPersonType.save();

    if (tags && tags.length > 0) {
      await setTagsForObject(trx, newPersonType.id, 'person_types', tags, false);
    }

    return newPersonType;
  }

  /**
   * Updates an existing PersonType and optionally updates its associated tags.
   * 
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the PersonType to update.
   * @param updateData - The data to update the PersonType.
   * @param tags - An array of tags to update or associate with the PersonType.
   * @returns A Promise that resolves to the updated PersonType.
   * @throws Will throw an error if the PersonType is not found.
   */
  public static async updatePersonTypeWithTags(trx: TransactionClientContract, id: string, updateData: any, tags: string[]): Promise<PersonType> {
    const personType = await PersonType.findOrFail(id);
    personType.useTransaction(trx);

    const updatedPersonType = await personType.merge(updateData).save();

    if (tags) {
      await setTagsForObject(trx, personType.id, 'person_types', tags);
    }

    return updatedPersonType;
  }
}

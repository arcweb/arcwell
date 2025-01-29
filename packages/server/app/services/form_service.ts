import { setTagsForObject } from '#helpers/query_builder'
import Form from '#models/form'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class FormService {
  /**
   * Retrieves a full Form record by ID with its associated tags.
   *
   * @param id - The ID of the Form to retrieve.
   * @param trx - Optional transaction object.
   * @returns A Promise that resolves to the Form with preloaded tags.
   * @throws Will throw an error if the Form is not found.
   */
  public static async getFullForm(id: string, trx?: TransactionClientContract): Promise<Form> {
    return Form.query(trx ? { client: trx } : {})
      .where('id', id)
      .withScopes((scopes) => scopes.fullForm())
      .firstOrFail()
  }

  /**
   * Creates a new Form and optionally associates tags with it.
   *
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the Form.
   * @param tags - An array of tags to associate with the Form.
   * @returns A Promise that resolves to the newly created Form.
   */
  public static async createForm(
    trx: TransactionClientContract,
    createData: any,
    tags?: string[]
  ): Promise<Form> {
    const form = new Form().fill(createData).useTransaction(trx)
    await form.save()

    if (tags && tags.length > 0) {
      await setTagsForObject(trx, form.id, 'Forms', tags, false)
    }

    return form
  }

  /**
   * Updates an existing Form and optionally updates its associated tags.
   *
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the Form to update.
   * @param updateData - The data to update the Form.
   * @param tags - An array of tags to update or associate with the Form.
   * @returns A Promise that resolves to the updated Form.
   * @throws Will throw an error if the Form is not found.
   */
  public static async updateForm(
    trx: TransactionClientContract,
    id: string,
    updateData: any,
    tags?: string[]
  ): Promise<Form> {
    const form = await Form.findOrFail(id)
    form.merge(updateData)
    await form.save()

    if (tags && tags.length > 0) {
      await setTagsForObject(trx, form.id, 'Forms', tags, true)
    }

    return form
  }
}

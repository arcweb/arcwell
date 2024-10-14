import { TransactionClientContract } from '@adonisjs/lucid/types/database';
import Role from '#models/role';

export default class RoleService {
  /**
   * Retrieves a full Role record by ID with its associated users and their person and tags data.
   * 
   * @param id - The ID of the Role to retrieve.
   * @param trx - Optional transaction object.
   * @returns A Promise that resolves to the Role with preloaded users, person, and tags.
   * @throws Will throw an error if the Role is not found.
   */
  public static async getFullRole(id: string, trx?: TransactionClientContract): Promise<Role> {
    return Role.query(trx ? { client: trx } : {})
      .where('id', id)
      .preload('users', (users) => users.preload('person').preload('tags'))
      .firstOrFail();
  }

  /**
   * Creates a new Role.
   * 
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the Role.
   * @returns A Promise that resolves to the newly created Role.
   */
  public static async createRole(trx: TransactionClientContract, createData: any): Promise<Role> {
    const newRole = new Role().fill(createData).useTransaction(trx);
    await newRole.save();
    return newRole;
  }

  /**
   * Updates an existing Role.
   * 
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the Role to update.
   * @param updateData - The data to update the Role.
   * @returns A Promise that resolves to the updated Role.
   * @throws Will throw an error if the Role is not found.
   */
  public static async updateRole(trx: TransactionClientContract, id: string, updateData: any): Promise<Role> {
    const role = await Role.findOrFail(id);
    role.useTransaction(trx);

    const updatedRole = await role.merge(updateData).save();
    return updatedRole;
  }
}

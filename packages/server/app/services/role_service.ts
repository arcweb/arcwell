import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Role from '#models/role'

export default class RoleService {
  /**
   * Finds or creates a Role by name.
   *
   * @param trx - The transaction object to run the database operations.
   * @param roleName - The name of the Role to find or create.
   * @param roleData - Optional data to create the role if it does not exist.
   * @returns A Promise that resolves to the found or newly created Role.
   */
  public static async findOrCreateRoleByName(trx: TransactionClientContract, roleData: any): Promise<Role> {
    let role = await Role.findBy('name', roleData.name)

    if (!role) {
      role = await this.createRole(trx, roleData)
    }

    return role
  }

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
      .withScopes((scopes) => scopes.fullRole())
      .firstOrFail()
  }

  /**
   * Creates a new Role.
   *
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the Role.
   * @returns A Promise that resolves to the newly created Role.
   */
  public static async createRole(trx: TransactionClientContract, createData: any): Promise<Role> {
    const newRole = new Role().fill(createData).useTransaction(trx)
    await newRole.save()
    return newRole
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
  public static async updateRole(
    trx: TransactionClientContract,
    id: string,
    updateData: any
  ): Promise<Role> {
    const role = await Role.findOrFail(id)
    role.useTransaction(trx)

    const updatedRole = await role.merge(updateData).save()
    return updatedRole
  }
}

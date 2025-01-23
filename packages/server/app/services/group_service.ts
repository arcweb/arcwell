import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Group from '#models/group'

export default class GroupService {
  /**
   * Finds a Group by its name.
   *
   * @returns A Promise that resolves to the found Group or null if not found.
   * @param trx
   * @param groupData
   */
  public static async findOrCreateGroup(
    trx: TransactionClientContract,
    groupData: any
  ): Promise<Group> {
    let group = await Group.findBy('name', groupData.pathname)

    if (!group) {
      group = await this.createGroup(trx, groupData)
    }

    return group
  }

  /**
   * Creates a new Group in the database.
   *
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the Group.
   * @returns A Promise that resolves to the newly created Group.
   */
  public static async createGroup(trx: TransactionClientContract, createData: any): Promise<Group> {
    const newGroup = new Group().fill(createData).useTransaction(trx)
    await newGroup.save()
    return newGroup
  }

  /**
   * Updates an existing Group in the database.
   *
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the Group to update.
   * @param updateData - The data to update the Group.
   * @returns A Promise that resolves to the updated Group.
   * @throws Will throw an error if the Group is not found.
   */
  public static async updateGroup(
    trx: TransactionClientContract,
    id: string,
    updateData: any
  ): Promise<Group> {
    const group = await Group.findOrFail(id)
    group.useTransaction(trx)
    return group.merge(updateData).save()
  }
}

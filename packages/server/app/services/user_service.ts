import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import User from '#models/user'
import { setTagsForObject } from '#helpers/query_builder'

export default class UserService {
  /**
   * Finds or creates a User by email.
   *
   * @param trx - The transaction object to run the database operations.
   * @param userData - The data to find or create the User.
   * @returns A Promise that resolves to the found or newly created User.
   */
  public static async findOrCreateUserByEmail(trx: TransactionClientContract, userData: any): Promise<User> {
    let user = await User.findBy('email', userData.email)

    if (!user) {
      user = await this.createUser(trx, userData, userData.tags)
    }

    return user
  }

  /**
   * Retrieves a full User record by ID with its associated tags, role, and person.
   *
   * @param id - The ID of the User to retrieve.
   * @returns A Promise that resolves to the User with preloaded tags, role, and person details.
   * @throws Will throw an error if the User is not found.
   */
  public static async getFullUser(id: string, trx?: TransactionClientContract): Promise<User> {
    return User.query(trx ? { client: trx } : {})
      .where('id', id)
      .withScopes((scopes) => scopes.fullUser())
      .firstOrFail()
  }

  /**
   * Creates a new User and associates optional tags.
   *
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the User.
   * @param tags - An array of tags to associate with the User.
   * @returns A Promise that resolves to the newly created User.
   */
  public static async createUser(
    trx: TransactionClientContract,
    createData: any,
    tags?: string[]
  ): Promise<User> {
    const newUser = new User().fill(createData).useTransaction(trx)
    await newUser.save()

    if (tags && tags.length > 0) {
      await setTagsForObject(trx, newUser.id, 'users', tags, false)
    }

    return newUser
  }

  /**
   * Updates an existing User and associates or updates optional tags.
   *
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the User to update.
   * @param updateData - The data to update the User.
   * @param tags - An array of tags to associate with the User.
   * @returns A Promise that resolves to the updated User.
   * @throws Will throw an error if the User is not found.
   */
  public static async updateUser(
    trx: TransactionClientContract,
    id: string,
    updateData: any,
    tags?: string[]
  ): Promise<User> {
    const user = await User.findOrFail(id)
    user.useTransaction(trx)

    const updatedUser = await user.merge(updateData).save()

    if (tags) {
      await setTagsForObject(trx, user.id, 'users', tags)
    }

    return updatedUser
  }
}

import { setTagsForObject } from '#helpers/query_builder'
import Person from '#models/person'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class PersonService {
  /**
 * Find or create a person based on their family name, given name, and typeKey.
 * 
 * @param trx - Transaction client
 * @param personData - Data for creating or finding the person
 * @returns - The found or created Person
 */
  public static async findOrCreatePerson(trx: TransactionClientContract, personData: any): Promise<Person> {
    let person = await Person.query()
      .where('familyName', personData.familyName)
      .andWhere('givenName', personData.givenName)
      .andWhere('typeKey', personData.typeKey)
      .first();

    if (!person) {
      person = await this.createPerson(trx, personData, personData.tags);
    }

    return person;
  }

  /**
   * Retrieves a full Person record by ID with associated relationships and limited cohorts.
   *
   * @param id - The ID of the Person to retrieve.
   * @param cohortLimit - Number of cohorts to preload.
   * @param cohortOffset - Offset for cohorts preload.
   * @param trx - Optional transaction object.
   * @returns A Promise that resolves to the Person with preloaded relationships.
   * @throws Will throw an error if the Person is not found.
   */
  public static async getFullPerson(
    id: string,
    cohortLimit: number = 10,
    cohortOffset: number = 0,
    trx?: TransactionClientContract
  ): Promise<Person> {
    return Person.query(trx ? { client: trx } : {})
      .where('id', id)
      .apply((scopes) => scopes.fullPerson())
      .withCount('cohorts')
      .preload('cohorts', (cohorts) => {
        cohorts.limit(cohortLimit)
        cohorts.offset(cohortOffset)
        cohorts.preload('tags')
        cohorts.orderBy('name', 'asc')
      })
      .firstOrFail()
  }

  /**
   * Creates a new Person with associated tags.
   *
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the Person.
   * @returns A Promise that resolves to the newly created Person.
   */
  public static async createPerson(
    trx: TransactionClientContract,
    createData: any,
    tags?: string[]
  ): Promise<Person> {
    const newPerson = new Person().fill(createData).useTransaction(trx)
    await newPerson.save()

    if (tags && tags.length > 0) {
      await setTagsForObject(trx, newPerson.id, 'people', tags, false)
    }

    return newPerson
  }

  /**
   * Updates an existing Person and optionally updates its associated tags.
   *
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the Person to update.
   * @param updateData - The data to update the Person.
   * @returns A Promise that resolves to the updated Person.
   * @throws Will throw an error if the Person is not found.
   */
  public static async updatePerson(
    trx: TransactionClientContract,
    id: string,
    updateData: any,
    tags?: string[]
  ): Promise<Person> {
    const person = await Person.findOrFail(id)
    person.useTransaction(trx)

    const updatedPerson = await person.merge(updateData).save()

    if (tags) {
      await setTagsForObject(trx, person.id, 'people', updateData.tags)
    }

    return updatedPerson
  }
}

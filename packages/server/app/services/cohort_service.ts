import Cohort from '#models/cohort';
import { TransactionClientContract } from '@adonisjs/lucid/types/database';
import { buildApiQuery, buildPeopleSort, setTagsForObject } from '#helpers/query_builder';

export default class CohortService {
  /**
   * Retrieves a full Cohort record by ID with its associated tags and people.
   *
   * @param id - The ID of the Cohort to retrieve.
   * @param queryData - Optional query parameters for filtering and sorting people.
   * @param trx - Optional transaction object.
   * @returns A Promise that resolves to the Cohort with preloaded tags and people.
   * @throws Will throw an error if the Cohort is not found.
   */
  public static async getFullCohort(
    id: string,
    queryData?: Record<string, any>,
    trx?: TransactionClientContract
  ): Promise<Cohort> {
    return Cohort.query(trx ? { client: trx } : {})
      .where('id', id)
      .preload('tags')
      .withCount('people')
      .preload('people', (people) => {
        let [peopleQuery] = buildApiQuery(people, queryData, 'people');
        peopleQuery.preload('personType');
        buildPeopleSort(peopleQuery, queryData);
      })
      .firstOrFail();
  }

  /**
   * Creates a new Cohort and optionally associates tags with it.
   *
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the Cohort.
   * @param tags - An array of tags to associate with the Cohort.
   * @returns A Promise that resolves to the newly created Cohort.
   */
  public static async createCohortWithTags(
    trx: TransactionClientContract,
    createData: any,
    tags?: string[]
  ): Promise<Cohort> {
    const newCohort = new Cohort().fill(createData).useTransaction(trx);
    await newCohort.save();

    if (tags && tags.length > 0) {
      await setTagsForObject(trx, newCohort.id, 'cohorts', tags, false);
    }

    return newCohort;
  }

  /**
   * Updates an existing Cohort and optionally updates its associated tags.
   *
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the Cohort to update.
   * @param updateData - The data to update the Cohort.
   * @param tags - An array of tags to update or associate with the Cohort.
   * @returns A Promise that resolves to the updated Cohort.
   * @throws Will throw an error if the Cohort is not found.
   */
  public static async updateCohortWithTags(
    trx: TransactionClientContract,
    id: string,
    updateData: any,
    tags?: string[]
  ): Promise<Cohort> {
    const cohort = await Cohort.findOrFail(id);
    cohort.useTransaction(trx);
    await cohort.merge(updateData).save();

    if (tags) {
      await setTagsForObject(trx, cohort.id, 'cohorts', tags);
    }

    return cohort;
  }
}

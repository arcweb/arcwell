import Event from '#models/event';
import { setTagsForObject } from '#helpers/query_builder';
import { TransactionClientContract } from '@adonisjs/lucid/types/database';

export default class EventService {
  /**
   * Retrieves a full Event record by ID with its associated tags and related models.
   *
   * @param id - The ID of the Event to retrieve.
   * @param trx - Optional transaction object.
   * @returns A Promise that resolves to the Event with preloaded tags and related models.
   * @throws Will throw an error if the Event is not found.
   */
  public static async getFullEvent(
    id: string,
    trx?: TransactionClientContract
  ): Promise<Event> {
    const eventQuery = Event.query(trx ? { client: trx } : {})
      .where('id', id)
      .withScopes((scopes) => scopes.fullEvent())

    return eventQuery.firstOrFail();
  }

  /**
   * Creates a new Event and optionally associates tags with it.
   *
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the Event.
   * @param tags - An array of tags to associate with the Event.
   * @returns A Promise that resolves to the newly created Event.
   */
  public static async createEvent(
    trx: TransactionClientContract,
    createData: any,
    tags?: string[]
  ): Promise<Event> {
    const event = new Event().fill(createData).useTransaction(trx);
    await event.save();

    if (tags && tags.length > 0) {
      await setTagsForObject(trx, event.id, 'events', tags, false);
    }

    return event;
  }

  /**
   * Updates an existing Event and optionally updates its associated tags.
   *
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the Event to update.
   * @param updateData - The data to update the Event.
   * @param tags - An array of tags to update or associate with the Event.
   * @returns A Promise that resolves to the updated Event.
   * @throws Will throw an error if the Event is not found.
   */
  public static async updateEvent(
    trx: TransactionClientContract,
    id: string,
    updateData: any,
    tags?: string[]
  ): Promise<Event> {
    const event = await Event.findOrFail(id);
    event.useTransaction(trx);
    await event.merge(updateData).save();

    if (tags) {
      await setTagsForObject(trx, event.id, 'events', tags);
    }

    return event;
  }
}

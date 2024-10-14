import { TransactionClientContract } from '@adonisjs/lucid/types/database';
import EventType from '#models/event_type';
import { setTagsForObject } from '#helpers/query_builder';

export default class EventTypeService {
  /**
   * Retrieves a full EventType record by ID with its associated tags.
   * 
   * @param id - The ID of the EventType to retrieve.
   * @param trx - Optional transaction object.
   * @returns A Promise that resolves to the EventType with preloaded tags.
   * @throws Will throw an error if the EventType is not found.
   */
  static async getFullEventType(id: string, trx?: TransactionClientContract): Promise<EventType> {
    return EventType.query(trx ? { client: trx } : {})
      .where('id', id)
      .preload('tags')
      .firstOrFail();
  }

  /**
   * Creates a new EventType and optionally associates tags with it.
   * 
   * @param trx - The transaction object to run the database operations.
   * @param createData - The data to create the EventType.
   * @param tags - An array of tags to associate with the EventType.
   * @returns A Promise that resolves to the newly created EventType.
   */
  static async createEventTypeWithTags(trx: TransactionClientContract, createData: any, tags: string[]): Promise<EventType> {
    const newEventType = new EventType().fill(createData).useTransaction(trx);
    await newEventType.save();

    if (tags && tags.length > 0) {
      await setTagsForObject(trx, newEventType.id, 'event_types', tags, false);
    }

    return newEventType;
  }

  /**
   * Updates an existing EventType and optionally updates its associated tags.
   * 
   * @param trx - The transaction object to run the database operations.
   * @param id - The ID of the EventType to update.
   * @param updateData - The data to update the EventType.
   * @param tags - An array of tags to update or associate with the EventType.
   * @returns A Promise that resolves to the updated EventType.
   * @throws Will throw an error if the EventType is not found.
   */
  static async updateEventTypeWithTags(trx: TransactionClientContract, id: string, updateData: any, tags: string[]): Promise<EventType> {
    const eventType = await EventType.findOrFail(id);
    eventType.useTransaction(trx);

    const updatedEventType = await eventType.merge(updateData).save();

    if (tags) {
      await setTagsForObject(trx, eventType.id, 'event_types', tags);
    }

    return updatedEventType;
  }
}

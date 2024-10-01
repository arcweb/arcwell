import { DateTime } from 'luxon';
import { TagUpdateType } from '../schemas/tag.schema';

// Base interface with common properties
interface TagBase {
  pathname: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  peopleCount?: number;
  resourcesCount?: number;
  eventsCount?: number;
  factsCount?: number;
}

// TODO: WIP.  This might be a decent way make id required after saving
// Interface for person before saving (no id)
export interface TagPreSave extends TagBase {
  id?: never;
}

// Interface for person after saving (id is required)
export interface TagPostSave extends TagBase {
  id: string;
}

export class TagModel {
  public id?: string;
  public pathname: string;
  public createdAt?: DateTime;
  public updatedAt?: DateTime;
  public peopleCount?: number;
  public resourcesCount?: number;
  public eventsCount?: number;
  public factsCount?: number;

  constructor(data: TagUpdateType) {
    this.id = data.id;
    this.pathname = data.pathname;
    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
    this.peopleCount = data.peopleCount ||= 0;
    this.resourcesCount = data.resourcesCount ||= 0;
    this.eventsCount = data.eventsCount ||= 0;
    this.factsCount = data.factsCount ||= 0;
  }

  // add helper methods here
}

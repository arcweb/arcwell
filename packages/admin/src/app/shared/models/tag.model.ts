import { DateTime } from 'luxon';
import { TagUpdateType } from '../schemas/tag.schema';

// Base interface with common properties
interface TagBase {
  pathname: string;
  createdAt: DateTime;
  updatedAt: DateTime;
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

  constructor(data: TagUpdateType) {
    this.id = data.id;
    this.pathname = data.pathname;
    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
  }

  // add helper methods here
}

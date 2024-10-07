import { DateTime } from 'luxon';
import { TagUpdateType } from '../schemas/tag.schema';
import { EventModel } from './event.model';
import { EventType } from '../schemas/event.schema';
import { PersonModel } from './person.model';
import { PersonType } from '../schemas/person.schema';
import { FactModel } from './fact.model';
import { FactType } from '../schemas/fact.schema';
import { ResourceModel } from './resource.model';
import { UserModel } from '.';
import { ResourceType } from '../schemas/resource.schema';
import { UserType } from '../schemas/user.schema';

// Base interface with common properties
interface TagBase {
  pathname: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  peopleCount?: number;
  resourcesCount?: number;
  eventsCount?: number;
  factsCount?: number;
  usersCount?: number;
  events?: EventModel[] | undefined;
  facts?: FactModel[] | undefined;
  people?: PersonModel[] | undefined;
  resources?: ResourceModel[] | undefined;
  users?: UserModel[] | undefined;
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
  public usersCount?: number;
  public events?: EventModel[] | undefined;
  public facts?: FactModel[] | undefined;
  public people?: PersonModel[] | undefined;
  public resources?: ResourceModel[] | undefined;
  public users?: UserModel[] | undefined;

  constructor(data: TagUpdateType) {
    this.id = data.id;
    this.pathname = data.pathname;
    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
    this.peopleCount = data.peopleCount ||= 0;
    this.resourcesCount = data.resourcesCount ||= 0;
    this.eventsCount = data.eventsCount ||= 0;
    this.factsCount = data.factsCount ||= 0;
    this.usersCount = data.usersCount ||= 0;
    this.events = data.events
      ? data.events.map((event: EventType) => new EventModel(event))
      : undefined;
    this.facts = data.facts
      ? data.facts.map((fact: FactType) => new FactModel(fact))
      : undefined;
    this.people = data.people
      ? data.people.map((person: PersonType) => new PersonModel(person))
      : undefined;
    this.resources = data.resources
      ? data.resources.map(
          (resource: ResourceType) => new ResourceModel(resource),
        )
      : undefined;
    this.users = data.users
      ? data.users.map((user: UserType) => new UserModel(user))
      : undefined;
  }

  // add helper methods here
}

import { DateTime } from 'luxon';
import { FactUpdateType } from '@shared/schemas/fact.schema';
import { FactTypeModel } from '@shared/models/fact-type.model';
import { TagModel } from '@shared/models/tag.model';
import { TagType } from '@schemas/tag.schema';
import { PersonType } from '@schemas/person.schema';
import { EventType } from '@schemas/event.schema';
import { PersonModel } from '@shared/models/person.model';
import { EventModel } from '@shared/models/event.model';
import { ResourceModel } from '@shared/models/resource.model';
import { ResourceType } from '@schemas/resource.schema';
import { DimensionModel } from '@shared/models/dimension.model';
import { DimensionType } from '@schemas/dimension.schema';

// Base interface with common properties
interface FactBase {
  typeKey: string;
  personId?: string;
  resourceId?: string;
  eventId?: string;
  person?: PersonType | undefined;
  resource?: ResourceType | undefined;
  event?: EventType | undefined;
  tags?: TagModel[] | undefined;
  meta?: object;
  observedAt?: DateTime;
  dimensions: DimensionModel[] | undefined;
  factType?: FactTypeModel;
  createdAt?: DateTime;
  updatedAt?: DateTime;
}

// TODO: WIP.  This might be a decent way make id required after saving
// Interface for fact before saving (no id)
export interface FactPreSave extends FactBase {
  id?: never;
}

// Interface for fact after saving (id is required)
export interface FactPostSave extends FactBase {
  id: string;
}

export class FactModel {
  public id?: string;
  public typeKey: string;
  public personId?: string;
  public resourceId?: string;
  public eventId?: string;
  public person?: PersonType | undefined;
  public resource?: ResourceType | undefined;
  public event?: EventType | undefined;
  public tags?: TagModel[] | undefined;
  public meta?: object;
  public observedAt?: DateTime;
  public dimensions: DimensionModel[] | undefined;
  public factType?: FactTypeModel;
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: FactUpdateType) {
    this.id = data.id;
    this.typeKey = data.typeKey;
    this.personId = data.personId;
    this.resourceId = data.resourceId;
    this.eventId = data.eventId;

    if (data.person) this.person = new PersonModel(data.person);
    if (data.resource) this.resource = new ResourceModel(data.resource);
    if (data.event) this.event = new EventModel(data.event);

    if (data.factType) this.factType = new FactTypeModel(data.factType);

    this.meta = data.meta;

    this.observedAt = data.observedAt
      ? DateTime.fromISO(data.observedAt)
      : undefined;

    if (data.tags)
      this.tags = data.tags.map((tag: TagType) => new TagModel(tag));

    if (data.dimensions) {
      this.dimensions = data.dimensions.map(
        (dimension: DimensionType) => new DimensionModel(dimension),
      );
    }

    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
  }

  // add helper methods here
}

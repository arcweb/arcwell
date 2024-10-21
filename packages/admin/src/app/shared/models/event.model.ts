import { DateTime } from 'luxon';
import { EventTypeModel } from '@shared/models/event-type.model';
import { EventNewType, EventType } from '@shared/schemas/event.schema';
import { PersonType } from '@schemas/person.schema';
import { ResourceType } from '@schemas/resource.schema';
import { PersonModel } from '@shared/models/person.model';
import { ResourceModel } from '@shared/models/resource.model';
import { DimensionModel } from '@shared/models/dimension.model';
import { DimensionType } from '@schemas/dimension.schema';

export class EventModel {
  public id?: string;
  public typeKey: string;
  public info?: object;
  public startedAt: DateTime;
  public endedAt?: DateTime;
  public dimensions?: DimensionModel[];
  public tags?: string[];
  public eventType?: EventTypeModel;
  public personId?: string;
  public resourceId?: string;
  public person?: PersonType;
  public resource?: ResourceType;
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: EventType | EventNewType) {
    if ('id' in data && data.id) {
      this.id = data.id;
    }
    this.typeKey = data.typeKey;
    this.info = data.info;
    this.startedAt = DateTime.fromISO(data.startedAt);
    this.endedAt = data.endedAt ? DateTime.fromISO(data.endedAt) : undefined;
    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
    if (data.dimensions) {
      this.dimensions = data.dimensions.map(
        (dimension: DimensionType) => new DimensionModel(dimension),
      );
    }
    this.tags = data.tags;
    this.eventType = data.eventType
      ? new EventTypeModel(data.eventType)
      : undefined;
    this.personId = data.personId;
    this.resourceId = data.resourceId;
    if (data.person) this.person = new PersonModel(data.person);
    if (data.resource) this.resource = new ResourceModel(data.resource);
  }
}

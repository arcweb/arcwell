import { DateTime } from 'luxon';

export class SubFeatureModel {
  public id?: string;
  public name: string;
  public path: string;
  public icon?: string;
  public createdAt: DateTime;
  public updatedAt: DateTime;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.path = data.path;
    this.icon = data.icon;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
  }

  // add helper methods here
}

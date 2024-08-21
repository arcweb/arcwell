import { DateTime } from 'luxon';
import { deserializeSubFeature } from '../schemas/sub-feature.schema';

export class FeatureModel {
  public id?: string;
  public name: string;
  public path: string;
  public icon: string;
  public createdAt: DateTime;
  public updatedAt: DateTime;
  public subFeatures: FeatureModel[];

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.path = data.path;
    this.icon = data.icon;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
    this.subFeatures = data.subFeatures
      ? data.subFeatures.map((feature: any) => deserializeSubFeature(feature))
      : [];
  }

  // add helper methods here
}

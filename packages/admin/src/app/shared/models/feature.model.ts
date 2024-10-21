import {
  deserializeSubfeature,
  SubfeatureType,
} from '@schemas/subfeature.schema';
import { FeatureType } from '@schemas/feature.schema';

export class FeatureModel {
  public name: string;
  public path: string;
  public icon: string;
  public subfeatures: FeatureModel[];

  constructor(data: FeatureType) {
    this.name = data.name;
    this.path = data.path;
    this.icon = data.icon;
    this.subfeatures = data.subfeatures
      ? data.subfeatures.map((subFeature: SubfeatureType) =>
          deserializeSubfeature(subFeature),
        )
      : [];
  }

  // add helper methods here
}

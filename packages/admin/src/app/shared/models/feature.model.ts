import { deserializeSubfeature } from '../schemas/subfeature.schema';

export class FeatureModel {
  public name: string;
  public path: string;
  public icon: string;
  public subfeatures: FeatureModel[];

  constructor(data: any) {
    this.name = data.name;
    this.path = data.path;
    this.icon = data.icon;
    this.subfeatures = data.subfeatures
      ? data.subfeatures.map((feature: any) => deserializeSubfeature(feature))
      : [];
  }

  // add helper methods here
}

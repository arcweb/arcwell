import { SubfeatureType } from '@schemas/subfeature.schema';

export class SubfeatureModel {
  public name: string;
  public path: string;
  public icon?: string;

  constructor(data: SubfeatureType) {
    this.name = data.name;
    this.path = data.path;
    this.icon = data.icon;
  }

  // add helper methods here
}

export class SubfeatureModel {
  public name: string;
  public path: string;
  public icon?: string;

  constructor(data: any) {
    this.name = data.name;
    this.path = data.path;
    this.icon = data.icon;
  }

  // add helper methods here
}

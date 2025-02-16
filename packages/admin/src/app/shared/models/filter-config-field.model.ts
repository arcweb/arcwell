import { FilterConfigFieldType } from '@schemas/filter-config-field.schema';

export class FilterConfigFieldModel {
  public name: string;
  public columnName: string;
  public type: string;
  public title: string;
  public filterType: 'filter' | 'dim';

  constructor(data: FilterConfigFieldType) {
    this.name = data.name;
    this.columnName = data.columnName;
    this.type = data.type;
    this.title = data.title;
    this.filterType = data.filterType;
  }

  // add helper methods here
}

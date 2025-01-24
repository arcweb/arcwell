import { DateTime } from 'luxon';
import { FileNewType, FileType } from '../schemas/file.schema';

export class FileModel {
  public id?: string;
  public typeKey: string;
  public name: string;
  public url: string;
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: FileType | FileNewType) {
    if ('id' in data && data.id) {
      this.id = data.id;
    }
    this.typeKey = data.typeKey;
    this.name = data.name;
    this.url = data.url;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

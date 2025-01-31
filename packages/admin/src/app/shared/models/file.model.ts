import { DateTime } from 'luxon';
import { FileNewType, FileType } from '../schemas/file.schema';
import { FileTypeModel } from './file-type.model';

export class FileModel {
  public id?: string;
  public typeKey: string;
  public name: string;
  public url: string;
  public extension: string;
  public size: string;
  public fileType?: FileType;
  public tags?: string[];
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: FileType | FileNewType) {
    if ('id' in data && data.id) {
      this.id = data.id;
    }
    this.typeKey = data.typeKey;
    this.name = data.name;
    this.url = data.url;
    this.extension = data.extension;
    this.size = data.size;
    this.tags = data.tags;

    if (data.fileType) this.fileType = new FileTypeModel(data.fileType);

    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
  }
}

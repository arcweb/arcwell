import { DateTime } from 'luxon';
import { SerializedUserType } from '../schemas/user.schema';
import { RoleModel } from './role.model';

export class UserModel {
  public id?: string;
  public fullName: string | null;
  public email: string;
  public roleId: string;
  public createdAt: DateTime;
  public updatedAt: DateTime;
  public role?: RoleModel;

  constructor(data: SerializedUserType) {
    this.id = data.id;
    this.fullName = data.fullName;
    this.email = data.email;
    this.roleId = data.roleId;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
    this.role = data.role ? new RoleModel(data.role) : undefined;
  }

  // add helper methods here
}

// TODO: Figure out if we want to do update models like this
export class UserUpdateModel {
  public id: string;
  public fullName?: string | null;
  public email?: string;
  public roleId?: string;

  constructor(data: any) {
    this.id = data.id;
    this.fullName = data.fullName;
    this.email = data.email;
    this.roleId = data.roleId;
  }
}

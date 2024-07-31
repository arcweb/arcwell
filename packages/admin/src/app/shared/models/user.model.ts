import { DateTime } from 'luxon';

import { RoleModel } from './role.model';

import { UserType } from '../schemas/user.schema';

export class UserModel {
  public id?: string;
  public fullName: string | null;
  public email: string;
  public roleId: string;
  public createdAt: DateTime;
  public updatedAt: DateTime;
  public role?: RoleModel;

  constructor(data: UserType) {
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

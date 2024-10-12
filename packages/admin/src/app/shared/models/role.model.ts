import { DateTime } from 'luxon';
import { UserType } from '@schemas/user.schema';
import { UserModel } from './user.model';
import { RoleType } from '@schemas/role.schema';

export class RoleModel {
  public id?: string;
  public name: string;
  public createdAt: DateTime;
  public updatedAt: DateTime;
  public users?: UserModel[];

  constructor(data: RoleType) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
    this.users = data.users
      ? data.users.map((user: UserType) => new UserModel(user))
      : undefined;
  }

  // add helper methods here
}

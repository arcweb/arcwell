import { DateTime } from 'luxon';
import { UserType } from '../schemas/user.schema';
import { RoleModel } from './role.model';
import { PersonModel } from './person.model';

export class UserModel {
  public id?: string;
  public email: string;
  public roleId: string;
  public personId: string;
  public createdAt: DateTime;
  public updatedAt: DateTime;
  public role?: RoleModel;
  public person?: PersonModel;

  constructor(data: UserType) {
    this.id = data.id;
    this.email = data.email;
    this.roleId = data.roleId;
    this.personId = data.personId;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
    this.role = data.role ? new RoleModel(data.role) : undefined;
    this.person = data.person ? new PersonModel(data.person) : undefined;
  }

  // add helper methods here
}

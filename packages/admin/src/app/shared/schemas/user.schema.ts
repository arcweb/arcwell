import { z } from 'zod';
import { UserModel } from '../models/user.model';
import { RoleSchema } from './role.schema';
import { StatusEnum } from './error.schema';

// validate data coming from API or sending to API for create
export const UserSchema = z
  .object({
    id: z.string().uuid().optional(),
    fullName: z.string().nullable(),
    email: z.string(),
    roleId: z.string().uuid(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    role: RoleSchema.optional(),
  })
  .strict();

// Validate data going to the API for update
export const UserUpdateSchema = UserSchema.extend({
  id: z.string().uuid(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  roleId: z.string().uuid().optional(),
}).strict();

// Responses

//  Multiple Users
export const UsersResponseSchema = z.object({
  status: StatusEnum,
  data: z.object({
    users: z.array(UserSchema),
  }),
});

// Single User
// TODO: Do we want to return an array of users or just a single user?  No, this was a mistake, format will change
export const UserResponseSchema = z.object({
  status: StatusEnum,
  data: z.object({
    user: z.array(UserSchema),
  }),
});

// export types
export type UserType = z.infer<typeof UserSchema>;
export type UserUpdateType = z.infer<typeof UserUpdateSchema>;
export type UsersResponseType = z.infer<typeof UsersResponseSchema>;
export type UserResponseType = z.infer<typeof UserResponseSchema>;

// Deserializer / Serializer
export const deserializeUser = (data: UserType): UserModel => {
  return new UserModel(data);
};

export const serializeUser = (data: UserModel): UserType => {
  return {
    ...data,
    createdAt: data.createdAt.toISO(),
    updatedAt: data.updatedAt.toISO(),
  };
};

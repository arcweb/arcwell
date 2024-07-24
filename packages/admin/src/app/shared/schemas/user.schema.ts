import { z } from 'zod';
import { UserModel } from '../models/user.model';
import { RoleSchema } from './role.schema';
import { StatusEnum } from './error.schema';

export const UserSchema: any = z
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

// TODO: Figure out if this is how we want to handle these slim types
export const UserUpdateSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  roleId: z.string().uuid().optional(),
});

const SerializedUserSchema = UserSchema.extend({});

// Responses

//  Multiple Users
export const UsersResponseSchema = z.object({
  status: StatusEnum,
  data: z.object({
    users: z.array(UserSchema),
  }),
});

// Single User
export const UserResponseSchema = z.object({
  status: StatusEnum,
  data: z.object({
    user: z.array(UserSchema),
  }),
});

// export types
export type UserType = z.infer<typeof UserSchema>;
export type UserUpdateType = z.infer<typeof UserUpdateSchema>;
export type SerializedUserType = z.infer<typeof SerializedUserSchema>;
export type UsersResponseType = z.infer<typeof UsersResponseSchema>;
export type UserResponseType = z.infer<typeof UserResponseSchema>;

// Deserializer / Serializer
export const deserializeUser = (data: SerializedUserType): UserModel => {
  return new UserModel(data);
};

export const serializeUser = (data: UserModel): SerializedUserType => {
  return {
    ...data,
    createdAt: data.createdAt.toISO(),
    updatedAt: data.updatedAt.toISO(),
  };
};

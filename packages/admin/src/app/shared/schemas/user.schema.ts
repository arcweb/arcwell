import { z } from 'zod';
import { UserModel } from '../models/user.model';
import { RoleSchema } from './role.schema';

// validate data coming from API or sending to API for create
// TODO: Do we want to have both request and response schemas?  Or do we want to make some fields optional?
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

// TODO: This shouldn't be needed, up for discussion
// const SerializedUserSchema = UserSchema.extend({});

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
  data: z.array(UserSchema),
});

// Single User
export const UserResponseSchema = z.object({
  data: z.object(UserSchema),
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

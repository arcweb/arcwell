import { z } from 'zod';
import { UserModel } from '@shared/models';
import { RoleSchema } from './role.schema';
import { PersonSchema } from '@shared/schemas/person.schema';

// validate data coming from API or sending to API for create
// TODO: Do we want to have both request and response schemas?  Or do we want to make some fields optional?
export const UserSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    email: z.string(),
    roleId: z.string().uuid(),
    personId: z.string().uuid().optional().nullable(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
    role: z.lazy(() => RoleSchema).optional(),
    person: z
      .lazy(() => PersonSchema)
      .optional()
      .nullable(),
    tags: z.array(z.string()).optional(),
    passwordResetCode: z.string().optional().nullable(),
    requiresPasswordChange: z.boolean().optional().nullable(),
  })
  .strict();

// Validate data going to the API for update
export const UserUpdateSchema = UserSchema.extend({
  id: z.string().uuid(),
  email: z.string().optional(),
  roleId: z.string().uuid().optional(),
}).strict();

// Responses

//  Multiple Users
export const UsersResponseSchema = z.object({
  data: z.array(UserSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

// Single User
export const UserResponseSchema = z.object({
  data: UserSchema,
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
    createdAt: data.createdAt?.toISO() ?? undefined,
    updatedAt: data.updatedAt?.toISO() ?? undefined,
  };
};

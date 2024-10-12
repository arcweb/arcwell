import { z } from 'zod';
import { UserSchema } from './user.schema';
import { RoleModel } from '../models';

export const RoleSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    users: z.array(z.lazy(() => UserSchema)).optional(),
  })
  .strict();

// Multiple Roles
export const RolesResponseSchema = z.object({
  data: z.array(RoleSchema),
  meta: z.object({ count: z.number() }).optional(),
});

// Single Role
export const RoleResponseSchema = z.object({
  data: RoleSchema,
});

export type RoleType = z.infer<typeof RoleSchema>;
export type RoleResponseType = z.infer<typeof RoleResponseSchema>;
export type RolesResponseType = z.infer<typeof RolesResponseSchema>;

// Deserializer / Serializer
export const deserializeRole = (data: RoleType): RoleModel => {
  return new RoleModel(data);
};

export const serializeRole = (data: RoleModel): RoleType => {
  return {
    ...data,
    createdAt: data.createdAt?.toISO() ?? undefined,
    updatedAt: data.updatedAt?.toISO() ?? undefined,
  };
};

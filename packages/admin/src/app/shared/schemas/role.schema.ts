import { z } from 'zod';

import { UserSchema } from './user.schema';

export const RoleSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    users: z.array(UserSchema).optional(),
  })
  .strict();

export type RoleType = z.infer<typeof RoleSchema>;

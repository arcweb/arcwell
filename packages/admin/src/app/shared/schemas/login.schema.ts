import { string, z } from 'zod';

import { UserSchema } from '@shared/schemas/user.schema';

export const LoginSchema = z
  .object({
    email: string(),
    password: string(),
  })
  .strict();

// Single User
export const LoginResponseSchema = z.object({
  data: z.object({
    token: z.object({
      type: z.literal('bearer'),
      value: z.string(),
      expiresAt: z.string().datetime({ offset: true }),
    }),
    user: UserSchema,
  }),
});

// export types
export type LoginType = z.infer<typeof LoginSchema>;
export type LoginResponseType = z.infer<typeof LoginResponseSchema>;

import { z } from 'zod';

export const ChangeSchema: any = z
  .object({
    email: z.string().email().trim(),
    password: z.string(),
    newPassword: z.string(),
  })
  .strict();

export type ChangeType = z.infer<typeof ChangeSchema>;

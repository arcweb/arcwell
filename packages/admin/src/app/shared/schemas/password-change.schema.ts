import { z } from 'zod';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const ChangeSchema: any = z
  .object({
    email: z.string().email().trim(),
    password: z.string(),
    newPassword: z.string(),
  })
  .strict();

export type ChangeType = z.infer<typeof ChangeSchema>;

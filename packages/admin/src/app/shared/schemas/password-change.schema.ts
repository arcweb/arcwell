import { z } from 'zod';

export const ChangeSchema: any = z
  .object({
    emal: z.string().email().trim(),
    password: z.string(),
    newPassword: z.string(),
  })
  .strict();

export type ChangeType = z.infer<typeof ChangeSchema>;

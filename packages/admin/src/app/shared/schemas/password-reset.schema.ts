import { z } from 'zod';

export const ResetSchema: any = z
  .object({
    code: z.string(),
    password: z.string(),
  })
  .strict();

export type ResetType = z.infer<typeof ResetSchema>;

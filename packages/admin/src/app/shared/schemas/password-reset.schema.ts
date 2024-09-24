import { string, z } from 'zod';

export const ResetSchema:any = z
  .object({
    token: z.string(),
    password: z.string(),
  })
  .strict();

export type ResetType = z.infer<typeof ResetSchema>;

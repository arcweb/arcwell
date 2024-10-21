import { z } from 'zod';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const ResetSchema: any = z
  .object({
    code: z.string(),
    password: z.string(),
  })
  .strict();

export type ResetType = z.infer<typeof ResetSchema>;

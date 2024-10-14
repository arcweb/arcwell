import { z } from 'zod';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const SetSchema: any = z
  .object({
    tempPasswor: z.string(),
    password: z.string(),
  })
  .strict();

export type SetType = z.infer<typeof SetSchema>;

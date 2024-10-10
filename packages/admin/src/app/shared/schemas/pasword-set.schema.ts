import { z } from 'zod';

export const SetSchema: any = z
  .object({
    tempPasswor: z.string(),
    password: z.string(),
  })
  .strict();

export type SetType = z.infer<typeof SetSchema>;

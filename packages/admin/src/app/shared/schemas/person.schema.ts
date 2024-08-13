import { z } from 'zod';

export const PersonSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    familyName: z.string(),
    givenName: z.string(),
    personTypeId: z.string().uuid().optional(),
    tags: z.array(z.any()).optional(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict();

export type PersonType = z.infer<typeof PersonSchema>;

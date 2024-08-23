import { z } from 'zod';

export const ErrorSchema = z
  .object({
    title: z.string(),
    code: z.string().optional(),
    detail: z.string().optional(),
    meta: z.array(z.any()).optional(),
  })
  .strict();

const ErrorsSchema: any = z.object({
  errors: z.array(ErrorSchema),
  meta: z.array(z.any()).optional(),
});

export type ErrorResponseType = z.infer<typeof ErrorsSchema>;

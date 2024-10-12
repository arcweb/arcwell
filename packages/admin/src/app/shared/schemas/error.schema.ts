import { z } from 'zod';

export const ErrorSchema = z
  .object({
    title: z.string(),
    code: z.string().optional(),
    detail: z.string().optional(),
    info: z.object({}).passthrough(),
  })
  .strict();

export const ErrorsSchema: any = z.object({
  errors: z.array(ErrorSchema),
  info: z.object({}).passthrough().optional(),
});

export type ErrorResponseType = z.infer<typeof ErrorsSchema>;

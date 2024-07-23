import { z } from 'zod';

export const StatusEnum = z.enum(['success', 'error']);

const ErrorSchema: any = z.object({
  status: StatusEnum,
  message: z.string(),
});

export type ErrorResponseType = z.infer<typeof ErrorSchema>;

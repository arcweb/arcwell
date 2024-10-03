import { z } from 'zod';

export const ConfigSchema: any = z
  .object({
    arcwell: z.object({
      name: z.string().trim(),
      id: z.string().trim(),
    }),
    mail: z.object({
      host: z.string().trim(),
      port: z.number(),
      fromAddress: z.string().email(),
      fromName: z.string(),
    }),
  })
  .strict();

export type ConfigType = z.infer<typeof ConfigSchema>;

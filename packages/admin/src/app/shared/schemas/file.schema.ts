import { z } from 'zod';
import { FileModel } from '../models/file.model';

export const FileSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    typeKey: z.string(),
    name: z.string(),
    url: z.string(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const FileUpdateSchema = FileSchema.extend({
  id: z.string().uuid(),
  typeKey: z.string().optional(),
  name: z.string(),
  url: z.string(),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
}).strict();

//  Multiple Files
export const FilesResponseSchema = z.object({
  data: z.array(FileSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

// Single File
export const FileResponseSchema = z.object({
  data: FileSchema,
});

export const FilesCountSchema = z.object({
  data: z.object({
    count: z.number(),
  }),
});

export type FileType = z.infer<typeof FileSchema>;
export type FileUpdateType = z.infer<typeof FileUpdateSchema>;
export type FilesResponseType = z.infer<typeof FilesResponseSchema>;
export type FileResponseType = z.infer<typeof FileResponseSchema>;
export type FilesCountType = z.infer<typeof FilesCountSchema>;

export const deserializeFile = (file: FileType): FileModel => {
  return new FileModel(file);
};

export const serializeFile = (file: FileModel): FileType => {
  return {
    ...file,
    id: file.id,
    typeKey: file.typeKey,
    name: file.name,
    url: file.url,
    createdAt: file.createdAt?.toISO() ?? undefined,
    updatedAt: file.updatedAt?.toISO() ?? undefined,
  };
};

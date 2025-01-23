import { z } from 'zod';
import { DimensionSchemaSchema } from './dimension-schema.schema';
import { FileTypeModel } from '../models/file-type.model';
import { FileSchema } from './file.schema';

export const FileTypeSchema = z
  .object({
    id: z.string().uuid(),
    key: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    dimensionSchemas: z.lazy(() =>
      z.array(DimensionSchemaSchema.optional()).optional(),
    ),
    files: z.lazy(() => z.array(FileSchema).optional()),
    tags: z.array(z.string()).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const FileTypeNewSchema = FileTypeSchema.omit({ id: true });

export const FileTypeUpdateSchema = FileTypeSchema.pick({
  id: true,
}).merge(FileTypeSchema.omit({ id: true }).partial());

export const FileTypesResponseSchema = z.object({
  data: z.array(FileTypeSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

export const FileTypeResponseSchema = z.object({
  data: FileTypeSchema,
});

export type FileTypeType = z.infer<typeof FileTypeSchema>;
export type FileTypeNewType = z.infer<typeof FileTypeNewSchema>;
export type FileTypeUpdateType = z.infer<typeof FileTypeUpdateSchema>;
export type FileTypesResponseType = z.infer<typeof FileTypesResponseSchema>;
export type FileTypeResponseType = z.infer<typeof FileTypeResponseSchema>;

export const deserializeFileType = (data: FileTypeType): FileTypeModel => {
  return new FileTypeModel(data);
};

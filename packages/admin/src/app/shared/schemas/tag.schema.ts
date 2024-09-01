import { z } from 'zod';
import { TagModel } from '@shared/models/tag.model';

export const TagSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    pathname: z.string(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

// Validate data going to the API for update
export const TagUpdateSchema = TagSchema.extend({
  id: z.string().uuid(),
  pathname: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
}).strict();

//  Multiple People
export const TagsResponseSchema = z.object({
  data: z.array(TagSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

// Single Person
export const TagResponseSchema = z.object({
  data: TagSchema,
});

export type TagType = z.infer<typeof TagSchema>;
export type TagUpdateType = z.infer<typeof TagUpdateSchema>;
export type TagsResponseType = z.infer<typeof TagsResponseSchema>;
export type TagResponseType = z.infer<typeof TagResponseSchema>;

// Deserializer / Serializer
export const deserializeTag = (data: TagType): TagModel => {
  return new TagModel(data);
};

export const serializeTag = (data: TagModel): TagType => {
  return {
    ...data,
    createdAt: data.createdAt?.toISO(),
    updatedAt: data.updatedAt?.toISO(),
  };
};

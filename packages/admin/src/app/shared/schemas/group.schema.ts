import { z } from 'zod';
import { GroupModel } from '@shared/models/group.model';
import { PersonSchema } from './person.schema';
import { EventSchema } from './event.schema';
import { FactSchema } from './fact.schema';
import { ResourceSchema } from './resource.schema';
import { UserSchema } from './user.schema';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const GroupSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
    peopleCount: z.number().optional().nullable(),
    resourcesCount: z.number().optional().nullable(),
    eventsCount: z.number().optional().nullable(),
    factsCount: z.number().optional().nullable(),
    usersCount: z.number().optional().nullable(),
    events: z.lazy(() => z.array(EventSchema).optional()),
    facts: z.lazy(() => z.array(FactSchema).optional()),
    people: z.lazy(() => z.array(PersonSchema).optional()),
    resources: z.lazy(() => z.array(ResourceSchema).optional()),
    users: z.lazy(() => z.array(UserSchema).optional()),
  })
  .strict();

// Validate data going to the API for update
export const GroupUpdateSchema = GroupSchema.extend({
  id: z.string().uuid(),
  name: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
}).strict();

//  Multiple Groups
export const GroupsResponseSchema = z.object({
  data: z.array(GroupSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

export const GroupsSimpleResponseSchema = z.object({
  data: z.array(z.string()),
});

// Single Group
export const GroupResponseSchema = z.object({
  data: GroupSchema,
});

export const GroupsCountSchema = z.object({
  data: z.object({
    count: z.number(),
  }),
});

export type GroupType = z.infer<typeof GroupSchema>;
export type GroupUpdateType = z.infer<typeof GroupUpdateSchema>;
export type GroupsResponseType = z.infer<typeof GroupsResponseSchema>;
export type GroupResponseType = z.infer<typeof GroupResponseSchema>;
export type GroupsSimpleResponseType = z.infer<
  typeof GroupsSimpleResponseSchema
>;
export type GroupsCountType = z.infer<typeof GroupsCountSchema>;

// Deserializer / Serializer
export const deserializeGroup = (data: GroupType): GroupModel => {
  return new GroupModel(data);
};

export const serializeGroup = (data: GroupModel): GroupType => {
  return {
    ...data,
    createdAt: data.createdAt?.toISO(),
    updatedAt: data.updatedAt?.toISO(),
  };
};

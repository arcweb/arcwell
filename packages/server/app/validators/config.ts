import vine from '@vinejs/vine'
import { createEventTypeSchema } from '#validators/event_type';
import { createFactTypeSchema } from '#validators/fact_type'
import { createPersonTypeSchema } from '#validators/person_type';
import { createResourceTypeSchema } from '#validators/resource_type';
import { createRoleSchema } from '#validators/role';
import { createUserSchema } from '#validators/user';

/**
 * Validates the installation configuration
 */
export const installConfigSchema = vine.object({
  event_types: vine.array(createEventTypeSchema).optional(),
  fact_types: vine.array(createFactTypeSchema).optional(),
  person_types: vine.array(createPersonTypeSchema).optional(),
  resource_types: vine.array(createResourceTypeSchema).optional(),
  roles: vine.array(createRoleSchema).optional(),
  users: vine.array(createUserSchema).optional(),
});

export const installConfigValidator = vine.compile(installConfigSchema);
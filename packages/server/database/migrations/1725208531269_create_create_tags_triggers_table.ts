import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.raw(`
      CREATE OR REPLACE FUNCTION enforce_object_type_fk()
      RETURNS TRIGGER AS $$
      BEGIN
          -- For INSERT or UPDATE operations, check and enforce foreign key constraints
          IF NEW.object_type = 'activities' THEN
              IF NOT EXISTS (SELECT 1 FROM public.activities WHERE id = NEW.object_id) THEN
                  RAISE EXCEPTION 'Object ID % does not exist in activities', NEW.object_id;
              END IF;
          ELSIF NEW.object_type = 'activity_types' THEN
              IF NOT EXISTS (SELECT 1 FROM public.activity_types WHERE id = NEW.object_id) THEN
                  RAISE EXCEPTION 'Object ID % does not exist in activity_types', NEW.object_id;
              END IF;
          ELSIF NEW.object_type = 'cohorts' THEN
              IF NOT EXISTS (SELECT 1 FROM public.cohorts WHERE id = NEW.object_id) THEN
                  RAISE EXCEPTION 'Object ID % does not exist in cohorts', NEW.object_id;
              END IF;
          ELSIF NEW.object_type = 'event_types' THEN
              IF NOT EXISTS (SELECT 1 FROM public.event_types WHERE id = NEW.object_id) THEN
                  RAISE EXCEPTION 'Object ID % does not exist in event_types', NEW.object_id;
              END IF;
          ELSIF NEW.object_type = 'events' THEN
              IF NOT EXISTS (SELECT 1 FROM public.events WHERE id = NEW.object_id) THEN
                  RAISE EXCEPTION 'Object ID % does not exist in events', NEW.object_id;
              END IF;
          ELSIF NEW.object_type = 'fact_types' THEN
              IF NOT EXISTS (SELECT 1 FROM public.fact_types WHERE id = NEW.object_id) THEN
                  RAISE EXCEPTION 'Object ID % does not exist in fact_types', NEW.object_id;
              END IF;
          ELSIF NEW.object_type = 'facts' THEN
              IF NOT EXISTS (SELECT 1 FROM public.facts WHERE id = NEW.object_id) THEN
                  RAISE EXCEPTION 'Object ID % does not exist in facts', NEW.object_id;
              END IF;
          ELSIF NEW.object_type = 'people' THEN
              IF NOT EXISTS (SELECT 1 FROM public.people WHERE id = NEW.object_id) THEN
                  RAISE EXCEPTION 'Object ID % does not exist in people', NEW.object_id;
              END IF;
          ELSIF NEW.object_type = 'person_types' THEN
              IF NOT EXISTS (SELECT 1 FROM public.person_types WHERE id = NEW.object_id) THEN
                  RAISE EXCEPTION 'Object ID % does not exist in person_types', NEW.object_id;
              END IF;
          ELSIF NEW.object_type = 'resource_types' THEN
              IF NOT EXISTS (SELECT 1 FROM public.resource_types WHERE id = NEW.object_id) THEN
                  RAISE EXCEPTION 'Object ID % does not exist in resource_types', NEW.object_id;
              END IF;
          ELSIF NEW.object_type = 'resources' THEN
              IF NOT EXISTS (SELECT 1 FROM public.resources WHERE id = NEW.object_id) THEN
                  RAISE EXCEPTION 'Object ID % does not exist in resources', NEW.object_id;
              END IF;
          ELSIF NEW.object_type = 'users' THEN
              IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.object_id) THEN
                  RAISE EXCEPTION 'Object ID % does not exist in users', NEW.object_id;
              END IF;
          ELSE
              -- Since object_type is an enum, this branch should never be reached
              RAISE EXCEPTION 'Invalid object type: %', NEW.object_type;
          END IF;

          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Create the trigger on the tag_object table for enforcing foreign key relationships
      CREATE TRIGGER tag_object_enforce_fk_trigger
      BEFORE INSERT OR UPDATE ON public.tag_object
      FOR EACH ROW EXECUTE FUNCTION enforce_object_type_fk();
    `)
  }

  async down() {
    await this.raw(`
      -- Remove the trigger from the tag_object table
      DROP TRIGGER tag_object_enforce_fk_trigger ON public.tag_object;

      -- Remove the enforce_object_type_fk function
      DROP FUNCTION enforce_object_type_fk();
    `)
  }
}

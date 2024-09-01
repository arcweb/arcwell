import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.raw(`
      CREATE OR REPLACE FUNCTION cascade_delete_tag_object()
      RETURNS TRIGGER AS $$
      BEGIN
          DELETE FROM public.tag_object
          WHERE object_id = OLD.id AND object_type = TG_TABLE_NAME::public.tag_object_object_type;
          RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER cohorts_cascade_delete_trigger
      AFTER DELETE ON public.cohorts
      FOR EACH ROW EXECUTE FUNCTION cascade_delete_tag_object();

      CREATE TRIGGER people_cascade_delete_trigger
      AFTER DELETE ON public.people
      FOR EACH ROW EXECUTE FUNCTION cascade_delete_tag_object();

      CREATE TRIGGER person_types_cascade_delete_trigger
      AFTER DELETE ON public.person_types
      FOR EACH ROW EXECUTE FUNCTION cascade_delete_tag_object();

      CREATE TRIGGER events_cascade_delete_trigger
      AFTER DELETE ON public.events
      FOR EACH ROW EXECUTE FUNCTION cascade_delete_tag_object();

      CREATE TRIGGER event_types_cascade_delete_trigger
      AFTER DELETE ON public.event_types
      FOR EACH ROW EXECUTE FUNCTION cascade_delete_tag_object();

      CREATE TRIGGER facts_cascade_delete_trigger
      AFTER DELETE ON public.facts
      FOR EACH ROW EXECUTE FUNCTION cascade_delete_tag_object();

      CREATE TRIGGER fact_types_cascade_delete_trigger
      AFTER DELETE ON public.fact_types
      FOR EACH ROW EXECUTE FUNCTION cascade_delete_tag_object();

      CREATE TRIGGER resources_cascade_delete_trigger
      AFTER DELETE ON public.resources
      FOR EACH ROW EXECUTE FUNCTION cascade_delete_tag_object();

      CREATE TRIGGER resource_types_cascade_delete_trigger
      AFTER DELETE ON public.resource_types
      FOR EACH ROW EXECUTE FUNCTION cascade_delete_tag_object();

      CREATE TRIGGER users_cascade_delete_trigger
      AFTER DELETE ON public.users
      FOR EACH ROW EXECUTE FUNCTION cascade_delete_tag_object();
    `)
  }

  async down() {
    await this.raw(`
      -- Drop triggers


      DROP TRIGGER cohorts_cascade_delete_trigger ON public.cohorts;
      DROP TRIGGER people_cascade_delete_trigger ON public.people;
      DROP TRIGGER events_cascade_delete_trigger ON public.events;
      DROP TRIGGER resources_cascade_delete_trigger ON public.resources;
      DROP TRIGGER event_types_cascade_delete_trigger ON public.event_types;
      DROP TRIGGER fact_types_cascade_delete_trigger ON public.fact_types;
      DROP TRIGGER facts_cascade_delete_trigger ON public.facts;
      DROP TRIGGER person_types_cascade_delete_trigger ON public.person_types;
      DROP TRIGGER resource_types_cascade_delete_trigger ON public.resource_types;
      DROP TRIGGER users_cascade_delete_trigger ON public.users;

      -- Drop the function
      DROP FUNCTION cascade_delete_tag_object();

    `)
  }
}

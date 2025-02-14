import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.raw(`
      CREATE OR REPLACE FUNCTION enforce_group_object_type_fk()
      RETURNS TRIGGER AS $$
      DECLARE
          query TEXT;
          table_exists BOOLEAN;
      BEGIN
          -- Construct dynamic SQL to check if the object ID exists in the appropriate table
          query := 'SELECT EXISTS (SELECT 1 FROM ' || quote_ident(NEW.object_type) || ' WHERE id = $1)';

          -- Execute the query with the object_id as a parameter
          EXECUTE query INTO table_exists USING NEW.object_id;

          -- Raise an exception if the object ID does not exist in the given table
          IF NOT table_exists THEN
              RAISE EXCEPTION 'Object ID % does not exist in %', NEW.object_id, NEW.object_type;
          END IF;

          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Create the trigger on the group_object table for enforcing foreign key relationships
      CREATE TRIGGER group_object_enforce_fk_trigger
      BEFORE INSERT OR UPDATE ON group_object
      FOR EACH ROW EXECUTE FUNCTION enforce_group_object_type_fk();
    `)
  }

  async down() {
    await this.raw(`
      -- Remove the trigger from the group_object table
      DROP TRIGGER group_object_enforce_fk_trigger ON public.group_object;

      -- Remove the enforce_group_object_type_fk function
      DROP FUNCTION enforce_group_object_type_fk();
    `)
  }
}

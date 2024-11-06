import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.raw(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm with schema public;
      CREATE INDEX idx_cohorts_name_trgm ON cohorts USING gin (name gin_trgm_ops);
      CREATE INDEX idx_event_types_name_trgm ON event_types USING gin (name gin_trgm_ops);
      CREATE INDEX idx_fact_types_name_trgm ON fact_types USING gin (name gin_trgm_ops);
      CREATE INDEX idx_people_family_name_trgm ON people USING gin (family_name gin_trgm_ops);
      CREATE INDEX idx_person_types_name_trgm ON person_types USING gin (name gin_trgm_ops);
      CREATE INDEX idx_resources_name_trgm ON resources USING gin (name gin_trgm_ops);
      CREATE INDEX idx_resource_types_name_trgm ON resource_types USING gin (name gin_trgm_ops);
    `)
  }

  async down() {
    this.schema.alterTable('cohorts', (table) => {
      table.dropIndex(['name'], 'idx_cohorts_name_trgm')
    })
    this.schema.alterTable('event_types', (table) => {
      table.dropIndex(['name'], 'idx_event_types_name_trgm')
    })
    this.schema.alterTable('fact_types', (table) => {
      table.dropIndex(['name'], 'idx_fact_types_name_trgm')
    })
    this.schema.alterTable('people', (table) => {
      table.dropIndex(['name'], 'idx_people_family_name_trgm')
    })
    this.schema.alterTable('person_types', (table) => {
      table.dropIndex(['name'], 'idx_person_types_name_trgm')
    })
    this.schema.alterTable('resources', (table) => {
      table.dropIndex(['name'], 'idx_resources_name_trgm')
    })
    this.schema.alterTable('resource_types', (table) => {
      table.dropIndex(['name'], 'idx_resource_types_name_trgm')
    })
  }
}

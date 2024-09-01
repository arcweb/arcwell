import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tag_object'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('tag_id').notNullable()
      table.uuid('object_id').notNullable()
      // table.string('object_type').notNullable() // Represents the table ('people', 'events', 'resources', etc)
      table
        .enu(
          'object_type',
          [
            'people',
            'person_types',
            'events',
            'event_types',
            'facts',
            'fact_types',
            'resources',
            'resource_types',
            'users',
          ],
          {
            useNative: true,
            enumName: 'tag_object_object_type',
            existingType: false,
            schemaName: 'public',
          }
        )
        .notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Constraints
      table.foreign('tag_id').references('tags.id').onDelete('CASCADE')
      table.unique(['tag_id', 'object_id'])

      // Indices
      table.index(['tag_id', 'object_id', 'object_type'], 'idx_tag_object_object_type')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE "tag_object_object_type"')
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'group_object'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('group_id').notNullable()
      table.uuid('object_id').notNullable()
      table.string('object_type').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Constraints
      table.foreign('group_id').references('groups.id').onDelete('CASCADE')
      table.unique(['group_id', 'object_id', 'object_type'])

      // Indices
      table.index(['group_id', 'object_id', 'object_type'], 'idx_group_object_object_type')
      table.index(['object_id', 'object_type'], 'idx_group_object_object_id_type')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

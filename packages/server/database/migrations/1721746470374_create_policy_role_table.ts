import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'policy_role'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('policy_id').notNullable()
      table.uuid('role_id').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Constraints
      table.foreign('policy_id').references('policies.id')
      table.foreign('role_id').references('roles.id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

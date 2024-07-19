import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('role_id').notNullable() //.references('id').inTable('roles')
      table.foreign('role_id').references('roles.id')
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('role_id')
    })
  }
}

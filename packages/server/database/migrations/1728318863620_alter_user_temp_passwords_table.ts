import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('temp_pasword').nullable()
      table.boolean('requires_password_change').nullable()
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('temp_password')
      table.dropColumn('requires_pasword_change')
    })
  }
}

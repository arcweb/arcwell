import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'roles'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropNullable('name')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.setNullable('name')
    })
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.setNullable('password')
      table.setNullable('person_id')
    })
  }

  async down() {}
}

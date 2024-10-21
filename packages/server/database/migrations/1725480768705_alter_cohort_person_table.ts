import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cohort_person'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['person_id', 'cohort_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['person_id', 'cohort_id'])
    })
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cohort_person'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('person_id')
      table.foreign('person_id').references('people.id').onDelete('CASCADE')
      table.dropForeign('cohort_id')
      table.foreign('cohort_id').references('cohorts.id').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('person_id')
      table.foreign('person_id').references('people.id')
      table.dropForeign('cohort_id')
      table.foreign('cohort_id').references('cohorts.id')
    })
  }
}

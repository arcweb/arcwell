import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'alter_cohorts_add_rules_defaults'

  async up() {
    this.schema.alterTable('cohorts', (table) => {
      table.dropColumn('rules')
    })
    this.schema.alterTable('cohorts', (table) => {
      table.jsonb('rules').defaultTo('{}').notNullable()
    })
  }

  async down() {
    this.schema.alterTable('cohorts', (table) => {
      table.dropColumn('rules')
    })
    this.schema.alterTable('cohorts', (table) => {
      table.jsonb('rules').nullable()
    })
  }
}

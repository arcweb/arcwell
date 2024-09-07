import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('people', (table) => {
      // table.dropIndex(['tags'], 'people_tags_gin')
      table.dropColumn('tags')
    })

    this.schema.alterTable('tags', (table) => {
      table.dropColumn('parent')
      table.dropColumn('basename')
    })
  }

  async down() {
    this.schema.alterTable('people', (table) => {
      table.jsonb('tags').defaultTo('[]').notNullable()
      table.index(['tags'], 'people_tags_gin', 'gin')
    })

    this.schema.alterTable('tags', (table) => {
      table.string('parent').notNullable().defaultTo('rollback-tag')
      table.string('basename').notNullable().defaultTo('rollback-tag')
    })
  }
}

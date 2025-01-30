import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected fileTableName = 'files'
  protected fileTypeTableName = 'file_types'

  async up() {
    this.schema.createTable(this.fileTypeTableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('key').unique().notNullable()
      table.string('name').notNullable()
      table.jsonb('dimensions').defaultTo('{}').notNullable()
      table.jsonb('tags').defaultTo('[]').notNullable()

      table.index(['tags'], 'file_types_tags_gin', 'gin')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable(this.fileTableName, (table) => {
      table.increments('id')

      table.string('name').notNullable()
      table.string('extension').notNullable()
      table.string('url').notNullable()
      table.string('size').notNullable()

      table.uuid('file_type_id').notNullable()
      table.foreign('file_type_id').references('file_types.id')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.fileTableName)
    this.schema.dropTable(this.fileTypeTableName)
  }
}

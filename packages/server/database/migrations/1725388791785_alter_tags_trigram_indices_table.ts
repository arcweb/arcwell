import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tags'

  async up() {
    await this.raw(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm with schema public;
      CREATE INDEX idx_tags_pathname_trgm ON tags USING gin (pathname gin_trgm_ops);
    `)
    // The following didn't work, so i added the index above with raw sql.
    // this.schema.alterTable(this.tableName, (table) => {
    //   table.index(['pathname'], 'idx_tags_pathname_trgm', 'gin_trgm_ops')
    // })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['pathname'], 'idx_tags_pathname_trgm')
    })
  }
}

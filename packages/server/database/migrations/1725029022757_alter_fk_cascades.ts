import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected eventsTableName = 'events'
  protected factsTableName = 'facts'
  protected peopleTableName = 'people'
  protected resourcesTableName = 'resources'

  async up() {
    this.schema.alterTable(this.eventsTableName, (table) => {
      table.dropForeign('type_key')
      table.foreign('type_key').references('event_types.key').onUpdate('CASCADE')
    })

    this.schema.alterTable(this.factsTableName, (table) => {
      table.dropForeign('type_key')
      table.foreign('type_key').references('fact_types.key').onUpdate('CASCADE')
    })

    this.schema.alterTable(this.peopleTableName, (table) => {
      table.dropForeign('type_key')
      table.foreign('type_key').references('person_types.key').onUpdate('CASCADE')
    })

    this.schema.alterTable(this.resourcesTableName, (table) => {
      table.dropForeign('type_key')
      table.foreign('type_key').references('resource_types.key').onUpdate('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.eventsTableName, (table) => {
      table.dropForeign('type_key')
      table.foreign('type_key').references('event_types.key')
    })

    this.schema.alterTable(this.factsTableName, (table) => {
      table.dropForeign('type_key')
      table.foreign('type_key').references('fact_types.key')
    })

    this.schema.alterTable(this.peopleTableName, (table) => {
      table.dropForeign('type_key')
      table.foreign('type_key').references('person_types.key')
    })

    this.schema.alterTable(this.resourcesTableName, (table) => {
      table.dropForeign('type_key')
      table.foreign('type_key').references('resource_types.key')
    })
  }
}

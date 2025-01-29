import { DateTime } from 'luxon'
import { afterDelete, beforeSave, column, manyToMany, scope } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Tag from '#models/tag'
import AwBaseModel from '#models/aw_base_model'
import FormSection from './form_section'

export default class Form extends AwBaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({ meta: { type: 'string' } })
  declare name: string

  @column()
  declare sections: FormSection[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Tag, {
    pivotTimestamps: true,
    pivotTable: 'tag_object',
    pivotForeignKey: 'object_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  declare tags: ManyToMany<typeof Tag>

  @beforeSave()
  static async generateJson(form: Form) {
    // stringify jsonb column to circumvent issue with knex and postgresql
    if (form.sections && typeof form.sections !== 'string') {
      // @ts-ignore - ignoring because sections have to be stringify-ed to get around knex & postgresql jsonb issue
      form.sections = JSON.stringify(form.sections)
    }
  }

  @afterDelete()
  static async detachTags(form: Form) {
    await form.related('tags').detach()
  }

  static fullForm = scope((query: ModelQueryBuilderContract<typeof Form>) => {
    query.preload('tags')
  })
}

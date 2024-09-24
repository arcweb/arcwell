import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { afterDelete, BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Role from '#models/role'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Person from '#models/person'
import Tag from '#models/tag'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare roleId: string

  @column()
  declare personId: string

  @column()
  declare passwordResetCode: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  @belongsTo(() => Person)
  declare person: BelongsTo<typeof Person>

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    tokenSecretLength: 40,
  })

  @manyToMany(() => Tag, {
    pivotTimestamps: true,
    pivotTable: 'tag_object',
    pivotForeignKey: 'object_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  declare tags: ManyToMany<typeof Tag>

  @afterDelete()
  static async detachTags(user: User) {
    await user.related('tags').detach()
  }

  static async generateResetCode(user: User) {
    let letters = '0123456789ABCDEF'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += letters[Math.floor(Math.random() * 16)]
    }

    user.merge({ passwordResetCode: code })
    await user.save()

    return user.passwordResetCode
  }
}

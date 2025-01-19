/* eslint-disable prettier/prettier */
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { v4 as uuid } from 'uuid'
import Organization from '#models/organization'
import Notification from '#models/notification'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  public id: string | undefined

  @column()
  public email!: string

  @column()
  public firstName!: string

  @column()
  public lastName!: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  public role!: 'ADMIN' | 'MANAGER' | 'SUPPORT'

  @column()
  public phoneNumber!: string

  @column()
  public twoFactorEnabled!: boolean

  @column()
  public status!: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

  @column()
  public organizationId!: string

  @column.dateTime()
  public lastLoginAt!: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt!: DateTime

  @belongsTo(() => Organization)
  public organization: BelongsTo<typeof Organization>

  @hasMany(() => Notification)
  public notifications: HasMany<typeof Notification>

  @beforeCreate()
  public static async createUUID(user: User) {
    user.id = uuid()
  }

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
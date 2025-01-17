import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, BelongsTo } from '@adonisjs/lucid/orm'
import { v4 as uuid } from 'uuid'
import User from './user'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public userId: string

  @column()
  public type: 'EMAIL' | 'SMS' | 'INAPP'

  @column()
  public subject: string

  @column()
  public content: string

  @column()
  public status: 'SENT' | 'PENDING' | 'FAILED'

  @column()
  public metadata: JSON

  @column.dateTime()
  public sentAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @beforeCreate()
  public static async createUUID(notification: Notification) {
    notification.id = uuid()
  }
}
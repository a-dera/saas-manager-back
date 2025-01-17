import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, BelongsTo } from '@adonisjs/lucid/orm'
import { v4 as uuid } from 'uuid'
import Subscription from './subscription'

export default class Usage extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public subscriptionId: string

  @column()
  public metric: string

  @column()
  public value: number

  @column()
  public details: JSON

  @column.dateTime()
  public date: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Subscription)
  public subscription: BelongsTo<typeof Subscription>

  @beforeCreate()
  public static async createUUID(usage: Usage) {
    usage.id = uuid()
  }
}
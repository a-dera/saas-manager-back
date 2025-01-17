import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, BelongsTo } from '@adonisjs/lucid/orm'
import { v4 as uuid } from 'uuid'
import Subscription from './subscription'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public subscriptionId: string

  @column()
  public amount: number

  @column()
  public currency: string

  @column()
  public status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

  @column()
  public paymentMethod: string

  @column()
  public invoiceNumber: string

  @column()
  public metadata: JSON

  @column.dateTime()
  public refundedAt: DateTime

  @column.dateTime()
  public date: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Subscription)
  public subscription: BelongsTo<typeof Subscription>

  @beforeCreate()
  public static async createUUID(transaction: Transaction) {
    transaction.id = uuid()
  }
}
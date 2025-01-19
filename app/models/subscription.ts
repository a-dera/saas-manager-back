import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { v4 as uuid } from 'uuid'
import Client from '#models/client'
import Plan from '#models/plan'
import Transaction from '#models/transaction'
import Usage from '#models/usage'

export default class Subscription extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public clientId: string

  @column()
  public planId: string

  @column.dateTime()
  public startDate: DateTime

  @column.dateTime()
  public endDate: DateTime

  @column()
  public status: 'ACTIVE' | 'CANCELLED' | 'PENDING' | 'TRIAL'

  @column()
  public amount: number

  @column()
  public billingCycle: 'MONTHLY' | 'YEARLY'

  @column()
  public autoRenew: boolean

  @column.dateTime()
  public trialEndsAt: DateTime

  @column.dateTime()
  public cancelledAt: DateTime

  @column()
  public customDiscounts: JSON

  @column()
  public usageMetrics: JSON

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Client)
  public client: BelongsTo<typeof Client>

  @belongsTo(() => Plan)
  public plan: BelongsTo<typeof Plan>

  @hasMany(() => Transaction)
  public transactions: HasMany<typeof Transaction>

  @hasMany(() => Usage)
  public usages: HasMany<typeof Usage>

  @beforeCreate()
  public static async createUUID(subscription: Subscription) {
    subscription.id = uuid()
  }
}
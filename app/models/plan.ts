import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { v4 as uuid } from 'uuid'
import SaasApplication from '#models/saas_application'
import Subscription from '#models/subscription'

export default class Plan extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public applicationId: string

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public price: number

  @column()
  public duration: number

  @column()
  public billingCycle: 'MONTHLY' | 'YEARLY'

  @column()
  public features: JSON

  @column()
  public limits: JSON

  @column()
  public isPublic: boolean

  @column()
  public sortOrder: number

  @column()
  public customizable: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => SaasApplication)
  public application: BelongsTo<typeof SaasApplication>

  @hasMany(() => Subscription)
  public subscriptions: HasMany<typeof Subscription>

  @beforeCreate()
  public static async createUUID(plan: Plan) {
    plan.id = uuid()
  }
}
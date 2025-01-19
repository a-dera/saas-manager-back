import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import { v4 as uuid } from 'uuid'
import SaasApplication from '#models/saas_application'

export default class Integration extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public applicationId: string

  @column()
  public name: string

  @column()
  public type: 'PAYMENT' | 'CRM' | 'ANALYTICS'

  @column()
  public config: JSON

  @column()
  public status: 'ACTIVE' | 'INACTIVE'

  @column()
  public credentials: JSON

  @column.dateTime()
  public lastSyncAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => SaasApplication)
  public application: BelongsTo<typeof SaasApplication>

  @beforeCreate()
  public static async createUUID(integration: Integration) {
    integration.id = uuid()
  }
}
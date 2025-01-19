import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { v4 as uuid } from 'uuid'
import Organization from '#models/organization'
import Plan from '#models/plan'
import Integration from '#models/integration'

export default class SaasApplication extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public organizationId: string

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public status: 'ACTIVE' | 'MAINTENANCE' | 'DEPRECATED'

  @column()
  public version: string

  @column()
  public url: string

  @column()
  public apiEndpoint: string

  @column()
  public documentation: string

  @column()
  public metrics: JSON

  @column()
  public features: JSON

  @column()
  public integrations: JSON

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Organization)
  public organization: BelongsTo<typeof Organization>

  @hasMany(() => Plan)
  public plans: HasMany<typeof Plan>

  @hasMany(() => Integration)
  public applicationIntegrations: HasMany<typeof Integration>

  @beforeCreate()
  public static async createUUID(app: SaasApplication) {
    app.id = uuid()
  }
}
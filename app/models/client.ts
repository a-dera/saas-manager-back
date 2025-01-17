import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, BelongsTo, hasMany, HasMany } from '@adonisjs/lucid/orm'
import { v4 as uuid } from 'uuid'
import Organization from './organization.js'
import Subscription from './subscription'

export default class Client extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public organizationId: string

  @column()
  public name: string

  @column()
  public contact: JSON

  @column()
  public status: 'ACTIVE' | 'INACTIVE' | 'PENDING'

  @column()
  public customerSegment: 'ENTERPRISE' | 'SMB' | 'STARTUP'

  @column()
  public billingInfo: JSON

  @column()
  public customFields: JSON

  @column()
  public notes: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Organization)
  public organization: BelongsTo<typeof Organization>

  @hasMany(() => Subscription)
  public subscriptions: HasMany<typeof Subscription>

  @beforeCreate()
  public static async createUUID(client: Client) {
    client.id = uuid()
  }
}
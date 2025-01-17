import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany, HasMany } from '@adonisjs/lucid/orm'
import { v4 as uuid } from 'uuid'
import User from './user'
import Client from './client'
import SaasApplication from './saas_application'

export default class Organization extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public type: 'COMPANY' | 'INDIVIDUAL'

  @column()
  public address: JSON

  @column()
  public billingEmail: string

  @column()
  public vatNumber: string

  @column()
  public settings: JSON

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => User)
  public users: HasMany<typeof User>

  @hasMany(() => Client)
  public clients: HasMany<typeof Client>

  @hasMany(() => SaasApplication)
  public applications: HasMany<typeof SaasApplication>

  @beforeCreate()
  public static async createUUID(organization: Organization) {
    organization.id = uuid()
  }
}
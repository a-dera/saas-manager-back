import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.enum('role', ['ADMIN', 'MANAGER', 'SUPPORT']).defaultTo('SUPPORT')
      table.string('phone_number').nullable()
      table.boolean('two_factor_enabled').defaultTo(false)
      table.enum('status', ['ACTIVE', 'INACTIVE', 'SUSPENDED']).defaultTo('ACTIVE')
      table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE')
      table.timestamp('last_login_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

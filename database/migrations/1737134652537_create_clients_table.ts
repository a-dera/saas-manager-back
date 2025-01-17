import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'clients'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('notes')
      table.timestamp('start_date', { useTz: true }).notNullable()
      table.timestamp('end_date', { useTz: true }).notNullable()
      table.enum('status', ['ACTIVE', 'INACTIVE', 'PENDING']).defaultTo('PENDING')
      table.enum('customer_segment', ['ENTERPRISE', 'SMB', 'STARTUP']).defaultTo('ENTERPRISE')
      table.jsonb('contacts').defaultTo('{}')
      table.jsonb('billing_info').defaultTo('{}')
      table.jsonb('custom_fields').defaultTo('{}')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
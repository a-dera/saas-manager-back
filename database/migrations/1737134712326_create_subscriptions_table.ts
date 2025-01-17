import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('client_id').references('id').inTable('clients').onDelete('CASCADE')
      table.uuid('plan_id').references('id').inTable('plans').onDelete('RESTRICT')
      table.timestamp('start_date', { useTz: true }).notNullable()
      table.timestamp('end_date', { useTz: true }).notNullable()
      table.enum('status', ['ACTIVE', 'CANCELLED', 'PENDING', 'TRIAL']).defaultTo('PENDING')
      table.decimal('amount', 10, 2).notNullable()
      table.enum('billing_cycle', ['MONTHLY', 'YEARLY']).notNullable()
      table.boolean('auto_renew').defaultTo(true)
      table.timestamp('trial_ends_at', { useTz: true })
      table.timestamp('cancelled_at', { useTz: true })
      table.jsonb('custom_discounts').defaultTo('{}')
      table.jsonb('usage_metrics').defaultTo('{}')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

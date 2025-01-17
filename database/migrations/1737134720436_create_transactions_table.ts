import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('subscription_id').references('id').inTable('subscriptions').onDelete('RESTRICT')
      table.decimal('amount', 10, 2).notNullable()
      table.string('currency', 3).notNullable()
      table.enum('status', ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).defaultTo('PENDING')
      table.string('payment_method').notNullable()
      table.string('invoice_number').unique()
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('refunded_at', { useTz: true })
      table.timestamp('date', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

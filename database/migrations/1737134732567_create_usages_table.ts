import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'usage'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('subscription_id').references('id').inTable('subscriptions').onDelete('CASCADE')
      table.string('metric').notNullable()
      table.decimal('value', 15, 4).notNullable()
      table.jsonb('details').defaultTo('{}')
      table.timestamp('date', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      // Index pour l'agrégation et le reporting
      table.index(['subscription_id', 'metric'])
      table.index(['date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'plans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('application_id').references('id').inTable('saas_applications').onDelete('CASCADE')
      table.string('name').notNullable()
      table.text('description')
      table.decimal('price', 10, 2).notNullable()
      table.integer('duration')
      table.enum('billing_cycle', ['MONTHLY', 'YEARLY']).notNullable()
      table.jsonb('features').defaultTo('{}')
      table.jsonb('limits').defaultTo('{}')
      table.boolean('is_public').defaultTo(true)
      table.integer('sort_order').defaultTo(0)
      table.boolean('customizable').defaultTo(false)
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

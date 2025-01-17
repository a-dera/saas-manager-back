import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.enum('type', ['EMAIL', 'SMS', 'INAPP']).notNullable()
      table.string('subject').notNullable()
      table.text('content').notNullable()
      table.enum('status', ['SENT', 'PENDING', 'FAILED']).defaultTo('PENDING')
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('sent_at', { useTz: true })
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      // Index pour le filtrage et la pagination
      table.index(['user_id', 'status'])
      table.index(['type', 'status'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

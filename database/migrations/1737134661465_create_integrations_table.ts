import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'integrations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('application_id').references('id').inTable('saas_applications').onDelete('CASCADE')
      table.string('name').notNullable()
      table.enum('type', ['PAYMENT', 'CRM', 'ANALYTICS']).notNullable()
      table.jsonb('config').defaultTo('{}')
      table.enum('status', ['ACTIVE', 'INACTIVE']).defaultTo('INACTIVE')
      table.jsonb('credentials').defaultTo('{}')
      table.timestamp('last_sync_at', { useTz: true })
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      // Index pour les recherches fréquentes
      table.index(['application_id', 'type'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

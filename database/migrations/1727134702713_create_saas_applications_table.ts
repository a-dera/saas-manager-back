import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'saas_applications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE')
      table.string('name').notNullable()
      table.text('description')
      table.enum('status', ['ACTIVE', 'MAINTENANCE', 'DEPRECATED']).defaultTo('ACTIVE')
      table.string('version')
      table.string('url')
      table.string('api_endpoint')
      table.string('documentation')
      table.jsonb('metrics').defaultTo('{}')
      table.jsonb('features').defaultTo('{}')
      table.jsonb('integrations').defaultTo('{}')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

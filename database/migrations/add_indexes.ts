import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Indexes pour les recherches et jointures fréquentes
    this.schema.alterTable('subscriptions', (table) => {
      table.index(['client_id', 'status'])
      table.index(['plan_id'])
      table.index(['start_date', 'end_date'])
    })

    this.schema.alterTable('transactions', (table) => {
      table.index(['subscription_id', 'status'])
      table.index(['date'])
    })

    this.schema.alterTable('plans', (table) => {
      table.index(['application_id', 'is_public'])
      table.index(['price'])
    })

    this.schema.alterTable('clients', (table) => {
      table.index(['organization_id', 'status'])
      table.index(['customer_segment'])
    })
  }

  async down() {
    // Suppression des index dans l'ordre inverse
    this.schema.alterTable('clients', (table) => {
      table.dropIndex(['organization_id', 'status'])
      table.dropIndex(['customer_segment'])
    })

    this.schema.alterTable('plans', (table) => {
      table.dropIndex(['application_id', 'is_public'])
      table.dropIndex(['price'])
    })

    this.schema.alterTable('transactions', (table) => {
      table.dropIndex(['subscription_id', 'status'])
      table.dropIndex(['date'])
    })

    this.schema.alterTable('subscriptions', (table) => {
      table.dropIndex(['client_id', 'status'])
      table.dropIndex(['plan_id'])
      table.dropIndex(['start_date', 'end_date'])
    })
  }
}
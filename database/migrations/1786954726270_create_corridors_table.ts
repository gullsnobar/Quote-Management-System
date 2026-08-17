import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'corridors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary key
      table.increments('id')

      // Source/reference fields
      table.integer('version_id').notNullable()
      table.string('source_row_id', 100).notNullable()
      table.integer('corridor_id').notNullable().unique()

      // Corridor information
      table.string('region', 100).notNullable()
      table.string('country', 100).notNullable()
      table.string('transaction_type', 50).notNullable()
      table.string('service', 100).notNullable()
      table.string('receiving_partner', 255).notNullable()
      table.text('payer').notNullable()
      table.string('payout_currency', 10).notNullable()

      // Historical / transaction values
      table.decimal('historical_atv', 15, 6).notNullable()
      table.decimal('atv_usd', 15, 2).notNullable()

      // Revenue / fee fields
      table.decimal('std_fixed_fee_usd', 15, 6).notNullable()
      table.decimal('variable_fee_percentage', 10, 4).notNullable()

      // FX fields
      table.string('fx_source', 100).notNullable()
      table.decimal('default_fx_spread', 10, 4).notNullable()
      table.decimal('treasury_fx_cost', 10, 4).notNullable()

      // Cost fields
      table.decimal('cost_fixed_per_usd', 15, 8).notNullable()
      table.decimal('cost_variable_per_trx', 15, 8).notNullable()

      // Approval
      table.boolean('needs_approval').notNullable().defaultTo(false)

      // Timestamps
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Filter indexes
      table.index(['region'])
      table.index(['country'])
      table.index(['transaction_type'])
      table.index(['service'])
      table.index(['payout_currency'])
      table.index(['receiving_partner'])
      table.index(['payer'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
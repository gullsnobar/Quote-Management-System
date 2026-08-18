import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quotes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('contract_length').notNullable().defaultTo(1)
      table.decimal('total_revenue', 15, 6).notNullable().defaultTo(0)
      table.decimal('monthly_revenue', 15, 6).notNullable().defaultTo(0)
      table.decimal('tcv', 15, 6).notNullable().defaultTo(0)
      table.integer('version').notNullable().defaultTo(1)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('contract_length')
      table.dropColumn('total_revenue')
      table.dropColumn('monthly_revenue')
      table.dropColumn('tcv')
      table.dropColumn('version')
    })
  }
}

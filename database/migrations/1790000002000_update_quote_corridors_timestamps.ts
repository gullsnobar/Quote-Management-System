import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quote_corridors'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('created_at').defaultTo(this.raw('CURRENT_TIMESTAMP')).notNullable().alter()
      table.timestamp('updated_at').defaultTo(this.raw('CURRENT_TIMESTAMP')).nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('created_at')
      table.dropColumn('updated_at')
    })
  }
}

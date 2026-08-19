import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Audit trail for quote changes (AC-11).
 *
 * Records who did what and when for every significant quote mutation:
 * create, update, submit, delete, corridor attach/detach.
 */
export default class extends BaseSchema {
  protected tableName = 'quote_audit_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('quote_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('quotes')
        .onDelete('CASCADE')

      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.string('action', 50).notNullable()
      table.jsonb('metadata').nullable()

      table.timestamp('created_at').notNullable()

      table.index(['quote_id'], 'quote_audit_logs_quote_id_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

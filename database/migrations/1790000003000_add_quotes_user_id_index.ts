import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Adds an index on quotes.user_id.
 *
 * Every quote list/filter/search query scopes by user_id (ownership check).
 * Without this index, PostgreSQL must scan the entire quotes table for each
 * request. This index is directly required by the AC-2 quote filtering feature
 * for performant ownership-scoped queries.
 *
 * Idempotent: skips creation if the index already exists (it may have been
 * added manually via SQL in a previous session).
 */
export default class extends BaseSchema {
  protected tableName = 'quotes'

  async up() {
    const indexExists = await this.db
      .from('pg_indexes')
      .where('indexname', 'quotes_user_id_index')
      .first()

    if (!indexExists) {
      this.schema.alterTable(this.tableName, (table) => {
        table.index('user_id', 'quotes_user_id_index')
      })
    }
  }

  async down() {
    const indexExists = await this.db
      .from('pg_indexes')
      .where('indexname', 'quotes_user_id_index')
      .first()

    if (indexExists) {
      this.schema.alterTable(this.tableName, (table) => {
        table.dropIndex('user_id', 'quotes_user_id_index')
      })
    }
  }
}

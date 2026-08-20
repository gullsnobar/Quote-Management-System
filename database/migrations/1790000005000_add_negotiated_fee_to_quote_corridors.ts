import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Per-quote corridor pricing override (negotiated fee).
 *
 * Adds a nullable `negotiated_fee` column to the `quote_corridors` pivot
 * table. When set, the calculation engine uses this value instead of the
 * corridor's standard `std_fixed_fee_usd` for revenue calculations on
 * that specific quote. When NULL, the standard catalog fee is used.
 *
 * This preserves the global corridor catalog as read-only: the override
 * lives on the quote-corridor relationship, not on the corridor itself.
 * Different quotes can have different negotiated fees for the same
 * corridor without affecting each other or the catalog.
 */
export default class extends BaseSchema {
  protected tableName = 'quote_corridors'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Nullable decimal — NULL means "use standard catalog fee".
      // Precision matches the corridor's std_fixed_fee_usd column.
      table.decimal('negotiated_fee', 15, 6).nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('negotiated_fee')
    })
  }
}

import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Quote from '#models/quote'
import User from '#models/user'

/**
 * Audit trail entry for quote mutations (AC-11).
 *
 * Records who did what and when for every significant quote action:
 * create, update, submit, delete, corridor attach/detach.
 */
export default class QuoteAuditLog extends BaseModel {
  public static table = 'quote_audit_logs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare quoteId: number

  @column()
  declare userId: number

  @column()
  declare action: string

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Quote)
  declare quote: BelongsTo<typeof Quote>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}

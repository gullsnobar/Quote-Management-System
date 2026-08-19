import QuoteAuditLog from '#models/quote_audit_log'

/**
 * Audit logging service (AC-11).
 *
 * Records quote mutations for compliance and debugging.
 * Each entry captures: who (userId), what (action), when (createdAt),
 * and contextual metadata (e.g. old/new values, version).
 *
 * Logging is fire-and-forget: failures are swallowed so a logging
 * issue never blocks a user action. The caller's transaction is
 * not affected.
 */
export default class AuditLogService {
  /**
   * Record a quote-related action.
   */
  static async record(input: {
    quoteId: number
    userId: number
    action: string
    metadata?: Record<string, any>
  }): Promise<void> {
    try {
      await QuoteAuditLog.create({
        quoteId: input.quoteId,
        userId: input.userId,
        action: input.action,
        metadata: input.metadata ?? null,
      })
    } catch (error) {
      // Logging must never break the user flow.
      // The error is reported via the standard exception reporter.
      console.error('[AuditLogService] Failed to record audit entry:', error)
    }
  }

  /**
   * Standard action names used across the codebase.
   */
  static readonly ACTIONS = {
    QUOTE_CREATED: 'quote.created',
    QUOTE_UPDATED: 'quote.updated',
    QUOTE_SUBMITTED: 'quote.submitted',
    QUOTE_DELETED: 'quote.deleted',
    CORRIDORS_ATTACHED: 'quote.corridors.attached',
    CORRIDORS_DETACHED: 'quote.corridors.detached',
  } as const
}

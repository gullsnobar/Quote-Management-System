import type { HttpContext } from '@adonisjs/core/http'
import Quote from '#models/quote'
import Corridor from '#models/corridor'
import QuoteCalculationService from '#services/quote_calculation_service'
import CorridorCalculationService from '#services/corridor_calculation_service'
import AuditLogService from '#services/audit_log_service'
import {
  attachCorridorsValidator,
  createQuoteValidator,
  listQuotesValidator,
  updateQuoteValidator,
  updateNegotiatedFeeValidator,
} from '#validators/quote'

export default class QuotesController {
  /**
   * List authenticated user's quotes with optional status filter and text search.
   *
   * Filtering and searching are performed in PostgreSQL via the Lucid query
   * builder (parameterized). Results are always scoped to the authenticated
   * user's own quotes.
   */
  async index({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()

    const { status, search } = await request.validateUsing(listQuotesValidator)

    const query = Quote.query().where('user_id', user.id).orderBy('created_at', 'desc')

    if (status) {
      query.where('status', status)
    }

    if (search) {
      query.where((builder) => {
        builder.whereILike('name', `%${search}%`).orWhereILike('partner_name', `%${search}%`)
      })
    }

    const quotes = await query

    return {
      data: quotes.map((quote) => ({
        ...quote.serialize(),
        ...QuoteCalculationService.calculateForQuote({
          corridors: quote.$preloaded.corridors ?? [],
          contractLength: quote.contractLength ?? 1,
        }),
      })),
    }
  }

  /**
   * Create a new quote.
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const payload = await request.validateUsing(createQuoteValidator)

    const quote = await Quote.create({
      userId: user.id,
      name: payload.name,
      partnerName: payload.partnerName,
      contractLength: payload.contractLength ?? 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    await AuditLogService.record({
      quoteId: quote.id,
      userId: user.id,
      action: AuditLogService.ACTIONS.QUOTE_CREATED,
      metadata: { name: payload.name, partnerName: payload.partnerName },
    })

    return response.created({
      data: quote,
    })
  }

  /**
   * Show one quote belonging to authenticated user.
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const quote = await Quote.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .preload('corridors')
      .first()

    if (!quote) {
      return response.notFound({
        message: 'Quote not found',
      })
    }

    const summary = QuoteCalculationService.calculateForQuote({
      corridors: quote.corridors,
      contractLength: quote.contractLength ?? 1,
    })

    return {
      data: {
        ...quote.serialize(),
        ...summary,
      },
    }
  }

  /**
   * Update a quote.
   *
   * Only draft and rejected quotes are editable.
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const quote = await Quote.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .preload('corridors')
      .first()

    if (!quote) {
      return response.notFound({
        message: 'Quote not found',
      })
    }

    if (!['draft', 'rejected'].includes(quote.status)) {
      return response.unprocessableEntity({
        message: 'This quote cannot be edited in its current status',
      })
    }

    const payload = await request.validateUsing(updateQuoteValidator)
    const submittedVersion = Number(payload.version ?? quote.version ?? 1)
    const contractLength = payload.contractLength ?? quote.contractLength ?? 1

    const summary = QuoteCalculationService.calculateForQuote({
      corridors: quote.corridors,
      contractLength,
    })

    const result = await Quote.query()
      .where('id', quote.id)
      .where('user_id', user.id)
      .where('version', submittedVersion)
      .update({
        name: payload.name,
        partnerName: payload.partnerName,
        contractLength,
        totalRevenue: summary.totalRevenue,
        monthlyRevenue: summary.monthlyRevenue,
        tcv: summary.tcv,
        version: quote.version + 1,
      })

    const affectedRows = Number(Array.isArray(result) ? result[0] : result)

    if (affectedRows === 0) {
      return response.conflict({
        success: false,
        code: 'QUOTE_CONFLICT',
        message:
          'This quote was modified by another user. Please reload the latest version before saving.',
      })
    }

    const updatedQuote = await Quote.query()
      .where('id', quote.id)
      .where('user_id', user.id)
      .preload('corridors')
      .firstOrFail()

    await AuditLogService.record({
      quoteId: quote.id,
      userId: user.id,
      action: AuditLogService.ACTIONS.QUOTE_UPDATED,
      metadata: {
        fromVersion: submittedVersion,
        toVersion: updatedQuote.version,
        name: payload.name,
        partnerName: payload.partnerName,
      },
    })

    return {
      data: {
        ...updatedQuote.serialize(),
        ...QuoteCalculationService.calculateForQuote({
          corridors: updatedQuote.corridors,
          contractLength: updatedQuote.contractLength ?? contractLength,
        }),
      },
    }
  }

  /**
   * Delete a quote.
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const quote = await Quote.query().where('id', params.id).where('user_id', user.id).first()

    if (!quote) {
      return response.notFound({
        message: 'Quote not found',
      })
    }

    const quoteId = quote.id
    await quote.delete()

    await AuditLogService.record({
      quoteId,
      userId: user.id,
      action: AuditLogService.ACTIONS.QUOTE_DELETED,
    })

    return {
      message: 'Quote deleted successfully',
    }
  }

  /**
   * Submit a quote for review.
   *
   * Only draft and rejected quotes can be submitted.
   * The status is controlled by the backend.
   */
  async submit({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const quote = await Quote.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .preload('corridors')
      .first()

    if (!quote) {
      return response.notFound({
        message: 'Quote not found',
      })
    }

    if (!['draft', 'rejected'].includes(quote.status)) {
      return response.unprocessableEntity({
        message: 'Only draft or rejected quotes can be submitted',
      })
    }

    const summary = QuoteCalculationService.calculateForQuote({
      corridors: quote.corridors,
      contractLength: quote.contractLength ?? 1,
    })

    quote.merge({
      totalRevenue: summary.totalRevenue,
      monthlyRevenue: summary.monthlyRevenue,
      tcv: summary.tcv,
      status: 'in_review',
    })

    await quote.save()

    await AuditLogService.record({
      quoteId: quote.id,
      userId: user.id,
      action: AuditLogService.ACTIONS.QUOTE_SUBMITTED,
      metadata: { fromStatus: quote.$original.status, toStatus: 'in_review' },
    })

    return {
      data: {
        ...quote.serialize(),
        ...summary,
      },
    }
  }

  /**
   * List corridors attached to a specific quote (AC-4).
   *
   * Returns the quote's own corridors with backend calculations.
   * Ownership is enforced: only the quote's owner can view its corridors.
   */
  async corridors({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const quote = await Quote.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .preload('corridors')
      .first()

    if (!quote) {
      return response.notFound({
        message: 'Quote not found',
      })
    }

    const data = quote.corridors.map((corridor) => ({
      ...corridor.serialize(),
      negotiatedFee: corridor.$extras?.pivot_negotiated_fee ?? null,
      calculations: CorridorCalculationService.calculate(
        corridor,
        corridor.$extras?.pivot_negotiated_fee ?? null
      ),
    }))

    return response.ok({
      data,
      count: data.length,
    })
  }

  /**
   * Attach corridors to a quote (AC-4).
   *
   * Only editable quotes (draft / rejected) can have corridors attached.
   * Ownership is enforced. Corridor IDs are validated to exist.
   */
  async attachCorridors({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const quote = await Quote.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .preload('corridors')
      .first()

    if (!quote) {
      return response.notFound({
        message: 'Quote not found',
      })
    }

    if (!['draft', 'rejected'].includes(quote.status)) {
      return response.unprocessableEntity({
        message: 'Corridors can only be attached to editable quotes (draft or rejected)',
      })
    }

    const payload = await request.validateUsing(attachCorridorsValidator)

    // Verify all corridor IDs exist (AC-7 input validation)
    const existingCorridors = await Corridor.query().whereIn('id', payload.corridorIds)
    if (existingCorridors.length !== payload.corridorIds.length) {
      const foundIds = existingCorridors.map((c) => c.id)
      const missingIds = payload.corridorIds.filter((id) => !foundIds.includes(id))
      return response.notFound({
        message: 'Some corridors were not found',
        missing: missingIds,
      })
    }

    // Filter out already-attached corridors to make attach idempotent
    const alreadyAttachedIds = new Set(quote.corridors.map((c) => c.id))
    const newIds = payload.corridorIds.filter((cid) => !alreadyAttachedIds.has(cid))

    if (newIds.length > 0) {
      await quote.related('corridors').attach(newIds)
    }

    await AuditLogService.record({
      quoteId: quote.id,
      userId: user.id,
      action: AuditLogService.ACTIONS.CORRIDORS_ATTACHED,
      metadata: { corridorIds: newIds },
    })

    // Reload with the newly attached corridors
    await quote.load('corridors')

    const data = quote.corridors.map((corridor) => ({
      ...corridor.serialize(),
      negotiatedFee: corridor.$extras?.pivot_negotiated_fee ?? null,
      calculations: CorridorCalculationService.calculate(
        corridor,
        corridor.$extras?.pivot_negotiated_fee ?? null
      ),
    }))

    return response.ok({
      data,
      count: data.length,
    })
  }

  /**
   * Detach corridors from a quote (AC-4).
   *
   * Only editable quotes (draft / rejected) can have corridors detached.
   */
  async detachCorridors({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const quote = await Quote.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .preload('corridors')
      .first()

    if (!quote) {
      return response.notFound({
        message: 'Quote not found',
      })
    }

    if (!['draft', 'rejected'].includes(quote.status)) {
      return response.unprocessableEntity({
        message: 'Corridors can only be detached from editable quotes (draft or rejected)',
      })
    }

    const payload = await request.validateUsing(attachCorridorsValidator)

    await quote.related('corridors').detach(payload.corridorIds)

    await AuditLogService.record({
      quoteId: quote.id,
      userId: user.id,
      action: AuditLogService.ACTIONS.CORRIDORS_DETACHED,
      metadata: { corridorIds: payload.corridorIds },
    })

    await quote.load('corridors')

    const data = quote.corridors.map((corridor) => ({
      ...corridor.serialize(),
      negotiatedFee: corridor.$extras?.pivot_negotiated_fee ?? null,
      calculations: CorridorCalculationService.calculate(
        corridor,
        corridor.$extras?.pivot_negotiated_fee ?? null
      ),
    }))

    return response.ok({
      data,
      count: data.length,
    })
  }

  /**
   * Update the negotiated fee for a specific corridor on a quote.
   *
   * Only editable quotes (draft / rejected) can have negotiated fees set.
   * Ownership is enforced. The corridor must already be attached to the quote.
   * The global corridor catalog is never modified — only the pivot row.
   *
   * After updating the negotiated fee, the quote's summary metrics are
   * recalculated and persisted so subsequent fetches return correct totals.
   */
  async updateNegotiatedFee({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const quote = await Quote.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .preload('corridors')
      .first()

    if (!quote) {
      return response.notFound({
        message: 'Quote not found',
      })
    }

    if (!['draft', 'rejected'].includes(quote.status)) {
      return response.unprocessableEntity({
        message: 'Negotiated fees can only be set on editable quotes (draft or rejected)',
      })
    }

    const corridorId = Number(params.corridorId)
    const isAttached = quote.corridors.some((c) => c.id === corridorId)

    if (!isAttached) {
      return response.notFound({
        message: 'Corridor is not attached to this quote',
      })
    }

    const payload = await request.validateUsing(updateNegotiatedFeeValidator)

    // Update the pivot row's negotiated_fee column
    await quote.related('corridors').sync({
      [corridorId]: { negotiated_fee: payload.negotiatedFee },
    })

    // Capture the old value for audit before the sync overwrote it.
    // We read it from the preloaded corridors' pivot extras.
    const oldNegotiatedFee = quote.corridors.find((c) => c.id === corridorId)?.$extras?.pivot_negotiated_fee ?? null

    // Reload corridors to get the updated pivot values
    await quote.load('corridors')

    // Recalculate and persist the quote summary so future fetches
    // return correct totals without needing to recalculate on read.
    const summary = QuoteCalculationService.calculateForQuote({
      corridors: quote.corridors,
      contractLength: quote.contractLength ?? 1,
    })

    await Quote.query()
      .where('id', quote.id)
      .where('user_id', user.id)
      .update({
        totalRevenue: summary.totalRevenue,
        monthlyRevenue: summary.monthlyRevenue,
        tcv: summary.tcv,
        version: quote.version + 1,
      })

    await AuditLogService.record({
      quoteId: quote.id,
      userId: user.id,
      action: AuditLogService.ACTIONS.CORRIDOR_NEGOTIATED_FEE_UPDATED,
      metadata: {
        corridorId,
        oldNegotiatedFee,
        newNegotiatedFee: payload.negotiatedFee,
      },
    })

    // Build the response with updated corridor data
    const data = quote.corridors.map((corridor) => ({
      ...corridor.serialize(),
      negotiatedFee: corridor.$extras?.pivot_negotiated_fee ?? null,
      calculations: CorridorCalculationService.calculate(
        corridor,
        corridor.$extras?.pivot_negotiated_fee ?? null
      ),
    }))

    return response.ok({
      data,
      count: data.length,
    })
  }

  /**
   * List the audit trail for a quote (AC-11).
   *
   * Returns all recorded actions for the quote, most recent first.
   * Only the quote's owner can view its audit trail.
   */
  async auditTrail({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const quote = await Quote.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!quote) {
      return response.notFound({
        message: 'Quote not found',
      })
    }

    const QuoteAuditLog = (await import('#models/quote_audit_log')).default
    const logs = await QuoteAuditLog.query()
      .where('quote_id', quote.id)
      .orderBy('created_at', 'desc')
      .preload('user')

    return response.ok({
      data: logs.map((log) => ({
        id: log.id,
        action: log.action,
        metadata: log.metadata,
        createdAt: log.createdAt.toISO(),
        user: log.user ? { id: log.user.id, email: log.user.email, fullName: log.user.fullName } : null,
      })),
    })
  }
}

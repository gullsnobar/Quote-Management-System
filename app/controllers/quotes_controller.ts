import type { HttpContext } from '@adonisjs/core/http'
import Quote from '#models/quote'
import QuoteCalculationService from '#services/quote_calculation_service'
import {
  createQuoteValidator,
  updateQuoteValidator,
} from '#validators/quote'

export default class QuotesController {
  /**
   * List authenticated user's quotes.
   */
  async index({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()

    const query = Quote.query()
      .where('user_id', user.id)
      .orderBy('created_at', 'desc')

    const status = request.input('status')
    const search = request.input('search')

    if (status) {
      query.where('status', status)
    }

    if (search) {
      query.where((builder) => {
        builder
          .whereILike('name', `%${search}%`)
          .orWhereILike('partner_name', `%${search}%`)
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

    const affectedRows = await Quote.query()
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

    if (affectedRows === 0) {
      return response.conflict({
        success: false,
        code: 'QUOTE_CONFLICT',
        message: 'This quote was modified by another user. Please reload the latest version before saving.',
      })
    }

    const updatedQuote = await Quote.query()
      .where('id', quote.id)
      .where('user_id', user.id)
      .preload('corridors')
      .firstOrFail()

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

    const quote = await Quote.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!quote) {
      return response.notFound({
        message: 'Quote not found',
      })
    }

    await quote.delete()

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

    return {
      data: {
        ...quote.serialize(),
        ...summary,
      },
    }
  }
}
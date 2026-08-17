import type { HttpContext } from '@adonisjs/core/http'
import Quote from '#models/quote'
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
      data: quotes,
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

      // Status is controlled by the backend.
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
      .first()

    if (!quote) {
      return response.notFound({
        message: 'Quote not found',
      })
    }

    return {
      data: quote,
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

    quote.merge({
      name: payload.name,
      partnerName: payload.partnerName,
    })

    await quote.save()

    return {
      data: quote,
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
}
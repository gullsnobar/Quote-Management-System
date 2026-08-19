import type { HttpContext } from '@adonisjs/core/http'
import Corridor from '#models/corridor'
import CorridorCalculationService from '#services/corridor_calculation_service'
import { listCorridorsValidator } from '#validators/quote'

export default class CorridorsController {
  /**
   * List the global corridor catalog with optional filters and attached
   * backend calculations (AC-4, AC-5, AC-6).
   *
   * All filters are validated via listCorridorsValidator (AC-7) and applied
   * in PostgreSQL via the Lucid query builder (parameterized — no raw SQL).
   */
  async index({ request, response }: HttpContext) {
    const payload = await request.validateUsing(listCorridorsValidator)

    const query = Corridor.query().orderBy('id', 'asc')

    if (payload.region) {
      query.where('region', payload.region)
    }

    if (payload.country) {
      query.whereILike('country', `%${payload.country}%`)
    }

    if (payload.transactionType) {
      query.where('transaction_type', payload.transactionType)
    }

    if (payload.service) {
      query.where('service', payload.service)
    }

    if (payload.payoutCurrency) {
      query.whereILike('payout_currency', `%${payload.payoutCurrency}%`)
    }

    if (payload.receivingPartner) {
      query.whereILike('receiving_partner', `%${payload.receivingPartner}%`)
    }

    if (payload.payer) {
      query.whereILike('payer', `%${payload.payer}%`)
    }

    const corridors = await query
    const data = corridors.map((corridor) => ({
      ...corridor.serialize(),
      calculations: CorridorCalculationService.calculate(corridor),
    }))

    return response.ok({
      data,
      count: data.length,
      meta: {
        total: data.length,
      },
    })
  }

  async store({ response }: HttpContext) {
    return response.methodNotAllowed({
      message: 'Corridors are read-only resources',
    })
  }

  async show({ params, response }: HttpContext) {
    const corridor = await Corridor.find(params.id)

    if (!corridor) {
      return response.notFound({
        message: 'Corridor not found',
      })
    }

    return response.ok({
      data: {
        ...corridor.serialize(),
        calculations: CorridorCalculationService.calculate(corridor),
      },
    })
  }

  async update({ response }: HttpContext) {
    return response.methodNotAllowed({
      message: 'Corridors are read-only resources',
    })
  }

  async destroy({ response }: HttpContext) {
    return response.methodNotAllowed({
      message: 'Corridors are read-only resources',
    })
  }
}
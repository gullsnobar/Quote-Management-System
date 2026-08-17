import type { HttpContext } from '@adonisjs/core/http'
import Corridor from '#models/corridor'
import CorridorCalculationService from '#services/corridor_calculation_service'

export default class CorridorsController {
  /**
   * List corridors with optional filters and attached calculations.
   *
   * Supported filters:
   * region
   * country
   * transactionType
   * service
   * payoutCurrency
   * receivingPartner
   * payer
   */
  async index({ request, response }: HttpContext) {
    const query = Corridor.query().orderBy('id', 'asc')

    const region = request.input('region')
    const country = request.input('country')
    const transactionType = request.input('transactionType')
    const service = request.input('service')
    const payoutCurrency = request.input('payoutCurrency')
    const receivingPartner = request.input('receivingPartner')
    const payer = request.input('payer')

    if (region) {
      query.where('region', region)
    }

    if (country) {
      query.where('country', country)
    }

    if (transactionType) {
      query.where('transaction_type', transactionType)
    }

    if (service) {
      query.where('service', service)
    }

    if (payoutCurrency) {
      query.where('payout_currency', payoutCurrency)
    }

    if (receivingPartner) {
      query.whereILike('receiving_partner', `%${receivingPartner}%`)
    }

    if (payer) {
      query.whereILike('payer', `%${payer}%`)
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
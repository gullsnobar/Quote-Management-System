import type { HttpContext } from '@adonisjs/core/http'
import Corridor from '#models/corridor'

export default class CorridorsController {
  /**
   * List corridors with optional filters.
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

    return response.ok({
      data: corridors,
      count: corridors.length,
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
      data: corridor,
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
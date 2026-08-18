import type Corridor from '#models/corridor'

export interface QuoteCalculationSummary {
  totalRevenue: number
  monthlyRevenue: number
  tcv: number
}

export default class QuoteCalculationService {
  static corridorRevenue(corridor: Partial<Corridor>): number {
    const yearlyVolumeUsd = 100000
    const atvUsd = Number(corridor.atvUsd ?? 0)

    if (atvUsd <= 0) {
      return 0
    }

    const yearlyTrx = Math.ceil(yearlyVolumeUsd / atvUsd)
    const revenue =
      Number(corridor.stdFixedFeeUsd ?? 0) * yearlyTrx +
      Number(corridor.variableFeePercentage ?? 0) * yearlyVolumeUsd

    return Number(revenue.toFixed(6))
  }

  static calculateForQuote(quote: {
    corridors?: unknown
    contractLength?: number | string | null
  }): QuoteCalculationSummary {
    const rawCorridors = quote.corridors ?? []
    const corridors: Partial<Corridor>[] = Array.isArray(rawCorridors)
      ? (rawCorridors as Partial<Corridor>[])
      : rawCorridors
        ? [rawCorridors as Partial<Corridor>]
        : []

    const totalRevenue = corridors.reduce(
      (sum, corridor) => sum + this.corridorRevenue(corridor),
      0
    )

    const contractLength = Number(quote.contractLength ?? 1)
    const monthlyRevenue = Number((totalRevenue / 12).toFixed(6))
    const tcv = Number((totalRevenue * contractLength).toFixed(6))

    return {
      totalRevenue: Number(totalRevenue.toFixed(6)),
      monthlyRevenue,
      tcv,
    }
  }
}

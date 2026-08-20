import type Corridor from '#models/corridor'

export interface QuoteCalculationSummary {
  totalRevenue: number
  totalCost: number
  totalMargin: number
  marginPercent: number
  monthlyRevenue: number
  monthlyCost: number
  monthlyMargin: number
  tcv: number
  corridorCount: number
}

/**
 * Extracts the negotiated fee from a corridor's pivot extras.
 *
 * When corridors are preloaded via the manyToMany relationship with
 * `pivotColumns: ['negotiated_fee']`, Lucid places pivot columns on
 * `$extras.negotiated_fee`. This helper normalizes access across
 * plain objects and model instances.
 */
function getNegotiatedFee(corridor: any): number | null | undefined {
  const extras = corridor?.$extras
  if (extras) {
    // Lucid prefixes pivot columns with `pivot_` when using pivotColumns
    if ('pivot_negotiated_fee' in extras) {
      const val = extras.pivot_negotiated_fee
      return val === null ? null : Number(val)
    }
    if ('negotiated_fee' in extras) {
      const val = extras.negotiated_fee
      return val === null ? null : Number(val)
    }
  }
  if (corridor && 'negotiatedFee' in corridor) {
    return corridor.negotiatedFee
  }
  return undefined
}

export default class QuoteCalculationService {
  static corridorRevenue(corridor: Partial<Corridor>): number {
    const yearlyVolumeUsd = 100000
    const atvUsd = Number(corridor.atvUsd ?? 0)

    if (atvUsd <= 0) {
      return 0
    }

    const yearlyTrx = Math.ceil(yearlyVolumeUsd / atvUsd)

    // Effective fee: negotiated override takes precedence over catalog fee
    const negotiated = getNegotiatedFee(corridor)
    const effectiveFee =
      negotiated !== null && negotiated !== undefined
        ? Number(negotiated)
        : Number(corridor.stdFixedFeeUsd ?? 0)

    const revenue =
      effectiveFee * yearlyTrx +
      Number(corridor.variableFeePercentage ?? 0) * yearlyVolumeUsd

    return Number(revenue.toFixed(6))
  }

  static corridorCost(corridor: Partial<Corridor>): number {
    const yearlyVolumeUsd = 100000
    const atvUsd = Number(corridor.atvUsd ?? 0)

    if (atvUsd <= 0) {
      return 0
    }

    const yearlyTrx = Math.ceil(yearlyVolumeUsd / atvUsd)

    const fixedCost = yearlyVolumeUsd * (Number(corridor.costFixedPerUsd ?? 0))
    const variableCost = Number(corridor.costVariablePerTrx ?? 0) * yearlyTrx
    const treasuryFxCost = yearlyVolumeUsd * (Number(corridor.treasuryFxCost ?? 0))

    return Number((fixedCost + variableCost + treasuryFxCost).toFixed(6))
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

    const totalCost = corridors.reduce(
      (sum, corridor) => sum + this.corridorCost(corridor),
      0
    )

    const totalMargin = totalRevenue - totalCost
    const marginPercent = totalRevenue === 0 ? 0 : (totalMargin / totalRevenue) * 100

    const contractLength = Number(quote.contractLength ?? 1)
    const monthlyRevenue = Number((totalRevenue / 12).toFixed(6))
    const monthlyCost = Number((totalCost / 12).toFixed(6))
    const monthlyMargin = Number((totalMargin / 12).toFixed(6))
    const tcv = Number((totalRevenue * contractLength).toFixed(6))

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      totalMargin: Number(totalMargin.toFixed(2)),
      marginPercent: Number(marginPercent.toFixed(2)),
      monthlyRevenue,
      monthlyCost,
      monthlyMargin,
      tcv,
      corridorCount: corridors.length,
    }
  }
}

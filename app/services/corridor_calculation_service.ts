import Corridor from '#models/corridor'

export interface CorridorCalculations {
  revenue: number
  cost: number
  margin: number
  marginPercent: number
}

export default class CorridorCalculationService {
  static calculate(corridor: Corridor): CorridorCalculations {
    const yearlyVolumeUsd = 100000
    const atvUsd = Number(corridor.atvUsd) || 0

    const yearlyTrx = atvUsd > 0 ? Math.ceil(yearlyVolumeUsd / atvUsd) : 0
    const revenue =
      Number(corridor.stdFixedFeeUsd) * yearlyTrx +
      Number(corridor.variableFeePercentage) * yearlyVolumeUsd

    const fixedCost =
      yearlyVolumeUsd * (Number(corridor.costFixedPerUsd) || 0)

    const variableCost =
      Number(corridor.costVariablePerTrx) * yearlyTrx

    const treasuryFxCost =
      yearlyVolumeUsd * (Number(corridor.treasuryFxCost) || 0)

    const cost = fixedCost + variableCost + treasuryFxCost
    const margin = revenue - cost
    const marginPercent = revenue === 0 ? 0 : (margin / revenue) * 100

    return {
      revenue: Number(revenue.toFixed(6)),
      cost: Number(cost.toFixed(6)),
      margin: Number(margin.toFixed(6)),
      marginPercent: Number(marginPercent.toFixed(2)),
    }
  }
}

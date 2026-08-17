import Corridor from '#models/corridor'

export interface CorridorCalculations {
  revenue: number
  cost: number
  margin: number
  marginPercent: number
}

export default class CorridorCalculationService {
  static calculate(corridor: Corridor): CorridorCalculations {
    const atvUsd = Number(corridor.atvUsd) || 0

    const fixedRevenue = Number(corridor.stdFixedFeeUsd) || 0

    const variableRevenue =
      atvUsd * ((Number(corridor.variableFeePercentage) || 0) / 100)

    const fxRevenue =
      atvUsd * ((Number(corridor.defaultFxSpread) || 0) / 100)

    const revenue = fixedRevenue + variableRevenue + fxRevenue

    const fixedCost =
      atvUsd * (Number(corridor.costFixedPerUsd) || 0)

    const variableCost = Number(corridor.costVariablePerTrx) || 0

    const treasuryFxCost =
      atvUsd * ((Number(corridor.treasuryFxCost) || 0) / 100)

    const cost = fixedCost + variableCost + treasuryFxCost

    const margin = revenue - cost

    const marginPercent =
      revenue === 0
        ? 0
        : (margin / revenue) * 100

    return {
      revenue: Number(revenue.toFixed(6)),
      cost: Number(cost.toFixed(6)),
      margin: Number(margin.toFixed(6)),
      marginPercent: Number(marginPercent.toFixed(2)),
    }
  }
}

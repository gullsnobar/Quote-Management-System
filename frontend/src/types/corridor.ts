export interface CorridorCalculations {
  revenue: number
  cost: number
  margin: number
  marginPercent: number
}

export interface Corridor {
  id: number
  versionId: number
  sourceRowId: string
  corridorId: number
  region: string
  country: string
  transactionType: string
  service: string
  receivingPartner: string
  payer: string
  payoutCurrency: string
  historicalAtv: number
  atvUsd: number
  stdFixedFeeUsd: number
  variableFeePercentage: number
  fxSource: string
  defaultFxSpread: number
  treasuryFxCost: number
  costFixedPerUsd: number
  costVariablePerTrx: number
  needsApproval: boolean
  createdAt: string
  updatedAt: string | null
  calculations?: CorridorCalculations
  /** Per-quote negotiated fee override (null = use standard catalog fee). */
  negotiatedFee?: number | null
}

export interface CorridorFilters {
  region?: string
  country?: string
  transactionType?: string
  service?: string
  payoutCurrency?: string
  receivingPartner?: string
  payer?: string
}

export interface CorridorsResponse {
  data: Corridor[]
  count: number
  meta?: {
    total: number
  }
}

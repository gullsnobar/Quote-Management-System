export type QuoteStatus = 'draft' | 'in_review' | 'approved' | 'rejected'

export interface Quote {
  id: number
  userId: number
  name: string
  partnerName: string
  status: QuoteStatus
  contractLength: number
  totalRevenue: number
  totalCost: number
  totalMargin: number
  marginPercent: number
  monthlyRevenue: number
  monthlyCost: number
  monthlyMargin: number
  tcv: number
  corridorCount: number
  version: number
  createdAt: string
  updatedAt: string
}

export interface CreateQuotePayload {
  name: string
  partnerName: string
  contractLength?: number
}

export interface UpdateQuotePayload {
  name: string
  partnerName: string
  contractLength?: number
  version: number
}

/**
 * Audit trail entry returned by GET /account/quotes/:id/audit.
 * Owner-scoped on the backend — only the quote owner can view.
 */
export interface AuditLogEntry {
  id: number
  action: string
  metadata: Record<string, unknown> | null
  createdAt: string
  user: {
    id: number
    email: string
    fullName: string | null
  } | null
}

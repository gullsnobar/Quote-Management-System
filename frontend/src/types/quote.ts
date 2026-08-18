export type QuoteStatus = 'draft' | 'in_review' | 'approved' | 'rejected'

export interface Quote {
  id: number
  userId: number
  name: string
  partnerName: string
  status: QuoteStatus
  version: number
  createdAt: string
  updatedAt: string
}

export interface CreateQuotePayload {
  name: string
  partnerName: string
}

export interface UpdateQuotePayload {
  name: string
  partnerName: string
  version: number
}

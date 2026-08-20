

import type { CorridorFilters } from '../types/corridor'

export type QuoteId = number | string

export interface QuoteListParams {
  status?: string
  search?: string
}

export const queryKeys = {
  /** All quote list queries. Pass params for a specific filtered list. */
  quotes: (params?: QuoteListParams) => ['quotes', params ?? {}] as const,

  /** A single quote by ID. */
  quote: (id: QuoteId) => ['quote', id] as const,

  /** Corridors attached to a specific quote. */
  quoteCorridors: (id: QuoteId) => ['quote', id, 'corridors'] as const,

  /** Audit trail for a specific quote. */
  quoteAudit: (id: QuoteId) => ['quote', id, 'audit'] as const,

  /** Global corridor catalog with optional filters. */
  corridors: (filters?: CorridorFilters) => ['corridors', filters ?? {}] as const,
} as const

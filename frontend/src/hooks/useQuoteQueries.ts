import { useQuery, useMutation } from '@tanstack/react-query'
import { quotesApi } from '../api/quotesApi'
import { queryClient } from '../lib/queryClient'
import { queryKeys, type QuoteId, type QuoteListParams } from '../lib/queryKeys'
import type { Quote, AuditLogEntry, UpdateQuotePayload, CreateQuotePayload } from '../types/quote'
import type { Corridor } from '../types/corridor'

/* ============================================================
 * QUERY HOOKS — read-only server state
 * ============================================================ */

/**
 * Fetch a single quote by ID.
 *
 * staleTime: 30s — frequently mutated (save, submit, attach/detach),
 * but mutations use setQueryData for instant cache updates.
 *
 * @param options.refetchOnWindowFocus — set to `false` when the consuming
 *   component has custom focus-refresh logic (e.g., QuoteDetails AC-9).
 */
export function useQuoteQuery(
  id: QuoteId | undefined,
  options?: { refetchOnWindowFocus?: boolean }
) {
  return useQuery<Quote>({
    queryKey: queryKeys.quote(id ?? 'unset'),
    queryFn: async () => {
      const res = await quotesApi.getQuote(id!)
      return res.data
    },
    enabled: id !== undefined && id !== null && id !== '',
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    staleTime: 30_000,
  })
}

/**
 * Fetch the authenticated user's quote list with optional filters.
 * staleTime: 30s — mutations invalidate `['quotes']` so the list stays fresh.
 */
export function useQuotesQuery(params?: QuoteListParams) {
  return useQuery<Quote[]>({
    queryKey: queryKeys.quotes(params),
    queryFn: async () => {
      const res = await quotesApi.getQuotes(params)
      return res.data
    },
    staleTime: 30_000,
  })
}

/**
 * Fetch corridors attached to a specific quote.
 * staleTime: 15s — shorter than the quote because corridor changes are
 * more granular and expected to reflect quickly on sub-tab switches.
 */
export function useQuoteCorridorsQuery(quoteId: QuoteId | undefined) {
  return useQuery<{ data: Corridor[]; count: number }>({
    queryKey: queryKeys.quoteCorridors(quoteId ?? 'unset'),
    queryFn: async () => {
      return await quotesApi.getQuoteCorridors(quoteId!)
    },
    enabled: quoteId !== undefined && quoteId !== null && quoteId !== '',
    staleTime: 15_000,
  })
}

/**
 * Fetch the audit trail for a specific quote.
 * staleTime: 10s — append-only data; new entries appear after every mutation.
 */
export function useAuditTrailQuery(quoteId: QuoteId | undefined) {
  return useQuery<AuditLogEntry[]>({
    queryKey: queryKeys.quoteAudit(quoteId ?? 'unset'),
    queryFn: async () => {
      const res = await quotesApi.getAuditTrail(quoteId!)
      return res.data
    },
    enabled: quoteId !== undefined && quoteId !== null && quoteId !== '',
    staleTime: 10_000,
  })
}

/* ============================================================
 * MUTATION HOOKS — write operations that invalidate cache
 * ============================================================ */

/**
 * Update a quote's editable fields with optimistic concurrency.
 * On success: sets the single-quote cache from the response (includes
 * incremented version) and invalidates quote lists.
 * On 409: the mutation rejects — the caller shows the conflict UI.
 * The cache is NOT updated on conflict.
 */
export function useUpdateQuoteMutation() {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: QuoteId; payload: UpdateQuotePayload }) => {
      const res = await quotesApi.updateQuote(id, payload)
      return res.data
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.quote(variables.id), data)
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    },
  })
}

/**
 * Submit a quote for review (status → in_review).
 * On success: sets the single-quote cache from the response and
 * invalidates quote lists. No version/concurrency checking (no 409).
 */
export function useSubmitQuoteMutation() {
  return useMutation({
    mutationFn: async (id: QuoteId) => {
      const res = await quotesApi.submitQuote(id)
      return res.data
    },
    onSuccess: (data, id) => {
      queryClient.setQueryData(queryKeys.quote(id), data)
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    },
  })
}

/** Create a new quote. Invalidates quote lists on success. */
export function useCreateQuoteMutation() {
  return useMutation({
    mutationFn: async (payload: CreateQuotePayload) => {
      const res = await quotesApi.createQuote(payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    },
  })
}

/** Delete a quote. Removes the single-quote cache and invalidates lists. */
export function useDeleteQuoteMutation() {
  return useMutation({
    mutationFn: async (id: QuoteId) => {
      return await quotesApi.deleteQuote(id)
    },
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ['quote', id] })
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    },
  })
}

/**
 * Attach corridors to a quote. On success, invalidates the quote's
 * corridors, the quote itself (financials change), and audit trail.
 */
export function useAttachCorridorsMutation() {
  return useMutation({
    mutationFn: async ({ quoteId, corridorIds }: { quoteId: QuoteId; corridorIds: number[] }) => {
      return await quotesApi.attachCorridors(quoteId, corridorIds)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteCorridors(variables.quoteId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.quote(variables.quoteId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteAudit(variables.quoteId) })
    },
  })
}

/** Detach corridors from a quote. Same invalidation pattern as attach. */
export function useDetachCorridorsMutation() {
  return useMutation({
    mutationFn: async ({ quoteId, corridorIds }: { quoteId: QuoteId; corridorIds: number[] }) => {
      return await quotesApi.detachCorridors(quoteId, corridorIds)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteCorridors(variables.quoteId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.quote(variables.quoteId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteAudit(variables.quoteId) })
    },
  })
}

/**
 * Update the negotiated fee for a corridor on a quote.
 * On success, invalidates the quote's corridors, the quote itself
 * (financials change), and audit trail.
 */
export function useUpdateNegotiatedFeeMutation() {
  return useMutation({
    mutationFn: async ({
      quoteId,
      corridorId,
      negotiatedFee,
    }: {
      quoteId: QuoteId
      corridorId: number
      negotiatedFee: number | null
    }) => {
      return await quotesApi.updateNegotiatedFee(quoteId, corridorId, negotiatedFee)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteCorridors(variables.quoteId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.quote(variables.quoteId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteAudit(variables.quoteId) })
    },
  })
}

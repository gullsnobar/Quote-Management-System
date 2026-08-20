import api from './axios'
import type { CreateQuotePayload, Quote, UpdateQuotePayload, AuditLogEntry } from '../types/quote'
import type { Corridor } from '../types/corridor'

export const quotesApi = {
  async getQuotes(params?: { status?: string; search?: string }): Promise<{ data: Quote[] }> {
    const response = await api.get<{ data: Quote[] }>('/account/quotes', { params })
    return response.data
  },

  async getQuote(id: number | string): Promise<{ data: Quote }> {
    const response = await api.get<{ data: Quote }>(`/account/quotes/${id}`)
    return response.data
  },

  async createQuote(payload: CreateQuotePayload): Promise<{ data: Quote }> {
    const response = await api.post<{ data: Quote }>('/account/quotes', payload)
    return response.data
  },

  async updateQuote(id: number | string, payload: UpdateQuotePayload): Promise<{ data: Quote }> {
    const response = await api.put<{ data: Quote }>(`/account/quotes/${id}`, payload)
    return response.data
  },

  async deleteQuote(id: number | string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/account/quotes/${id}`)
    return response.data
  },

  async submitQuote(id: number | string): Promise<{ data: Quote }> {
    const response = await api.post<{ data: Quote }>(`/account/quotes/${id}/submit`)
    return response.data
  },

  // Quote-specific corridors (AC-4)
  async getQuoteCorridors(id: number | string): Promise<{ data: Corridor[]; count: number }> {
    const response = await api.get<{ data: Corridor[]; count: number }>(
      `/account/quotes/${id}/corridors`
    )
    return response.data
  },

  async attachCorridors(
    id: number | string,
    corridorIds: number[]
  ): Promise<{ data: Corridor[]; count: number }> {
    const response = await api.post<{ data: Corridor[]; count: number }>(
      `/account/quotes/${id}/corridors/attach`,
      { corridorIds }
    )
    return response.data
  },

  async detachCorridors(
    id: number | string,
    corridorIds: number[]
  ): Promise<{ data: Corridor[]; count: number }> {
    const response = await api.post<{ data: Corridor[]; count: number }>(
      `/account/quotes/${id}/corridors/detach`,
      { corridorIds }
    )
    return response.data
  },

  /** Update the negotiated fee for a corridor on a quote (per-quote override). */
  async updateNegotiatedFee(
    quoteId: number | string,
    corridorId: number,
    negotiatedFee: number | null
  ): Promise<{ data: Corridor[]; count: number }> {
    const response = await api.patch<{ data: Corridor[]; count: number }>(
      `/account/quotes/${quoteId}/corridors/${corridorId}`,
      { negotiatedFee }
    )
    return response.data
  },

  async getAuditTrail(id: number | string): Promise<{ data: AuditLogEntry[] }> {
    const response = await api.get<{ data: AuditLogEntry[] }>(`/account/quotes/${id}/audit`)
    return response.data
  },
}

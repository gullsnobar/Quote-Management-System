import api from './axios'
import type { CreateQuotePayload, Quote, UpdateQuotePayload } from '../types/quote'

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
}

import api from './axios'
import type { Corridor, CorridorFilters, CorridorsResponse } from '../types/corridor'

export const corridorsApi = {
  async getCorridors(filters?: CorridorFilters): Promise<CorridorsResponse> {
    const response = await api.get<CorridorsResponse>('/account/corridors', {
      params: filters,
    })
    return response.data
  },

  async getCorridor(id: number | string): Promise<{ data: Corridor }> {
    const response = await api.get<{ data: Corridor }>(`/account/corridors/${id}`)
    return response.data
  },
}

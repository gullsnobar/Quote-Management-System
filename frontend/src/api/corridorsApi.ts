import api from './axios'
import type { CorridorFilters, CorridorsResponse } from '../types/corridor'

export const corridorsApi = {
  async getCorridors(filters?: CorridorFilters): Promise<CorridorsResponse> {
    const response = await api.get<CorridorsResponse>('/account/corridors', {
      params: filters,
    })
    return response.data
  },
}

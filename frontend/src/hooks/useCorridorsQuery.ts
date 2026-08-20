import { useQuery } from '@tanstack/react-query'
import { corridorsApi } from '../api/corridorsApi'
import { queryKeys } from '../lib/queryKeys'
import type { CorridorFilters, CorridorsResponse } from '../types/corridor'

/**
 * Fetch the global corridor catalog with optional filters.
 *
 * staleTime: 5 minutes — the catalog is a relatively static reference
 * dataset (~3,000 rows) not affected by quote mutations.
 *
 * @param filters - Part of the query key, so changing filters triggers a new fetch.
 * @param options - `enabled: false` prevents fetching until the consuming component is ready.
 */
export function useCorridorsQuery(
  filters?: CorridorFilters,
  options?: { enabled?: boolean }
) {
  return useQuery<CorridorsResponse>({
    queryKey: queryKeys.corridors(filters),
    queryFn: async () => {
      return await corridorsApi.getCorridors(filters)
    },
    enabled: options?.enabled !== false,
    staleTime: 5 * 60_000,
  })
}

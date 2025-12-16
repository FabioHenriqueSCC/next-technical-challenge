import { useQuery } from '@tanstack/react-query';
import { listZones } from '../api/zones.api';
import { zonesQueryKeys } from '../constants/zones.queryKeys';

/**
 * React Query hook to fetch Zones, optionally filtered by name.
 *
 * The filter is trimmed to keep stable query keys and avoid accidental cache misses
 * due to leading/trailing whitespace.
 *
 * @param filterName - User-provided filter (typically from a search input).
 * @returns A React Query result containing the zones list request state.
 */
export function useZones(filterName: string) {
  const normalized = filterName.trim();

  return useQuery({
    queryKey: zonesQueryKeys.list(normalized),
    queryFn: () => listZones(normalized || undefined),
    staleTime: 30_000,
  });
}

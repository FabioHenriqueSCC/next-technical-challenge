import { useQuery } from '@tanstack/react-query';
import { listZones } from '../api/zones.api';
import { zonesQueryKeys } from '../constants/zones.queryKeys';

export function useZones(filterName: string) {
  const normalized = filterName.trim();

  return useQuery({
    queryKey: zonesQueryKeys.list(normalized),
    queryFn: () => listZones(normalized || undefined),
    staleTime: 30_000,
  });
}

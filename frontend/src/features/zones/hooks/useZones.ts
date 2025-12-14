import { useQuery } from '@tanstack/react-query';
import { listZones } from '../api/zones.api';

export function useZones(filterName: string) {
  return useQuery({
    queryKey: ['zones', filterName],
    queryFn: () => listZones(filterName || undefined),
  });
}

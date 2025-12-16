import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createZone } from '../api/zones.api';
import { zonesQueryKeys } from '../constants/zones.queryKeys';

/**
 * React Query mutation hook to create a new Zone.
 *
 * On success, it invalidates all Zone-related queries so lists/maps refresh
 * with the newly created zone.
 *
 * @returns A React Query mutation object for creating zones.
 */
export function useCreateZone() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createZone,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: zonesQueryKeys.all });
    },
  });
}

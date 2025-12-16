import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createZone } from '../api/zones.api';
import { zonesQueryKeys } from '../constants/zones.queryKeys';

export function useCreateZone() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createZone,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: zonesQueryKeys.all });
    },
  });
}

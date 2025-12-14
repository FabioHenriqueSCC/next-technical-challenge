import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createZone } from '../api/zones.api';

export function useCreateZone() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createZone,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zones'] }),
  });
}

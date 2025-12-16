import { apiClient } from '@/src/shared/api/apiClient';
import type { CreateZoneDTO, Zone } from '../model/zone.types';

export async function listZones(name?: string): Promise<Zone[]> {
  const res = await apiClient.get<Zone[]>('/zones', {
    params: name ? { name } : undefined,
  });
  return res.data;
}

export async function createZone(payload: CreateZoneDTO): Promise<Zone> {
  const res = await apiClient.post<Zone>('/zones', payload);
  return res.data;
}

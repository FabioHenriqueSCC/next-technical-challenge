import { apiClient } from '@/src/shared/api/apiClient';
import type { CreateZoneDTO, Zone } from '../model/zone.types';

/**
 * Fetches Zones from the backend.
 *
 * When `name` is provided, the request includes a query param `name` to filter
 * results server-side.
 *
 * @param name - Optional zone name filter.
 * @returns A list of Zones returned by the API.
 */
export async function listZones(name?: string): Promise<Zone[]> {
  const res = await apiClient.get<Zone[]>('/zones', {
    params: name ? { name } : undefined,
  });
  return res.data;
}

/**
 * Creates a new Zone through the backend API.
 *
 * @param payload - DTO containing the data required to create a Zone.
 * @returns The created Zone returned by the API.
 */
export async function createZone(payload: CreateZoneDTO): Promise<Zone> {
  const res = await apiClient.post<Zone>('/zones', payload);
  return res.data;
}

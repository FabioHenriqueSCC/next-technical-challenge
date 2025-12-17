'use client';

import { Alert, Loader, Table } from '@mantine/core';
import type { Zone } from '../../model/zone.types';

type ZonesTableProps = {
  zones: Zone[];
  isLoading: boolean;
  isError: boolean;
  selectedZoneId: string | null;
  onSelectZone: (id: string | null) => void;
};

/**
 * Table view for the zones list.
 *
 * Behavior:
 * - Shows a loader while loading.
 * - Shows an error alert if the request failed.
 * - Shows an empty-state alert when there are no zones.
 * - Clicking a row toggles selection for that zone.
 */
export default function ZonesTable({
  zones,
  isLoading,
  isError,
  selectedZoneId,
  onSelectZone,
}: ZonesTableProps) {
  if (isLoading) return <Loader size="sm" />;
  if (isError) return <Alert color="red">Erro ao carregar zonas</Alert>;
  if (!zones.length) return <Alert color="gray">Nenhuma zona encontrada</Alert>;

  return (
    <Table.ScrollContainer minWidth={360}>
      <Table withTableBorder highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nome</Table.Th>
            <Table.Th>Tipo</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {zones.map((z) => (
            <Table.Tr
              key={z.id}
              onClick={() =>
                onSelectZone(selectedZoneId === z.id ? null : z.id)
              }
              style={{
                cursor: 'pointer',
                background:
                  selectedZoneId === z.id
                    ? 'rgba(255,255,255,0.06)'
                    : undefined,
              }}
            >
              <Table.Td>{z.name}</Table.Td>
              <Table.Td>{z.type}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

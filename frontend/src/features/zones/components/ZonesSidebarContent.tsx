'use client';

import { Tabs, TextInput, Text, Stack, Divider } from '@mantine/core';
import ZonesTable from './ZonesTable';
import ZoneForm from './ZoneForm';
import type { Zone } from '../model/zone.types';
import type { ZoneGeometry } from '../model/zone.geometry';
import type { DrawMode } from './DrawModeController.client';

export default function ZonesSidebarContent({
  filterInput,
  onFilterInputChange,
  zones,
  isLoading,
  isError,
  selectedZoneId,
  onSelectZone,
  draftGeometry,
  onDraftGeometryChange,
  drawMode,
  onDrawModeChange,
  onClearDraft,
}: {
  filterInput: string;
  onFilterInputChange: (v: string) => void;

  zones: Zone[];
  isLoading: boolean;
  isError: boolean;

  selectedZoneId: string | null;
  onSelectZone: (id: string | null) => void;

  draftGeometry: ZoneGeometry | null;
  onDraftGeometryChange: (g: ZoneGeometry | null) => void;

  drawMode: DrawMode;
  onDrawModeChange: (m: DrawMode) => void;

  onClearDraft: () => void;
}) {
  return (
    <Stack gap="md" style={{ height: '100%' }}>
      <TextInput
        label="Filtrar por nome"
        placeholder="Ex: Zona Residencial Norte"
        value={filterInput}
        onChange={(e) => onFilterInputChange(e.currentTarget.value)}
      />

      <Tabs defaultValue="list">
        <Tabs.List>
          <Tabs.Tab value="list">Zonas</Tabs.Tab>
          <Tabs.Tab value="create">Criar</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list" pt="sm">
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              {zones.length} zona(s)
            </Text>

            <ZonesTable
              zones={zones}
              isLoading={isLoading}
              isError={isError}
              selectedZoneId={selectedZoneId}
              onSelectZone={onSelectZone}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="create" pt="sm">
          <Divider my="xs" />
          <ZoneForm
            draftGeometry={draftGeometry}
            onDraftGeometryChange={onDraftGeometryChange}
            drawMode={drawMode}
            onDrawModeChange={onDrawModeChange}
            onClearDraft={onClearDraft}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

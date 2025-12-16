'use client';

import {
  Tabs,
  TextInput,
  Text,
  Stack,
  Divider,
  Group,
  ActionIcon,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';

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
  onGoToMap,
  onFocusGeometry,
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

  onGoToMap?: () => void;
  onFocusGeometry?: (g: ZoneGeometry) => void;
}) {
  const hasFilter = filterInput.trim().length > 0;

  return (
    <Stack gap="md" style={{ height: '100%' }}>
      <Tabs defaultValue="list">
        <Tabs.List>
          <Tabs.Tab value="list">Zonas</Tabs.Tab>
          <Tabs.Tab value="create">Criar</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list" pt="sm">
          <Stack gap="sm">
            <TextInput
              label="Buscar zona"
              placeholder="Digite o nome…"
              value={filterInput}
              onChange={(e) => onFilterInputChange(e.currentTarget.value)}
              rightSection={
                hasFilter ? (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label="Limpar busca"
                    onClick={() => onFilterInputChange('')}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                ) : null
              }
            />

            <Group justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                {zones.length} zona(s)
              </Text>

              {hasFilter ? (
                <Text size="sm" c="dimmed">
                  Filtrando por: <b>{filterInput}</b>
                </Text>
              ) : null}
            </Group>

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
            onGoToMap={onGoToMap}
            onFocusGeometry={onFocusGeometry}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

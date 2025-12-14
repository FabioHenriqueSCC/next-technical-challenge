'use client';

import {
  AppShell,
  Burger,
  Group,
  Text,
  Drawer,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  useDebouncedValue,
  useDisclosure,
  useMediaQuery,
} from '@mantine/hooks';
import { useMemo, useRef, useState } from 'react';

import { useZones } from '../hooks/useZones';
import ZonesSidebarContent from './ZonesSidebarContent';
import type { ZoneGeometry } from '../model/zone.geometry';
import MapView from './MapView.client';
import type { DrawMode } from './DrawModeController.client';

export default function ZonesPage() {
  const isMobile = useMediaQuery('(max-width: 48em)');
  const [drawerOpened, drawer] = useDisclosure(false);

  const [filterInput, setFilterInput] = useState('');
  const [filterDebounced] = useDebouncedValue(filterInput, 300);

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const [draftGeometry, setDraftGeometry] = useState<ZoneGeometry | null>(null);
  const [drawMode, setDrawMode] = useState<DrawMode>('NONE');

  const clearDraftRef = useRef<(() => void) | null>(null);

  const zonesQuery = useZones(filterDebounced);
  const zones = useMemo(() => zonesQuery.data ?? [], [zonesQuery.data]);

  const clearDraft = () => {
    clearDraftRef.current?.();
    setDraftGeometry(null);
    setDrawMode('NONE');
  };

  const sidebar = (
    <ZonesSidebarContent
      filterInput={filterInput}
      onFilterInputChange={setFilterInput}
      zones={zones}
      isLoading={zonesQuery.isLoading}
      isError={zonesQuery.isError}
      selectedZoneId={selectedZoneId}
      onSelectZone={(id: string | null) => {
        setSelectedZoneId(id);
        if (isMobile) drawer.close();
      }}
      draftGeometry={draftGeometry}
      onDraftGeometryChange={setDraftGeometry}
      drawMode={drawMode}
      onDrawModeChange={setDrawMode}
      onClearDraft={clearDraft}
    />
  );

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={isMobile ? undefined : { width: 420, breakpoint: 'md' }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            {isMobile ? (
              <Burger
                opened={drawerOpened}
                onClick={drawer.toggle}
                aria-label="Abrir menu"
              />
            ) : null}
            <Text fw={700}>Zones</Text>
          </Group>

          <Tooltip label="Limpar seleção">
            <ActionIcon
              variant="light"
              onClick={() => setSelectedZoneId(null)}
              aria-label="Limpar seleção"
            >
              ✕
            </ActionIcon>
          </Tooltip>
        </Group>
      </AppShell.Header>

      {!isMobile ? <AppShell.Navbar p="md">{sidebar}</AppShell.Navbar> : null}

      <AppShell.Main
        style={{
          height: 'calc(100dvh - 56px)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            overflow: 'hidden',
            borderRadius: 16,
          }}
        >
          <MapView
            zones={zones}
            selectedZoneId={selectedZoneId}
            onSelectZone={setSelectedZoneId}
            draftGeometry={draftGeometry}
            onDraftGeometryChange={setDraftGeometry}
            drawMode={drawMode}
            onDrawModeChange={setDrawMode}
            onRegisterClearDraft={(fn) => {
              clearDraftRef.current = fn;
            }}
          />
        </div>
      </AppShell.Main>

      <Drawer
        opened={drawerOpened}
        onClose={drawer.close}
        title="Zonas"
        size="92%"
        padding="md"
        hiddenFrom="md"
        zIndex={4000}
      >
        {sidebar}
      </Drawer>
    </AppShell>
  );
}

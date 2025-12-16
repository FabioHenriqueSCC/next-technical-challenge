'use client';

import { AppShell, Burger, Drawer, Group, ScrollArea } from '@mantine/core';
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

import { BrandLogo } from '@/src/shared/components/BrandLogo';

export default function ZonesPage() {
  const isMobile = useMediaQuery('(max-width: 48em)');
  const [drawerOpened, drawer] = useDisclosure(false);

  const [filterInput, setFilterInput] = useState('');
  const [filterDebounced] = useDebouncedValue(filterInput, 300);

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const [draftGeometry, setDraftGeometry] = useState<ZoneGeometry | null>(null);
  const [drawMode, setDrawMode] = useState<DrawMode>('NONE');

  const clearDraftRef = useRef<(() => void) | null>(null);
  const flyToGeometryRef = useRef<((g: ZoneGeometry) => void) | null>(null);

  const zonesQuery = useZones(filterDebounced);
  const zones = useMemo(() => zonesQuery.data ?? [], [zonesQuery.data]);

  const clearDraft = () => {
    clearDraftRef.current?.();
    setDraftGeometry(null);
    setDrawMode('NONE');
  };

  const goToMap = () => {
    if (isMobile) drawer.close();
  };

  const focusGeometry = (g: ZoneGeometry) => {
    if (isMobile) {
      drawer.close();
      setTimeout(() => flyToGeometryRef.current?.(g), 50);
      return;
    }
    flyToGeometryRef.current?.(g);
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
      onGoToMap={goToMap}
      onFocusGeometry={focusGeometry}
    />
  );

  const headerHeight = 56;

  return (
    <AppShell
      header={{ height: headerHeight }}
      navbar={isMobile ? undefined : { width: 420, breakpoint: 'md' }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px={0} justify="space-between" wrap="nowrap">
          <Group
            gap={12}
            align="center"
            wrap="nowrap"
            style={{ paddingLeft: 12 }}
          >
            {isMobile ? (
              <Burger
                opened={drawerOpened}
                onClick={drawer.toggle}
                aria-label="Abrir menu"
              />
            ) : null}

            <BrandLogo height={isMobile ? 32 : 48} />
          </Group>
        </Group>
      </AppShell.Header>

      {!isMobile ? (
        <AppShell.Navbar p={0}>
          <ScrollArea h={`calc(100dvh - ${headerHeight}px)`} px="md" py="md">
            {sidebar}
          </ScrollArea>
        </AppShell.Navbar>
      ) : null}

      <AppShell.Main
        style={{
          height: `calc(100dvh - ${headerHeight}px)`,
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
            onRegisterFlyToGeometry={(fn) => {
              flyToGeometryRef.current = fn;
            }}
          />
        </div>
      </AppShell.Main>

      <Drawer
        opened={drawerOpened}
        onClose={drawer.close}
        title="Zonas"
        size="92%"
        padding={0}
        hiddenFrom="md"
        zIndex={4000}
        styles={{
          body: {
            height: `calc(100dvh - ${headerHeight}px)`,
            overflow: 'hidden',
            padding: 0,
          },
        }}
      >
        <ScrollArea h="100%" px="md" py="md">
          {sidebar}
        </ScrollArea>
      </Drawer>
    </AppShell>
  );
}

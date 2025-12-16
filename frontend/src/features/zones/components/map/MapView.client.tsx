'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  CircleMarker,
  useMap,
} from 'react-leaflet';
import { ActionIcon, Button } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconEye, IconEyeOff, IconListDetails } from '@tabler/icons-react';

import type { LatLngExpression } from 'leaflet';
import type { Zone, ZoneType } from '../../model/zone.types';
import type { ZoneGeometry } from '../../model/zone.geometry';

import ZoneLegend, { TYPE_COLOR } from './ZoneLegend';
import DrawModeController, { DrawMode } from './DrawModeController.client';

import './leafletSetup.client';
import {
  APPLY_MAX_ZOOM,
  APPLY_POINT_MIN_ZOOM,
  SELECT_MAX_ZOOM,
  SELECT_POINT_MIN_ZOOM,
  TILE_URL,
  boundsFromGeometry,
  toLatLngTuple,
} from './map.utils';

function InvalidateSizeOnMount() {
  const map = useMap();

  useEffect(() => {
    const t1 = window.setTimeout(() => map.invalidateSize(), 0);
    const t2 = window.setTimeout(() => map.invalidateSize(), 250);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);

  return null;
}

function FitToSelected({
  zones,
  selectedZoneId,
}: {
  zones: Zone[];
  selectedZoneId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedZoneId) return;
    const z = zones.find((x) => x.id === selectedZoneId);
    if (!z) return;

    if (z.geometry.type === 'Point') {
      const [lat, lng] = toLatLngTuple(z.geometry.coordinates);

      const currentZoom = map.getZoom();
      const desiredZoom =
        currentZoom < SELECT_POINT_MIN_ZOOM
          ? SELECT_POINT_MIN_ZOOM
          : currentZoom;

      const nextZoom = Math.min(SELECT_MAX_ZOOM, desiredZoom);

      map.flyTo([lat, lng], nextZoom, {
        animate: true,
        duration: 0.6,
      });
      return;
    }

    map.fitBounds(boundsFromGeometry(z.geometry), {
      padding: [30, 30],
      maxZoom: SELECT_MAX_ZOOM,
      animate: true,
    });
  }, [map, zones, selectedZoneId]);

  return null;
}

function FlyToGeometryController({
  onRegister,
}: {
  onRegister?: (fn: (g: ZoneGeometry) => void) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!onRegister) return;

    onRegister((g: ZoneGeometry) => {
      if (g.type === 'Point') {
        const [lat, lng] = toLatLngTuple(g.coordinates);

        const currentZoom = map.getZoom();
        const desiredZoom =
          currentZoom < APPLY_POINT_MIN_ZOOM
            ? APPLY_POINT_MIN_ZOOM
            : currentZoom;

        const nextZoom = Math.min(APPLY_MAX_ZOOM, desiredZoom);

        map.flyTo([lat, lng], nextZoom, {
          animate: true,
          duration: 0.8,
        });
        return;
      }

      map.fitBounds(boundsFromGeometry(g), {
        padding: [30, 30],
        maxZoom: APPLY_MAX_ZOOM,
        animate: true,
      });
    });
  }, [map, onRegister]);

  return null;
}

export default function MapView({
  zones,
  selectedZoneId,
  onSelectZone,
  draftGeometry,
  onDraftGeometryChange,
  drawMode,
  onDrawModeChange,
  onRegisterClearDraft,
  onRegisterFlyToGeometry,
}: {
  zones: Zone[];
  selectedZoneId: string | null;
  onSelectZone: (id: string | null) => void;

  draftGeometry: ZoneGeometry | null;
  onDraftGeometryChange: (g: ZoneGeometry | null) => void;

  drawMode: DrawMode;
  onDrawModeChange: (m: DrawMode) => void;

  onRegisterClearDraft: (fn: (() => void) | null) => void;
  onRegisterFlyToGeometry?: (fn: (g: ZoneGeometry) => void) => void;
}) {
  const isMobile = useMediaQuery('(max-width: 48em)');

  const counts = useMemo<Partial<Record<ZoneType, number>>>(() => {
    const c: Partial<Record<ZoneType, number>> = {};
    zones.forEach((z) => {
      c[z.type] = (c[z.type] ?? 0) + 1;
    });
    return c;
  }, [zones]);

  const [legendOpen, setLegendOpen] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem('zones.legend.open');
      if (saved === '0') return false;
      if (saved === '1') return true;
    } catch {
      // ignore
    }
    return true;
  });

  const setLegend = (next: boolean) => {
    setLegendOpen(next);
    try {
      window.localStorage.setItem('zones.legend.open', next ? '1' : '0');
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Toggle legenda */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1200,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        {isMobile ? (
          <Button
            size="xs"
            variant="filled"
            leftSection={<IconListDetails size={14} />}
            onClick={() => setLegend(!legendOpen)}
          >
            Legenda
          </Button>
        ) : (
          <ActionIcon
            variant="filled"
            size="lg"
            aria-label={legendOpen ? 'Ocultar legenda' : 'Mostrar legenda'}
            onClick={() => setLegend(!legendOpen)}
          >
            {legendOpen ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </ActionIcon>
        )}
      </div>

      {legendOpen ? (
        <div
          style={{
            position: 'absolute',
            top: isMobile ? 52 : 12,
            right: 12,
            zIndex: 1100,
            pointerEvents: 'auto',
          }}
        >
          <ZoneLegend counts={counts} />
        </div>
      ) : null}

      <MapContainer
        center={[-23.55, -46.64]}
        zoom={12}
        style={{
          height: '100%',
          width: '100%',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <InvalidateSizeOnMount />
        <TileLayer attribution="&copy; OpenStreetMap" url={TILE_URL} />

        <FitToSelected zones={zones} selectedZoneId={selectedZoneId} />
        <FlyToGeometryController onRegister={onRegisterFlyToGeometry} />

        <DrawModeController
          mode={drawMode}
          draftGeometry={draftGeometry}
          onGeometryChange={onDraftGeometryChange}
          onModeChange={onDrawModeChange}
          onRegisterClear={onRegisterClearDraft}
        />

        {zones.map((z) => {
          const isSelected = selectedZoneId === z.id;
          const color = TYPE_COLOR[z.type];

          if (z.geometry.type === 'Point') {
            const position: LatLngExpression = toLatLngTuple(
              z.geometry.coordinates,
            );

            return (
              <CircleMarker
                key={z.id}
                center={position}
                radius={isSelected ? 10 : 7}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.55 : 0.35,
                  weight: isSelected ? 3 : 2,
                }}
                eventHandlers={{
                  click: () => onSelectZone(isSelected ? null : z.id),
                }}
              >
                <Popup>
                  <b>{z.name}</b>
                  <br />
                  {z.type}
                </Popup>
              </CircleMarker>
            );
          }

          const ring = z.geometry.coordinates[0];
          const positions: LatLngExpression[] = ring.map((c) =>
            toLatLngTuple(c),
          );

          return (
            <Polygon
              key={z.id}
              positions={positions}
              pathOptions={{
                color,
                fillColor: color,
                weight: isSelected ? 4 : 2,
                fillOpacity: isSelected ? 0.25 : 0.14,
              }}
              eventHandlers={{
                click: () => onSelectZone(isSelected ? null : z.id),
              }}
            >
              <Popup>
                <b>{z.name}</b>
                <br />
                {z.type}
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
}

'use client';

import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  CircleMarker,
  useMap,
} from 'react-leaflet';

import type { LatLngExpression } from 'leaflet';
import type { Zone, ZoneType } from '../model/zone.types';
import type { ZoneGeometry } from '../model/zone.geometry';

import ZoneLegend, { TYPE_COLOR } from './ZoneLegend';
import DrawModeController, { DrawMode } from './DrawModeController.client';

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const toLatLng = (coord: [number, number]): [number, number] => {
  const [lng, lat] = coord;
  return [lat, lng];
};

function boundsFromGeometry(geometry: ZoneGeometry): L.LatLngBounds {
  if (geometry.type === 'Point') {
    const [lat, lng] = toLatLng(geometry.coordinates);
    return L.latLngBounds(
      [lat - 0.002, lng - 0.002],
      [lat + 0.002, lng + 0.002],
    );
  }

  const ring = geometry.coordinates[0];
  const latLngs = ring.map((c) => {
    const [lat, lng] = toLatLng(c);
    return L.latLng(lat, lng);
  });

  return L.latLngBounds(latLngs);
}

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

    map.fitBounds(boundsFromGeometry(z.geometry), { padding: [30, 30] });
  }, [map, zones, selectedZoneId]);

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
}: {
  zones: Zone[];
  selectedZoneId: string | null;
  onSelectZone: (id: string | null) => void;

  draftGeometry: ZoneGeometry | null;
  onDraftGeometryChange: (g: ZoneGeometry | null) => void;

  drawMode: DrawMode;
  onDrawModeChange: (m: DrawMode) => void;

  onRegisterClearDraft: (fn: (() => void) | null) => void;
}) {
  const counts = useMemo<Partial<Record<ZoneType, number>>>(() => {
    const c: Partial<Record<ZoneType, number>> = {};
    zones.forEach((z) => {
      c[z.type] = (c[z.type] ?? 0) + 1;
    });
    return c;
  }, [zones]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
        <ZoneLegend counts={counts} />
      </div>

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
            const position: LatLngExpression = toLatLng(z.geometry.coordinates);

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
          const positions: LatLngExpression[] = ring.map((c) => toLatLng(c));

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

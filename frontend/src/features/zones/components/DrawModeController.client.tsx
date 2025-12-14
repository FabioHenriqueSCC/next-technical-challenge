'use client';

import L from 'leaflet';
import 'leaflet-draw';
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { ZoneGeometry } from '../model/zone.geometry';

export type DrawMode = 'NONE' | 'POINT' | 'POLYGON';

const toLngLat = (ll: L.LatLng): [number, number] => [ll.lng, ll.lat];
const toLatLng = ([lng, lat]: [number, number]) => L.latLng(lat, lng);

function ensureClosedRing(coords: [number, number][]): [number, number][] {
  if (coords.length < 3) return coords;
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return coords;
  return [...coords, first];
}

function layerToGeometry(layer: L.Layer): ZoneGeometry | null {
  if (layer instanceof L.Marker) {
    const ll = layer.getLatLng();
    return { type: 'Point', coordinates: toLngLat(ll) };
  }

  if (layer instanceof L.Polygon) {
    const latlngs = layer.getLatLngs();
    const ring = Array.isArray(latlngs) ? (latlngs[0] as L.LatLng[]) : [];
    const coords = ensureClosedRing(ring.map(toLngLat));
    return { type: 'Polygon', coordinates: [coords] };
  }

  return null;
}

function geometryToLayer(geometry: ZoneGeometry): L.Layer {
  if (geometry.type === 'Point') {
    return L.marker(toLatLng(geometry.coordinates));
  }
  const ring = geometry.coordinates[0].map(toLatLng);
  return L.polygon(ring);
}

export default function DrawModeController({
  mode,
  draftGeometry,
  onGeometryChange,
  onModeChange,
  onRegisterClear,
}: {
  mode: DrawMode;
  draftGeometry: ZoneGeometry | null;
  onGeometryChange: (g: ZoneGeometry | null) => void;
  onModeChange: (m: DrawMode) => void;
  onRegisterClear: (fn: (() => void) | null) => void;
}) {
  const map = useMap();

  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const activeHandlerRef = useRef<L.Draw.Marker | L.Draw.Polygon | null>(null);

  useEffect(() => {
    const fg = new L.FeatureGroup();
    featureGroupRef.current = fg;
    map.addLayer(fg);

    const clear = () => {
      fg.clearLayers();
      onGeometryChange(null);
      onModeChange('NONE');
    };

    onRegisterClear(() => clear);

    const onCreated = (evt: unknown) => {
      const e = evt as { layer: L.Layer };
      fg.clearLayers();
      fg.addLayer(e.layer);

      onGeometryChange(layerToGeometry(e.layer));
      onModeChange('NONE');
    };

    map.on('draw:created', onCreated);

    return () => {
      map.off('draw:created', onCreated);
      onRegisterClear(null);
      map.removeLayer(fg);
      featureGroupRef.current = null;
    };
  }, [map, onGeometryChange, onModeChange, onRegisterClear]);

  useEffect(() => {
    if (activeHandlerRef.current) {
      activeHandlerRef.current.disable();
      activeHandlerRef.current = null;
    }

    if (mode === 'NONE') return;

    const drawMap = map as unknown as L.DrawMap;

    if (mode === 'POINT') {
      const handler = new L.Draw.Marker(drawMap, {});
      activeHandlerRef.current = handler;
      handler.enable();
      return;
    }

    if (mode === 'POLYGON') {
      const handler = new L.Draw.Polygon(drawMap, {
        allowIntersection: false,
        showArea: true,
      });
      activeHandlerRef.current = handler;
      handler.enable();
    }
  }, [map, mode]);

  useEffect(() => {
    const fg = featureGroupRef.current;
    if (!fg) return;

    fg.clearLayers();

    if (!draftGeometry) return;

    fg.addLayer(geometryToLayer(draftGeometry));
  }, [draftGeometry]);

  return null;
}

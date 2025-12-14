'use client';

import L from 'leaflet';
import iconRetinaImport from 'leaflet/dist/images/marker-icon-2x.png';
import iconImport from 'leaflet/dist/images/marker-icon.png';
import shadowImport from 'leaflet/dist/images/marker-shadow.png';

function getSrc(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object' && 'src' in v) {
    const src = (v as { src?: unknown }).src;
    if (typeof src === 'string') return src;
  }
  return '';
}

const iconRetinaUrl = getSrc(iconRetinaImport);
const iconUrl = getSrc(iconImport);
const shadowUrl = getSrc(shadowImport);

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

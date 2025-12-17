'use client';

import dynamic from 'next/dynamic';

const ZonesPage = dynamic(
  () => import('@/src/features/zones/components/ZonesPage'),
  {
    ssr: false,
    loading: () => <div style={{ padding: 16 }}>Carregando mapa…</div>,
  },
);

export default function Page() {
  return <ZonesPage />;
}

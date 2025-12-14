'use client';

import dynamic from 'next/dynamic';

const ZonesPage = dynamic(
  () => import('@/src/features/zones/components/ZonesPage'),
  { ssr: false },
);

export default function Page() {
  return <ZonesPage />;
}

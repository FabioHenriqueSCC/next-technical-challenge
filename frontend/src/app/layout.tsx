import type { Metadata } from 'next';
import { ColorSchemeScript } from '@mantine/core';

import Providers from './providers';

import '@mantine/core/styles.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ZoneAtlas',
    template: '%s | ZoneAtlas',
  },
  description: 'Gestão e visualização de zonas',
  icons: {
    icon: [
      { url: '/zoneatlas-mark.svg', media: '(prefers-color-scheme: light)' },
      {
        url: '/zoneatlas-mark-white.svg',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

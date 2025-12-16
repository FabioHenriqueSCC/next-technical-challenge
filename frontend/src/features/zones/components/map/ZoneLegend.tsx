'use client';

import { Paper, Group, Text, Stack, Badge } from '@mantine/core';
import type { ZoneType } from '../../model/zone.types';

export const TYPE_COLOR: Record<ZoneType, string> = {
  RESIDENCIAL: '#4dabf7',
  COMERCIAL: '#51cf66',
  INDUSTRIAL: '#ffa94d',
  MISTO: '#9775fa',
  ESPECIAL: '#ff6b6b',
};

type ZoneLegendProps = {
  counts: Partial<Record<ZoneType, number>>;
};

/**
 * Displays a compact legend for zone types with color indicators and counts.
 *
 * This component is used as an overlay on the map and is designed to remain readable
 * over map tiles (semi-transparent background + blur).
 */
export default function ZoneLegend({ counts }: ZoneLegendProps) {
  const items = (Object.keys(TYPE_COLOR) as ZoneType[]).map((t) => ({
    type: t,
    color: TYPE_COLOR[t],
    count: counts[t] ?? 0,
  }));

  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      style={{
        background: 'rgba(20,20,20,0.72)',
        backdropFilter: 'blur(6px)',
        width: 'clamp(180px, 52vw, 240px)',
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: 'min(42vh, 320px)',
        overflowY: 'auto',
      }}
    >
      <Text fw={700} size="sm" mb={6}>
        Tipos de zona
      </Text>

      <Stack gap={6}>
        {items.map((it) => (
          <Group key={it.type} justify="space-between" wrap="nowrap">
            <Group gap={8} wrap="nowrap">
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: it.color,
                  display: 'inline-block',
                  flex: '0 0 auto',
                }}
              />
              <Text size="sm">{it.type}</Text>
            </Group>
            <Badge variant="light">{it.count}</Badge>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}

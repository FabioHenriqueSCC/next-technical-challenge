'use client';

import Image from 'next/image';
import { useComputedColorScheme } from '@mantine/core';

export function BrandLogo({
  variant = 'horizontal',
  height = 25,
}: {
  variant?: 'horizontal' | 'mark';
  height?: number;
}) {
  const scheme = useComputedColorScheme('light');
  const isDark = scheme === 'dark';

  const src =
    variant === 'mark'
      ? isDark
        ? '/zoneatlas-mark-white.svg'
        : '/zoneatlas-mark.svg'
      : isDark
        ? '/zoneatlas-logo-white.svg'
        : '/zoneatlas-logo.svg';

  const width = variant === 'mark' ? height : Math.round(height * 5);

  return (
    <Image
      src={src}
      alt="ZoneAtlas"
      width={width}
      height={height}
      priority
      draggable={false}
      style={{
        width,
        height,
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}

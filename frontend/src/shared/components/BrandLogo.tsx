'use client';

import Image from 'next/image';
import { useComputedColorScheme } from '@mantine/core';

type BrandLogoProps = {
  variant?: 'horizontal' | 'mark';
  height?: number;
};

const HORIZONTAL_RATIO = 5;

export function BrandLogo({
  variant = 'horizontal',
  height = 25,
}: BrandLogoProps) {
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

  const width =
    variant === 'mark' ? height : Math.round(height * HORIZONTAL_RATIO);

  return (
    <Image
      src={src}
      alt="ZoneAtlas"
      width={width}
      height={height}
      priority
      draggable={false}
      sizes={variant === 'mark' ? `${height}px` : `${width}px`}
      style={{
        width,
        height,
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}

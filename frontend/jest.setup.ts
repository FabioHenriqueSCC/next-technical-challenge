import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';

type GlobalEncoding = {
  TextEncoder?: typeof TextEncoder;
  TextDecoder?: typeof TextDecoder;
};

const gEnc = globalThis as unknown as GlobalEncoding;

if (!gEnc.TextEncoder) gEnc.TextEncoder = TextEncoder;
if (!gEnc.TextDecoder) gEnc.TextDecoder = TextDecoder;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => {
    const mql = {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;

    return mql;
  },
});

class ResizeObserverMock implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

type GlobalResizeObserver = {
  ResizeObserver?: typeof ResizeObserver;
};

const gRO = globalThis as unknown as GlobalResizeObserver;

if (!gRO.ResizeObserver) {
  gRO.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}

class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void {}
}

type GlobalIntersectionObserver = {
  IntersectionObserver?: typeof IntersectionObserver;
};

const gIO = globalThis as unknown as GlobalIntersectionObserver;

if (!gIO.IntersectionObserver) {
  gIO.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver;
}

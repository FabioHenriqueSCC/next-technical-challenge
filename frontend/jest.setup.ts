import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';

type GlobalEncoding = {
  TextEncoder?: typeof TextEncoder;
  TextDecoder?: typeof TextDecoder;
};

const g = globalThis as unknown as GlobalEncoding;

if (!g.TextEncoder) g.TextEncoder = TextEncoder;
if (!g.TextDecoder) g.TextDecoder = TextDecoder;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => {
    const listeners = new Set<(e: MediaQueryListEvent) => void>();

    const mql = {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (
        _type: 'change',
        listener: (e: MediaQueryListEvent) => void,
      ) => {
        listeners.add(listener);
      },
      removeEventListener: (
        _type: 'change',
        listener: (e: MediaQueryListEvent) => void,
      ) => {
        listeners.delete(listener);
      },
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;

    return mql;
  },
});

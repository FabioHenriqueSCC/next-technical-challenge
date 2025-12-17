import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { useZones } from './useZones';

const listZones = jest.fn<Promise<unknown>, [string?]>().mockResolvedValue([]);

jest.mock('../api/zones.api', () => ({
  listZones: (name?: string) => listZones(name),
}));

describe('useZones', () => {
  beforeEach(() => {
    listZones.mockClear();
  });

  it('trims filter and calls listZones with normalized value', async () => {
    const qc = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    renderHook(() => useZones('   abc   '), { wrapper });

    await waitFor(() => {
      expect(listZones).toHaveBeenCalledWith('abc');
    });
  });

  it('calls listZones with undefined when filter becomes empty after trim', async () => {
    const qc = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    renderHook(() => useZones('   '), { wrapper });

    await waitFor(() => {
      expect(listZones).toHaveBeenCalledWith(undefined);
    });
  });
});

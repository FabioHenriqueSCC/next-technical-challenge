import React from 'react';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

type ProvidersProps = {
  children: React.ReactNode;
};

function Providers({ children }: ProvidersProps) {
  return <MantineProvider>{children}</MantineProvider>;
}

/**
 * Renders UI wrapped with the same providers used in the app
 * (e.g., MantineProvider). This keeps tests aligned with runtime behavior.
 */
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: Providers });
}

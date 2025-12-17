import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/test-utils';
import ZonesTable from './ZonesTable';
import type { Zone } from '../../model/zone.types';

function makeZone(overrides: Partial<Zone> = {}): Zone {
  const base = {
    id: '1',
    name: 'Zona A',
    type: 'RESIDENCIAL',
    geometry: { type: 'Point', coordinates: [0, 0] },
  } as unknown as Zone;

  return { ...base, ...overrides };
}

describe('ZonesTable', () => {
  it('shows loader when loading', () => {
    const { container } = renderWithProviders(
      <ZonesTable
        zones={[]}
        isLoading
        isError={false}
        selectedZoneId={null}
        onSelectZone={() => {}}
      />,
    );

    expect(container.querySelector('.mantine-Loader-root')).toBeTruthy();
  });

  it('shows error state', () => {
    renderWithProviders(
      <ZonesTable
        zones={[]}
        isLoading={false}
        isError
        selectedZoneId={null}
        onSelectZone={() => {}}
      />,
    );

    expect(screen.getByText(/Erro ao carregar zonas/i)).toBeInTheDocument();
  });

  it('toggles selection on row click', async () => {
    const user = userEvent.setup();
    const onSelectZone = jest.fn();

    const zones: Zone[] = [
      makeZone({ id: '1', name: 'Zona A' }),
      makeZone({ id: '2', name: 'Zona B', type: 'COMERCIAL' }),
    ];

    const { rerender } = renderWithProviders(
      <ZonesTable
        zones={zones}
        isLoading={false}
        isError={false}
        selectedZoneId={null}
        onSelectZone={onSelectZone}
      />,
    );

    await user.click(screen.getByText('Zona A'));
    expect(onSelectZone).toHaveBeenCalledWith('1');

    onSelectZone.mockClear();

    rerender(
      <ZonesTable
        zones={zones}
        isLoading={false}
        isError={false}
        selectedZoneId="1"
        onSelectZone={onSelectZone}
      />,
    );

    await user.click(screen.getByText('Zona A'));
    expect(onSelectZone).toHaveBeenCalledWith(null);
  });
});

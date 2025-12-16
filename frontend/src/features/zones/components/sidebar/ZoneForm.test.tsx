import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ZoneForm from './ZoneForm';
import type { ZoneGeometry } from '../../model/zone.geometry';

const mutateAsync = jest
  .fn<Promise<unknown>, [unknown]>()
  .mockResolvedValue({});

jest.mock('../../hooks/useCreateZone', () => ({
  useCreateZone: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

describe('ZoneForm', () => {
  beforeEach(() => {
    mutateAsync.mockClear();
  });

  it('blocks submit when geometry is missing', async () => {
    const user = userEvent.setup();

    render(
      <ZoneForm
        draftGeometry={null}
        onDraftGeometryChange={jest.fn()}
        drawMode="NONE"
        onDrawModeChange={jest.fn()}
        onClearDraft={jest.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Nome'), 'Zona Teste');
    await user.click(screen.getByRole('button', { name: /Criar zona/i }));

    expect(
      await screen.findByText(/Informe a geometria antes de criar/i),
    ).toBeInTheDocument();
  });

  it('applies manual point and calls onDraftGeometryChange', async () => {
    const user = userEvent.setup();
    const onDraftGeometryChange = jest.fn();

    render(
      <ZoneForm
        draftGeometry={null}
        onDraftGeometryChange={onDraftGeometryChange}
        drawMode="NONE"
        onDrawModeChange={jest.fn()}
        onClearDraft={jest.fn()}
      />,
    );

    await user.click(screen.getByText('Ponto manual'));

    await user.type(screen.getByLabelText('Latitude'), '-23.55');
    await user.type(screen.getByLabelText('Longitude'), '-46.64');

    await user.click(
      screen.getByRole('button', { name: /Aplicar ponto no mapa/i }),
    );

    expect(onDraftGeometryChange).toHaveBeenCalledWith({
      type: 'Point',
      coordinates: [-46.64, -23.55],
    });
  });

  it('submits when geometry exists and sends trimmed name', async () => {
    const user = userEvent.setup();
    const draft: ZoneGeometry = {
      type: 'Point',
      coordinates: [-46.64, -23.55],
    };

    render(
      <ZoneForm
        draftGeometry={draft}
        onDraftGeometryChange={jest.fn()}
        drawMode="NONE"
        onDrawModeChange={jest.fn()}
        onClearDraft={jest.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Nome'), '  Zona Trim  ');
    await user.click(screen.getByRole('button', { name: /Criar zona/i }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());

    expect(mutateAsync).toHaveBeenCalledWith({
      name: 'Zona Trim',
      type: 'RESIDENCIAL',
      geometry: draft,
    });
  });
});

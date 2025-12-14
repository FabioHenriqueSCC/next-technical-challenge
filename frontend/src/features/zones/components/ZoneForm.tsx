'use client';

import {
  Button,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import type { ZoneGeometry } from '../model/zone.geometry';
import type { ZoneType } from '../model/zone.types';
import type { DrawMode } from './DrawModeController.client';

import { useCreateZone } from '../hooks/useCreateZone';

type CreateZoneDTO = {
  name: string;
  type: ZoneType;
  geometry: ZoneGeometry;
};

type CreateZoneFormValues = {
  name: string;
  type: ZoneType;
  geometry: ZoneGeometry | null;
};

const ZONE_TYPES: ZoneType[] = [
  'RESIDENCIAL',
  'COMERCIAL',
  'INDUSTRIAL',
  'MISTO',
  'ESPECIAL',
];

function parseGeometryJson(input: string): ZoneGeometry | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const raw = JSON.parse(trimmed) as unknown;

  if (
    typeof raw === 'object' &&
    raw !== null &&
    'type' in raw &&
    (raw as { type?: unknown }).type === 'Point' &&
    'coordinates' in raw
  ) {
    const coords = (raw as { coordinates?: unknown }).coordinates;
    if (
      Array.isArray(coords) &&
      coords.length === 2 &&
      coords.every((n) => typeof n === 'number')
    ) {
      return { type: 'Point', coordinates: [coords[0], coords[1]] };
    }
  }

  if (
    typeof raw === 'object' &&
    raw !== null &&
    'type' in raw &&
    (raw as { type?: unknown }).type === 'Polygon' &&
    'coordinates' in raw
  ) {
    const coords = (raw as { coordinates?: unknown }).coordinates;

    if (
      Array.isArray(coords) &&
      coords.length >= 1 &&
      Array.isArray(coords[0]) &&
      (coords[0] as unknown[]).every(
        (p) =>
          Array.isArray(p) &&
          p.length === 2 &&
          p.every((n) => typeof n === 'number'),
      )
    ) {
      return {
        type: 'Polygon',
        coordinates: [coords[0] as Array<[number, number]>],
      };
    }
  }

  return null;
}

function geometryToPrettyJson(g: ZoneGeometry | null): string {
  if (!g) return '';
  return JSON.stringify(g, null, 2);
}

export default function ZoneForm({
  draftGeometry,
  onDraftGeometryChange,
  drawMode,
  onDrawModeChange,
  onClearDraft,
}: {
  draftGeometry: ZoneGeometry | null;
  onDraftGeometryChange: (g: ZoneGeometry | null) => void;

  drawMode: DrawMode;
  onDrawModeChange: (m: DrawMode) => void;

  onClearDraft: () => void;
}) {
  const createZoneMutation = useCreateZone();

  const [geometryText, setGeometryText] = useState<string>(
    geometryToPrettyJson(draftGeometry),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const form = useForm<CreateZoneFormValues>({
    initialValues: {
      name: '',
      type: 'RESIDENCIAL',
      geometry: null,
    },
    validate: {
      name: (v) =>
        v.trim().length < 2 ? 'Nome deve ter pelo menos 2 caracteres' : null,
      type: (v) => (ZONE_TYPES.includes(v) ? null : 'Tipo inválido'),
      geometry: (g) =>
        g ? null : 'Informe a geometria (cole GeoJSON ou desenhe no mapa)',
    },
  });

  useEffect(() => {
    form.setFieldValue('geometry', draftGeometry);
    setGeometryText(geometryToPrettyJson(draftGeometry));
    setJsonError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftGeometry]);

  const typeSelectData = useMemo(
    () => ZONE_TYPES.map((t) => ({ value: t, label: t })),
    [],
  );

  const examplePoint: ZoneGeometry = {
    type: 'Point',
    coordinates: [-46.6402, -23.5599],
  };

  const examplePolygon: ZoneGeometry = {
    type: 'Polygon',
    coordinates: [
      [
        [-46.65, -23.56],
        [-46.635, -23.565],
        [-46.625, -23.555],
        [-46.635, -23.545],
        [-46.65, -23.55],
        [-46.65, -23.56],
      ],
    ],
  };

  const onApplyGeometryText = () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const g = parseGeometryJson(geometryText);
      if (!g) {
        setJsonError(
          'GeoJSON inválido. Use Point ou Polygon no formato esperado.',
        );
        return;
      }
      setJsonError(null);
      onDraftGeometryChange(g);
    } catch {
      setJsonError('JSON inválido (erro ao parsear).');
    }
  };

  const onSubmit = async (values: CreateZoneFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!values.geometry) {
      form.setFieldError('geometry', 'Informe a geometria antes de criar.');
      return;
    }

    const payload: CreateZoneDTO = {
      name: values.name.trim(),
      type: values.type,
      geometry: values.geometry,
    };

    try {
      await createZoneMutation.mutateAsync(payload);

      setSubmitSuccess('Zona criada com sucesso!');
      form.reset();
      onClearDraft();
      onDrawModeChange('NONE');
      setGeometryText('');
      setJsonError(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg =
          (err.response?.data as { message?: string } | undefined)?.message ??
          err.message ??
          'Erro ao criar zona.';
        setSubmitError(msg);
        return;
      }

      setSubmitError('Erro ao criar zona.');
    }
  };

  const isSubmitting = createZoneMutation.isPending;

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="sm">
        {submitSuccess ? <Alert color="green">{submitSuccess}</Alert> : null}
        {submitError ? <Alert color="red">{submitError}</Alert> : null}

        <TextInput
          label="Nome"
          placeholder="Ex: Zona Mista Sul"
          {...form.getInputProps('name')}
        />

        <Select
          label="Tipo"
          data={typeSelectData}
          value={form.values.type}
          onChange={(v) => {
            const next = (v as ZoneType | null) ?? 'RESIDENCIAL';
            form.setFieldValue('type', next);
          }}
        />

        <Group grow>
          <Button
            type="button"
            variant={drawMode === 'POINT' ? 'filled' : 'light'}
            onClick={() =>
              onDrawModeChange(drawMode === 'POINT' ? 'NONE' : 'POINT')
            }
          >
            Desenhar ponto
          </Button>

          <Button
            type="button"
            variant={drawMode === 'POLYGON' ? 'filled' : 'light'}
            onClick={() =>
              onDrawModeChange(drawMode === 'POLYGON' ? 'NONE' : 'POLYGON')
            }
          >
            Desenhar polígono
          </Button>
        </Group>

        <Group grow>
          <Button
            variant="light"
            type="button"
            onClick={() => onDraftGeometryChange(examplePoint)}
          >
            Exemplo ponto
          </Button>
          <Button
            variant="light"
            type="button"
            onClick={() => onDraftGeometryChange(examplePolygon)}
          >
            Exemplo polígono
          </Button>
        </Group>

        <Group justify="space-between" align="center">
          <Text fw={600} size="sm">
            Geometria (GeoJSON Geometry)
          </Text>

          <Button
            variant="subtle"
            color="gray"
            type="button"
            onClick={() => {
              onClearDraft();
              form.setFieldValue('geometry', null);
              setGeometryText('');
              setJsonError(null);
              setSubmitError(null);
              setSubmitSuccess(null);
              onDrawModeChange('NONE');
            }}
          >
            Limpar
          </Button>
        </Group>

        <Text size="xs" c="dimmed">
          Cole um Geometry (Point/Polygon) ou use os botões para desenhar no
          mapa. O formato aceito é GeoJSON com coordenadas [lng, lat].
        </Text>

        {jsonError ? <Alert color="red">{jsonError}</Alert> : null}

        <Textarea
          value={geometryText}
          onChange={(e) => setGeometryText(e.currentTarget.value)}
          minRows={6}
          autosize
        />

        <Group>
          <Button type="button" variant="light" onClick={onApplyGeometryText}>
            Aplicar GeoJSON no mapa
          </Button>
        </Group>

        {form.errors.geometry ? (
          <Text size="xs" c="red">
            {form.errors.geometry}
          </Text>
        ) : null}

        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          Criar zona
        </Button>
      </Stack>
    </form>
  );
}

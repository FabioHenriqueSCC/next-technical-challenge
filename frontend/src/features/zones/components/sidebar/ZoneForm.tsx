'use client';

import {
  Accordion,
  Alert,
  Button,
  Group,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import type { ZoneGeometry } from '../../model/zone.geometry';
import {
  ZONE_TYPES,
  type CreateZoneDTO,
  type ZoneType,
} from '../../model/zone.types';
import type { DrawMode } from '../map/DrawModeController.client';
import { useCreateZone } from '../../hooks/useCreateZone';

import {
  createZoneFormSchema,
  type CreateZoneFormValues,
} from '../../model/zone.schema';

type GeometryMode = 'DRAW' | 'POINT_MANUAL' | 'GEOJSON';

/**
 * Parses a JSON string into a `ZoneGeometry` supported by the UI.
 *
 * Supported:
 * - `Point` with `[lng, lat]`
 * - `Polygon` with coordinates as `[[[lng, lat], ...]]` (reads the first ring only)
 *
 * Notes:
 * - Returns `null` if the object shape is not recognized.
 * - Throws if the input is not valid JSON (caller handles the try/catch).
 *
 * @param input - Raw JSON text.
 * @returns Parsed `ZoneGeometry` or `null` when unsupported.
 */
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

/**
 * Serializes geometry into pretty-printed JSON for display in the textarea.
 *
 * @param g - Geometry (or `null`).
 * @returns Pretty JSON or empty string.
 */
function geometryToPrettyJson(g: ZoneGeometry | null): string {
  if (!g) return '';
  return JSON.stringify(g, null, 2);
}

/**
 * Converts Mantine/Zod flattened errors (string array per field) into
 * a Mantine-friendly object containing only the first error per field.
 *
 * @param errs - Field errors with possibly multiple messages per field.
 * @returns First error per field key.
 */
function firstFieldError(errs: Record<string, string[] | undefined>) {
  const out: Record<string, string> = {};
  for (const [k, arr] of Object.entries(errs)) {
    if (arr && arr.length > 0) out[k] = arr[0];
  }
  return out;
}

type ZoneFormProps = {
  draftGeometry: ZoneGeometry | null;

  onDraftGeometryChange: (g: ZoneGeometry | null) => void;

  drawMode: DrawMode;

  onDrawModeChange: (m: DrawMode) => void;

  onClearDraft: () => void;

  onGoToMap?: () => void;

  onFocusGeometry?: (g: ZoneGeometry) => void;
};

/**
 * Zone creation form.
 *
 * Features:
 * - Validates values via Zod (runtime validation) using `createZoneFormSchema`.
 * - Supports 3 geometry modes: draw on map, manual point entry, and GeoJSON paste.
 * - Integrates with React Query mutation (`useCreateZone`) to create a zone in the API.
 * - Provides success/error feedback and resets state on success.
 */
export default function ZoneForm({
  draftGeometry,
  onDraftGeometryChange,
  drawMode,
  onDrawModeChange,
  onClearDraft,
  onGoToMap,
  onFocusGeometry,
}: ZoneFormProps) {
  const createZoneMutation = useCreateZone();

  const [geometryMode, setGeometryMode] = useState<GeometryMode>('DRAW');

  const [geometryText, setGeometryText] = useState<string>(
    geometryToPrettyJson(draftGeometry),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [lat, setLat] = useState<number | ''>('');
  const [lng, setLng] = useState<number | ''>('');

  const form = useForm<CreateZoneFormValues>({
    initialValues: {
      name: '',
      type: 'RESIDENCIAL',
      geometry: null,
    },
    validate: (values) => {
      const parsed = createZoneFormSchema.safeParse(values);
      if (parsed.success) return {};
      const flat = parsed.error.flatten();
      return firstFieldError(
        flat.fieldErrors as Record<string, string[] | undefined>,
      );
    },
  });

  useEffect(() => {
    form.setFieldValue('geometry', draftGeometry);
    setGeometryText(geometryToPrettyJson(draftGeometry));
    setJsonError(null);

    if (draftGeometry?.type === 'Point') {
      const [lng0, lat0] = draftGeometry.coordinates;
      setLat(lat0);
      setLng(lng0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftGeometry]);

  useEffect(() => {
    if (geometryMode !== 'DRAW') onDrawModeChange('NONE');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometryMode]);

  /**
   * Memoized select options for zone types.
   */
  const typeSelectData = useMemo(
    () => ZONE_TYPES.map((t) => ({ value: t, label: t })),
    [],
  );

  /**
   * Applies the GeoJSON text area value to the draft geometry (if valid).
   * Also optionally switches user focus to the map and zooms to the geometry.
   */
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
      onGoToMap?.();
      onFocusGeometry?.(g);
    } catch {
      setJsonError('JSON inválido (erro ao parsear).');
    }
  };

  /**
   * Builds a Point geometry from manually entered lat/lng and applies it.
   */
  const onApplyPointManual = () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      form.setFieldError('geometry', 'Informe latitude e longitude.');
      return;
    }

    const g: ZoneGeometry = { type: 'Point', coordinates: [lng, lat] };
    onDraftGeometryChange(g);

    onGoToMap?.();
    onFocusGeometry?.(g);
  };

  /**
   * Submits the form:
   * - ensures geometry is present
   * - trims name
   * - calls backend mutation
   * - resets UI state on success
   */
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
      setLat('');
      setLng('');
      setGeometryMode('DRAW');
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
          comboboxProps={{ withinPortal: false }}
        />

        <Group justify="space-between" align="center">
          <Text fw={600} size="sm">
            Geometria
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
              setLat('');
              setLng('');
              setGeometryMode('DRAW');
              onDrawModeChange('NONE');
            }}
          >
            Limpar
          </Button>
        </Group>

        <SegmentedControl
          fullWidth
          value={geometryMode}
          onChange={(v) => setGeometryMode(v as GeometryMode)}
          data={[
            { label: 'Desenhar', value: 'DRAW' },
            { label: 'Ponto manual', value: 'POINT_MANUAL' },
            { label: 'GeoJSON (avançado)', value: 'GEOJSON' },
          ]}
        />

        {geometryMode === 'DRAW' ? (
          <Group grow>
            <Button
              type="button"
              variant={drawMode === 'POINT' ? 'filled' : 'light'}
              onClick={() => {
                onDrawModeChange(drawMode === 'POINT' ? 'NONE' : 'POINT');
                onGoToMap?.();
              }}
            >
              Desenhar ponto
            </Button>

            <Button
              type="button"
              variant={drawMode === 'POLYGON' ? 'filled' : 'light'}
              onClick={() => {
                onDrawModeChange(drawMode === 'POLYGON' ? 'NONE' : 'POLYGON');
                onGoToMap?.();
              }}
            >
              Desenhar polígono
            </Button>
          </Group>
        ) : null}

        {geometryMode === 'POINT_MANUAL' ? (
          <Stack gap="xs">
            <Group grow>
              <NumberInput
                label="Latitude"
                placeholder="-23.5599"
                value={lat}
                onChange={(v) => setLat(typeof v === 'number' ? v : '')}
                decimalScale={7}
              />
              <NumberInput
                label="Longitude"
                placeholder="-46.6402"
                value={lng}
                onChange={(v) => setLng(typeof v === 'number' ? v : '')}
                decimalScale={7}
              />
            </Group>

            <Button type="button" variant="light" onClick={onApplyPointManual}>
              Aplicar ponto no mapa
            </Button>

            <Text size="xs" c="dimmed">
              O sistema salva como GeoJSON [lng, lat].
            </Text>
          </Stack>
        ) : null}

        {geometryMode === 'GEOJSON' ? (
          <Accordion variant="separated">
            <Accordion.Item value="geojson">
              <Accordion.Control>Importar GeoJSON</Accordion.Control>
              <Accordion.Panel>
                <Text size="xs" c="dimmed" mb="xs">
                  Aceito: GeoJSON Geometry (Point/Polygon) com coordenadas [lng,
                  lat].
                </Text>

                {jsonError ? <Alert color="red">{jsonError}</Alert> : null}

                <Textarea
                  value={geometryText}
                  onChange={(e) => setGeometryText(e.currentTarget.value)}
                  autosize={false}
                  minRows={12}
                  styles={{
                    input: {
                      height: 'clamp(320px, 48vh, 760px)',
                      overflowY: 'auto',
                    },
                  }}
                />

                <Group mt="sm">
                  <Button
                    type="button"
                    variant="light"
                    onClick={onApplyGeometryText}
                  >
                    Aplicar GeoJSON no mapa
                  </Button>
                </Group>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        ) : null}

        {form.errors.geometry ? (
          <Text size="xs" c="red">
            {String(form.errors.geometry)}
          </Text>
        ) : null}

        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          Criar zona
        </Button>
      </Stack>
    </form>
  );
}

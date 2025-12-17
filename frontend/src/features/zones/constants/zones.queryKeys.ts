export const zonesQueryKeys = {
  all: ['zones'] as const,
  list: (filterName: string) => ['zones', filterName] as const,
};

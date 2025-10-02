import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

export function useStoreSettings() {
  const settings = useQuery(api.queries.getPublicStoreSettings) as Record<string, unknown> | undefined;

  const getSetting = (key: string, defaultValue?: unknown) => {
    return settings?.[key] ?? defaultValue;
  };

  return {
    settings,
    getSetting,
    isLoading: settings === undefined,
  };
}
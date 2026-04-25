// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Hook for listing all apps across every project in an organization.
 *
 * Backed by the org-scoped `sys_app` catalog mirrored into the control-plane
 * DB by `AppCatalogService`. A single read replaces the previous
 * per-project-DB fan-out.
 */

import { useCallback, useEffect, useState } from 'react';
import { useClient } from '@objectstack/client-react';

export interface OrgApp {
  id?: string;
  organization_id: string;
  project_id: string;
  project_name?: string | null;
  name: string;
  label?: string | null;
  icon?: string | null;
  branding?: string | null;
  is_default?: boolean;
  active?: boolean;
  source?: 'package' | 'user';
  package_id?: string | null;
  updated_at?: string;
}

export function useOrgApps(organizationId: string | undefined) {
  const client = useClient() as any;
  const [apps, setApps] = useState<OrgApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadApps = useCallback(async () => {
    if (!organizationId || !client) return;

    setLoading(true);
    setError(null);
    try {
      const route = '/api/v1/data';
      const res = await client.fetch(
        `${client.baseUrl}${route}/sys_app?filter=organization_id eq '${organizationId}'&sort=project_id,name`,
      );

      if (!res.ok) {
        throw new Error('Failed to load apps');
      }

      const data = await res.json();
      const list = data?.data?.items ?? data?.items ?? [];
      setApps(list);
    } catch (err) {
      setError(err as Error);
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, [client, organizationId]);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  return {
    apps,
    loading,
    error,
    reload: loadApps,
  };
}

// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { useState, useEffect } from 'react';
import { useClient } from '@objectstack/client-react';
import type { InstalledPackage } from '@objectstack/spec/kernel';

export interface UsePackagesOptions {
  // Reserved for future filtering options. Scope-based filtering has been
  // intentionally removed — every installed package (system + project) is
  // visible from every surface so the user can always switch between them.
}

/**
 * Hook to fetch and manage installed packages
 */
export function usePackages(_options: UsePackagesOptions = {}) {
  const client = useClient();
  const [packages, setPackages] = useState<InstalledPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<InstalledPackage | null>(null);

  useEffect(() => {
    if (!client) return;
    let mounted = true;

    async function loadPackages() {
      try {
        const result = await client.packages.list();
        const all: InstalledPackage[] = result?.packages || [];
        // Exclude dev-workspace (monorepo aggregator) and unversioned packages;
        // otherwise return every package regardless of `manifest.scope`.
        const items = all.filter((p) => {
          if (p.manifest?.version === '0.0.0') return false;
          if (p.manifest?.id === 'dev-workspace') return false;
          return true;
        });
        console.log('[App] Fetched packages:', items.map((p) => p.manifest?.name || p.manifest?.id));
        if (mounted) {
          setPackages(items);
          setSelectedPackage((prev) =>
            items.length === 0
              ? null
              : prev && items.some((p) => p.manifest?.id === prev.manifest?.id)
                ? prev
                : items[0],
          );
        }
      } catch (err) {
        console.error('[App] Failed to fetch packages:', err);
      }
    }

    loadPackages();
    return () => { mounted = false; };
  }, [client]);

  return { packages, selectedPackage, setSelectedPackage };
}

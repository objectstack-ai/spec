// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * /environments/$environmentId/$package — env-scoped package layout.
 *
 * Mirrors `/$package.tsx` but scoped to a specific environment:
 *  - Package list comes from `useEnvAwarePackages` (only env-installed packages,
 *    enriched with full manifest data from the global registry).
 *  - Package switching navigates to `/environments/:envId/:newPkg` to keep
 *    the env context in the URL.
 *  - The parent `environments.$environmentId.tsx` layout already binds
 *    `X-Environment-Id` to the client for all downstream API requests.
 */

import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect } from 'react';
import type { InstalledPackage } from '@objectstack/spec/kernel';
import { AppSidebar } from '../components/app-sidebar';
import { useEnvAwarePackages } from '../hooks/useEnvAwarePackages';

function EnvPackageLayoutComponent() {
  const { environmentId, package: packageId } = Route.useParams();
  const { packages, selectedPackage, setSelectedPackage } = useEnvAwarePackages(environmentId);
  const navigate = useNavigate();

  // URL param is the single source of truth for the selected package.
  // Match by full manifest.id first, then by last dot-segment (short alias).
  useEffect(() => {
    if (!packageId || !packages.length) return;
    const pkg = packages.find(
      (p) =>
        p.manifest?.id === packageId ||
        p.manifest?.id?.endsWith('.' + packageId),
    );
    if (pkg && pkg !== selectedPackage) setSelectedPackage(pkg);
  }, [packageId, packages, selectedPackage, setSelectedPackage]);

  const handleSelectPackage = useCallback(
    (pkg: InstalledPackage) => {
      const nextId = pkg.manifest?.id;
      if (!nextId || nextId === packageId) return;
      navigate({
        to: '/environments/$environmentId/$package',
        params: { environmentId, package: nextId },
      });
    },
    [navigate, environmentId, packageId],
  );

  return (
    <>
      <AppSidebar
        packages={packages}
        selectedPackage={selectedPackage}
        onSelectPackage={handleSelectPackage}
        environmentId={environmentId}
      />
      <main className="flex min-w-0 flex-1 flex-col h-svh overflow-hidden bg-background">
        <Outlet />
      </main>
    </>
  );
}

export const Route = createFileRoute('/environments/$environmentId/$package')({
  component: EnvPackageLayoutComponent,
});

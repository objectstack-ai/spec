// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { AppSidebar } from '../components/app-sidebar';
import { usePackages } from '../hooks/usePackages';
import { useCallback, useEffect } from 'react';
import type { InstalledPackage } from '@objectstack/spec/kernel';

/**
 * Layout for every `/$package/*` route.
 *
 * Renders the persistent left `AppSidebar` and the main content frame, and
 * delegates the `SiteHeader` + body rendering to the child leaf routes via
 * `<Outlet />`. Keeping the header in the children lets each leaf (index,
 * object view, metadata view) provide accurate breadcrumbs without prop-
 * drilling. It also prevents the duplicated-shell bug that occurred when
 * both this layout and its children each rendered their own `AppSidebar`.
 *
 * The URL `$package` param is the single source of truth for the current
 * package. Selecting a new package in the sidebar dropdown navigates to
 * `/$newPackage`; the URL→state effect below then updates `selectedPackage`,
 * which in turn invalidates `AppSidebar.loadMetadata` (its dependency) and
 * causes the left metadata list to refresh for the newly selected package.
 */
function PackageLayoutComponent() {
  const { package: packageId } = Route.useParams();
  const { packages, selectedPackage, setSelectedPackage } = usePackages();
  const navigate = useNavigate();

  // Sync selection from the URL param (single source of truth).
  useEffect(() => {
    const pkg = packages.find(p => p.manifest?.id === packageId);
    if (pkg && pkg !== selectedPackage) {
      setSelectedPackage(pkg);
    }
  }, [packageId, packages, selectedPackage, setSelectedPackage]);

  // Selecting a package in the sidebar dropdown must drive the URL;
  // otherwise the URL→state effect above would immediately revert the
  // local state back to the old package and the metadata list would
  // never refresh.
  const handleSelectPackage = useCallback((pkg: InstalledPackage) => {
    const nextId = pkg.manifest?.id;
    if (!nextId || nextId === packageId) return;
    navigate({ to: '/$package', params: { package: nextId } });
  }, [navigate, packageId]);

  return (
    <>
      <AppSidebar
        packages={packages}
        selectedPackage={selectedPackage}
        onSelectPackage={handleSelectPackage}
      />
      <main className="flex min-w-0 flex-1 flex-col h-svh overflow-hidden bg-background">
        <Outlet />
      </main>
    </>
  );
}

export const Route = createFileRoute('/$package')({
  component: PackageLayoutComponent,
});

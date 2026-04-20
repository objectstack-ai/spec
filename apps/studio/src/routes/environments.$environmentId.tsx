// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * /environments/$environmentId — environment-scoped layout.
 *
 * Mirrors Power Platform's URL structure:
 *   https://make.powerapps.com/environments/<env-uuid>/apps
 *
 * Responsibilities:
 *  - Bind the URL `environmentId` to the ObjectStackClient via
 *    {@link useEnvironmentDetail}, causing every downstream API request to
 *    carry the `X-Environment-Id` header.
 *  - Render the package-scoped {@link AppSidebar} (metadata tree) for ALL
 *    routes under `/environments/:envId/*` — overview, package management,
 *    and the package workspace — so the user sees the metadata list as soon
 *    as they select an environment.
 *  - Redirect back to `/environments` when the environment cannot be loaded.
 */

import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useCallback, useEffect, useMemo } from 'react';
import type { InstalledPackage } from '@objectstack/spec/kernel';
import { useEnvironmentDetail } from '@/hooks/useEnvironments';
import { useRegisterActiveEnvironment } from '@/components/production-guard';
import { toast } from '@/hooks/use-toast';
import { AppSidebar } from '@/components/app-sidebar';
import { useEnvAwarePackages } from '@/hooks/useEnvAwarePackages';

function EnvironmentLayoutComponent() {
  const { environmentId } = useParams({
    from: '/environments/$environmentId',
  });
  const { detail, error } = useEnvironmentDetail(environmentId);
  const registerActiveEnv = useRegisterActiveEnvironment();
  const navigate = useNavigate();
  const location = useLocation();

  const { packages, selectedPackage, setSelectedPackage } =
    useEnvAwarePackages(environmentId);

  // Extract the $package segment from the URL when the user is on a
  // package-scoped child route. This lets the sidebar highlight the
  // current package without requiring the child route to own the sidebar.
  const activePackageId = useMemo(() => {
    const m = location.pathname.match(
      /^\/environments\/[^/]+\/([^/]+)(?:\/|$)/,
    );
    if (!m) return undefined;
    const seg = m[1];
    // Reserved child segments that are NOT package ids.
    if (seg === 'packages') return undefined;
    return seg;
  }, [location.pathname]);

  // Sync selectedPackage with URL.
  useEffect(() => {
    if (!activePackageId) {
      if (selectedPackage) setSelectedPackage(null);
      return;
    }
    if (!packages.length) return;
    const pkg = packages.find(
      (p) =>
        p.manifest?.id === activePackageId ||
        p.manifest?.id?.endsWith('.' + activePackageId),
    );
    if (pkg && pkg !== selectedPackage) setSelectedPackage(pkg);
  }, [activePackageId, packages, selectedPackage, setSelectedPackage]);

  const handleSelectPackage = useCallback(
    (pkg: InstalledPackage) => {
      const nextId = pkg.manifest?.id;
      if (!nextId) return;
      navigate({
        to: '/environments/$environmentId/$package',
        params: { environmentId, package: nextId },
      });
    },
    [navigate, environmentId],
  );

  // Publish the active environment to the production guard so that any
  // descendant component can call useProductionGuard().confirm() and have
  // the dialog know which env it's protecting.
  useEffect(() => {
    registerActiveEnv({
      envType: detail?.environment?.envType,
      displayName: detail?.environment?.displayName,
    });
    return () => registerActiveEnv({ envType: undefined });
  }, [detail, registerActiveEnv]);

  // Persist last-used environment so legacy /$package/* redirects can restore context.
  useEffect(() => {
    if (environmentId) localStorage.setItem('objectstack.lastEnvId', environmentId);
  }, [environmentId]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Environment not available',
        description: error.message,
        variant: 'destructive',
      });
      navigate({ to: '/environments' });
    }
  }, [error, navigate]);

  return (
    <>
      <AppSidebar
        packages={packages}
        selectedPackage={selectedPackage}
        onSelectPackage={handleSelectPackage}
        environmentId={environmentId}
      />
      <Outlet />
    </>
  );
}

export const Route = createFileRoute('/environments/$environmentId')({
  component: EnvironmentLayoutComponent,
});

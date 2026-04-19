// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * /environments/$environmentId — environment-scoped layout.
 *
 * Mirrors Power Platform's URL structure:
 *   https://make.powerapps.com/environments/<env-uuid>/apps
 *
 * This layout's only job is to bind the URL `environmentId` to the
 * ObjectStackClient via {@link useEnvironmentDetail}, which causes every
 * downstream API request to carry the `X-Environment-Id` header. Child
 * routes render inside `<Outlet />` and can read the current environment
 * from the route params.
 *
 * On load, if the requested environment cannot be found (404, revoked
 * membership, etc.), the layout redirects back to `/environments` so the
 * user can pick another.
 */

import {
  createFileRoute,
  Outlet,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useEffect } from 'react';
import { useEnvironmentDetail } from '@/hooks/useEnvironments';
import { useRegisterActiveEnvironment } from '@/components/production-guard';
import { toast } from '@/hooks/use-toast';

function EnvironmentLayoutComponent() {
  const { environmentId } = useParams({
    from: '/environments/$environmentId',
  });
  const { detail, error } = useEnvironmentDetail(environmentId);
  const registerActiveEnv = useRegisterActiveEnvironment();
  const navigate = useNavigate();

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

  return <Outlet />;
}

export const Route = createFileRoute('/environments/$environmentId')({
  component: EnvironmentLayoutComponent,
});

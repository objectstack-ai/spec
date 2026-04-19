// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Legacy `/$package` layout — redirects to the env-scoped equivalent.
 *
 * Package browsing is now per-environment: `/environments/:envId/:package/*`.
 * If the user's last-used environment is known (localStorage), we redirect
 * directly there. Otherwise we send them to the environment selection page.
 */

import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/$package')({
  beforeLoad: ({ params }) => {
    const lastEnvId =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('objectstack.lastEnvId')
        : null;

    if (lastEnvId) {
      throw redirect({
        to: '/environments/$environmentId/$package',
        params: { environmentId: lastEnvId, package: params.package },
        replace: true,
      });
    }
    throw redirect({ to: '/environments', replace: true });
  },
  component: () => null,
});

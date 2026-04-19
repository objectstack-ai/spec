// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Legacy `/$package/` index — handled by the parent `/$package` redirect.
 * This file must exist so TanStack Router doesn't generate a 404 for the
 * exact index path before the parent redirect fires.
 */

import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/$package/')({
  beforeLoad: ({ params }) => {
    const lastEnvId =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('objectstack.lastEnvId')
        : null;

    if (lastEnvId) {
      throw redirect({
        to: '/environments/$environmentId/$package/',
        params: { environmentId: lastEnvId, package: params.package },
        replace: true,
      });
    }
    throw redirect({ to: '/environments', replace: true });
  },
  component: () => null,
});

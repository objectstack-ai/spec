// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/$package/metadata/$type/$name')({
  beforeLoad: ({ params }) => {
    const lastEnvId =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('objectstack.lastEnvId')
        : null;

    if (lastEnvId) {
      throw redirect({
        to: '/environments/$environmentId/$package/metadata/$type/$name',
        params: {
          environmentId: lastEnvId,
          package: params.package,
          type: params.type,
          name: params.name,
        },
        replace: true,
      });
    }
    throw redirect({ to: '/environments', replace: true });
  },
  component: () => null,
});

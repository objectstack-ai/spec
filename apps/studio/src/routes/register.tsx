// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Studio's `/register` route — redirects to `/_account/register`.
 */

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/register')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const r = search.redirect;
    return typeof r === 'string' ? { redirect: r } : {};
  },
  component: RegisterRedirect,
});

function RegisterRedirect() {
  const { redirect } = useSearch({ from: '/register' });
  useEffect(() => {
    const target = redirect ?? '/';
    const url = `/_account/register?redirect=${encodeURIComponent(target)}`;
    window.location.assign(url);
  }, [redirect]);
  return null;
}

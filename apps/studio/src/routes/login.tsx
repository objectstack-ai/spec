// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Studio's `/login` route — kept only for backwards-compatible URLs.
 *
 * Studio delegates all auth UI to the Account SPA at `/_account/login`.
 * Visitors landing here are redirected immediately, preserving any
 * `?redirect=...` they brought along.
 */

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';
import { gotoAccountLogin } from '@/lib/auth-redirect';

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const r = search.redirect;
    return typeof r === 'string' ? { redirect: r } : {};
  },
  component: LoginRedirect,
});

function LoginRedirect() {
  const { redirect } = useSearch({ from: '/login' });
  useEffect(() => {
    gotoAccountLogin(redirect);
  }, [redirect]);
  return null;
}

// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createRootRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { ObjectStackProvider } from '@objectstack/client-react';
import { ObjectStackClient } from '@objectstack/client';
import { Toaster } from '@/components/ui/toaster';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TopBar } from '@/components/top-bar';
import { AccountSidebar } from '@/components/account-sidebar';
import { SessionProvider, useSession } from '@/hooks/useSession';
import { getApiBaseUrl } from '@/lib/config';

/** Routes that don't require authentication. */
const PUBLIC_ROUTES = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/device',
]);

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.has(pathname) || pathname.startsWith('/accept-invitation/');
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const pub = isPublic(location.pathname);
  // OAuth consent screen renders fullscreen without sidebar/topbar chrome
  // — it's a flow page, not part of the account portal proper. Still
  // requires authentication.
  const fullscreenAuthed = location.pathname.startsWith('/oauth/');

  useEffect(() => {
    if (loading) return;
    if (!user && !pub) {
      navigate({
        to: '/login',
        search: { redirect: location.pathname + location.searchStr },
        replace: true,
      });
    }
  }, [user, loading, pub, navigate, location.pathname, location.searchStr]);

  if (loading && !user) {
    return (
      <div className="flex min-h-screen w-full flex-1 items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (!user && !pub) {
    return null;
  }

  // Public routes (login/register/etc.) and authed flow pages (/oauth/*)
  // render fullscreen without chrome.
  if (pub || fullscreenAuthed) {
    return <div className="flex min-h-screen w-full">{children}</div>;
  }

  // Authenticated layout: TopBar across the top, Sidebar + main below.
  return (
    <SidebarProvider className="flex h-svh w-full flex-col">
      <TopBar />
      <div className="flex min-h-0 flex-1 w-full">
        <AccountSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function RootComponent() {
  const baseUrl = getApiBaseUrl();
  const client = useMemo(() => new ObjectStackClient({ baseUrl }), [baseUrl]);

  return (
    <ObjectStackProvider client={client}>
      <SessionProvider>
        <RequireAuth>
          <Outlet />
        </RequireAuth>
        <Toaster />
      </SessionProvider>
    </ObjectStackProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});

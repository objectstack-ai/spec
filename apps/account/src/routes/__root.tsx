// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createRootRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { ObjectStackProvider } from '@objectstack/client-react';
import { ObjectStackClient } from '@objectstack/client';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
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

  // Public routes (login/register/etc.) render fullscreen without chrome.
  if (pub) {
    return <div className="flex min-h-screen w-full">{children}</div>;
  }

  // Authenticated layout: TopBar + Sidebar + main content.
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <TopBar />
        <div className="flex w-full flex-1 overflow-hidden">
          <AccountSidebar />
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
            {children}
          </main>
        </div>
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

// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ObjectStackProvider } from '@objectstack/client-react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { AiChatPanel } from '@/components/AiChatPanel';
import { ProductionGuardProvider } from '@/components/production-guard';
import { PluginRegistryProvider } from '../plugins';
import { builtInPlugins } from '../plugins/built-in';
import { useObjectStackClient } from '../hooks/useObjectStackClient';

function RootComponent() {
  const client = useObjectStackClient();

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Connecting to ObjectStack…</p>
        </div>
      </div>
    );
  }

  return (
    <ObjectStackProvider client={client}>
      <PluginRegistryProvider plugins={builtInPlugins}>
        <ErrorBoundary>
          <SidebarProvider>
            <ProductionGuardProvider>
              <Outlet />
              <Toaster />
              <AiChatPanel />
            </ProductionGuardProvider>
          </SidebarProvider>
        </ErrorBoundary>
      </PluginRegistryProvider>
    </ObjectStackProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});

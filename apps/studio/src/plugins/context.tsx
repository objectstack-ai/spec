// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Studio Plugin React Context
 * 
 * Provides the PluginRegistry to the React tree and handles
 * plugin initialization lifecycle.
 */

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import { PluginRegistry, getPluginRegistry } from './registry';
import type { StudioPlugin } from './types';

// ─── Context ─────────────────────────────────────────────────────────

const PluginRegistryContext = createContext<PluginRegistry | null>(null);

/** Access the plugin registry from React components */
export function usePluginRegistry(): PluginRegistry {
  const registry = useContext(PluginRegistryContext);
  if (!registry) {
    throw new Error('usePluginRegistry must be used within a <PluginRegistryProvider>');
  }
  return registry;
}

// ─── Provider ────────────────────────────────────────────────────────

interface PluginRegistryProviderProps {
  /** Built-in plugins to register on mount */
  plugins?: StudioPlugin[];
  /** Optional pre-created registry (for testing) */
  registry?: PluginRegistry;
  children: ReactNode;
}

/**
 * Provides the Plugin Registry to the component tree.
 * 
 * On mount, registers and activates all provided plugins.
 * Plugins can also be registered dynamically at runtime.
 * 
 * @example
 * ```tsx
 * import { PluginRegistryProvider } from './plugins/context';
 * import { builtInPlugins } from './plugins/built-in';
 * 
 * function App() {
 *   return (
 *     <PluginRegistryProvider plugins={builtInPlugins}>
 *       <MyStudioUI />
 *     </PluginRegistryProvider>
 *   );
 * }
 * ```
 */
export function PluginRegistryProvider({ plugins = [], registry: externalRegistry, children }: PluginRegistryProviderProps) {
  const registry = useMemo(() => externalRegistry || getPluginRegistry(), [externalRegistry]);
  const [ready, setReady] = useState(false);

  // Register and activate all provided plugins on mount
  useEffect(() => {
    let cancelled = false;

    async function initPlugins() {
      for (const plugin of plugins) {
        if (cancelled) break;
        try {
          await registry.registerAndActivate(plugin);
        } catch (err) {
          console.error(`[PluginRegistryProvider] Failed to init plugin "${plugin.manifest.id}":`, err);
        }
      }
      if (!cancelled) setReady(true);
    }

    initPlugins();
    return () => { cancelled = true; };
  }, [registry, plugins]);

  // Show loading state until all plugins are activated
  if (!ready) {
    return (
      <PluginRegistryContext.Provider value={registry}>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">Loading plugins…</p>
          </div>
        </div>
      </PluginRegistryContext.Provider>
    );
  }

  return (
    <PluginRegistryContext.Provider value={registry}>
      {children}
    </PluginRegistryContext.Provider>
  );
}

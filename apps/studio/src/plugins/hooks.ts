// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Studio Plugin React Hooks
 * 
 * Reactive hooks that read from the PluginRegistry using useSyncExternalStore.
 * Components that use these hooks will automatically re-render when plugins
 * register new viewers, actions, etc.
 */

import { useSyncExternalStore, useMemo, useCallback } from 'react';
import type { ViewMode } from '@objectstack/spec/studio';
import type { ResolvedViewer, ResolvedAction, ResolvedCommand, ResolvedPanel, ResolvedMetadataIcon } from './types';
import { usePluginRegistry } from './context';

// ─── Low-level: subscribe to registry changes ───────────────────────

/**
 * Subscribe to the raw registry state.
 * Most consumers should use the higher-level hooks below.
 */
export function useRegistryState() {
  const registry = usePluginRegistry();
  const subscribe = useCallback((cb: () => void) => registry.subscribe(cb), [registry]);
  const getSnapshot = useCallback(() => registry.getSnapshot(), [registry]);
  return useSyncExternalStore(subscribe, getSnapshot);
}

// ─── Viewers ─────────────────────────────────────────────────────────

/**
 * Get the best viewer for a given metadata type and mode.
 * Returns null if no viewer is registered.
 * 
 * @example
 * ```tsx
 * const viewer = useMetadataViewer('flow', 'design');
 * if (viewer) {
 *   return <viewer.component metadataType="flow" metadataName={name} mode="design" />;
 * }
 * ```
 */
export function useMetadataViewer(metadataType: string, mode: ViewMode = 'preview'): ResolvedViewer | null {
  const registry = usePluginRegistry();
  // Re-subscribe on registry changes
  useRegistryState();
  return useMemo(() => registry.getViewer(metadataType, mode), [registry, metadataType, mode]);
}

/**
 * Get all viewers registered for a metadata type, sorted by priority (highest first).
 */
export function useMetadataViewers(metadataType: string): ResolvedViewer[] {
  const registry = usePluginRegistry();
  useRegistryState();
  return useMemo(() => registry.getViewers(metadataType), [registry, metadataType]);
}

/**
 * Get all available view modes for a metadata type.
 */
export function useAvailableModes(metadataType: string): ViewMode[] {
  const registry = usePluginRegistry();
  useRegistryState();
  return useMemo(() => registry.getAvailableModes(metadataType), [registry, metadataType]);
}

// ─── Actions ─────────────────────────────────────────────────────────

/**
 * Get actions applicable to a metadata type, optionally filtered by location.
 */
export function useMetadataActions(metadataType: string, location?: string): ResolvedAction[] {
  const registry = usePluginRegistry();
  useRegistryState();
  return useMemo(() => registry.getActions(metadataType, location), [registry, metadataType, location]);
}

// ─── Commands ────────────────────────────────────────────────────────

/**
 * Get all registered commands (for command palette).
 */
export function useCommands(): ResolvedCommand[] {
  const registry = usePluginRegistry();
  useRegistryState();
  return useMemo(() => registry.getCommands(), [registry]);
}

// ─── Panels ──────────────────────────────────────────────────────────

/**
 * Get all panels, optionally filtered by location.
 */
export function usePanels(location?: string): ResolvedPanel[] {
  const registry = usePluginRegistry();
  useRegistryState();
  return useMemo(() => registry.getPanels(location), [registry, location]);
}

// ─── Icons ───────────────────────────────────────────────────────────

/**
 * Get the icon and label for a metadata type.
 */
export function useMetadataIcon(metadataType: string): ResolvedMetadataIcon | null {
  const registry = usePluginRegistry();
  useRegistryState();
  return useMemo(() => registry.getMetadataIcon(metadataType), [registry, metadataType]);
}

/**
 * Get all metadata icons (for sidebar rendering).
 */
export function useAllMetadataIcons(): Map<string, ResolvedMetadataIcon> {
  const registry = usePluginRegistry();
  useRegistryState();
  return useMemo(() => registry.getAllMetadataIcons(), [registry]);
}

// ─── Sidebar Groups ─────────────────────────────────────────────────

/**
 * Get merged sidebar groups from all plugins, sorted by order.
 */
export function useSidebarGroups() {
  const registry = usePluginRegistry();
  useRegistryState();
  return useMemo(() => registry.getSidebarGroups(), [registry]);
}

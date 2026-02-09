// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Studio Plugin Registry
 * 
 * Central registry that manages the lifecycle of all Studio plugins.
 * Analogous to VS Code's ExtensionHost — it loads, activates, and resolves plugins.
 * 
 * The registry is a singleton (one per Studio instance) and is the single source
 * of truth for all contributed viewers, actions, commands, panels, and icons.
 */

import type { LucideIcon } from 'lucide-react';
import type { ViewMode } from '@objectstack/spec/studio';
import type {
  StudioPlugin,
  StudioPluginAPI,
  ResolvedViewer,
  ResolvedPanel,
  ResolvedAction,
  ResolvedCommand,
  ResolvedMetadataIcon,
  MetadataViewerProps,
} from './types';
import type { ComponentType } from 'react';

// ─── Registry State ──────────────────────────────────────────────────

interface RegistryState {
  plugins: Map<string, StudioPlugin>;
  viewers: Map<string, ResolvedViewer>;
  panels: Map<string, ResolvedPanel>;
  actions: Map<string, ResolvedAction>;
  commands: Map<string, ResolvedCommand>;
  metadataIcons: Map<string, ResolvedMetadataIcon>;
  activated: Set<string>;
}

function createInitialState(): RegistryState {
  return {
    plugins: new Map(),
    viewers: new Map(),
    panels: new Map(),
    actions: new Map(),
    commands: new Map(),
    metadataIcons: new Map(),
    activated: new Set(),
  };
}

// ─── Plugin Registry ─────────────────────────────────────────────────

export class PluginRegistry {
  private state: RegistryState;
  private listeners = new Set<() => void>();

  constructor() {
    this.state = createInitialState();
  }

  // ── Subscription (for React) ─────────────────────────────────────

  /** Subscribe to registry changes (used by React hooks) */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Get a snapshot of the registry state (used by useSyncExternalStore) */
  getSnapshot(): RegistryState {
    return this.state;
  }

  private notify() {
    // Create a new state reference to trigger React re-renders
    this.state = { ...this.state };
    this.listeners.forEach(fn => fn());
  }

  // ── Plugin Lifecycle ─────────────────────────────────────────────

  /** Register a plugin (does not activate it yet) */
  register(plugin: StudioPlugin): void {
    const { id } = plugin.manifest;
    if (this.state.plugins.has(id)) {
      console.warn(`[PluginRegistry] Plugin "${id}" is already registered, replacing.`);
      this.deactivate(id);
    }
    this.state.plugins.set(id, plugin);
    this.notify();
  }

  /** Register and immediately activate a plugin */
  async registerAndActivate(plugin: StudioPlugin): Promise<void> {
    this.register(plugin);
    await this.activate(plugin.manifest.id);
  }

  /** Activate a registered plugin */
  async activate(pluginId: string): Promise<void> {
    const plugin = this.state.plugins.get(pluginId);
    if (!plugin) {
      console.error(`[PluginRegistry] Cannot activate unknown plugin "${pluginId}"`);
      return;
    }
    if (this.state.activated.has(pluginId)) {
      return; // Already activated
    }

    // Create the API object scoped to this plugin
    const api = this.createPluginAPI(pluginId, plugin);

    try {
      await plugin.activate(api);
      this.state.activated.add(pluginId);
      console.log(`[PluginRegistry] Activated plugin "${pluginId}"`);
      this.notify();
    } catch (err) {
      console.error(`[PluginRegistry] Failed to activate "${pluginId}":`, err);
    }
  }

  /** Deactivate a plugin and remove its contributions */
  deactivate(pluginId: string): void {
    const plugin = this.state.plugins.get(pluginId);
    if (!plugin) return;

    // Call deactivate hook
    try {
      plugin.deactivate?.();
    } catch (err) {
      console.error(`[PluginRegistry] Error deactivating "${pluginId}":`, err);
    }

    // Remove all contributions from this plugin
    for (const [key, viewer] of this.state.viewers) {
      if (viewer.pluginId === pluginId) this.state.viewers.delete(key);
    }
    for (const [key, panel] of this.state.panels) {
      if (panel.pluginId === pluginId) this.state.panels.delete(key);
    }
    for (const [key, action] of this.state.actions) {
      if (action.pluginId === pluginId) this.state.actions.delete(key);
    }
    for (const [key, command] of this.state.commands) {
      if (command.pluginId === pluginId) this.state.commands.delete(key);
    }
    for (const [key, icon] of this.state.metadataIcons) {
      if (icon.metadataType) {
        // We don't track pluginId on icons, so remove by checking contributions
        const contrib = plugin.manifest.contributes.metadataIcons;
        if (contrib?.some((c: { metadataType: string }) => c.metadataType === key)) {
          this.state.metadataIcons.delete(key);
        }
      }
    }

    this.state.activated.delete(pluginId);
    this.state.plugins.delete(pluginId);
    this.notify();
  }

  // ── Queries ──────────────────────────────────────────────────────

  /** Get the best viewer for a given metadata type and mode */
  getViewer(metadataType: string, mode: ViewMode = 'preview'): ResolvedViewer | null {
    let best: ResolvedViewer | null = null;

    for (const viewer of this.state.viewers.values()) {
      if (!viewer.metadataTypes.includes(metadataType) && !viewer.metadataTypes.includes('*')) {
        continue;
      }
      if (!viewer.modes.includes(mode)) continue;
      if (!best || viewer.priority > best.priority) {
        best = viewer;
      }
    }

    return best;
  }

  /** Get all viewers for a given metadata type */
  getViewers(metadataType: string): ResolvedViewer[] {
    return Array.from(this.state.viewers.values())
      .filter(v => v.metadataTypes.includes(metadataType) || v.metadataTypes.includes('*'))
      .sort((a, b) => b.priority - a.priority);
  }

  /** Get all available view modes for a metadata type */
  getAvailableModes(metadataType: string): ViewMode[] {
    const modes = new Set<ViewMode>();
    for (const viewer of this.state.viewers.values()) {
      if (viewer.metadataTypes.includes(metadataType) || viewer.metadataTypes.includes('*')) {
        viewer.modes.forEach(m => modes.add(m));
      }
    }
    return Array.from(modes);
  }

  /** Get actions applicable to a metadata type */
  getActions(metadataType: string, location?: string): ResolvedAction[] {
    return Array.from(this.state.actions.values()).filter(a => {
      if (location && a.location !== location) return false;
      return a.metadataTypes.length === 0 || a.metadataTypes.includes(metadataType);
    });
  }

  /** Get all commands */
  getCommands(): ResolvedCommand[] {
    return Array.from(this.state.commands.values());
  }

  /** Get all panels */
  getPanels(location?: string): ResolvedPanel[] {
    return Array.from(this.state.panels.values())
      .filter(p => !location || p.location === location);
  }

  /** Get all registered plugins */
  getPlugins(): StudioPlugin[] {
    return Array.from(this.state.plugins.values());
  }

  /** Get sidebar groups from all plugins (merged and sorted) */
  getSidebarGroups(): Array<{ key: string; label: string; icon?: string; metadataTypes: string[]; order: number }> {
    const groups = new Map<string, { key: string; label: string; icon?: string; metadataTypes: string[]; order: number }>();

    for (const plugin of this.state.plugins.values()) {
      for (const group of plugin.manifest.contributes.sidebarGroups) {
        const existing = groups.get(group.key);
        if (existing) {
          // Merge metadata types
          const merged = new Set([...existing.metadataTypes, ...group.metadataTypes]);
          existing.metadataTypes = Array.from(merged);
          // Keep lower order (higher priority)
          if (group.order < existing.order) {
            existing.order = group.order;
            existing.label = group.label;
            existing.icon = group.icon || existing.icon;
          }
        } else {
          groups.set(group.key, { ...group });
        }
      }
    }

    return Array.from(groups.values()).sort((a, b) => a.order - b.order);
  }

  /** Get icon & label for a metadata type */
  getMetadataIcon(metadataType: string): ResolvedMetadataIcon | null {
    return this.state.metadataIcons.get(metadataType) || null;
  }

  /** Get all metadata icons */
  getAllMetadataIcons(): Map<string, ResolvedMetadataIcon> {
    return new Map(this.state.metadataIcons);
  }

  /** Check if a plugin is activated */
  isActivated(pluginId: string): boolean {
    return this.state.activated.has(pluginId);
  }

  // ── Internal: Create scoped API ──────────────────────────────────

  private createPluginAPI(pluginId: string, plugin: StudioPlugin): StudioPluginAPI {
    const registry = this;

    return {
      registerViewer(viewerId: string, component: ComponentType<MetadataViewerProps>) {
        const contribution = plugin.manifest.contributes.metadataViewers.find((v: { id: string }) => v.id === viewerId);
        if (!contribution) {
          console.warn(`[PluginRegistry] Viewer "${viewerId}" not declared in manifest of "${pluginId}"`);
          return;
        }

        const resolved: ResolvedViewer = {
          id: viewerId,
          pluginId,
          label: contribution.label,
          metadataTypes: contribution.metadataTypes,
          modes: contribution.modes as ViewMode[],
          priority: contribution.priority,
          component,
        };

        registry.state.viewers.set(viewerId, resolved);
        registry.notify();
      },

      registerPanel(panelId: string, component: ComponentType<any>) {
        const contribution = plugin.manifest.contributes.panels.find((p: { id: string }) => p.id === panelId);
        if (!contribution) {
          console.warn(`[PluginRegistry] Panel "${panelId}" not declared in manifest of "${pluginId}"`);
          return;
        }

        registry.state.panels.set(panelId, {
          id: panelId,
          pluginId,
          label: contribution.label,
          icon: contribution.icon,
          location: contribution.location,
          component,
        });
        registry.notify();
      },

      registerAction(actionId: string, handler: ResolvedAction['handler']) {
        const contribution = plugin.manifest.contributes.actions.find((a: { id: string }) => a.id === actionId);
        if (!contribution) {
          console.warn(`[PluginRegistry] Action "${actionId}" not declared in manifest of "${pluginId}"`);
          return;
        }

        registry.state.actions.set(actionId, {
          id: actionId,
          pluginId,
          label: contribution.label,
          icon: contribution.icon,
          location: contribution.location,
          metadataTypes: contribution.metadataTypes,
          handler,
        });
        registry.notify();
      },

      registerCommand(commandId: string, handler: ResolvedCommand['handler']) {
        const contribution = plugin.manifest.contributes.commands.find((c: { id: string }) => c.id === commandId);
        if (!contribution) {
          console.warn(`[PluginRegistry] Command "${commandId}" not declared in manifest of "${pluginId}"`);
          return;
        }

        registry.state.commands.set(commandId, {
          id: commandId,
          pluginId,
          label: contribution.label,
          shortcut: contribution.shortcut,
          icon: contribution.icon,
          handler,
        });
        registry.notify();
      },

      registerMetadataIcon(metadataType: string, icon: LucideIcon, label?: string) {
        const contribution = plugin.manifest.contributes.metadataIcons.find(
          (i: { metadataType: string }) => i.metadataType === metadataType
        );
        registry.state.metadataIcons.set(metadataType, {
          metadataType,
          label: label || contribution?.label || metadataType,
          icon,
        });
        registry.notify();
      },
    };
  }
}

// ─── Singleton ───────────────────────────────────────────────────────

let globalRegistry: PluginRegistry | null = null;

/** Get or create the global plugin registry */
export function getPluginRegistry(): PluginRegistry {
  if (!globalRegistry) {
    globalRegistry = new PluginRegistry();
  }
  return globalRegistry;
}

/** Reset the global registry (for testing) */
export function resetPluginRegistry(): void {
  globalRegistry = null;
}

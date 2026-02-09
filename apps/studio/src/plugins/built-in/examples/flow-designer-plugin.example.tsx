// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Example: Writing a Custom Studio Plugin
 * 
 * This file demonstrates how to create an external plugin for ObjectStack Studio.
 * A Studio plugin follows the VS Code extension model:
 * 
 * 1. **Manifest (Declarative)** — Declare what you contribute (viewers, icons, groups)
 * 2. **Activate (Imperative)** — Register React components and handlers at runtime
 * 
 * ## Quick Start
 * 
 * ```tsx
 * import { myCustomPlugin } from './my-plugin';
 * import { builtInPlugins } from './plugins/built-in';
 * 
 * // Add your plugin alongside built-ins
 * const allPlugins = [...builtInPlugins, myCustomPlugin];
 * 
 * <PluginRegistryProvider plugins={allPlugins}>
 *   <App />
 * </PluginRegistryProvider>
 * ```
 */

import { defineStudioPlugin } from '@objectstack/spec/studio';
import type { StudioPlugin, MetadataViewerProps } from '../types';
import { Workflow } from 'lucide-react';

// ─── Step 1: Create your viewer component ────────────────────────────

/**
 * A custom viewer component for Flow metadata.
 * 
 * This receives standard props from the plugin host:
 * - `metadataType` — The type of metadata (e.g., "flows")
 * - `metadataName` — The item name (e.g., "approval_flow")
 * - `data` — The raw metadata payload (loaded from API)
 * - `mode` — Current view mode ("preview" | "design" | "code" | "data")
 */
function FlowDesignerComponent({ metadataType, metadataName, data, mode }: MetadataViewerProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Workflow className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Flow Designer</h2>
        <span className="text-xs text-muted-foreground">({mode} mode)</span>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-medium">{metadataName}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Type: {metadataType}
        </p>
      </div>

      {mode === 'design' && (
        <div className="rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            🎨 Visual flow designer canvas would go here
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Drag and drop flow nodes, connect with edges, etc.
          </p>
        </div>
      )}

      {mode === 'preview' && data && (
        <pre className="rounded-lg bg-muted p-4 text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ─── Step 2: Define the plugin ───────────────────────────────────────

export const flowDesignerPlugin: StudioPlugin = {
  /**
   * The manifest declares what this plugin contributes.
   * This is purely declarative — no React components here.
   */
  manifest: defineStudioPlugin({
    id: 'example.flow-designer',
    name: 'Flow Designer',
    version: '0.1.0',
    description: 'Visual flow designer for automation flows.',
    author: 'Example',

    contributes: {
      // Register a viewer for the "flows" metadata type
      metadataViewers: [
        {
          id: 'flow-canvas',
          metadataTypes: ['flows'],
          label: 'Flow Designer',
          priority: 50,              // Higher than default inspector (-1)
          modes: ['preview', 'design'],  // Supports both preview and design modes
        },
      ],

      // Optionally add custom actions
      actions: [
        {
          id: 'validate-flow',
          label: 'Validate Flow',
          icon: 'check-circle',
          location: 'toolbar',
          metadataTypes: ['flows'],
        },
      ],

      // Optionally add commands
      commands: [
        {
          id: 'example.flow-designer.create',
          label: 'Create New Flow',
          shortcut: 'Ctrl+Shift+F',
          icon: 'plus',
        },
      ],
    },
  }),

  /**
   * The activate function registers runtime components and handlers.
   * It receives the `StudioPluginAPI` — similar to VS Code's `vscode` module.
   */
  activate(api) {
    // Register the React component for our declared viewer
    api.registerViewer('flow-canvas', FlowDesignerComponent);

    // Register action handler
    api.registerAction('validate-flow', async (ctx) => {
      console.log(`Validating flow: ${ctx.metadataName}`, ctx.data);
      // In a real plugin, this would validate the flow structure
      alert(`Flow "${ctx.metadataName}" is valid! ✅`);
    });

    // Register command handler
    api.registerCommand('example.flow-designer.create', () => {
      console.log('Creating new flow...');
      // In a real plugin, this would open a creation dialog
    });

    // Register a custom icon
    api.registerMetadataIcon('flows', Workflow, 'Flows');
  },

  /**
   * Optional: cleanup when the plugin is deactivated.
   */
  deactivate() {
    console.log('[FlowDesigner] Plugin deactivated');
  },
};

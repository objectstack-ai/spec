/**
 * Example Studio Plugin: Dashboard Designer
 * 
 * A complete example showing how to build a metadata viewer plugin
 * with multiple view modes, toolbar actions, and sidebar integration.
 * 
 * This plugin provides:
 * - Preview mode: Grid layout showing dashboard widgets
 * - Design mode: Placeholder for drag-and-drop builder
 * - Code mode: Raw JSON viewer
 * - Toolbar action: Export dashboard as JSON
 * 
 * @example Registration
 * ```tsx
 * import { builtInPlugins } from './plugins/built-in';
 * import { dashboardDesignerPlugin } from './plugins/examples/dashboard-designer';
 * 
 * const allPlugins = [...builtInPlugins, dashboardDesignerPlugin];
 * 
 * <PluginRegistryProvider plugins={allPlugins}>
 *   <App />
 * </PluginRegistryProvider>
 * ```
 */

import { useState, useEffect } from 'react';
import { defineStudioPlugin } from '@objectstack/spec/studio';
import { useClient } from '@objectstack/client-react';
import type { StudioPlugin, MetadataViewerProps } from '../../types';
import { BarChart3, RefreshCw } from 'lucide-react';

// ─── Viewer Component ────────────────────────────────────────────────

function DashboardDesigner({ metadataType, metadataName, data, mode }: MetadataViewerProps) {
  const client = useClient();
  const [metadata, setMetadata] = useState<any>(data);
  const [loading, setLoading] = useState(!data);

  // Load metadata if not passed as prop
  useEffect(() => {
    if (data) {
      setMetadata(data);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const result = await client.meta.getItem(metadataType, metadataName);
        if (!cancelled) setMetadata(result);
      } catch (err) {
        console.error(`[DashboardDesigner] Failed to load ${metadataName}:`, err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [client, metadataType, metadataName, data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <RefreshCw className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p className="text-sm">Dashboard not found: {metadataName}</p>
      </div>
    );
  }

  // ── Preview Mode: Widget Grid ──
  if (mode === 'preview') {
    const widgets = metadata.widgets || [];
    const columns = metadata.layout?.columns || 2;

    return (
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{metadata.label || metadataName}</h2>
            {metadata.description && (
              <p className="text-sm text-muted-foreground">{metadata.description}</p>
            )}
          </div>
          <span className="ml-auto text-xs text-muted-foreground">
            {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Widget Grid */}
        {widgets.length > 0 ? (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {widgets.map((widget: any, index: number) => (
              <div
                key={widget.id || index}
                className="rounded-lg border bg-card p-4 space-y-2"
                style={{
                  gridColumn: widget.colSpan ? `span ${widget.colSpan}` : undefined,
                  gridRow: widget.rowSpan ? `span ${widget.rowSpan}` : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{widget.label || widget.title || `Widget ${index + 1}`}</h3>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    {widget.type || 'unknown'}
                  </span>
                </div>
                {widget.description && (
                  <p className="text-xs text-muted-foreground">{widget.description}</p>
                )}
                {widget.object && (
                  <p className="text-xs">
                    <span className="text-muted-foreground">Source: </span>
                    <code className="bg-muted px-1 py-0.5 rounded text-[11px]">{widget.object}</code>
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
            <p className="text-sm">No widgets configured</p>
            <p className="text-xs mt-1">Switch to Design mode to add widgets</p>
          </div>
        )}
      </div>
    );
  }

  // ── Design Mode: Placeholder ──
  if (mode === 'design') {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Dashboard Designer</h2>
          <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
            Design Mode
          </span>
        </div>
        <div className="rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-12 text-center space-y-3">
          <BarChart3 className="h-10 w-10 mx-auto text-primary/40" />
          <p className="text-sm text-muted-foreground">
            🎨 Visual dashboard builder would go here
          </p>
          <p className="text-xs text-muted-foreground">
            Drag widgets from the palette, resize, and configure data sources.
          </p>
        </div>
      </div>
    );
  }

  // ── Code Mode: JSON ──
  return (
    <div className="p-4">
      <pre className="rounded-lg bg-muted p-4 text-xs overflow-auto font-mono leading-relaxed">
        {JSON.stringify(metadata, null, 2)}
      </pre>
    </div>
  );
}

// ─── Plugin Definition ───────────────────────────────────────────────

export const dashboardDesignerPlugin: StudioPlugin = {
  manifest: defineStudioPlugin({
    id: 'example.dashboard-designer',
    name: 'Dashboard Designer',
    version: '1.0.0',
    description: 'Visual dashboard builder with widget grid preview and drag-and-drop design mode.',
    author: 'ObjectStack Examples',

    contributes: {
      metadataViewers: [
        {
          id: 'dashboard-designer',
          metadataTypes: ['dashboards'],
          label: 'Dashboard Designer',
          priority: 50,
          modes: ['preview', 'design', 'code'],
        },
      ],

      actions: [
        {
          id: 'export-json',
          label: 'Export JSON',
          icon: 'download',
          location: 'toolbar',
          metadataTypes: ['dashboards'],
        },
      ],

      metadataIcons: [
        { metadataType: 'dashboards', label: 'Dashboards', icon: 'bar-chart-3' },
      ],
    },
  }),

  activate(api) {
    // Register the viewer
    api.registerViewer('dashboard-designer', DashboardDesigner);

    // Register the icon
    api.registerMetadataIcon('dashboards', BarChart3, 'Dashboards');

    // Register the export action
    api.registerAction('export-json', async (ctx) => {
      if (!ctx.data) {
        alert('No data to export');
        return;
      }
      const json = JSON.stringify(ctx.data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ctx.metadataName}.dashboard.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  },

  deactivate() {
    console.log('[DashboardDesigner] Plugin deactivated');
  },
};

/**
 * Example Studio Plugin: Agent Viewer
 * 
 * A rich preview for AI Agent metadata, displaying role, model,
 * tools, and system instructions in a card-based layout.
 * 
 * Demonstrates:
 * - Rich preview UI with cards and badges
 * - Toolbar action (Test Agent)
 * - Multiple view modes (preview + code)
 * - Loading state handling with ObjectStack client
 * 
 * @example Registration
 * ```tsx
 * import { builtInPlugins } from './plugins/built-in';
 * import { agentViewerPlugin } from './plugins/examples/agent-viewer';
 * 
 * const allPlugins = [...builtInPlugins, agentViewerPlugin];
 * ```
 */

import { useState, useEffect } from 'react';
import { defineStudioPlugin } from '@objectstack/spec/studio';
import { useClient } from '@objectstack/client-react';
import type { StudioPlugin, MetadataViewerProps } from '../../types';
import { Bot, Sparkles, Wrench, Brain, MessageCircle, RefreshCw } from 'lucide-react';

// ─── Viewer Component ────────────────────────────────────────────────

function AgentViewer({ metadataType, metadataName, data, mode }: MetadataViewerProps) {
  const client = useClient();
  const [metadata, setMetadata] = useState<any>(data);
  const [loading, setLoading] = useState(!data);

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
        console.error(`[AgentViewer] Failed to load ${metadataName}:`, err);
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
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p className="text-sm">Agent not found: {metadataName}</p>
      </div>
    );
  }

  // ── Code Mode ──
  if (mode === 'code') {
    return (
      <div className="p-4">
        <pre className="rounded-lg bg-muted p-4 text-xs overflow-auto font-mono leading-relaxed">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      </div>
    );
  }

  // ── Preview Mode ──
  const tools: string[] = metadata.tools || [];
  const capabilities: string[] = metadata.capabilities || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
          <Bot className="h-6 w-6 text-violet-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{metadata.label || metadataName}</h2>
          {metadata.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{metadata.description}</p>
          )}
          <div className="flex items-center gap-2 pt-1">
            {metadata.model && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                <Brain className="h-3 w-3" />
                {metadata.model}
              </span>
            )}
            {metadata.temperature != null && (
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                temp: {metadata.temperature}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Role Card */}
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            Role
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {metadata.role || 'No role specified'}
          </p>
        </div>

        {/* Tools Card */}
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            Tools ({tools.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {tools.length > 0 ? (
              tools.map((tool) => (
                <span key={tool} className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
                  {tool}
                </span>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">No tools configured</p>
            )}
          </div>
        </div>

        {/* Capabilities Card */}
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            Capabilities ({capabilities.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {capabilities.length > 0 ? (
              capabilities.map((cap) => (
                <span key={cap} className="rounded bg-violet-50 text-violet-700 px-2 py-0.5 text-xs">
                  {cap}
                </span>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">No capabilities listed</p>
            )}
          </div>
        </div>
      </div>

      {/* System Instructions */}
      {metadata.instructions && (
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-violet-500" />
            System Instructions
          </div>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted rounded-lg p-3 leading-relaxed font-mono">
            {metadata.instructions}
          </pre>
        </div>
      )}

      {/* Context / Knowledge Sources */}
      {metadata.knowledgeSources && metadata.knowledgeSources.length > 0 && (
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="text-sm font-medium">Knowledge Sources</div>
          <div className="space-y-1">
            {metadata.knowledgeSources.map((source: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{source.name || source.type || `Source ${i + 1}`}</span>
                {source.type && (
                  <span className="text-muted-foreground">({source.type})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Plugin Definition ───────────────────────────────────────────────

export const agentViewerPlugin: StudioPlugin = {
  manifest: defineStudioPlugin({
    id: 'example.agent-viewer',
    name: 'Agent Viewer',
    version: '1.0.0',
    description: 'Rich preview for AI Agent metadata with role, model, tools, and instructions.',
    author: 'ObjectStack Examples',

    contributes: {
      metadataViewers: [
        {
          id: 'agent-preview',
          metadataTypes: ['agents'],
          label: 'Agent Viewer',
          priority: 50,
          modes: ['preview', 'code'],
        },
      ],

      actions: [
        {
          id: 'test-agent',
          label: '🧪 Test Agent',
          icon: 'play',
          location: 'toolbar',
          metadataTypes: ['agents'],
        },
        {
          id: 'copy-instructions',
          label: 'Copy Instructions',
          icon: 'copy',
          location: 'toolbar',
          metadataTypes: ['agents'],
        },
      ],

      metadataIcons: [
        { metadataType: 'agents', label: 'Agents', icon: 'bot' },
      ],
    },
  }),

  activate(api) {
    api.registerViewer('agent-preview', AgentViewer);
    api.registerMetadataIcon('agents', Bot, 'Agents');

    api.registerAction('test-agent', async (ctx) => {
      console.log(`[AgentViewer] Testing agent: ${ctx.metadataName}`, ctx.data);
      alert(`🧪 Agent "${ctx.metadataName}" test initiated!\nModel: ${ctx.data?.model || 'default'}`);
    });

    api.registerAction('copy-instructions', async (ctx) => {
      const instructions = ctx.data?.instructions;
      if (!instructions) {
        alert('No instructions to copy');
        return;
      }
      await navigator.clipboard.writeText(instructions);
      alert('✅ Instructions copied to clipboard');
    });
  },

  deactivate() {
    console.log('[AgentViewer] Plugin deactivated');
  },
};

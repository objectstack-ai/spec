// @vitest-environment happy-dom
// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
  PluginRegistry,
  PluginRegistryProvider,
  usePluginRegistry,
} from '../../src/plugins';
import { defineStudioPlugin } from '@objectstack/spec/studio';
import type { StudioPlugin } from '../../src/plugins/types';

// Test component that reads viewer info from the registry
function ViewerProbe({ metadataType }: { metadataType: string }) {
  const registry = usePluginRegistry();
  const viewers = registry.getViewers(metadataType);
  return (
    <div>
      <div data-testid="viewer-count">{viewers.length}</div>
      {viewers.map(v => (
        <div key={v.id} data-testid={`viewer-${v.id}`}>{v.label}</div>
      ))}
    </div>
  );
}

// Minimal React component used as a registered viewer
function DummyViewer() {
  return <div>dummy</div>;
}

/** Build a plugin that contributes a single metadata viewer + sidebar group. */
function makePlugin(opts: {
  id: string;
  viewerId: string;
  priority?: number;
  label?: string;
  metadataTypes?: string[];
  groupKey?: string;
}): StudioPlugin {
  const {
    id,
    viewerId,
    priority = 100,
    label = viewerId,
    metadataTypes = ['object'],
    groupKey = 'test-group',
  } = opts;
  return {
    manifest: defineStudioPlugin({
      id,
      name: id,
      version: '1.0.0',
      description: `${id} test plugin`,
      contributes: {
        metadataViewers: [
          {
            id: viewerId,
            metadataTypes,
            label,
            priority,
            modes: ['preview'],
          },
        ],
        sidebarGroups: [
          {
            key: groupKey,
            label: 'Test Group',
            icon: 'database',
            metadataTypes,
            order: 10,
          },
        ],
      },
    }),
    activate: vi.fn((api) => {
      api.registerViewer(viewerId, DummyViewer);
    }),
  };
}

describe('Studio Plugin System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PluginRegistry', () => {
    it('registers plugins via register()', () => {
      const registry = new PluginRegistry();
      const plugin = makePlugin({ id: 'p1', viewerId: 'v1' });

      registry.register(plugin);

      expect(registry.getPlugins()).toHaveLength(1);
      expect(registry.getPlugins()[0].manifest.id).toBe('p1');
    });

    it('activates plugins and invokes their activate() callback', async () => {
      const registry = new PluginRegistry();
      const plugin = makePlugin({ id: 'p1', viewerId: 'v1' });

      await registry.registerAndActivate(plugin);

      expect(plugin.activate).toHaveBeenCalledTimes(1);
      expect(registry.isActivated('p1')).toBe(true);
    });

    it('returns viewers matching a given metadata type', async () => {
      const registry = new PluginRegistry();
      await registry.registerAndActivate(
        makePlugin({ id: 'p1', viewerId: 'v1', metadataTypes: ['object'] }),
      );

      const viewers = registry.getViewers('object');
      expect(viewers).toHaveLength(1);
      expect(viewers[0].id).toBe('v1');
    });

    it('returns an empty array for unknown metadata types', async () => {
      const registry = new PluginRegistry();
      await registry.registerAndActivate(
        makePlugin({ id: 'p1', viewerId: 'v1', metadataTypes: ['object'] }),
      );

      expect(registry.getViewers('unknown-type')).toHaveLength(0);
    });

    it('returns sidebar groups contributed by registered plugins', () => {
      const registry = new PluginRegistry();
      registry.register(makePlugin({ id: 'p1', viewerId: 'v1' }));

      const groups = registry.getSidebarGroups();
      expect(groups).toHaveLength(1);
      expect(groups[0].key).toBe('test-group');
      expect(groups[0].label).toBe('Test Group');
    });

    it('sorts viewers by priority (higher first)', async () => {
      const registry = new PluginRegistry();
      await registry.registerAndActivate(
        makePlugin({ id: 'p1', viewerId: 'v-low', priority: 50 }),
      );
      await registry.registerAndActivate(
        makePlugin({ id: 'p2', viewerId: 'v-high', priority: 100 }),
      );

      const viewers = registry.getViewers('object');
      expect(viewers.map(v => v.id)).toEqual(['v-high', 'v-low']);
    });
  });

  describe('PluginRegistryProvider', () => {
    it('provides an activated plugin registry to children', async () => {
      const plugin = makePlugin({ id: 'p1', viewerId: 'v1' });

      render(
        <PluginRegistryProvider plugins={[plugin]} registry={new PluginRegistry()}>
          <ViewerProbe metadataType="object" />
        </PluginRegistryProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('viewer-count')).toHaveTextContent('1');
      });
      expect(screen.getByTestId('viewer-v1')).toHaveTextContent('v1');
    });

    it('handles an empty plugin list', async () => {
      render(
        <PluginRegistryProvider plugins={[]} registry={new PluginRegistry()}>
          <ViewerProbe metadataType="object" />
        </PluginRegistryProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('viewer-count')).toHaveTextContent('0');
      });
    });
  });
});

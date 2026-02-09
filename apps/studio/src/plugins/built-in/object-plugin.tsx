// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Built-in Plugin: Object Designer
 * 
 * Provides the Object Explorer (schema/data/API tabs) as a plugin viewer.
 * This wraps the existing ObjectExplorer component.
 */

import { defineStudioPlugin } from '@objectstack/spec/studio';
import { ObjectExplorer } from '@/components/ObjectExplorer';
import type { StudioPlugin, MetadataViewerProps } from '../types';
import {
  Package, Database, Anchor, Map, PieChart,
} from 'lucide-react';

// ─── Viewer Component (adapts ObjectExplorer to plugin interface) ────

function ObjectViewerComponent({ metadataName }: MetadataViewerProps) {
  return <ObjectExplorer objectApiName={metadataName} />;
}

// ─── Plugin Definition ───────────────────────────────────────────────

export const objectDesignerPlugin: StudioPlugin = {
  manifest: defineStudioPlugin({
    id: 'objectstack.object-designer',
    name: 'Object Designer',
    version: '1.0.0',
    description: 'Schema inspector, data table, and API reference for Object metadata.',
    contributes: {
      metadataViewers: [
        {
          id: 'object-explorer',
          metadataTypes: ['object', 'objects'],
          label: 'Object Explorer',
          priority: 100,
          modes: ['preview', 'data', 'code'],
        },
      ],
      sidebarGroups: [
        {
          key: 'data',
          label: 'Data',
          icon: 'database',
          metadataTypes: ['object', 'objects', 'hooks', 'mappings', 'analyticsCubes', 'data'],
          order: 10,
        },
      ],
      metadataIcons: [
        { metadataType: 'object', label: 'Objects', icon: 'package' },
        { metadataType: 'objects', label: 'Objects', icon: 'package' },
        { metadataType: 'hooks', label: 'Hooks', icon: 'anchor' },
        { metadataType: 'mappings', label: 'Mappings', icon: 'map' },
        { metadataType: 'analyticsCubes', label: 'Analytics Cubes', icon: 'pie-chart' },
        { metadataType: 'data', label: 'Seed Data', icon: 'database' },
      ],
    },
  }),

  activate(api) {
    // Register the React component for the declared viewer
    api.registerViewer('object-explorer', ObjectViewerComponent);

    // Register Lucide icons for metadata types
    api.registerMetadataIcon('object', Package, 'Objects');
    api.registerMetadataIcon('objects', Package, 'Objects');
    api.registerMetadataIcon('hooks', Anchor, 'Hooks');
    api.registerMetadataIcon('mappings', Map, 'Mappings');
    api.registerMetadataIcon('analyticsCubes', PieChart, 'Analytics Cubes');
    api.registerMetadataIcon('data', Database, 'Seed Data');
  },
};

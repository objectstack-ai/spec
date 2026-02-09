// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Built-in Plugin: UI Protocol
 * 
 * Provides sidebar groups and icons for UI metadata types
 * (actions, views, pages, dashboards, reports, themes).
 */

import { defineStudioPlugin } from '@objectstack/spec/studio';
import type { StudioPlugin } from '../types';
import {
  Zap, Eye, FileCode, BarChart3, FileText, Palette,
} from 'lucide-react';

export const uiProtocolPlugin: StudioPlugin = {
  manifest: defineStudioPlugin({
    id: 'objectstack.ui-protocol',
    name: 'UI Protocol',
    version: '1.0.0',
    description: 'Sidebar groups and icons for UI metadata types.',
    contributes: {
      sidebarGroups: [
        {
          key: 'ui',
          label: 'UI',
          icon: 'app-window',
          metadataTypes: ['actions', 'views', 'pages', 'dashboards', 'reports', 'themes'],
          order: 20,
        },
      ],
      metadataIcons: [
        { metadataType: 'actions', label: 'Actions', icon: 'zap' },
        { metadataType: 'views', label: 'Views', icon: 'eye' },
        { metadataType: 'pages', label: 'Pages', icon: 'file-code' },
        { metadataType: 'dashboards', label: 'Dashboards', icon: 'bar-chart-3' },
        { metadataType: 'reports', label: 'Reports', icon: 'file-text' },
        { metadataType: 'themes', label: 'Themes', icon: 'palette' },
      ],
    },
  }),

  activate(api) {
    api.registerMetadataIcon('actions', Zap, 'Actions');
    api.registerMetadataIcon('views', Eye, 'Views');
    api.registerMetadataIcon('pages', FileCode, 'Pages');
    api.registerMetadataIcon('dashboards', BarChart3, 'Dashboards');
    api.registerMetadataIcon('reports', FileText, 'Reports');
    api.registerMetadataIcon('themes', Palette, 'Themes');
  },
};

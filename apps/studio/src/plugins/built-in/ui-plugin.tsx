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
          metadataTypes: ['action', 'view', 'page', 'dashboard', 'report', 'theme'],
          order: 20,
        },
      ],
      metadataIcons: [
        { metadataType: 'action', label: 'Actions', icon: 'zap' },
        { metadataType: 'view', label: 'Views', icon: 'eye' },
        { metadataType: 'page', label: 'Pages', icon: 'file-code' },
        { metadataType: 'dashboard', label: 'Dashboards', icon: 'bar-chart-3' },
        { metadataType: 'report', label: 'Reports', icon: 'file-text' },
        { metadataType: 'theme', label: 'Themes', icon: 'palette' },
      ],
    },
  }),

  activate(api) {
    api.registerMetadataIcon('action', Zap, 'Actions');
    api.registerMetadataIcon('view', Eye, 'Views');
    api.registerMetadataIcon('page', FileCode, 'Pages');
    api.registerMetadataIcon('dashboard', BarChart3, 'Dashboards');
    api.registerMetadataIcon('report', FileText, 'Reports');
    api.registerMetadataIcon('theme', Palette, 'Themes');
  },
};

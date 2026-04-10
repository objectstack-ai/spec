// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Built-in Plugin: API Protocol
 * 
 * Provides sidebar groups and icons for API metadata types
 * (apis, connectors).
 */

import { defineStudioPlugin } from '@objectstack/spec/studio';
import type { StudioPlugin } from '../types';
import { Globe, Link2 } from 'lucide-react';

export const apiProtocolPlugin: StudioPlugin = {
  manifest: defineStudioPlugin({
    id: 'objectstack.api-protocol',
    name: 'API Protocol',
    version: '1.0.0',
    description: 'Sidebar groups and icons for API metadata types.',
    contributes: {
      sidebarGroups: [
        {
          key: 'api',
          label: 'API',
          icon: 'globe',
          metadataTypes: ['api', 'connector'],
          order: 60,
        },
      ],
      metadataIcons: [
        { metadataType: 'api', label: 'APIs', icon: 'globe' },
        { metadataType: 'connector', label: 'Connectors', icon: 'link-2' },
      ],
    },
  }),

  activate(api) {
    api.registerMetadataIcon('api', Globe, 'APIs');
    api.registerMetadataIcon('connector', Link2, 'Connectors');
  },
};

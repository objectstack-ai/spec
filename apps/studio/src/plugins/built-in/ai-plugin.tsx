// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Built-in Plugin: AI Protocol
 * 
 * Provides sidebar groups and icons for AI metadata types
 * (agents, ragPipelines).
 */

import { defineStudioPlugin } from '@objectstack/spec/studio';
import type { StudioPlugin } from '../types';
import { Bot, BookOpen } from 'lucide-react';

export const aiProtocolPlugin: StudioPlugin = {
  manifest: defineStudioPlugin({
    id: 'objectstack.ai-protocol',
    name: 'AI Protocol',
    version: '1.0.0',
    description: 'Sidebar groups and icons for AI metadata types.',
    contributes: {
      sidebarGroups: [
        {
          key: 'ai',
          label: 'AI',
          icon: 'bot',
          metadataTypes: ['agents', 'ragPipelines'],
          order: 50,
        },
      ],
      metadataIcons: [
        { metadataType: 'agents', label: 'Agents', icon: 'bot' },
        { metadataType: 'ragPipelines', label: 'RAG Pipelines', icon: 'book-open' },
      ],
    },
  }),

  activate(api) {
    api.registerMetadataIcon('agents', Bot, 'Agents');
    api.registerMetadataIcon('ragPipelines', BookOpen, 'RAG Pipelines');
  },
};

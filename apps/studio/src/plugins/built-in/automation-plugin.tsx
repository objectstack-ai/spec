// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Built-in Plugin: Automation Protocol
 * 
 * Provides sidebar groups and icons for automation metadata types
 * (flows, workflows, approvals, webhooks).
 */

import { defineStudioPlugin } from '@objectstack/spec/studio';
import type { StudioPlugin } from '../types';
import { Workflow, CheckSquare, Webhook } from 'lucide-react';

export const automationProtocolPlugin: StudioPlugin = {
  manifest: defineStudioPlugin({
    id: 'objectstack.automation-protocol',
    name: 'Automation Protocol',
    version: '1.0.0',
    description: 'Sidebar groups and icons for automation metadata types.',
    contributes: {
      sidebarGroups: [
        {
          key: 'automation',
          label: 'Automation',
          icon: 'workflow',
          metadataTypes: ['flow', 'workflow', 'approval', 'webhook'],
          order: 30,
        },
      ],
      metadataIcons: [
        { metadataType: 'flow', label: 'Flows', icon: 'workflow' },
        { metadataType: 'workflow', label: 'Workflows', icon: 'workflow' },
        { metadataType: 'approval', label: 'Approvals', icon: 'check-square' },
        { metadataType: 'webhook', label: 'Webhooks', icon: 'webhook' },
      ],
    },
  }),

  activate(api) {
    api.registerMetadataIcon('flow', Workflow, 'Flows');
    api.registerMetadataIcon('workflow', Workflow, 'Workflows');
    api.registerMetadataIcon('approval', CheckSquare, 'Approvals');
    api.registerMetadataIcon('webhook', Webhook, 'Webhooks');
  },
};

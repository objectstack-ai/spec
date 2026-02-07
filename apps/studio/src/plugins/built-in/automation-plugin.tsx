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
          metadataTypes: ['flows', 'workflows', 'approvals', 'webhooks'],
          order: 30,
        },
      ],
      metadataIcons: [
        { metadataType: 'flows', label: 'Flows', icon: 'workflow' },
        { metadataType: 'workflows', label: 'Workflows', icon: 'workflow' },
        { metadataType: 'approvals', label: 'Approvals', icon: 'check-square' },
        { metadataType: 'webhooks', label: 'Webhooks', icon: 'webhook' },
      ],
    },
  }),

  activate(api) {
    api.registerMetadataIcon('flows', Workflow, 'Flows');
    api.registerMetadataIcon('workflows', Workflow, 'Workflows');
    api.registerMetadataIcon('approvals', CheckSquare, 'Approvals');
    api.registerMetadataIcon('webhooks', Webhook, 'Webhooks');
  },
};

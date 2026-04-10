// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Built-in Plugin: Security Protocol
 * 
 * Provides sidebar groups and icons for security metadata types
 * (roles, permissions, profiles, sharingRules, policies).
 */

import { defineStudioPlugin } from '@objectstack/spec/studio';
import type { StudioPlugin } from '../types';
import { Shield, UserCog, Lock } from 'lucide-react';

export const securityProtocolPlugin: StudioPlugin = {
  manifest: defineStudioPlugin({
    id: 'objectstack.security-protocol',
    name: 'Security Protocol',
    version: '1.0.0',
    description: 'Sidebar groups and icons for security metadata types.',
    contributes: {
      sidebarGroups: [
        {
          key: 'security',
          label: 'Security',
          icon: 'shield',
          metadataTypes: ['role', 'permission', 'profile', 'sharingRule', 'policy'],
          order: 40,
        },
      ],
      metadataIcons: [
        { metadataType: 'role', label: 'Roles', icon: 'user-cog' },
        { metadataType: 'permission', label: 'Permissions', icon: 'lock' },
        { metadataType: 'profile', label: 'Profiles', icon: 'shield' },
        { metadataType: 'sharingRule', label: 'Sharing Rules', icon: 'shield' },
        { metadataType: 'policy', label: 'Policies', icon: 'shield' },
      ],
    },
  }),

  activate(api) {
    api.registerMetadataIcon('role', UserCog, 'Roles');
    api.registerMetadataIcon('permission', Lock, 'Permissions');
    api.registerMetadataIcon('profile', Shield, 'Profiles');
    api.registerMetadataIcon('sharingRule', Shield, 'Sharing Rules');
    api.registerMetadataIcon('policy', Shield, 'Policies');
  },
};

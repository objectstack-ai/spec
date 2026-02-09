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
          metadataTypes: ['roles', 'permissions', 'profiles', 'sharingRules', 'policies'],
          order: 40,
        },
      ],
      metadataIcons: [
        { metadataType: 'roles', label: 'Roles', icon: 'user-cog' },
        { metadataType: 'permissions', label: 'Permissions', icon: 'lock' },
        { metadataType: 'profiles', label: 'Profiles', icon: 'shield' },
        { metadataType: 'sharingRules', label: 'Sharing Rules', icon: 'shield' },
        { metadataType: 'policies', label: 'Policies', icon: 'shield' },
      ],
    },
  }),

  activate(api) {
    api.registerMetadataIcon('roles', UserCog, 'Roles');
    api.registerMetadataIcon('permissions', Lock, 'Permissions');
    api.registerMetadataIcon('profiles', Shield, 'Profiles');
    api.registerMetadataIcon('sharingRules', Shield, 'Sharing Rules');
    api.registerMetadataIcon('policies', Shield, 'Policies');
  },
};

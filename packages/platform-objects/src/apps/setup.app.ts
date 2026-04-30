// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Platform Setup App — static definition.
 *
 * Lists every `sys_*` administrative object as a left-hand navigation
 * entry in Studio's "Setup" area. Lives here (alongside the object
 * schemas it references) instead of being assembled at runtime by
 * `@objectstack/plugin-setup` — that plugin existed only because the
 * referenced objects used to live in three different runtime plugins
 * (auth/security/audit). Now that all `sys_*` objects are centralized
 * in `@objectstack/platform-objects`, the Setup App is a fixed metadata
 * artifact too and can be exported as plain data.
 *
 * The runtime registration happens in `plugin-auth` (which is always
 * loaded alongside security + audit and already calls
 * `manifest.register({...})`).
 */

import type { App } from '@objectstack/spec/ui';

export const SETUP_APP: App = {
  name: 'setup',
  label: 'Setup',
  description: 'Platform settings and administration',
  icon: 'settings',
  active: true,
  isDefault: false,
  branding: {
    primaryColor: '#475569', // Slate-600 — neutral admin palette
  },
  requiredPermissions: ['setup.access'],
  areas: [
    {
      id: 'area_administration',
      label: 'Administration',
      icon: 'shield',
      order: 10,
      description:
        'User management, roles, permissions, and security settings',
      navigation: [
        { id: 'nav_users', type: 'object', label: 'Users', objectName: 'sys_user', icon: 'users', order: 10 },
        { id: 'nav_organizations', type: 'object', label: 'Organizations', objectName: 'sys_organization', icon: 'building-2', order: 20 },
        { id: 'nav_teams', type: 'object', label: 'Teams', objectName: 'sys_team', icon: 'users-round', order: 30 },
        { id: 'nav_api_keys', type: 'object', label: 'API Keys', objectName: 'sys_api_key', icon: 'key', order: 40 },
        { id: 'nav_sessions', type: 'object', label: 'Sessions', objectName: 'sys_session', icon: 'monitor', order: 50 },
        { id: 'nav_roles', type: 'object', label: 'Roles', objectName: 'sys_role', icon: 'shield-check', order: 60 },
        { id: 'nav_permission_sets', type: 'object', label: 'Permission Sets', objectName: 'sys_permission_set', icon: 'lock', order: 70 },
      ],
    },
    {
      id: 'area_platform',
      label: 'Platform',
      icon: 'layers',
      order: 20,
      description:
        'Objects, fields, layouts, automation, and extensibility settings',
      navigation: [],
    },
    {
      id: 'area_system',
      label: 'System',
      icon: 'settings',
      order: 30,
      description:
        'Datasources, integrations, jobs, logs, and environment configuration',
      navigation: [
        { id: 'nav_audit_logs', type: 'object', label: 'Audit Logs', objectName: 'sys_audit_log', icon: 'scroll-text', order: 10 },
      ],
    },
    {
      id: 'area_ai',
      label: 'AI',
      icon: 'brain',
      order: 40,
      description:
        'AI agents, model registry, RAG pipelines, and intelligence settings',
      navigation: [
        { id: 'nav_ai_conversations', type: 'object', label: 'Conversations', objectName: 'ai_conversations', icon: 'message-square', order: 10 },
        { id: 'nav_ai_messages', type: 'object', label: 'Messages', objectName: 'ai_messages', icon: 'messages-square', order: 20 },
      ],
    },
  ].filter((a) => a.navigation.length > 0),
};

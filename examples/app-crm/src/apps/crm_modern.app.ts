// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineApp } from '@objectstack/spec/ui';

/**
 * Modern CRM App using the new Interface-driven navigation pattern
 * 
 * Demonstrates:
 * - App.interfaces[] for main navigation (auto-generates Interface→Pages sidebar)
 * - App.defaultInterface for startup interface
 * - App.navigation[] repurposed for global utility entries only (Settings, Help)
 */
export const CrmAppModern = defineApp({
  name: 'crm_modern',
  label: 'CRM (Modern)',
  description: 'Enterprise CRM with Interface-driven navigation',
  icon: 'briefcase',
  
  branding: {
    primaryColor: '#4169E1',
    logo: '/assets/crm-logo.png',
    favicon: '/assets/crm-favicon.ico',
  },

  // NEW: Interface-driven navigation
  // The sidebar will auto-render a two-level menu:
  // - Sales Cloud (group)
  //   - Sales Workspace (interface) → Pipeline, Accounts, Leads (pages)
  //   - Lead Review (interface) → Review Queue, Qualified Leads (pages)
  // - Analytics (group)
  //   - Sales Analytics (interface) → Overview, Pipeline Report (pages)
  interfaces: ['sales_workspace', 'lead_review', 'sales_analytics'],
  
  // NEW: Default interface on app launch
  defaultInterface: 'sales_workspace',
  
  // REPURPOSED: navigation[] is now for global utility entries only
  // These render at the bottom of the sidebar
  navigation: [
    {
      id: 'nav_settings',
      type: 'page',
      label: 'Settings',
      icon: 'settings',
      pageName: 'admin_settings',
    },
    {
      id: 'nav_help',
      type: 'url',
      label: 'Help Center',
      icon: 'help-circle',
      url: 'https://help.example.com',
      target: '_blank',
    },
  ],

  requiredPermissions: ['app.access.crm'],
  isDefault: true,
});

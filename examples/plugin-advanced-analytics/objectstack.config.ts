import { defineStack } from '@objectstack/spec';

/**
 * Example: Advanced Plugin with Loading Configuration
 * 
 * This example demonstrates how to configure the enhanced plugin loading mechanism
 * for an analytics dashboard plugin with optimal performance settings.
 */

export default defineStack({
  manifest: {
    id: 'com.example.analytics-dashboard',
    version: '1.2.0',
    type: 'plugin',
    name: 'Advanced Analytics Dashboard',
    description: 'Comprehensive analytics and reporting dashboard',
    
    loading: {
      strategy: 'lazy',
      preload: {
        enabled: true,
        priority: 50,
        resources: ['metadata', 'dependencies', 'code'],
        conditions: {
          routes: ['/analytics', '/reports'],
          roles: ['admin', 'analyst'],
        },
      },
      caching: {
        enabled: true,
        storage: 'hybrid',
        keyStrategy: 'version',
      },
    },
  },
});

import { defineStack } from '@objectstack/spec';

export default defineStack({
  manifest: {
    id: 'com.objectstack.bi',
    name: 'Business Intelligence Plugin',
    version: '1.0.0',
    type: 'plugin',
    description: 'Provides BI capabilities, dataset definitions, and chart rendering.',
    
    // 1. Configuration (Settings)
    configuration: {
    title: 'BI Plugin Configuration',
    properties: {
      enableCache: {
        type: 'boolean',
        default: true,
        description: 'Enable in-memory caching for query results'
      },
      maxRows: {
        type: 'number',
        default: 1000,
        description: 'Maximum rows returned per query'
      }
    }
  },

  // 2. Capabilities
  contributes: {
    kinds: [
      {
        id: 'bi.dataset',
        globs: ['**/*.dataset.json', '**/*.dataset.ts'],
        description: 'BI Dataset Definition'
      },
      {
        id: 'bi.dashboard',
        globs: ['**/*.bi-dash.json'],
        description: 'Advanced BI Dashboard'
      }
    ],
    menus: {
      'sidebar/tools': [
        { id: 'open_bi_studio', label: 'BI Studio', command: 'bi.openStudio' }
      ]
    },
    actions: [
      { 
        name: 'refresh_dataset',
        label: 'Refresh Dataset',
        description: 'Manually trigger a dataset refresh',
        input: { datasetId: 'string' }
      }
    ]
  },

    // 3. Lifecycle Entry Point
    // in a real scenario, this would be a path or module name
    extensions: {
      runtime: {
        entry: './src/index.ts'
      }
    }
  }
});

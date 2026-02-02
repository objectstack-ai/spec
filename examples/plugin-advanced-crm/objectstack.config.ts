import { defineStack } from '@objectstack/spec';

/**
 * Advanced CRM Plugin Example
 * 
 * This example demonstrates a comprehensive plugin manifest that:
 * - Implements standard protocols
 * - Provides interfaces for other plugins
 * - Depends on other plugins
 * - Defines extension points
 * - Uses proper naming conventions
 */
export default defineStack({
  manifest: {
  // Basic Information
  id: 'com.acme.crm.advanced',
  name: 'ACME Advanced CRM',
  version: '2.1.0',
  type: 'plugin',
  description: 'Comprehensive customer relationship management with advanced features',

  // Dependencies on NPM packages
  dependencies: {
    '@objectstack/spec': '^0.6.0',
    '@objectstack/driver-postgres': '^1.0.0',
  },

  // Required System Permissions
  permissions: [
    'system.user.read',
    'system.data.write',
    'system.data.read',
    'network.http.request',
  ],

  // Plugin Configuration Schema
  configuration: {
    title: 'CRM Configuration',
    properties: {
      apiEndpoint: {
        type: 'string',
        default: 'https://api.acme.com',
        description: 'External API endpoint for data synchronization',
      },
      syncInterval: {
        type: 'number',
        default: 3600,
        description: 'Sync interval in seconds',
      },
      enableAudit: {
        type: 'boolean',
        default: true,
        description: 'Enable audit trail for customer data changes',
      },
      apiKey: {
        type: 'string',
        secret: true,
        description: 'API key for external service integration',
      },
    },
  },

  // Plugin Capability Declaration
  capabilities: {
    // Protocols This Plugin Implements
    implements: [
      {
        protocol: {
          id: 'com.objectstack.protocol.storage.v1',
          label: 'Storage Protocol v1',
          version: { major: 1, minor: 0, patch: 0 },
          description: 'Standard data storage and retrieval operations',
        },
        conformance: 'full',
        certified: true,
        certificationDate: '2024-01-15T00:00:00Z',
      },
      {
        protocol: {
          id: 'com.objectstack.protocol.sync.v1',
          label: 'Data Sync Protocol v1',
          version: { major: 1, minor: 0, patch: 0 },
          description: 'Bidirectional data synchronization',
        },
        conformance: 'partial',
        implementedFeatures: [
          'incremental_sync',
          'conflict_resolution',
          'batch_operations',
        ],
        features: [
          {
            name: 'real_time_sync',
            enabled: false,
            description: 'Real-time synchronization via websockets',
            sinceVersion: '2.0.0',
          },
          {
            name: 'batch_operations',
            enabled: true,
            description: 'Batch sync operations for performance',
          },
        ],
      },
    ],

    // Interfaces This Plugin Provides
    provides: [
      {
        id: 'com.acme.crm.interface.customer_service',
        name: 'CustomerService',
        description: 'Customer data management service',
        version: { major: 2, minor: 1, patch: 0 },
        stability: 'stable',

        methods: [
          {
            name: 'getCustomer',
            description: 'Retrieve a customer by ID',
            parameters: [
              {
                name: 'id',
                type: 'string',
                required: true,
                description: 'Customer unique identifier',
              },
            ],
            returnType: 'Customer',
            async: true,
          },
          {
            name: 'searchCustomers',
            description: 'Search customers with filters',
            parameters: [
              {
                name: 'query',
                type: 'CustomerSearchQuery',
                required: true,
              },
              {
                name: 'options',
                type: 'SearchOptions',
                required: false,
              },
            ],
            returnType: 'Customer[]',
            async: true,
          },
          {
            name: 'createCustomer',
            description: 'Create a new customer',
            parameters: [
              {
                name: 'data',
                type: 'CustomerInput',
                required: true,
              },
            ],
            returnType: 'Customer',
            async: true,
          },
          {
            name: 'updateCustomer',
            description: 'Update customer information',
            parameters: [
              {
                name: 'id',
                type: 'string',
                required: true,
              },
              {
                name: 'data',
                type: 'Partial<CustomerInput>',
                required: true,
              },
            ],
            returnType: 'Customer',
            async: true,
          },
        ],

        events: [
          {
            name: 'customerCreated',
            description: 'Fired when a new customer is created',
            payload: 'Customer',
          },
          {
            name: 'customerUpdated',
            description: 'Fired when customer data is updated',
            payload: 'CustomerUpdateEvent',
          },
          {
            name: 'customerDeleted',
            description: 'Fired when a customer is deleted',
            payload: 'CustomerDeleteEvent',
          },
        ],
      },

      {
        id: 'com.acme.crm.interface.opportunity_service',
        name: 'OpportunityService',
        description: 'Sales opportunity management',
        version: { major: 1, minor: 0, patch: 0 },
        stability: 'stable',

        methods: [
          {
            name: 'getOpportunity',
            parameters: [{ name: 'id', type: 'string', required: true }],
            returnType: 'Opportunity',
            async: true,
          },
          {
            name: 'createOpportunity',
            parameters: [{ name: 'data', type: 'OpportunityInput', required: true }],
            returnType: 'Opportunity',
            async: true,
          },
        ],

        events: [
          {
            name: 'opportunityStageChanged',
            description: 'Fired when opportunity stage is updated',
            payload: 'OpportunityStageEvent',
          },
        ],
      },
    ],

    // Dependencies on Other Plugins
    requires: [
      {
        pluginId: 'com.objectstack.driver.postgres',
        version: '^1.0.0',
        optional: false,
        reason: 'Primary data storage backend',
        requiredCapabilities: [
          'com.objectstack.protocol.storage.v1',
          'com.objectstack.protocol.transactions.v1',
        ],
      },
      {
        pluginId: 'com.objectstack.auth.oauth2',
        version: '>=2.0.0 <3.0.0',
        optional: false,
        reason: 'OAuth2 authentication for external API integration',
      },
      {
        pluginId: 'com.acme.analytics.basic',
        version: '^1.5.0',
        optional: true,
        reason: 'Enhanced analytics and reporting features',
        requiredCapabilities: [
          'com.acme.protocol.metrics.v1',
        ],
      },
    ],

    // Extension Points This Plugin Defines
    extensionPoints: [
      {
        id: 'com.acme.crm.extension.customer_enrichment',
        name: 'Customer Data Enrichment',
        description: 'Allows other plugins to enrich customer data from external sources',
        type: 'transformer',
        cardinality: 'multiple',
        contract: {
          input: 'Customer',
          output: 'EnrichedCustomer',
          signature: '(customer: Customer) => Promise<Partial<Customer>>',
        },
      },
      {
        id: 'com.acme.crm.extension.customer_validator',
        name: 'Customer Data Validator',
        description: 'Custom validation rules for customer data',
        type: 'validator',
        cardinality: 'multiple',
        contract: {
          input: 'Customer',
          output: 'ValidationResult',
          signature: '(customer: Customer) => ValidationResult | Promise<ValidationResult>',
        },
      },
      {
        id: 'com.acme.crm.extension.opportunity_scoring',
        name: 'Opportunity Scoring Engine',
        description: 'Calculate opportunity win probability',
        type: 'provider',
        cardinality: 'single',
        contract: {
          input: 'Opportunity',
          output: 'OpportunityScore',
        },
      },
      {
        id: 'com.acme.crm.extension.dashboard_widget',
        name: 'Dashboard Widget',
        description: 'Custom widgets for CRM dashboard',
        type: 'widget',
        cardinality: 'multiple',
        contract: {
          signature: 'React.ComponentType<WidgetProps>',
        },
      },
    ],

    // Extensions This Plugin Contributes to Other Plugins
    extensions: [
      {
        targetPluginId: 'com.objectstack.ui.dashboard',
        extensionPointId: 'com.objectstack.ui.extension.widget',
        implementation: './widgets/customer-summary.tsx',
        priority: 50,
      },
    ],
  },

  // Contribution Points
  contributes: {
    // Custom Metadata Kinds
    kinds: [
      {
        id: 'crm.customer',
        globs: ['**/*.customer.json', '**/*.customer.ts'],
        description: 'Customer data definition files',
      },
    ],

    // System Event Subscriptions
    events: [
      'system:plugin:installed',
      'system:plugin:uninstalled',
      'data:record:beforeCreate',
      'data:record:afterCreate',
    ],

    // UI Menu Contributions
    menus: {
      'sidebar/main': [
        {
          id: 'open_crm_dashboard',
          label: 'CRM Dashboard',
          command: 'crm.openDashboard',
        },
        {
          id: 'open_customers',
          label: 'Customers',
          command: 'crm.openCustomers',
        },
      ],
    },

    // Custom Actions
    actions: [
      {
        name: 'sync_customers',
        label: 'Sync Customers',
        description: 'Manually trigger customer data synchronization',
        input: {
          fullSync: 'boolean',
        },
        output: {
          syncedCount: 'number',
          errors: 'string[]',
        },
      },
    ],
  },

  // Data Model Definitions
  objects: ['./src/objects/*.object.ts'],

  // Initial Seed Data
  data: [
    {
      object: 'crm_customer_status',
      records: [
        { name: 'active', label: 'Active', sort_order: 1 },
        { name: 'inactive', label: 'Inactive', sort_order: 2 },
        { name: 'prospect', label: 'Prospect', sort_order: 3 },
      ],
      mode: 'upsert',
    },
  ],

  // Extension Entry Points
  extensions: {
    runtime: {
      entry: './src/index.ts',
    },
  },
}});

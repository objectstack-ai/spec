import { ObjectStackManifest } from '@objectstack/spec/system';

/**
 * MSW (Mock Service Worker) Plugin Manifest
 * 
 * Browser-based mock server for testing and development.
 * Intercepts HTTP requests and provides mock responses using ObjectStack runtime.
 */
const MSWPlugin: ObjectStackManifest = {
  id: 'com.objectstack.plugin.msw',
  name: 'Mock Service Worker Plugin',
  version: '1.0.0',
  type: 'plugin',
  description: 'MSW (Mock Service Worker) integration for testing and development. Provides browser-based API mocking using ObjectStack runtime protocol.',
  
  configuration: {
    title: 'MSW Plugin Configuration',
    properties: {
      enableBrowser: {
        type: 'boolean',
        default: true,
        description: 'Enable MSW in browser environment',
      },
      baseUrl: {
        type: 'string',
        default: '/api/v1',
        description: 'Base URL for API endpoints',
      },
      logRequests: {
        type: 'boolean',
        default: true,
        description: 'Log all intercepted requests',
      },
    },
  },

  // Plugin Capability Declaration
  capabilities: {
    // Protocols This Plugin Implements
    implements: [
      {
        protocol: {
          id: 'com.objectstack.protocol.testing.mock.v1',
          label: 'Mock Service Protocol v1',
          version: { major: 1, minor: 0, patch: 0 },
          description: 'HTTP request mocking for testing',
        },
        conformance: 'full',
        features: [
          {
            name: 'browser_mocking',
            enabled: true,
            description: 'Browser-based request interception',
          },
          {
            name: 'api_simulation',
            enabled: true,
            description: 'Full ObjectStack API simulation',
          },
          {
            name: 'custom_handlers',
            enabled: true,
            description: 'Custom request handler registration',
          },
        ],
        certified: false,
      },
      {
        protocol: {
          id: 'com.objectstack.protocol.api.rest.v1',
          label: 'REST API Protocol v1',
          version: { major: 1, minor: 0, patch: 0 },
          description: 'RESTful API endpoint mocking',
        },
        conformance: 'full',
        features: [
          {
            name: 'meta_endpoints',
            enabled: true,
            description: 'Metadata discovery endpoints',
          },
          {
            name: 'data_endpoints',
            enabled: true,
            description: 'CRUD data operation endpoints',
          },
          {
            name: 'ui_endpoints',
            enabled: true,
            description: 'UI view metadata endpoints',
          },
        ],
        certified: false,
      },
    ],

    // Interfaces This Plugin Provides
    provides: [
      {
        id: 'com.objectstack.plugin.msw.interface.mock_server',
        name: 'ObjectStackServer',
        description: 'Mock server interface for testing',
        version: { major: 1, minor: 0, patch: 0 },
        stability: 'stable',
        methods: [
          {
            name: 'init',
            description: 'Initialize mock server with protocol implementation',
            parameters: [
              {
                name: 'protocol',
                type: 'IObjectStackProtocol',
                required: true,
                description: 'ObjectStack protocol implementation instance',
              },
              {
                name: 'logger',
                type: 'Logger',
                required: false,
                description: 'Optional logger instance',
              },
            ],
            returnType: 'void',
            async: false,
          },
          {
            name: 'findData',
            description: 'Mock data find operation',
            parameters: [
              {
                name: 'object',
                type: 'string',
                required: true,
                description: 'Object name',
              },
              {
                name: 'params',
                type: 'any',
                required: false,
                description: 'Query parameters',
              },
            ],
            returnType: 'Promise<{ status: number; data: any }>',
            async: true,
          },
          {
            name: 'getData',
            description: 'Mock data get operation',
            parameters: [
              {
                name: 'object',
                type: 'string',
                required: true,
                description: 'Object name',
              },
              {
                name: 'id',
                type: 'string',
                required: true,
                description: 'Record ID',
              },
            ],
            returnType: 'Promise<{ status: number; data: any }>',
            async: true,
          },
          {
            name: 'createData',
            description: 'Mock data create operation',
            parameters: [
              {
                name: 'object',
                type: 'string',
                required: true,
                description: 'Object name',
              },
              {
                name: 'data',
                type: 'any',
                required: true,
                description: 'Record data',
              },
            ],
            returnType: 'Promise<{ status: number; data: any }>',
            async: true,
          },
          {
            name: 'updateData',
            description: 'Mock data update operation',
            parameters: [
              {
                name: 'object',
                type: 'string',
                required: true,
                description: 'Object name',
              },
              {
                name: 'id',
                type: 'string',
                required: true,
                description: 'Record ID',
              },
              {
                name: 'data',
                type: 'any',
                required: true,
                description: 'Updated record data',
              },
            ],
            returnType: 'Promise<{ status: number; data: any }>',
            async: true,
          },
          {
            name: 'deleteData',
            description: 'Mock data delete operation',
            parameters: [
              {
                name: 'object',
                type: 'string',
                required: true,
                description: 'Object name',
              },
              {
                name: 'id',
                type: 'string',
                required: true,
                description: 'Record ID',
              },
            ],
            returnType: 'Promise<{ status: number; data: any }>',
            async: true,
          },
        ],
      },
    ],

    // Dependencies on Other Plugins/Services
    requires: [
      {
        pluginId: 'com.objectstack.engine.objectql',
        version: '^0.6.0',
        optional: false,
        reason: 'ObjectQL data engine for mock responses',
        requiredCapabilities: [
          'com.objectstack.protocol.storage.v1',
        ],
      },
    ],

    // Extension Points This Plugin Defines
    extensionPoints: [
      {
        id: 'com.objectstack.plugin.msw.extension.custom_handler',
        name: 'Custom Request Handlers',
        description: 'Register custom MSW request handlers',
        type: 'action',
        cardinality: 'multiple',
        contract: {
          input: 'MSWHandler',
          description: 'MSW HTTP handler definition',
        },
      },
    ],

    // No extensions contributed to other plugins
    extensions: [],
  },

  contributes: {
    // No specific contributions (runtime plugin)
  },
};

export default MSWPlugin;

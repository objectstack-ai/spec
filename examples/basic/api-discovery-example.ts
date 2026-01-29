/**
 * Example: API Discovery Protocol
 * 
 * This example demonstrates the API Discovery mechanism in ObjectStack.
 * The Discovery API allows clients (frontends, AI agents, tools) to:
 * - Discover available capabilities
 * - Learn about the system's features and limits
 * - Adapt behavior based on runtime capabilities
 * 
 * Typically exposed at: GET /api/discovery
 */

import type {
  ApiDiscoveryResponse,
  ApiCapabilities,
} from '@objectstack/spec';

/**
 * Example 1: Complete Discovery Response
 * 
 * This is what a client receives when calling /api/discovery
 */
export const fullDiscoveryResponse: ApiDiscoveryResponse = {
  // System Identity
  system: {
    name: 'ObjectStack CRM',
    version: '2.1.0',
    environment: 'production',
    vendor: 'Acme Corporation',
  },

  // Available API Surfaces
  endpoints: {
    rest: {
      baseUrl: 'https://api.example.com/v1',
      version: 'v1',
      documentation: 'https://api.example.com/docs',
    },
    graphql: {
      endpoint: 'https://api.example.com/graphql',
      introspection: true,
      playground: 'https://api.example.com/playground',
    },
    odata: {
      baseUrl: 'https://api.example.com/odata',
      version: '4.0',
    },
    realtime: {
      websocket: 'wss://api.example.com/ws',
      sse: 'https://api.example.com/events',
    },
  },

  // Runtime Capabilities (from capabilities-example.ts)
  capabilities: {
    data: {
      queryFilters: true,
      queryAggregations: true,
      querySorting: true,
      queryPagination: true,
      queryWindowFunctions: true,
      querySubqueries: true,
      queryDistinct: true,
      queryHaving: true,
      queryJoins: true,

      fullTextSearch: true,
      vectorSearch: true,
      geoSpatial: true,

      jsonFields: true,
      arrayFields: true,

      validationRules: true,
      workflows: true,
      triggers: true,
      formulas: true,

      transactions: true,
      bulkOperations: true,

      supportedDrivers: ['postgresql', 'mongodb'],
    },

    ui: {
      listView: true,
      formView: true,
      kanbanView: true,
      calendarView: true,
      ganttView: true,

      dashboards: true,
      reports: true,
      charts: true,

      customPages: true,
      customThemes: true,
      customComponents: true,

      customActions: true,
      screenFlows: true,

      mobileOptimized: true,
      accessibility: true,
    },

    system: {
      version: '2.1.0',
      environment: 'production',

      restApi: true,
      graphqlApi: true,
      odataApi: true,

      websockets: true,
      serverSentEvents: true,
      eventBus: true,

      webhooks: true,
      apiContracts: true,

      authentication: true,
      rbac: true,
      fieldLevelSecurity: true,
      rowLevelSecurity: true,

      multiTenant: true,

      backgroundJobs: true,
      auditLogging: true,
      fileStorage: true,

      i18n: true,

      pluginSystem: true,

      systemObjects: ['user', 'role', 'permission', 'object', 'field'],

      limits: {
        maxObjects: 1000,
        maxFieldsPerObject: 500,
        maxRecordsPerQuery: 10000,
        apiRateLimit: 1000,
        fileUploadSizeLimit: 10485760,
      },
    },
  },

  // Authentication Configuration
  auth: {
    required: true,
    methods: ['oauth2', 'apiKey', 'jwt'],
    oauth2: {
      authorizationUrl: 'https://auth.example.com/oauth/authorize',
      tokenUrl: 'https://auth.example.com/oauth/token',
      scopes: ['read', 'write', 'admin'],
    },
  },

  // Available Objects (Schema Registry)
  objects: [
    {
      name: 'account',
      label: 'Account',
      labelPlural: 'Accounts',
      apiEnabled: true,
      endpoints: {
        list: '/api/v1/objects/account',
        get: '/api/v1/objects/account/{id}',
        create: '/api/v1/objects/account',
        update: '/api/v1/objects/account/{id}',
        delete: '/api/v1/objects/account/{id}',
      },
    },
    {
      name: 'contact',
      label: 'Contact',
      labelPlural: 'Contacts',
      apiEnabled: true,
      endpoints: {
        list: '/api/v1/objects/contact',
        get: '/api/v1/objects/contact/{id}',
        create: '/api/v1/objects/contact',
        update: '/api/v1/objects/contact/{id}',
        delete: '/api/v1/objects/contact/{id}',
      },
    },
  ],

  // Feature Flags
  features: {
    aiAssistant: true,
    advancedAnalytics: true,
    customBranding: true,
    apiAccess: true,
    webhooks: true,
    auditLogs: true,
  },

  // Links
  links: {
    documentation: 'https://docs.example.com',
    support: 'https://support.example.com',
    status: 'https://status.example.com',
    portal: 'https://app.example.com',
  },
};

/**
 * Example 2: Minimal Discovery Response (Development Mode)
 * 
 * A simplified response for local development
 */
export const devDiscoveryResponse: ApiDiscoveryResponse = {
  system: {
    name: 'ObjectStack Dev',
    version: '0.1.0',
    environment: 'development',
  },

  endpoints: {
    rest: {
      baseUrl: 'http://localhost:3000/api',
      version: 'v1',
    },
  },

  capabilities: {
    data: {
      queryFilters: true,
      queryAggregations: true,
      querySorting: true,
      queryPagination: true,
      queryWindowFunctions: false,
      querySubqueries: false,
      queryDistinct: true,
      queryHaving: false,
      queryJoins: false,

      fullTextSearch: false,
      vectorSearch: false,
      geoSpatial: false,

      jsonFields: true,
      arrayFields: false,

      validationRules: true,
      workflows: false,
      triggers: false,
      formulas: true,

      transactions: true,
      bulkOperations: true,

      supportedDrivers: ['memory', 'sqlite'],
    },

    ui: {
      listView: true,
      formView: true,
      kanbanView: false,
      calendarView: false,
      ganttView: false,

      dashboards: true,
      reports: true,
      charts: true,

      customPages: true,
      customThemes: false,
      customComponents: false,

      customActions: true,
      screenFlows: false,

      mobileOptimized: false,
      accessibility: false,
    },

    system: {
      version: '0.1.0',
      environment: 'development',

      restApi: true,
      graphqlApi: false,
      odataApi: false,

      websockets: false,
      serverSentEvents: false,
      eventBus: false,

      webhooks: false,
      apiContracts: false,

      authentication: true,
      rbac: true,
      fieldLevelSecurity: false,
      rowLevelSecurity: false,

      multiTenant: false,

      backgroundJobs: false,
      auditLogging: false,
      fileStorage: true,

      i18n: true,

      pluginSystem: false,

      systemObjects: ['user', 'role', 'object'],

      limits: {
        maxObjects: 100,
        maxFieldsPerObject: 200,
        maxRecordsPerQuery: 1000,
        apiRateLimit: 100,
        fileUploadSizeLimit: 5242880,
      },
    },
  },

  auth: {
    required: false,
  },

  objects: [],

  features: {},

  links: {},
};

/**
 * Example 3: Client Usage - Adaptive Behavior
 * 
 * How a client can use the discovery API to adapt its behavior
 */
export class AdaptiveClient {
  private capabilities: ApiCapabilities | null = null;

  async initialize(baseUrl: string) {
    // Fetch discovery information
    const response = await fetch(`${baseUrl}/api/discovery`);
    const discovery: ApiDiscoveryResponse = await response.json();
    
    this.capabilities = discovery.capabilities;
    
    console.log(`Connected to: ${discovery.system.name} v${discovery.system.version}`);
    console.log(`Environment: ${discovery.system.environment}`);
  }

  /**
   * Check if a specific feature is available
   */
  hasFeature(subsystem: 'data' | 'ui' | 'system', feature: string): boolean {
    if (!this.capabilities) return false;
    
    const subsystemCaps = this.capabilities[subsystem] as any;
    return subsystemCaps?.[feature] === true;
  }

  /**
   * Build query based on available capabilities
   */
  buildQuery(object: string, options: any) {
    const query: any = { object };

    // Only use subqueries if supported
    if (this.hasFeature('data', 'querySubqueries') && options.includeRelated) {
      query.subqueries = options.includeRelated;
    }

    // Only use window functions if supported
    if (this.hasFeature('data', 'queryWindowFunctions') && options.ranking) {
      query.windowFunctions = options.ranking;
    }

    // Basic filtering is usually always available
    if (options.filter) {
      query.filter = options.filter;
    }

    return query;
  }

  /**
   * Choose the best available API endpoint
   */
  getApiEndpoint(discovery: ApiDiscoveryResponse, preference: 'rest' | 'graphql' | 'odata' = 'rest') {
    const endpoints = discovery.endpoints;

    // Try preferred endpoint first
    if (preference === 'graphql' && endpoints.graphql) {
      return { type: 'graphql', url: endpoints.graphql.endpoint };
    }
    
    if (preference === 'odata' && endpoints.odata) {
      return { type: 'odata', url: endpoints.odata.baseUrl };
    }

    // Fallback to REST (usually always available)
    if (endpoints.rest) {
      return { type: 'rest', url: endpoints.rest.baseUrl };
    }

    throw new Error('No API endpoints available');
  }
}

/**
 * Example 4: AI Agent Usage
 * 
 * How an AI agent can use discovery to understand the system
 */
export function generateSystemPromptFromDiscovery(discovery: ApiDiscoveryResponse): string {
  const { system, capabilities, objects } = discovery;

  const prompt = `You are an AI assistant for ${system.name} (v${system.version}).

SYSTEM CAPABILITIES:
${capabilities.data.vectorSearch ? '- Vector search available (can use RAG)' : ''}
${capabilities.data.fullTextSearch ? '- Full-text search available' : ''}
${capabilities.ui.dashboards ? '- Can create and manage dashboards' : ''}
${capabilities.system.webhooks ? '- Can configure webhooks' : ''}

AVAILABLE OBJECTS:
${objects.map(obj => `- ${obj.label} (${obj.name})`).join('\n')}

RATE LIMITS:
- API Rate Limit: ${capabilities.system.limits?.apiRateLimit || 'N/A'} requests/minute
- Max Records per Query: ${capabilities.system.limits?.maxRecordsPerQuery || 'N/A'}

When helping users, respect these capabilities and limits.`;

  return prompt;
}

// ============================================================================
// Usage Examples
// ============================================================================

// Example: Initialize adaptive client
const client = new AdaptiveClient();
// await client.initialize('https://api.example.com');

// Example: Check features before using them
if (client.hasFeature('data', 'vectorSearch')) {
  console.log('✅ Vector search is available - AI/RAG features enabled');
}

// Example: Generate AI prompt
const systemPrompt = generateSystemPromptFromDiscovery(fullDiscoveryResponse);
console.log('AI System Prompt:\n', systemPrompt);

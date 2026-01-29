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
  DiscoveryResponse,
  ApiCapabilities,
} from '@objectstack/spec';

/**
 * Example 1: Complete Discovery Response
 * 
 * This is what a client receives when calling /api/discovery
 */
export const fullDiscoveryResponse: DiscoveryResponse = {
  // System Identity
  name: 'ObjectStack CRM',
  version: '2.1.0',
  environment: 'production',

  // Dynamic Routing - tells frontend where to send requests
  routes: {
    data: '/api/data',
    metadata: '/api/meta',
    auth: '/api/auth',
    automation: '/api/automation',
    storage: '/api/storage',
    graphql: '/graphql',
  },

  // Feature Flags - what capabilities are enabled
  features: {
    graphql: true,
    search: true,
    websockets: true,
    files: true,
  },

  // Localization Info
  locale: {
    default: 'en-US',
    supported: ['en-US', 'zh-CN', 'es-ES', 'fr-FR'],
    timezone: 'UTC',
  },
};

/**
 * Example 2: Minimal Discovery Response (Development Mode)
 * 
 * A simplified response for local development
 */
export const devDiscoveryResponse: DiscoveryResponse = {
  name: 'ObjectStack Dev',
  version: '0.1.0',
  environment: 'development',

  routes: {
    data: '/api/data',
    metadata: '/api/meta',
    auth: '/api/auth',
  },

  features: {
    graphql: false,
    search: true,
    websockets: false,
    files: true,
  },

  locale: {
    default: 'en-US',
    supported: ['en-US'],
    timezone: 'America/New_York',
  },
};

/**
 * Example 3: Client Usage - Adaptive Behavior
 * 
 * How a client can use the discovery API to adapt its behavior
 */
export class AdaptiveClient {
  private discovery: DiscoveryResponse | null = null;

  async initialize(baseUrl: string) {
    // Fetch discovery information
    const response = await fetch(`${baseUrl}/api/discovery`);
    this.discovery = await response.json() as DiscoveryResponse;
    
    console.log(`Connected to: ${this.discovery.name} v${this.discovery.version}`);
    console.log(`Environment: ${this.discovery.environment}`);
  }

  /**
   * Check if a specific feature is available
   */
  hasFeature(feature: keyof ApiCapabilities): boolean {
    if (!this.discovery) return false;
    return this.discovery.features[feature] === true;
  }

  /**
   * Get the route for a specific API
   */
  getRoute(route: 'data' | 'metadata' | 'auth' | 'automation' | 'storage' | 'graphql'): string | undefined {
    if (!this.discovery) return undefined;
    return this.discovery.routes[route];
  }

  /**
   * Choose the best available API endpoint
   */
  getApiEndpoint(preference: 'rest' | 'graphql' = 'rest') {
    if (!this.discovery) {
      throw new Error('Client not initialized');
    }

    // Check if GraphQL is available
    if (preference === 'graphql' && this.discovery.features.graphql && this.discovery.routes.graphql) {
      return { type: 'graphql', url: this.discovery.routes.graphql };
    }

    // Fallback to REST (data route)
    if (this.discovery.routes.data) {
      return { type: 'rest', url: this.discovery.routes.data };
    }

    throw new Error('No API endpoints available');
  }
}

/**
 * Example 4: AI Agent Usage
 * 
 * How an AI agent can use discovery to understand the system
 */
export function generateSystemPromptFromDiscovery(discovery: DiscoveryResponse): string {
  const { name, version, features, locale } = discovery;

  const prompt = `You are an AI assistant for ${name} (v${version}).

SYSTEM CAPABILITIES:
${features.graphql ? '- GraphQL API available' : ''}
${features.search ? '- Search functionality available' : ''}
${features.websockets ? '- Real-time updates via WebSockets' : ''}
${features.files ? '- File upload/download supported' : ''}

LOCALIZATION:
- Default Locale: ${locale.default}
- Supported Languages: ${locale.supported.join(', ')}
- Timezone: ${locale.timezone}

When helping users, respect these capabilities and localization settings.`;

  return prompt;
}

// ============================================================================
// Usage Examples
// ============================================================================

// Example: Initialize adaptive client (uncomment to run)
// const client = new AdaptiveClient();
// await client.initialize('https://api.example.com');
// if (client.hasFeature('data', 'vectorSearch')) {
//   console.log('✅ Vector search is available - AI/RAG features enabled');
// }

// Example: Generate AI prompt (uncomment to run)
// const systemPrompt = generateSystemPromptFromDiscovery(fullDiscoveryResponse);
// console.log('AI System Prompt:\n', systemPrompt);

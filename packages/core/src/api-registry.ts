import type {
  ApiRegistry as ApiRegistryType,
  ApiRegistryEntry,
  ApiRegistryEntryInput,
  ApiEndpointRegistration,
  ConflictResolutionStrategy,
  ApiDiscoveryQuery,
  ApiDiscoveryResponse,
} from '@objectstack/spec/api';
import { ApiRegistryEntrySchema } from '@objectstack/spec/api';
import type { Logger } from '@objectstack/spec/contracts';

/**
 * API Registry Service
 * 
 * Central registry for managing API endpoints across different protocols.
 * Provides endpoint registration, discovery, and conflict resolution.
 * 
 * **Features:**
 * - Multi-protocol support (REST, GraphQL, OData, WebSocket, etc.)
 * - Route conflict detection with configurable resolution strategies
 * - RBAC permission integration
 * - Dynamic schema linking with ObjectQL references
 * - Plugin API registration
 * 
 * **Architecture Alignment:**
 * - Kubernetes: Service Discovery & API Server
 * - AWS API Gateway: Unified API Management
 * - Kong Gateway: Plugin-based API Management
 * 
 * @example
 * ```typescript
 * const registry = new ApiRegistry(logger, 'priority');
 * 
 * // Register an API
 * registry.registerApi({
 *   id: 'customer_api',
 *   name: 'Customer API',
 *   type: 'rest',
 *   version: 'v1',
 *   basePath: '/api/v1/customers',
 *   endpoints: [...]
 * });
 * 
 * // Discover APIs
 * const apis = registry.findApis({ type: 'rest', status: 'active' });
 * 
 * // Get registry snapshot
 * const snapshot = registry.getRegistry();
 * ```
 */
export class ApiRegistry {
  private apis: Map<string, ApiRegistryEntry> = new Map();
  private endpoints: Map<string, { api: string; endpoint: ApiEndpointRegistration }> = new Map();
  private routes: Map<string, { api: string; endpointId: string; priority: number }> = new Map();
  private conflictResolution: ConflictResolutionStrategy;
  private logger: Logger;
  private version: string;
  private updatedAt: string;

  constructor(
    logger: Logger,
    conflictResolution: ConflictResolutionStrategy = 'error',
    version: string = '1.0.0'
  ) {
    this.logger = logger;
    this.conflictResolution = conflictResolution;
    this.version = version;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Register an API with its endpoints
   * 
   * @param api - API registry entry
   * @throws Error if API already registered or route conflicts detected
   */
  registerApi(api: ApiRegistryEntryInput): void {
    // Check if API already exists
    if (this.apis.has(api.id)) {
      throw new Error(`[ApiRegistry] API '${api.id}' already registered`);
    }

    // Parse and validate the input using Zod schema
    const fullApi = ApiRegistryEntrySchema.parse(api);

    // Validate and register endpoints
    for (const endpoint of fullApi.endpoints) {
      this.validateEndpoint(endpoint, fullApi.id);
    }

    // Register the API
    this.apis.set(fullApi.id, fullApi);
    
    // Register endpoints
    for (const endpoint of fullApi.endpoints) {
      this.registerEndpoint(fullApi.id, endpoint);
    }

    this.updatedAt = new Date().toISOString();
    this.logger.info(`API registered: ${fullApi.id}`, {
      api: fullApi.id,
      type: fullApi.type,
      endpointCount: fullApi.endpoints.length,
    });
  }

  /**
   * Unregister an API and all its endpoints
   * 
   * @param apiId - API identifier
   */
  unregisterApi(apiId: string): void {
    const api = this.apis.get(apiId);
    if (!api) {
      throw new Error(`[ApiRegistry] API '${apiId}' not found`);
    }

    // Remove all endpoints
    for (const endpoint of api.endpoints) {
      this.unregisterEndpoint(apiId, endpoint.id);
    }

    // Remove the API
    this.apis.delete(apiId);
    this.updatedAt = new Date().toISOString();
    
    this.logger.info(`API unregistered: ${apiId}`);
  }

  /**
   * Register a single endpoint
   * 
   * @param apiId - API identifier
   * @param endpoint - Endpoint registration
   * @throws Error if route conflict detected
   */
  private registerEndpoint(apiId: string, endpoint: ApiEndpointRegistration): void {
    const endpointKey = `${apiId}:${endpoint.id}`;
    
    // Check if endpoint already registered
    if (this.endpoints.has(endpointKey)) {
      throw new Error(`[ApiRegistry] Endpoint '${endpoint.id}' already registered for API '${apiId}'`);
    }

    // Register endpoint
    this.endpoints.set(endpointKey, { api: apiId, endpoint });

    // Register route if path is defined
    if (endpoint.path) {
      this.registerRoute(apiId, endpoint);
    }
  }

  /**
   * Unregister a single endpoint
   * 
   * @param apiId - API identifier
   * @param endpointId - Endpoint identifier
   */
  private unregisterEndpoint(apiId: string, endpointId: string): void {
    const endpointKey = `${apiId}:${endpointId}`;
    const entry = this.endpoints.get(endpointKey);
    
    if (!entry) {
      return; // Already unregistered
    }

    // Unregister route
    if (entry.endpoint.path) {
      const routeKey = this.getRouteKey(entry.endpoint);
      this.routes.delete(routeKey);
    }

    // Unregister endpoint
    this.endpoints.delete(endpointKey);
  }

  /**
   * Register a route with conflict detection
   * 
   * @param apiId - API identifier
   * @param endpoint - Endpoint registration
   * @throws Error if route conflict detected (based on strategy)
   */
  private registerRoute(apiId: string, endpoint: ApiEndpointRegistration): void {
    const routeKey = this.getRouteKey(endpoint);
    const priority = endpoint.priority ?? 100;
    const existingRoute = this.routes.get(routeKey);

    if (existingRoute) {
      // Route conflict detected
      this.handleRouteConflict(routeKey, apiId, endpoint, existingRoute, priority);
      return;
    }

    // Register route
    this.routes.set(routeKey, {
      api: apiId,
      endpointId: endpoint.id,
      priority,
    });
  }

  /**
   * Handle route conflict based on resolution strategy
   * 
   * @param routeKey - Route key
   * @param apiId - New API identifier
   * @param endpoint - New endpoint
   * @param existingRoute - Existing route registration
   * @param newPriority - New endpoint priority
   * @throws Error if strategy is 'error'
   */
  private handleRouteConflict(
    routeKey: string,
    apiId: string,
    endpoint: ApiEndpointRegistration,
    existingRoute: { api: string; endpointId: string; priority: number },
    newPriority: number
  ): void {
    const strategy = this.conflictResolution;

    switch (strategy) {
      case 'error':
        throw new Error(
          `[ApiRegistry] Route conflict detected: '${routeKey}' is already registered by API '${existingRoute.api}' endpoint '${existingRoute.endpointId}'`
        );

      case 'priority':
        if (newPriority > existingRoute.priority) {
          // New endpoint has higher priority, replace
          this.logger.warn(
            `Route conflict: replacing '${routeKey}' (priority ${existingRoute.priority} -> ${newPriority})`,
            {
              oldApi: existingRoute.api,
              oldEndpoint: existingRoute.endpointId,
              newApi: apiId,
              newEndpoint: endpoint.id,
            }
          );
          this.routes.set(routeKey, {
            api: apiId,
            endpointId: endpoint.id,
            priority: newPriority,
          });
        } else {
          // Existing endpoint has higher priority, keep it
          this.logger.warn(
            `Route conflict: keeping existing '${routeKey}' (priority ${existingRoute.priority} >= ${newPriority})`,
            {
              existingApi: existingRoute.api,
              existingEndpoint: existingRoute.endpointId,
              newApi: apiId,
              newEndpoint: endpoint.id,
            }
          );
        }
        break;

      case 'first-wins':
        // Keep existing route
        this.logger.warn(
          `Route conflict: keeping first registered '${routeKey}'`,
          {
            existingApi: existingRoute.api,
            newApi: apiId,
          }
        );
        break;

      case 'last-wins':
        // Replace with new route
        this.logger.warn(
          `Route conflict: replacing with last registered '${routeKey}'`,
          {
            oldApi: existingRoute.api,
            newApi: apiId,
          }
        );
        this.routes.set(routeKey, {
          api: apiId,
          endpointId: endpoint.id,
          priority: newPriority,
        });
        break;

      default:
        throw new Error(`[ApiRegistry] Unknown conflict resolution strategy: ${strategy}`);
    }
  }

  /**
   * Generate a unique route key for conflict detection
   * 
   * @param endpoint - Endpoint registration
   * @returns Route key (e.g., "GET:/api/v1/customers/:id")
   */
  private getRouteKey(endpoint: ApiEndpointRegistration): string {
    const method = endpoint.method || 'ANY';
    return `${method}:${endpoint.path}`;
  }

  /**
   * Validate endpoint registration
   * 
   * @param endpoint - Endpoint to validate
   * @param apiId - API identifier (for error messages)
   * @throws Error if endpoint is invalid
   */
  private validateEndpoint(endpoint: ApiEndpointRegistration, apiId: string): void {
    if (!endpoint.id) {
      throw new Error(`[ApiRegistry] Endpoint in API '${apiId}' missing 'id' field`);
    }

    if (!endpoint.path) {
      throw new Error(`[ApiRegistry] Endpoint '${endpoint.id}' in API '${apiId}' missing 'path' field`);
    }
  }

  /**
   * Get an API by ID
   * 
   * @param apiId - API identifier
   * @returns API registry entry or undefined
   */
  getApi(apiId: string): ApiRegistryEntry | undefined {
    return this.apis.get(apiId);
  }

  /**
   * Get all registered APIs
   * 
   * @returns Array of all APIs
   */
  getAllApis(): ApiRegistryEntry[] {
    return Array.from(this.apis.values());
  }

  /**
   * Find APIs matching query criteria
   * 
   * @param query - Discovery query parameters
   * @returns Matching APIs
   */
  findApis(query: ApiDiscoveryQuery): ApiDiscoveryResponse {
    let results = Array.from(this.apis.values());

    // Filter by type
    if (query.type) {
      results = results.filter((api) => api.type === query.type);
    }

    // Filter by status
    if (query.status) {
      results = results.filter(
        (api) => api.metadata?.status === query.status
      );
    }

    // Filter by plugin source
    if (query.pluginSource) {
      results = results.filter(
        (api) => api.metadata?.pluginSource === query.pluginSource
      );
    }

    // Filter by version
    if (query.version) {
      results = results.filter((api) => api.version === query.version);
    }

    // Filter by tags (ANY match)
    if (query.tags && query.tags.length > 0) {
      results = results.filter((api) => {
        const apiTags = api.metadata?.tags || [];
        return query.tags!.some((tag) => apiTags.includes(tag));
      });
    }

    // Search in name/description
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(
        (api) =>
          api.name.toLowerCase().includes(searchLower) ||
          (api.description && api.description.toLowerCase().includes(searchLower))
      );
    }

    return {
      apis: results,
      total: results.length,
      filters: query,
    };
  }

  /**
   * Get endpoint by API ID and endpoint ID
   * 
   * @param apiId - API identifier
   * @param endpointId - Endpoint identifier
   * @returns Endpoint registration or undefined
   */
  getEndpoint(apiId: string, endpointId: string): ApiEndpointRegistration | undefined {
    const key = `${apiId}:${endpointId}`;
    return this.endpoints.get(key)?.endpoint;
  }

  /**
   * Find endpoint by route (method + path)
   * 
   * @param method - HTTP method
   * @param path - URL path
   * @returns Endpoint registration or undefined
   */
  findEndpointByRoute(method: string, path: string): {
    api: ApiRegistryEntry;
    endpoint: ApiEndpointRegistration;
  } | undefined {
    const routeKey = `${method}:${path}`;
    const route = this.routes.get(routeKey);
    
    if (!route) {
      return undefined;
    }

    const api = this.apis.get(route.api);
    const endpoint = this.getEndpoint(route.api, route.endpointId);

    if (!api || !endpoint) {
      return undefined;
    }

    return { api, endpoint };
  }

  /**
   * Get complete registry snapshot
   * 
   * @returns Current registry state
   */
  getRegistry(): ApiRegistryType {
    const apis = Array.from(this.apis.values());
    
    // Group by type
    const byType: Record<string, ApiRegistryEntry[]> = {};
    for (const api of apis) {
      if (!byType[api.type]) {
        byType[api.type] = [];
      }
      byType[api.type].push(api);
    }

    // Group by status
    const byStatus: Record<string, ApiRegistryEntry[]> = {};
    for (const api of apis) {
      const status = api.metadata?.status || 'active';
      if (!byStatus[status]) {
        byStatus[status] = [];
      }
      byStatus[status].push(api);
    }

    // Count total endpoints
    const totalEndpoints = apis.reduce(
      (sum, api) => sum + api.endpoints.length,
      0
    );

    return {
      version: this.version,
      conflictResolution: this.conflictResolution,
      apis,
      totalApis: apis.length,
      totalEndpoints,
      byType,
      byStatus,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Clear all registered APIs
   * Useful for testing or hot-reload scenarios
   */
  clear(): void {
    this.apis.clear();
    this.endpoints.clear();
    this.routes.clear();
    this.updatedAt = new Date().toISOString();
    this.logger.info('API registry cleared');
  }

  /**
   * Get registry statistics
   * 
   * @returns Registry statistics
   */
  getStats(): {
    totalApis: number;
    totalEndpoints: number;
    totalRoutes: number;
    apisByType: Record<string, number>;
    endpointsByApi: Record<string, number>;
  } {
    const apis = Array.from(this.apis.values());
    
    const apisByType: Record<string, number> = {};
    for (const api of apis) {
      apisByType[api.type] = (apisByType[api.type] || 0) + 1;
    }

    const endpointsByApi: Record<string, number> = {};
    for (const api of apis) {
      endpointsByApi[api.id] = api.endpoints.length;
    }

    return {
      totalApis: this.apis.size,
      totalEndpoints: this.endpoints.size,
      totalRoutes: this.routes.size,
      apisByType,
      endpointsByApi,
    };
  }
}

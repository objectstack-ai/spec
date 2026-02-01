import { QueryAST, SortNode, AggregationNode, WindowFunctionNode } from '@objectstack/spec/data';
import { 
  BatchUpdateRequest, 
  BatchUpdateResponse, 
  UpdateManyRequest,
  DeleteManyRequest,
  BatchOptions,
  MetadataCacheRequest,
  MetadataCacheResponse,
  StandardErrorCode,
  ErrorCategory
} from '@objectstack/spec/api';
import { Logger, createLogger } from '@objectstack/core';

export interface ClientConfig {
  baseUrl: string;
  token?: string;
  /**
   * Custom fetch implementation (e.g. node-fetch or for Next.js caching)
   */
  fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  /**
   * Logger instance for debugging
   */
  logger?: Logger;
  /**
   * Enable debug logging
   */
  debug?: boolean;
}

export interface DiscoveryResult {
  routes: {
    discovery: string;
    metadata: string;
    data: string;
    auth: string;
    ui: string;
  };
  capabilities?: Record<string, boolean>;
}

export interface QueryOptions {
  select?: string[]; // Simplified Selection
  filters?: Record<string, any>; // Map or AST
  sort?: string | string[] | SortNode[]; // 'name' or ['-created_at'] or AST
  top?: number;
  skip?: number;
  // Advanced features
  aggregations?: AggregationNode[];
  groupBy?: string[];
}

export interface PaginatedResult<T = any> {
  value: T[];
  count: number;
}

export interface StandardError {
  code: StandardErrorCode;
  message: string;
  category: ErrorCategory;
  httpStatus: number;
  retryable: boolean;
  details?: Record<string, any>;
}

export class ObjectStackClient {
  private baseUrl: string;
  private token?: string;
  private fetchImpl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  private routes?: DiscoveryResult['routes'];
  private logger: Logger;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.token = config.token;
    this.fetchImpl = config.fetch || globalThis.fetch.bind(globalThis);
    
    // Initialize logger
    this.logger = config.logger || createLogger({ 
      level: config.debug ? 'debug' : 'info',
      format: 'pretty'
    });
    
    this.logger.debug('ObjectStack client created', { baseUrl: this.baseUrl });
  }

  /**
   * Initialize the client by discovering server capabilities and routes.
   */
  async connect() {
    this.logger.debug('Connecting to ObjectStack server', { baseUrl: this.baseUrl });
    
    try {
      // Connect to the discovery endpoint
      // During boot, we might not know routes, so we check convention /api/v1 first
      const res = await this.fetch(`${this.baseUrl}/api/v1`);
      
      const data = await res.json();
      this.routes = data.routes;
      
      this.logger.info('Connected to ObjectStack server', { 
        routes: Object.keys(data.routes || {}),
        capabilities: data.capabilities 
      });
      
      return data as DiscoveryResult;
    } catch (e) {
      this.logger.error('Failed to connect to ObjectStack server', e as Error, { baseUrl: this.baseUrl });
      throw e;
    }
  }

  /**
   * Metadata Operations
   */
  meta = {
    getObject: async (name: string) => {
        const route = this.getRoute('metadata');
        const res = await this.fetch(`${this.baseUrl}${route}/object/${name}`);
        return res.json();
    },
    
    /**
     * Get object metadata with cache support
     * Supports ETag-based conditional requests for efficient caching
     */
    getCached: async (name: string, cacheOptions?: MetadataCacheRequest): Promise<MetadataCacheResponse> => {
        const route = this.getRoute('metadata');
        const headers: Record<string, string> = {};
        
        if (cacheOptions?.ifNoneMatch) {
          headers['If-None-Match'] = cacheOptions.ifNoneMatch;
        }
        if (cacheOptions?.ifModifiedSince) {
          headers['If-Modified-Since'] = cacheOptions.ifModifiedSince;
        }
        
        const res = await this.fetch(`${this.baseUrl}${route}/object/${name}`, {
          headers
        });
        
        // Check for 304 Not Modified
        if (res.status === 304) {
          return {
            notModified: true,
            etag: cacheOptions?.ifNoneMatch ? { 
              value: cacheOptions.ifNoneMatch.replace(/^W\/|"/g, ''),
              weak: cacheOptions.ifNoneMatch.startsWith('W/')
            } : undefined
          };
        }
        
        const data = await res.json();
        const etag = res.headers.get('ETag');
        const lastModified = res.headers.get('Last-Modified');
        
        return {
          data,
          etag: etag ? { 
            value: etag.replace(/^W\/|"/g, ''), 
            weak: etag.startsWith('W/') 
          } : undefined,
          lastModified: lastModified || undefined,
          notModified: false
        };
    },
    
    getView: async (object: string, type: 'list' | 'form' = 'list') => {
        const route = this.getRoute('ui');
        const res = await this.fetch(`${this.baseUrl}${route}/view/${object}?type=${type}`);
        return res.json();
    }
  };

  /**
   * Data Operations
   */
  data = {
    /**
     * Advanced Query using ObjectStack Query Protocol
     * Supports both simplified options and full AST
     */
    query: async <T = any>(object: string, query: Partial<QueryAST>): Promise<PaginatedResult<T>> => {
      const route = this.getRoute('data');
      // POST for complex query to avoid URL length limits and allow clean JSON AST
      // Convention: POST /api/v1/data/:object/query
      const res = await this.fetch(`${this.baseUrl}${route}/${object}/query`, {
        method: 'POST',
        body: JSON.stringify(query)
      });
      return res.json();
    },

    find: async <T = any>(object: string, options: QueryOptions = {}): Promise<PaginatedResult<T>> => {
        const route = this.getRoute('data');
        const queryParams = new URLSearchParams();
        
        // 1. Handle Pagination
        if (options.top) queryParams.set('top', options.top.toString());
        if (options.skip) queryParams.set('skip', options.skip.toString());

        // 2. Handle Sort
        if (options.sort) {
            // Check if it's AST 
            if (Array.isArray(options.sort) && typeof options.sort[0] === 'object') {
                 queryParams.set('sort', JSON.stringify(options.sort));
            } else {
                 const sortVal = Array.isArray(options.sort) ? options.sort.join(',') : options.sort;
                 queryParams.set('sort', sortVal as string);
            }
        }
        
        // 3. Handle Select
        if (options.select) {
            queryParams.set('select', options.select.join(','));
        }

        // 4. Handle Filters (Simple vs AST)
        if (options.filters) {
             // If looks like AST (not plain object map)
             // TODO: robust check. safely assuming map for simplified find, and recommending .query() for AST
             if (this.isFilterAST(options.filters)) {
                 queryParams.set('filters', JSON.stringify(options.filters));
             } else {
                 Object.entries(options.filters).forEach(([k, v]) => {
                     if (v !== undefined && v !== null) {
                        queryParams.append(k, String(v));
                     }
                 });
             }
        }
        
        // 5. Handle Aggregations & GroupBy (Pass through as JSON if present)
        if (options.aggregations) {
            queryParams.set('aggregations', JSON.stringify(options.aggregations));
        }
        if (options.groupBy) {
             queryParams.set('groupBy', options.groupBy.join(','));
        }

        const res = await this.fetch(`${this.baseUrl}${route}/${object}?${queryParams.toString()}`);
        return res.json();
    },

    get: async <T = any>(object: string, id: string): Promise<T> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/${id}`);
        return res.json();
    },

    create: async <T = any>(object: string, data: Partial<T>): Promise<T> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return res.json();
    },

    createMany: async <T = any>(object: string, data: Partial<T>[]): Promise<T[]> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/createMany`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return res.json();
    },

    update: async <T = any>(object: string, id: string, data: Partial<T>): Promise<T> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return res.json();
    },

    /**
     * Batch update multiple records
     * Uses the new BatchUpdateRequest schema with full control over options
     */
    batch: async (object: string, request: BatchUpdateRequest): Promise<BatchUpdateResponse> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/batch`, {
            method: 'POST',
            body: JSON.stringify(request)
        });
        return res.json();
    },

    /**
     * Update multiple records (simplified batch update)
     * Convenience method for batch updates without full BatchUpdateRequest
     */
    updateMany: async <T = any>(
      object: string, 
      records: Array<{ id: string; data: Partial<T> }>,
      options?: BatchOptions
    ): Promise<BatchUpdateResponse> => {
        const route = this.getRoute('data');
        const request: UpdateManyRequest = {
          records,
          options
        };
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/updateMany`, {
            method: 'POST',
            body: JSON.stringify(request)
        });
        return res.json();
    },

    delete: async (object: string, id: string): Promise<{ success: boolean }> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    /**
     * Delete multiple records by IDs
     */
    deleteMany: async(object: string, ids: string[], options?: BatchOptions): Promise<BatchUpdateResponse> => {
        const route = this.getRoute('data');
        const request: DeleteManyRequest = {
          ids,
          options
        };
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/deleteMany`, {
             method: 'POST',
             body: JSON.stringify(request)
        });
        return res.json();
    }
  };



  /**
   * Private Helpers
   */

  private isFilterAST(filter: any): boolean {
    // Basic check: if array, it's [field, op, val] or [logic, node, node]
    // If object but not basic KV map... harder to tell without schema
    // For now, assume if it passes Array.isArray it's an AST root
    return Array.isArray(filter);
  }

  private async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    this.logger.debug('HTTP request', { 
      method: options.method || 'GET',
      url,
      hasBody: !!options.body
    });
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await this.fetchImpl(url, { ...options, headers });
    
    this.logger.debug('HTTP response', { 
      method: options.method || 'GET',
      url,
      status: res.status,
      ok: res.ok
    });
    
    if (!res.ok) {
        let errorBody: any;
        try {
            errorBody = await res.json();
        } catch {
            errorBody = { message: res.statusText };
        }
        
        this.logger.error('HTTP request failed', undefined, { 
          method: options.method || 'GET',
          url,
          status: res.status,
          error: errorBody
        });
        
        // Create a standardized error if the response includes error details
        const errorMessage = errorBody?.message || errorBody?.error?.message || res.statusText;
        const errorCode = errorBody?.code || errorBody?.error?.code;
        const error = new Error(`[ObjectStack] ${errorCode ? `${errorCode}: ` : ''}${errorMessage}`) as any;
        
        // Attach error details for programmatic access
        error.code = errorCode;
        error.category = errorBody?.category;
        error.httpStatus = res.status;
        error.retryable = errorBody?.retryable;
        error.details = errorBody?.details || errorBody;
        
        throw error;
    }
    
    return res;
  }

  private getRoute(key: keyof DiscoveryResult['routes']): string {
    if (!this.routes) {
        // Fallback for strictness, but we allow bootstrapping
        this.logger.warn('Accessing route before connect()', { 
          route: key, 
          fallback: `/api/v1/${key}` 
        });
        return `/api/v1/${key}`;
    }
    return this.routes[key] || `/api/v1/${key}`; 
  }
}

// Re-export type-safe query builder
export { QueryBuilder, FilterBuilder, createQuery, createFilter } from './query-builder';

// Re-export commonly used types from @objectstack/spec/api for convenience
export type {
  BatchUpdateRequest,
  BatchUpdateResponse,
  UpdateManyRequest,
  DeleteManyRequest,
  BatchOptions,
  BatchRecord,
  BatchOperationResult,
  MetadataCacheRequest,
  MetadataCacheResponse,
  StandardErrorCode,
  ErrorCategory
} from '@objectstack/spec/api';

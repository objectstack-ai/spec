import { QueryAST, FilterNode, SortNode, AggregationNode, WindowFunctionNode } from '@objectstack/spec';

export interface ClientConfig {
  baseUrl: string;
  token?: string;
  /**
   * Custom fetch implementation (e.g. node-fetch or for Next.js caching)
   */
  fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
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
  filters?: Record<string, any> | FilterNode; // Map or AST
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

export class ObjectStackClient {
  private baseUrl: string;
  private token?: string;
  private fetchImpl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  private routes?: DiscoveryResult['routes'];

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.token = config.token;
    this.fetchImpl = config.fetch || globalThis.fetch.bind(globalThis);
  }

  /**
   * Initialize the client by discovering server capabilities and routes.
   */
  async connect() {
    try {
      // Connect to the discovery endpoint
      // During boot, we might not know routes, so we check convention /api/v1 first
      const res = await this.fetch(`${this.baseUrl}/api/v1`);
      
      const data = await res.json();
      this.routes = data.routes;
      return data as DiscoveryResult;
    } catch (e) {
      console.error('Failed to connect to ObjectStack Server', e);
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
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/batch`, {
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

    updateMany: async <T = any>(object: string, ids: string[], data: Partial<T>): Promise<number> => {
        // Warning: This implies updating all IDs with the SAME data
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/batch`, {
            method: 'PATCH',
            body: JSON.stringify({ ids, data })
        });
        return res.json(); // Returns count
    },

    delete: async (object: string, id: string): Promise<{ success: boolean }> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    deleteMany: async(object: string, ids: string[]): Promise<{ count: number }> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/batch`, {
             method: 'DELETE',
             body: JSON.stringify({ ids })
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await this.fetchImpl(url, { ...options, headers });
    
    if (!res.ok) {
        let errorBody;
        try {
            errorBody = await res.json();
        } catch {
            errorBody = { message: res.statusText };
        }
        throw new Error(`[ObjectStack] Request failed: ${res.status} ${JSON.stringify(errorBody)}`);
    }
    
    return res;
  }

  private getRoute(key: keyof DiscoveryResult['routes']): string {
    if (!this.routes) {
        // Fallback for strictness, but we allow bootstrapping
        console.warn(`[ObjectStackClient] Accessing ${key} route before connect(). Using default /api/v1/${key}`);
        return `/api/v1/${key}`;
    }
    return this.routes[key] || `/api/v1/${key}`; 
  }
}

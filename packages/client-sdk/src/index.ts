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
  select?: string[];
  filters?: Record<string, any>;
  sort?: string | string[]; // 'name' or ['-created_at', 'name']
  top?: number;
  skip?: number;
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
    find: async <T = any>(object: string, options: QueryOptions = {}): Promise<PaginatedResult<T>> => {
        const route = this.getRoute('data');
        const queryParams = new URLSearchParams();
        
        if (options.top) queryParams.set('top', options.top.toString());
        if (options.skip) queryParams.set('skip', options.skip.toString());
        if (options.sort) {
            const sortVal = Array.isArray(options.sort) ? options.sort.join(',') : options.sort;
            queryParams.set('sort', sortVal);
        }
        
        // Flatten simple KV pairs if filters exists
        if (options.filters) {
             Object.entries(options.filters).forEach(([k, v]) => {
                 if (v !== undefined && v !== null) {
                    queryParams.append(k, String(v));
                 }
             });
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

    update: async <T = any>(object: string, id: string, data: Partial<T>): Promise<T> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return res.json();
    },

    delete: async (object: string, id: string): Promise<{ success: boolean }> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    }
  };

  /**
   * Private Helpers
   */

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

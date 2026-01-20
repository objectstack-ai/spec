export interface ClientConfig {
  baseUrl: string;
  token?: string;
}

export interface DiscoveryResult {
  routes: {
    discovery: string;
    metadata: string;
    data: string;
    auth: string;
  };
  capabilities?: Record<string, boolean>;
}

export class ObjectStackClient {
  private baseUrl: string;
  private token?: string;
  private routes?: DiscoveryResult['routes'];

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.token = config.token;
  }

  /**
   * Initialize the client by discovering server capabilities and routes.
   */
  async connect() {
    try {
      const res = await this.fetch(`${this.baseUrl}/api/v1`);
      const data = await res.json();
      this.routes = data.routes;
      return data;
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
        // UI routes might not be in discovery map yet, assume convention or add to server
        // Convention from server/src/index.ts: /api/v1/ui/view/:object
        const res = await this.fetch(`${this.baseUrl}/api/v1/ui/view/${object}?type=${type}`);
        return res.json();
    }
  };

  /**
   * Data Operations
   */
  data = {
    find: async (object: string, query: any = {}) => {
        const route = this.getRoute('data');
        const queryString = new URLSearchParams(query).toString();
        const res = await this.fetch(`${this.baseUrl}${route}/${object}?${queryString}`);
        return res.json();
    },

    get: async (object: string, id: string) => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/${id}`);
        return res.json();
    },

    create: async (object: string, data: any) => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return res.json();
    },

    update: async (object: string, id: string, data: any) => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return res.json();
    },

    delete: async (object: string, id: string) => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    }
  };

  private getRoute(key: keyof DiscoveryResult['routes']): string {
    if (!this.routes) {
        throw new Error('Client not connected. Call client.connect() first.');
    }
    return this.routes[key];
  }

  private async fetch(url: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as any || {})
    };

    if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(url, {
        ...options,
        headers
    });

    if (res.status >= 400) {
        throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }

    return res;
  }
}

// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { QueryAST, SortNode, AggregationNode } from '@objectstack/spec/data';
import { 
  BatchUpdateRequest, 
  BatchUpdateResponse, 
  UpdateManyRequest,
  DeleteManyRequest,
  BatchOptions,
  MetadataCacheRequest,
  MetadataCacheResponse,
  StandardErrorCode,
  ErrorCategory,
  GetDiscoveryResponse,
  GetMetaTypesResponse,
  GetMetaItemsResponse,
  LoginRequest,
  SessionResponse,
  GetPresignedUrlRequest,
  PresignedUrlResponse,
  CompleteUploadRequest,
  FileUploadResponse
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

/**
 * Discovery Result
 * Re-export from @objectstack/spec/api for convenience
 */
export type DiscoveryResult = GetDiscoveryResponse;

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
  /** @deprecated Use `records` — aligned with FindDataResponseSchema */
  value?: T[];
  /** Spec-compliant: array of matching records */
  records: T[];
  /** @deprecated Use `total` — aligned with FindDataResponseSchema */
  count?: number;
  /** Total number of matching records (if requested) */
  total?: number;
  /** The object name */
  object?: string;
  /** Whether more records are available */
  hasMore?: boolean;
}

/** Spec: GetDataResponseSchema */
export interface GetDataResult<T = any> {
  object: string;
  id: string;
  record: T;
}

/** Spec: CreateDataResponseSchema */
export interface CreateDataResult<T = any> {
  object: string;
  id: string;
  record: T;
}

/** Spec: UpdateDataResponseSchema */
export interface UpdateDataResult<T = any> {
  object: string;
  id: string;
  record: T;
}

/** Spec: DeleteDataResponseSchema */
export interface DeleteDataResult {
  object: string;
  id: string;
  deleted: boolean;
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
  private discoveryInfo?: DiscoveryResult;
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
   * Initialize the client by discovering server capabilities.
   */
  async connect() {
    this.logger.debug('Connecting to ObjectStack server', { baseUrl: this.baseUrl });
    
    try {
      let data: DiscoveryResult | undefined;

      // 1. Try Standard Discovery (.well-known)
      try {
        let wellKnownUrl: string;
        try {
          // If baseUrl is absolute, get origin
          const url = new URL(this.baseUrl);
          wellKnownUrl = `${url.origin}/.well-known/objectstack`;
        } catch {
          // If baseUrl is relative, use absolute path from root
          wellKnownUrl = '/.well-known/objectstack';
        }

        this.logger.debug('Probing .well-known discovery', { url: wellKnownUrl });
        const res = await this.fetchImpl(wellKnownUrl);
        if (res.ok) {
          const body = await res.json();
          data = body.data || body;
          this.logger.debug('Discovered via .well-known');
        }
      } catch (e) {
        this.logger.debug('Standard discovery probe failed', { error: (e as Error).message });
      }

      // 2. Fallback to Legacy/Direct Path /api/v1
      if (!data) {
        const fallbackUrl = `${this.baseUrl}/api/v1`;
        this.logger.debug('Falling back to legacy discovery', { url: fallbackUrl });
        const res = await this.fetchImpl(fallbackUrl);
        if (!res.ok) {
           throw new Error(`Failed to connect to ${fallbackUrl}: ${res.statusText}`);
        }
        const body = await res.json();
        data = body.data || body;
      }

      if (!data) {
         throw new Error('Connection failed: No discovery data returned');
      }

      this.discoveryInfo = data;
      
      this.logger.info('Connected to ObjectStack server', { 
        version: data.version,
        apiName: data.apiName,
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
    /**
     * Get all available metadata types
     * Returns types like 'object', 'plugin', 'view', etc.
     */
    getTypes: async (): Promise<GetMetaTypesResponse> => {
        const route = this.getRoute('metadata');
        const res = await this.fetch(`${this.baseUrl}${route}`);
        return this.unwrapResponse<GetMetaTypesResponse>(res);
    },

    /**
     * Get all items of a specific metadata type
     * @param type - Metadata type name (e.g., 'object', 'plugin')
     * @param options - Optional filters (e.g., packageId to scope by package)
     */
    getItems: async (type: string, options?: { packageId?: string }): Promise<GetMetaItemsResponse> => {
        const route = this.getRoute('metadata');
        const params = new URLSearchParams();
        if (options?.packageId) params.set('package', options.packageId);
        const qs = params.toString();
        const url = `${this.baseUrl}${route}/${type}${qs ? `?${qs}` : ''}`;
        const res = await this.fetch(url);
        return this.unwrapResponse<GetMetaItemsResponse>(res);
    },

    /**
     * Get a specific object definition by name
     * @deprecated Use `getItem('object', name)` instead for consistency with spec protocol
     * @param name - Object name (snake_case identifier)
     */
    getObject: async (name: string) => {
        const route = this.getRoute('metadata');
        const res = await this.fetch(`${this.baseUrl}${route}/object/${name}`);
        return this.unwrapResponse(res);
    },

    /**
     * Get a specific metadata item by type and name
     * @param type - Metadata type (e.g., 'object', 'plugin')
     * @param name - Item name (snake_case identifier)
     */
    getItem: async (type: string, name: string) => {
        const route = this.getRoute('metadata');
        const res = await this.fetch(`${this.baseUrl}${route}/${type}/${name}`);
        return this.unwrapResponse(res);
    },

    /**
     * Save a metadata item
     * @param type - Metadata type (e.g., 'object', 'plugin')
     * @param name - Item name
     * @param item - The metadata content to save
     */
    saveItem: async (type: string, name: string, item: any) => {
        const route = this.getRoute('metadata');
        const res = await this.fetch(`${this.baseUrl}${route}/${type}/${name}`, {
            method: 'PUT',
            body: JSON.stringify(item)
        });
        return this.unwrapResponse(res);
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
        return this.unwrapResponse(res);
    }
  };

  /**
   * Analytics Services
   */
  analytics = {
    query: async (payload: any) => {
      const route = this.getRoute('analytics');
      const res = await this.fetch(`${this.baseUrl}${route}/query`, {
         method: 'POST',
         body: JSON.stringify(payload)
      });
      return res.json();
    },
    meta: async (cube: string) => {
        const route = this.getRoute('analytics');
        const res = await this.fetch(`${this.baseUrl}${route}/meta/${cube}`);
        return res.json();
    },
    explain: async (payload: any) => {
        const route = this.getRoute('analytics');
        const res = await this.fetch(`${this.baseUrl}${route}/explain`, {
            method: 'POST',
            body: JSON.stringify(payload)
         });
         return res.json();
    }
  };

  /**
   * Hub Management Services
   */
  hub = {
    spaces: {
        list: async () => {
            const route = this.getRoute('hub');
            const res = await this.fetch(`${this.baseUrl}${route}/spaces`);
            return res.json();
        },
        create: async (payload: any) => {
            const route = this.getRoute('hub');
            const res = await this.fetch(`${this.baseUrl}${route}/spaces`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            return res.json();
        }
    },
    plugins: {
        install: async (pkg: string, version?: string) => {
            const route = this.getRoute('hub');
            const res = await this.fetch(`${this.baseUrl}${route}/plugins/install`, {
                method: 'POST',
                body: JSON.stringify({ pkg, version })
            });
            return res.json();
        }
    }
  };

  /**
   * Package Management Services
   * 
   * Manages the lifecycle of installed packages.
   * A package (ManifestSchema) is the unit of installation.
   * An app (AppSchema) is a UI navigation definition within a package.
   * A package may contain 0, 1, or many apps, or be a pure functionality plugin.
   * 
   * Endpoints:
   * - GET    /packages               → list installed packages
   * - GET    /packages/:id           → get package details  
   * - POST   /packages               → install a package
   * - DELETE  /packages/:id           → uninstall a package
   * - PATCH  /packages/:id/enable    → enable a package
   * - PATCH  /packages/:id/disable   → disable a package
   */
  packages = {
    /**
     * List all installed packages with optional filters.
     */
    list: async (filters?: { status?: string; type?: string; enabled?: boolean }) => {
        const route = this.getRoute('packages');
        const params = new URLSearchParams();
        if (filters?.status) params.set('status', filters.status);
        if (filters?.type) params.set('type', filters.type);
        if (filters?.enabled !== undefined) params.set('enabled', String(filters.enabled));
        const qs = params.toString();
        const url = `${this.baseUrl}${route}${qs ? '?' + qs : ''}`;
        const res = await this.fetch(url);
        return this.unwrapResponse<{ packages: any[]; total: number }>(res);
    },

    /**
     * Get a specific installed package by its ID (reverse domain identifier).
     */
    get: async (id: string) => {
        const route = this.getRoute('packages');
        const res = await this.fetch(`${this.baseUrl}${route}/${encodeURIComponent(id)}`);
        return this.unwrapResponse<{ package: any }>(res);
    },

    /**
     * Install a new package from its manifest.
     */
    install: async (manifest: any, options?: { settings?: Record<string, any>; enableOnInstall?: boolean }) => {
        const route = this.getRoute('packages');
        const res = await this.fetch(`${this.baseUrl}${route}`, {
            method: 'POST',
            body: JSON.stringify({
                manifest,
                settings: options?.settings,
                enableOnInstall: options?.enableOnInstall,
            }),
        });
        return this.unwrapResponse<{ package: any; message?: string }>(res);
    },

    /**
     * Uninstall a package by its ID.
     */
    uninstall: async (id: string) => {
        const route = this.getRoute('packages');
        const res = await this.fetch(`${this.baseUrl}${route}/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });
        return this.unwrapResponse<{ id: string; success: boolean; message?: string }>(res);
    },

    /**
     * Enable a disabled package.
     */
    enable: async (id: string) => {
        const route = this.getRoute('packages');
        const res = await this.fetch(`${this.baseUrl}${route}/${encodeURIComponent(id)}/enable`, {
            method: 'PATCH',
        });
        return this.unwrapResponse<{ package: any; message?: string }>(res);
    },

    /**
     * Disable an installed package.
     */
    disable: async (id: string) => {
        const route = this.getRoute('packages');
        const res = await this.fetch(`${this.baseUrl}${route}/${encodeURIComponent(id)}/disable`, {
            method: 'PATCH',
        });
        return this.unwrapResponse<{ package: any; message?: string }>(res);
    },
  };

  /**
   * Authentication Services
   */
  auth = {
    login: async (request: LoginRequest): Promise<SessionResponse> => {
        const route = this.getRoute('auth');
        const res = await this.fetch(`${this.baseUrl}${route}/login`, {
            method: 'POST',
            body: JSON.stringify(request)
        });
        const data = await res.json();
        // Auto-set token if present in response
        if (data.data?.token) {
            this.token = data.data.token;
        }
        return data;
    },
    
    logout: async () => {
        const route = this.getRoute('auth');
        await this.fetch(`${this.baseUrl}${route}/logout`, { method: 'POST' });
        this.token = undefined;
    },

    me: async (): Promise<SessionResponse> => {
        const route = this.getRoute('auth');
        const res = await this.fetch(`${this.baseUrl}${route}/me`);
        return res.json();
    }
  };

  /**
   * Storage Services
   */
  storage = {
    upload: async (file: any, scope: string = 'user'): Promise<FileUploadResponse> => {
        // 1. Get Presigned URL
        const presignedReq: GetPresignedUrlRequest = {
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            scope
        };
        
        const route = this.getRoute('storage');
        const presignedRes = await this.fetch(`${this.baseUrl}${route}/upload/presigned`, {
            method: 'POST',
            body: JSON.stringify(presignedReq)
        });
        const { data: presigned } = await presignedRes.json() as { data: PresignedUrlResponse['data'] };

        // 2. Upload to Cloud directly (Bypass API Middleware to avoid Auth headers if using S3)
        // Use fetchImpl directly
        const uploadRes = await this.fetchImpl(presigned.uploadUrl, {
            method: presigned.method,
            headers: presigned.headers,
            body: file
        });

        if (!uploadRes.ok) {
            throw new Error(`Storage Upload Failed: ${uploadRes.statusText}`);
        }

        // 3. Complete Upload
        const completeReq: CompleteUploadRequest = {
            fileId: presigned.fileId
        };
        const completeRes = await this.fetch(`${this.baseUrl}${route}/upload/complete`, {
            method: 'POST',
            body: JSON.stringify(completeReq)
        });
        
        return completeRes.json();
    },
    
    getDownloadUrl: async (fileId: string): Promise<string> => {
        const route = this.getRoute('storage');
        const res = await this.fetch(`${this.baseUrl}${route}/files/${fileId}/url`);
        const data = await res.json();
        return data.url;
    }
  };

  /**
   * Automation Services
   */
  automation = {
      trigger: async (triggerName: string, payload: any) => {
          const route = this.getRoute('automation');
          const res = await this.fetch(`${this.baseUrl}${route}/trigger/${triggerName}`, {
              method: 'POST',
              body: JSON.stringify(payload)
          });
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
      return this.unwrapResponse<PaginatedResult<T>>(res);
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
        return this.unwrapResponse<PaginatedResult<T>>(res);
    },

    get: async <T = any>(object: string, id: string): Promise<GetDataResult<T>> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/${id}`);
        return this.unwrapResponse<GetDataResult<T>>(res);
    },

    create: async <T = any>(object: string, data: Partial<T>): Promise<CreateDataResult<T>> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return this.unwrapResponse<CreateDataResult<T>>(res);
    },

    createMany: async <T = any>(object: string, data: Partial<T>[]): Promise<T[]> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/createMany`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return this.unwrapResponse<T[]>(res);
    },

    update: async <T = any>(object: string, id: string, data: Partial<T>): Promise<UpdateDataResult<T>> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return this.unwrapResponse<UpdateDataResult<T>>(res);
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
        return this.unwrapResponse<BatchUpdateResponse>(res);
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
        return this.unwrapResponse<BatchUpdateResponse>(res);
    },

    delete: async (object: string, id: string): Promise<DeleteDataResult> => {
        const route = this.getRoute('data');
        const res = await this.fetch(`${this.baseUrl}${route}/${object}/${id}`, {
            method: 'DELETE'
        });
        return this.unwrapResponse<DeleteDataResult>(res);
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
        return this.unwrapResponse<BatchUpdateResponse>(res);
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

  /**
   * Unwrap the standard REST API response envelope.
   * The HTTP layer wraps responses as `{ success: boolean, data: T, meta? }`
   * (see BaseResponseSchema in contract.zod.ts).
   * This method strips the envelope and returns the inner `data` payload
   * so callers receive the spec-level type (e.g. GetMetaTypesResponse).
   */
  private async unwrapResponse<T>(res: Response): Promise<T> {
    const body = await res.json();
    // If the body has a `success` flag it's a BaseResponse envelope
    if (body && typeof body.success === 'boolean' && 'data' in body) {
      return body.data as T;
    }
    // Already unwrapped or non-standard
    return body as T;
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

  /**
   * Get the conventional route path for a given API endpoint type
   * ObjectStack uses standard conventions: /api/v1/data, /api/v1/meta, /api/v1/ui
   */
  private getRoute(type: 'data' | 'metadata' | 'ui' | 'auth' | 'analytics' | 'hub' | 'storage' | 'automation' | 'packages'): string {
    // 1. Use discovered routes if available
    // Note: Spec uses 'endpoints', mapped dynamically
    if (this.discoveryInfo?.endpoints && (this.discoveryInfo.endpoints as any)[type]) {
        return (this.discoveryInfo.endpoints as any)[type];
    }

    // 2. Fallback to conventions
    const routeMap: Record<string, string> = {
      data: '/api/v1/data',
      metadata: '/api/v1/meta',
      ui: '/api/v1/ui',
      auth: '/api/v1/auth',
      analytics: '/api/v1/analytics',
      hub: '/api/v1/hub',
      storage: '/api/v1/storage',
      automation: '/api/v1/automation',
      packages: '/api/v1/packages',
    };
    
    return routeMap[type] || `/api/v1/${type}`;
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
  ErrorCategory,
  GetDiscoveryResponse,
  GetMetaTypesResponse,
  GetMetaItemsResponse
} from '@objectstack/spec/api';

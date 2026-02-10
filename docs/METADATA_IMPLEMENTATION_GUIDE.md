# Implementation Guide: API and Client Extensions for Metadata Service

**Date:** 2025-02-10  
**Status:** Implementation Guide  
**Related:** [METADATA_SERVICE_EVALUATION.md](./METADATA_SERVICE_EVALUATION.md), [ADR-0002](./adr/0002-database-driven-metadata-storage.md)

---

## Overview

This guide provides step-by-step instructions for implementing the recommended API and client extensions to support database-driven metadata management, particularly for view metadata.

## Table of Contents

1. [API Interface Extensions](#1-api-interface-extensions)
2. [Client SDK Extensions](#2-client-sdk-extensions)
3. [Testing Strategy](#3-testing-strategy)
4. [Migration Path](#4-migration-path)
5. [Security Considerations](#5-security-considerations)

---

## 1. API Interface Extensions

### 1.1 Define View Response Schemas

**File:** `packages/spec/src/api/metadata.zod.ts`

```typescript
import { z } from 'zod';
import { BaseResponseSchema } from './contract.zod';
import { ViewSchema } from '../ui/view.zod';

/**
 * View Definition Response
 * Returns a complete view configuration
 */
export const ViewDefinitionResponseSchema = BaseResponseSchema.extend({
  data: ViewSchema.describe('View configuration'),
});

/**
 * View List Response
 * Returns multiple view configurations
 */
export const ViewListResponseSchema = BaseResponseSchema.extend({
  data: z.array(z.object({
    name: z.string(),
    object_name: z.string(),
    label: z.string().optional(),
    type: z.enum(['grid', 'kanban', 'calendar', 'timeline', 'gantt', 'map']),
    is_default: z.boolean().optional(),
  })).describe('List of view metadata'),
});

/**
 * View Creation/Update Request
 */
export const ViewMutationRequestSchema = z.object({
  name: z.string().optional().describe('View name (required for creation)'),
  object_name: z.string().describe('Target object name'),
  view: ViewSchema.describe('View configuration'),
  is_default: z.boolean().optional().describe('Set as default view'),
});

/**
 * View Mutation Response
 */
export const ViewMutationResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    name: z.string(),
    object_name: z.string(),
    created: z.boolean().describe('True if created, false if updated'),
  }),
});

export type ViewDefinitionResponse = z.infer<typeof ViewDefinitionResponseSchema>;
export type ViewListResponse = z.infer<typeof ViewListResponseSchema>;
export type ViewMutationRequest = z.infer<typeof ViewMutationRequestSchema>;
export type ViewMutationResponse = z.infer<typeof ViewMutationResponseSchema>;
```

### 1.2 Implement API Endpoints

**File:** `packages/rest/src/routes/metadata/views.ts` (NEW)

```typescript
import { Router } from 'express';
import { PluginContext } from '@objectstack/core';
import { 
  ViewDefinitionResponseSchema,
  ViewListResponseSchema,
  ViewMutationRequestSchema,
  ViewMutationResponseSchema 
} from '@objectstack/spec/api';

export function createViewRoutes(ctx: PluginContext) {
  const router = Router();
  const metadataService = ctx.getService('metadata');
  
  /**
   * GET /api/v1/metadata/views
   * List all views, optionally filtered by object
   */
  router.get('/', async (req, res, next) => {
    try {
      const { object } = req.query;
      
      let views;
      if (object) {
        // Load views for specific object
        const objectql = ctx.getService('objectql');
        views = await objectql.find('sys_view', {
          filters: [['object_name', '=', object]],
          sort: [{ field: 'name', order: 'asc' }]
        });
      } else {
        // Load all views
        views = await metadataService.loadMany('view');
      }
      
      const response = ViewListResponseSchema.parse({
        success: true,
        data: views,
      });
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  });
  
  /**
   * GET /api/v1/metadata/views/:name
   * Get a specific view definition
   */
  router.get('/:name', async (req, res, next) => {
    try {
      const { name } = req.params;
      
      const view = await metadataService.load('view', name);
      
      if (!view) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `View '${name}' not found`,
          }
        });
      }
      
      const response = ViewDefinitionResponseSchema.parse({
        success: true,
        data: view,
      });
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  });
  
  /**
   * POST /api/v1/metadata/views
   * Create a new view definition
   */
  router.post('/', async (req, res, next) => {
    try {
      const body = ViewMutationRequestSchema.parse(req.body);
      
      if (!body.name) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'View name is required for creation',
          }
        });
      }
      
      // Check if view already exists
      const existing = await metadataService.exists('view', body.name);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: `View '${body.name}' already exists`,
          }
        });
      }
      
      // Save to database
      const result = await metadataService.save('view', body.name, body.view);
      
      const response = ViewMutationResponseSchema.parse({
        success: true,
        data: {
          name: body.name,
          object_name: body.object_name,
          created: true,
        }
      });
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  });
  
  /**
   * PUT /api/v1/metadata/views/:name
   * Update an existing view definition
   */
  router.put('/:name', async (req, res, next) => {
    try {
      const { name } = req.params;
      const body = ViewMutationRequestSchema.parse(req.body);
      
      // Check if view exists
      const existing = await metadataService.exists('view', name);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `View '${name}' not found`,
          }
        });
      }
      
      // Update
      await metadataService.save('view', name, body.view);
      
      const response = ViewMutationResponseSchema.parse({
        success: true,
        data: {
          name,
          object_name: body.object_name,
          created: false,
        }
      });
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  });
  
  /**
   * DELETE /api/v1/metadata/views/:name
   * Delete a view definition
   */
  router.delete('/:name', async (req, res, next) => {
    try {
      const { name } = req.params;
      
      const objectql = ctx.getService('objectql');
      
      // Find the view
      const view = await objectql.findOne('sys_view', {
        filters: [['name', '=', name]]
      });
      
      if (!view) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `View '${name}' not found`,
          }
        });
      }
      
      // Delete
      await objectql.delete('sys_view', view._id);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  return router;
}
```

**Register routes:**

**File:** `packages/rest/src/routes/metadata/index.ts`

```typescript
import { Router } from 'express';
import { PluginContext } from '@objectstack/core';
import { createViewRoutes } from './views';

export function createMetadataRoutes(ctx: PluginContext) {
  const router = Router();
  
  // Existing routes
  router.get('/objects/:name', ...);
  router.get('/apps/:name', ...);
  
  // New view routes
  router.use('/views', createViewRoutes(ctx));
  
  return router;
}
```

### 1.3 Add Batch Operations Endpoint

**File:** `packages/rest/src/routes/metadata/batch.ts` (NEW)

```typescript
import { Router } from 'express';
import { PluginContext } from '@objectstack/core';
import { z } from 'zod';

const BatchLoadRequestSchema = z.object({
  requests: z.array(z.object({
    type: z.string(),
    name: z.string(),
  }))
});

export function createBatchRoutes(ctx: PluginContext) {
  const router = Router();
  const metadataService = ctx.getService('metadata');
  
  /**
   * POST /api/v1/metadata/batch/load
   * Load multiple metadata items in one request
   */
  router.post('/load', async (req, res, next) => {
    try {
      const { requests } = BatchLoadRequestSchema.parse(req.body);
      
      const results = await Promise.allSettled(
        requests.map(({ type, name }) => 
          metadataService.load(type, name)
        )
      );
      
      const data = results.map((result, index) => ({
        type: requests[index].type,
        name: requests[index].name,
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null,
      }));
      
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  });
  
  return router;
}
```

---

## 2. Client SDK Extensions

### 2.1 Create MetadataClient Class

**File:** `packages/client/src/metadata-client.ts` (NEW)

```typescript
import { HttpClient } from './http-client';
import type { 
  View,
  ObjectDefinitionResponse,
  AppDefinitionResponse,
  ViewDefinitionResponse,
  ViewListResponse,
  ViewMutationRequest,
  ViewMutationResponse 
} from '@objectstack/spec';

export class MetadataClient {
  constructor(private http: HttpClient) {}
  
  /**
   * Get object definition
   */
  async getObject(name: string): Promise<ObjectDefinitionResponse> {
    return this.http.get(`/api/v1/metadata/objects/${name}`);
  }
  
  /**
   * Get app definition
   */
  async getApp(name: string): Promise<AppDefinitionResponse> {
    return this.http.get(`/api/v1/metadata/apps/${name}`);
  }
  
  /**
   * Get view definition
   */
  async getView(name: string): Promise<ViewDefinitionResponse> {
    return this.http.get(`/api/v1/metadata/views/${name}`);
  }
  
  /**
   * List views, optionally filtered by object
   */
  async listViews(objectName?: string): Promise<ViewListResponse> {
    const url = objectName
      ? `/api/v1/metadata/views?object=${objectName}`
      : '/api/v1/metadata/views';
    
    return this.http.get(url);
  }
  
  /**
   * Create a new view
   */
  async createView(request: ViewMutationRequest): Promise<ViewMutationResponse> {
    return this.http.post('/api/v1/metadata/views', request);
  }
  
  /**
   * Update an existing view
   */
  async updateView(
    name: string,
    request: Omit<ViewMutationRequest, 'name'>
  ): Promise<ViewMutationResponse> {
    return this.http.put(`/api/v1/metadata/views/${name}`, request);
  }
  
  /**
   * Delete a view
   */
  async deleteView(name: string): Promise<void> {
    await this.http.delete(`/api/v1/metadata/views/${name}`);
  }
  
  /**
   * Batch load metadata
   */
  async loadBatch(requests: Array<{ type: string; name: string }>) {
    return this.http.post('/api/v1/metadata/batch/load', { requests });
  }
}
```

### 2.2 Integrate with Main Client

**File:** `packages/client/src/index.ts`

```typescript
import { MetadataClient } from './metadata-client';
import { HttpClient } from './http-client';

export class ObjectStackClient {
  private httpClient: HttpClient;
  public metadata: MetadataClient;
  
  constructor(config: { baseUrl: string; apiKey?: string }) {
    this.httpClient = new HttpClient(config);
    this.metadata = new MetadataClient(this.httpClient);
  }
  
  // ... other methods
}
```

### 2.3 React Hooks (Optional)

**File:** `packages/client-react/src/use-view.ts` (NEW)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useObjectStackClient } from './provider';
import type { View, ViewMutationRequest } from '@objectstack/spec';

export function useView(viewName: string) {
  const client = useObjectStackClient();
  
  return useQuery({
    queryKey: ['view', viewName],
    queryFn: () => client.metadata.getView(viewName),
  });
}

export function useViewList(objectName?: string) {
  const client = useObjectStackClient();
  
  return useQuery({
    queryKey: ['views', objectName],
    queryFn: () => client.metadata.listViews(objectName),
  });
}

export function useCreateView() {
  const client = useObjectStackClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: ViewMutationRequest) => 
      client.metadata.createView(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['views'] });
    },
  });
}

export function useUpdateView(viewName: string) {
  const client = useObjectStackClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: Omit<ViewMutationRequest, 'name'>) =>
      client.metadata.updateView(viewName, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['view', viewName] });
      queryClient.invalidateQueries({ queryKey: ['views'] });
    },
  });
}

export function useDeleteView() {
  const client = useObjectStackClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (viewName: string) => 
      client.metadata.deleteView(viewName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['views'] });
    },
  });
}
```

---

## 3. Testing Strategy

### 3.1 Unit Tests

**File:** `packages/rest/src/routes/metadata/views.test.ts`

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createTestServer } from '../../test-utils';

describe('Metadata Views API', () => {
  let server: any;
  
  beforeAll(async () => {
    server = await createTestServer();
  });
  
  it('GET /api/v1/metadata/views/:name should return view', async () => {
    const response = await request(server)
      .get('/api/v1/metadata/views/account_list')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });
  
  it('POST /api/v1/metadata/views should create view', async () => {
    const viewData = {
      name: 'test_view',
      object_name: 'account',
      view: {
        list: {
          type: 'grid',
          columns: ['name', 'status'],
          filter: []
        }
      }
    };
    
    const response = await request(server)
      .post('/api/v1/metadata/views')
      .send(viewData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.created).toBe(true);
  });
  
  // Add more tests...
});
```

### 3.2 Integration Tests

**File:** `packages/client/src/metadata-client.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { ObjectStackClient } from './index';

describe('MetadataClient', () => {
  const client = new ObjectStackClient({
    baseUrl: 'http://localhost:3000'
  });
  
  it('should fetch view definition', async () => {
    const response = await client.metadata.getView('account_list');
    
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
  
  it('should create and delete view', async () => {
    const createResponse = await client.metadata.createView({
      name: 'integration_test_view',
      object_name: 'account',
      view: {
        list: {
          type: 'grid',
          columns: ['name'],
          filter: []
        }
      }
    });
    
    expect(createResponse.success).toBe(true);
    
    // Cleanup
    await client.metadata.deleteView('integration_test_view');
  });
});
```

---

## 4. Migration Path

### Phase 1: Read-Only Support (Week 1)
- ✅ Implement GET endpoints for views
- ✅ Add client methods for fetching views
- ✅ Add tests for read operations

### Phase 2: Write Support (Week 2)
- ✅ Implement POST/PUT/DELETE endpoints
- ✅ Add client mutation methods
- ✅ Add validation and error handling

### Phase 3: Batch Operations (Week 3)
- ✅ Implement batch load endpoint
- ✅ Add client batch methods
- ✅ Performance testing

### Phase 4: Production Readiness (Week 4)
- ✅ Add caching layer
- ✅ Implement RBAC
- ✅ Comprehensive E2E tests
- ✅ Documentation update

---

## 5. Security Considerations

### 5.1 Authentication

All metadata mutation endpoints require authentication:

```typescript
router.post('/', authenticateUser, async (req, res, next) => {
  // Only authenticated users can create views
});
```

### 5.2 Authorization

Implement role-based access control:

```typescript
router.delete('/:name', requireRole('admin'), async (req, res, next) => {
  // Only admins can delete views
});
```

### 5.3 Input Validation

Always validate input using Zod schemas:

```typescript
const body = ViewMutationRequestSchema.parse(req.body);
// Throws if validation fails
```

### 5.4 Rate Limiting

Add rate limiting for metadata mutations:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.post('/views', limiter, ...);
```

---

## Summary Checklist

### API Implementation
- [ ] Add view response schemas to `@objectstack/spec`
- [ ] Create view routes in `@objectstack/rest`
- [ ] Implement batch operations endpoint
- [ ] Add validation and error handling
- [ ] Write API unit tests
- [ ] Update OpenAPI documentation

### Client Implementation
- [ ] Create `MetadataClient` class
- [ ] Add view CRUD methods
- [ ] Add batch loading method
- [ ] Write client unit tests
- [ ] Add React hooks (optional)
- [ ] Update client documentation

### Testing & Quality
- [ ] Unit tests for all endpoints
- [ ] Integration tests for client
- [ ] E2E tests for complete workflow
- [ ] Performance testing
- [ ] Security audit

### Documentation
- [ ] API reference documentation
- [ ] Client SDK usage guide
- [ ] Migration guide
- [ ] Security best practices

---

**Document Version:** 1.0  
**Last Updated:** 2025-02-10  
**Author:** ObjectStack Engineering Team

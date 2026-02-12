// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * @objectstack/hono — Comprehensive Metadata API Integration Tests
 *
 * Validates that the Hono adapter correctly routes ALL metadata API operations
 * defined by the @objectstack/metadata package through the HttpDispatcher.
 *
 * Covers: CRUD, Query, Bulk, Overlay, Import/Export, Validation, Type Registry, Dependencies
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

// Mock dispatcher instance with all metadata-related handlers
const mockDispatcher = {
  getDiscoveryInfo: vi.fn().mockReturnValue({ version: '1.0', endpoints: [] }),
  handleAuth: vi.fn().mockResolvedValue({ handled: true, response: { body: { ok: true }, status: 200 } }),
  handleGraphQL: vi.fn().mockResolvedValue({ data: {} }),
  handleMetadata: vi.fn().mockResolvedValue({ handled: true, response: { body: { success: true }, status: 200 } }),
  handleData: vi.fn().mockResolvedValue({ handled: true, response: { body: { records: [] }, status: 200 } }),
  handleAnalytics: vi.fn().mockResolvedValue({ handled: true, response: { body: {}, status: 200 } }),
  handleAutomation: vi.fn().mockResolvedValue({ handled: true, response: { body: {}, status: 200 } }),
  handleStorage: vi.fn().mockResolvedValue({ handled: true, response: { body: {}, status: 200 } }),
  handlePackages: vi.fn().mockResolvedValue({ handled: true, response: { body: {}, status: 200 } }),
};

vi.mock('@objectstack/runtime', () => {
  return {
    HttpDispatcher: function HttpDispatcher() {
      return mockDispatcher;
    },
  };
});

import { createHonoApp } from './index';

const mockKernel = { name: 'test-kernel' } as any;

describe('Hono Metadata API Integration Tests', () => {
  let app: ReturnType<typeof createHonoApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createHonoApp({ kernel: mockKernel });
  });

  // ==========================================
  // CRUD Operations
  // ==========================================

  describe('CRUD Operations', () => {
    describe('GET /api/meta/objects — List all objects', () => {
      it('dispatches to handleMetadata with correct path and method', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: [
                { name: 'account', label: 'Account' },
                { name: 'contact', label: 'Contact' },
              ],
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/objects');
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data).toHaveLength(2);
        expect(mockDispatcher.handleMetadata).toHaveBeenCalledWith(
          '/objects',
          expect.objectContaining({ request: expect.any(Request) }),
          'GET',
          undefined,
          expect.any(Object),
        );
      });
    });

    describe('GET /api/meta/objects/account — Get single object', () => {
      it('dispatches to handleMetadata with item-level path', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: { type: 'object', name: 'account', definition: { label: 'Account' } },
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/objects/account');
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.name).toBe('account');
        expect(mockDispatcher.handleMetadata).toHaveBeenCalledWith(
          '/objects/account',
          expect.objectContaining({ request: expect.any(Request) }),
          'GET',
          undefined,
          expect.any(Object),
        );
      });
    });

    describe('POST /api/meta/objects — Register metadata', () => {
      it('dispatches POST with JSON body to handleMetadata', async () => {
        const body = {
          type: 'object',
          name: 'project_task',
          data: { label: 'Project Task', fields: {} },
        };

        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: { body: { success: true }, status: 201 },
        });

        const res = await app.request('/api/meta/objects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        expect(res.status).toBe(201);
        expect(mockDispatcher.handleMetadata).toHaveBeenCalledWith(
          '/objects',
          expect.objectContaining({ request: expect.any(Request) }),
          'POST',
          body,
          expect.any(Object),
        );
      });
    });

    describe('PUT /api/meta/objects/account — Update metadata', () => {
      it('dispatches PUT with JSON body to handleMetadata', async () => {
        const body = { label: 'Updated Account' };

        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: { body: { success: true }, status: 200 },
        });

        const res = await app.request('/api/meta/objects/account', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        expect(res.status).toBe(200);
        expect(mockDispatcher.handleMetadata).toHaveBeenCalledWith(
          '/objects/account',
          expect.objectContaining({ request: expect.any(Request) }),
          'PUT',
          body,
          expect.any(Object),
        );
      });
    });

    describe('DELETE /api/meta/objects/old_entity — Delete metadata', () => {
      it('dispatches DELETE to handleMetadata', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: { success: true, data: { type: 'object', name: 'old_entity' } },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/objects/old_entity', { method: 'DELETE' });
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.name).toBe('old_entity');
      });
    });

    describe('GET /api/meta/objects/account/exists — Check existence', () => {
      it('dispatches existence check', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: { success: true, data: { exists: true } },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/objects/account/exists');
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.exists).toBe(true);
      });
    });

    describe('GET /api/meta/objects/names — List names', () => {
      it('dispatches names listing', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: { success: true, data: ['account', 'contact', 'lead'] },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/objects/names');
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data).toHaveLength(3);
      });
    });

    describe('Multiple metadata types', () => {
      it('GET /api/meta/views dispatches for views', async () => {
        const res = await app.request('/api/meta/views');
        expect(mockDispatcher.handleMetadata).toHaveBeenCalledWith(
          '/views',
          expect.objectContaining({ request: expect.any(Request) }),
          'GET',
          undefined,
          expect.any(Object),
        );
      });

      it('GET /api/meta/flows dispatches for flows', async () => {
        const res = await app.request('/api/meta/flows');
        expect(mockDispatcher.handleMetadata).toHaveBeenCalledWith(
          '/flows',
          expect.objectContaining({ request: expect.any(Request) }),
          'GET',
          undefined,
          expect.any(Object),
        );
      });

      it('GET /api/meta/agents dispatches for agents', async () => {
        const res = await app.request('/api/meta/agents');
        expect(mockDispatcher.handleMetadata).toHaveBeenCalledWith(
          '/agents',
          expect.objectContaining({ request: expect.any(Request) }),
          'GET',
          undefined,
          expect.any(Object),
        );
      });
    });
  });

  // ==========================================
  // Query / Search
  // ==========================================

  describe('Query / Search', () => {
    describe('POST /api/meta/query — Advanced search', () => {
      it('dispatches query with full filter payload', async () => {
        const queryBody = {
          types: ['object', 'view'],
          search: 'account',
          scope: 'platform',
          state: 'active',
          sortBy: 'updatedAt',
          sortOrder: 'desc',
          page: 1,
          pageSize: 25,
        };

        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: {
                items: [{ type: 'object', name: 'account', label: 'Account' }],
                total: 1,
                page: 1,
                pageSize: 25,
              },
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(queryBody),
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.items).toHaveLength(1);
        expect(json.data.total).toBe(1);
      });
    });
  });

  // ==========================================
  // Bulk Operations
  // ==========================================

  describe('Bulk Operations', () => {
    describe('POST /api/meta/bulk/register — Bulk register', () => {
      it('dispatches bulk register with items', async () => {
        const bulkBody = {
          items: [
            { type: 'object', name: 'customer', data: { label: 'Customer' } },
            { type: 'view', name: 'customer_list', data: { label: 'Customer List' } },
          ],
          continueOnError: true,
        };

        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: { total: 2, succeeded: 2, failed: 0 },
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/bulk/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bulkBody),
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.succeeded).toBe(2);
      });
    });

    describe('POST /api/meta/bulk/unregister — Bulk unregister', () => {
      it('dispatches bulk unregister', async () => {
        const body = {
          items: [
            { type: 'object', name: 'old_object' },
            { type: 'view', name: 'old_view' },
          ],
        };

        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: { success: true, data: { total: 2, succeeded: 2, failed: 0 } },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/bulk/unregister', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.succeeded).toBe(2);
      });
    });

    describe('Bulk operation with partial failures', () => {
      it('returns error details for failed items', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: {
                total: 3,
                succeeded: 2,
                failed: 1,
                errors: [{ type: 'object', name: 'bad_item', error: 'Validation failed' }],
              },
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/bulk/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [
              { type: 'object', name: 'good', data: {} },
              { type: 'object', name: 'good2', data: {} },
              { type: 'object', name: 'bad_item', data: {} },
            ],
            continueOnError: true,
          }),
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.failed).toBe(1);
        expect(json.data.errors[0].name).toBe('bad_item');
      });
    });
  });

  // ==========================================
  // Overlay / Customization
  // ==========================================

  describe('Overlay / Customization', () => {
    describe('GET /api/meta/objects/account/overlay — Get overlay', () => {
      it('dispatches overlay retrieval', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: {
                id: 'overlay-001',
                baseType: 'object',
                baseName: 'account',
                scope: 'platform',
                patch: { fields: { status: { label: 'Custom Status' } } },
              },
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/objects/account/overlay');
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.scope).toBe('platform');
      });
    });

    describe('PUT /api/meta/objects/account/overlay — Save overlay', () => {
      it('dispatches overlay save with body', async () => {
        const overlayBody = {
          id: 'overlay-002',
          baseType: 'object',
          baseName: 'account',
          scope: 'platform',
          patch: { fields: { status: { label: 'Account Status' } } },
        };

        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: { body: { success: true }, status: 200 },
        });

        const res = await app.request('/api/meta/objects/account/overlay', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(overlayBody),
        });

        expect(res.status).toBe(200);
        expect(mockDispatcher.handleMetadata).toHaveBeenCalledWith(
          '/objects/account/overlay',
          expect.objectContaining({ request: expect.any(Request) }),
          'PUT',
          overlayBody,
          expect.any(Object),
        );
      });
    });

    describe('DELETE /api/meta/objects/account/overlay — Remove overlay', () => {
      it('dispatches overlay removal', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: { body: { success: true }, status: 200 },
        });

        const res = await app.request('/api/meta/objects/account/overlay', { method: 'DELETE' });
        expect(res.status).toBe(200);
      });
    });

    describe('GET /api/meta/objects/account/effective — Get effective metadata', () => {
      it('dispatches effective (merged) metadata retrieval', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: {
                name: 'account',
                label: 'Account',
                fields: { status: { label: 'Custom Status' } },
              },
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/objects/account/effective');
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.fields.status.label).toBe('Custom Status');
      });
    });
  });

  // ==========================================
  // Import / Export
  // ==========================================

  describe('Import / Export', () => {
    describe('POST /api/meta/export — Export metadata', () => {
      it('dispatches export request', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: { version: '1.0', objects: { account: {} }, views: {} },
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ types: ['object', 'view'], format: 'json' }),
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.version).toBe('1.0');
      });
    });

    describe('POST /api/meta/import — Import metadata', () => {
      it('dispatches import request', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: { total: 5, imported: 4, skipped: 1, failed: 0 },
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: { objects: { customer: {} } },
            conflictResolution: 'merge',
            validate: true,
          }),
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.imported).toBe(4);
        expect(json.data.skipped).toBe(1);
      });
    });

    describe('POST /api/meta/import — Dry run', () => {
      it('returns import preview without saving', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: { total: 3, imported: 0, skipped: 0, failed: 0 },
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: {}, dryRun: true }),
        });

        expect(res.status).toBe(200);
      });
    });
  });

  // ==========================================
  // Validation
  // ==========================================

  describe('Validation', () => {
    describe('POST /api/meta/validate — Validate metadata', () => {
      it('dispatches validation for valid payload', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: { success: true, data: { valid: true } },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'object', data: { name: 'test', fields: {} } }),
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.valid).toBe(true);
      });

      it('returns errors for invalid payload', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: {
                valid: false,
                errors: [{ path: 'name', message: 'Required', code: 'required' }],
              },
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'object', data: {} }),
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.valid).toBe(false);
        expect(json.data.errors).toHaveLength(1);
      });
    });
  });

  // ==========================================
  // Type Registry
  // ==========================================

  describe('Type Registry', () => {
    describe('GET /api/meta/types — List registered types', () => {
      it('returns all registered metadata types', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: ['object', 'field', 'view', 'page', 'dashboard', 'app', 'flow', 'agent'],
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/types');
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data).toContain('object');
        expect(json.data).toContain('agent');
      });
    });

    describe('GET /api/meta/types/object — Get type info', () => {
      it('returns type metadata details', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: {
                type: 'object',
                label: 'Object',
                description: 'Business entity definition',
                filePatterns: ['**/*.object.ts'],
                supportsOverlay: true,
                domain: 'data',
              },
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/types/object');
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.domain).toBe('data');
        expect(json.data.supportsOverlay).toBe(true);
      });
    });
  });

  // ==========================================
  // Dependency Tracking
  // ==========================================

  describe('Dependency Tracking', () => {
    describe('GET /api/meta/objects/account/dependencies — Get dependencies', () => {
      it('returns items this item depends on', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: [
                {
                  sourceType: 'object',
                  sourceName: 'account',
                  targetType: 'object',
                  targetName: 'organization',
                  kind: 'reference',
                },
              ],
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/objects/account/dependencies');
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data).toHaveLength(1);
        expect(json.data[0].kind).toBe('reference');
      });
    });

    describe('GET /api/meta/objects/account/dependents — Get dependents', () => {
      it('returns items that depend on this item', async () => {
        mockDispatcher.handleMetadata.mockResolvedValueOnce({
          handled: true,
          response: {
            body: {
              success: true,
              data: [
                {
                  sourceType: 'view',
                  sourceName: 'account_list',
                  targetType: 'object',
                  targetName: 'account',
                  kind: 'reference',
                },
                {
                  sourceType: 'flow',
                  sourceName: 'new_account_flow',
                  targetType: 'object',
                  targetName: 'account',
                  kind: 'triggers',
                },
              ],
            },
            status: 200,
          },
        });

        const res = await app.request('/api/meta/objects/account/dependents');
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data).toHaveLength(2);
      });
    });
  });

  // ==========================================
  // Error Handling
  // ==========================================

  describe('Error Handling', () => {
    it('returns 404 when metadata not found', async () => {
      mockDispatcher.handleMetadata.mockResolvedValueOnce({ handled: false });

      const res = await app.request('/api/meta/objects/nonexistent');
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it('returns 500 on dispatcher exception', async () => {
      mockDispatcher.handleMetadata.mockRejectedValueOnce(new Error('Internal error'));

      const res = await app.request('/api/meta/objects');
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toBe('Internal error');
    });

    it('returns custom status code from error', async () => {
      mockDispatcher.handleMetadata.mockRejectedValueOnce(
        Object.assign(new Error('Forbidden'), { statusCode: 403 }),
      );

      const res = await app.request('/api/meta/objects');
      expect(res.status).toBe(403);
    });

    it('handles malformed JSON body gracefully', async () => {
      const res = await app.request('/api/meta/objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json',
      });
      // Should still route to handleMetadata with empty body fallback
      expect(mockDispatcher.handleMetadata).toHaveBeenCalled();
    });
  });

  // ==========================================
  // Path Parsing
  // ==========================================

  describe('Path Parsing', () => {
    it('correctly parses nested paths', async () => {
      await app.request('/api/meta/objects/account/fields/name');
      expect(mockDispatcher.handleMetadata).toHaveBeenCalledWith(
        '/objects/account/fields/name',
        expect.any(Object),
        'GET',
        undefined,
        expect.any(Object),
      );
    });

    it('correctly parses path with query string', async () => {
      await app.request('/api/meta/objects?scope=platform&state=active');
      expect(mockDispatcher.handleMetadata).toHaveBeenCalledWith(
        '/objects',
        expect.any(Object),
        'GET',
        undefined,
        expect.objectContaining({ scope: 'platform', state: 'active' }),
      );
    });

    it('handles root metadata path', async () => {
      await app.request('/api/meta');
      expect(mockDispatcher.handleMetadata).toHaveBeenCalledWith(
        '',
        expect.any(Object),
        'GET',
        undefined,
        expect.any(Object),
      );
    });
  });
});

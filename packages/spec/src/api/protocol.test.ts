import { describe, it, expect } from 'vitest';
import {
  GetDiscoveryRequestSchema,
  GetDiscoveryResponseSchema,
  GetMetaTypesRequestSchema,
  GetMetaTypesResponseSchema,
  GetMetaItemsRequestSchema,
  GetMetaItemsResponseSchema,
  GetMetaItemRequestSchema,
  GetMetaItemResponseSchema,
  GetUiViewRequestSchema,
  GetUiViewResponseSchema,
  FindDataRequestSchema,
  FindDataResponseSchema,
  GetDataRequestSchema,
  GetDataResponseSchema,
  CreateDataRequestSchema,
  CreateDataResponseSchema,
  UpdateDataRequestSchema,
  UpdateDataResponseSchema,
  DeleteDataRequestSchema,
  DeleteDataResponseSchema,
  BatchDataRequestSchema,
  CreateManyDataRequestSchema,
  CreateManyDataResponseSchema,
  UpdateManyDataRequestSchema,
  DeleteManyDataRequestSchema,
} from './protocol.zod';

describe('Discovery & Metadata Operations', () => {
  describe('GetDiscoveryRequestSchema', () => {
    it('should accept empty request', () => {
      const request = GetDiscoveryRequestSchema.parse({});
      expect(request).toEqual({});
    });
  });

  describe('GetDiscoveryResponseSchema', () => {
    it('should accept basic response', () => {
      const response = GetDiscoveryResponseSchema.parse({
        version: 'v1',
        apiName: 'ObjectStack API',
      });

      expect(response.version).toBe('v1');
      expect(response.apiName).toBe('ObjectStack API');
    });

    it('should accept response with capabilities', () => {
      const response = GetDiscoveryResponseSchema.parse({
        version: 'v1',
        apiName: 'ObjectStack API',
        capabilities: ['crud', 'batch', 'realtime'],
      });

      expect(response.capabilities).toHaveLength(3);
    });

    it('should accept response with endpoints', () => {
      const response = GetDiscoveryResponseSchema.parse({
        version: 'v1',
        apiName: 'ObjectStack API',
        endpoints: {
          data: '/api/v1/data',
          meta: '/api/v1/meta',
        },
      });

      expect(response.endpoints).toBeDefined();
    });
  });

  describe('GetMetaTypesRequestSchema', () => {
    it('should accept empty request', () => {
      const request = GetMetaTypesRequestSchema.parse({});
      expect(request).toEqual({});
    });
  });

  describe('GetMetaTypesResponseSchema', () => {
    it('should accept metadata types', () => {
      const response = GetMetaTypesResponseSchema.parse({
        types: ['object', 'plugin', 'view', 'flow'],
      });

      expect(response.types).toHaveLength(4);
    });
  });

  describe('GetMetaItemsRequestSchema', () => {
    it('should accept type parameter', () => {
      const request = GetMetaItemsRequestSchema.parse({
        type: 'object',
      });

      expect(request.type).toBe('object');
    });

    it('should reject request without type', () => {
      expect(() => GetMetaItemsRequestSchema.parse({})).toThrow();
    });
  });

  describe('GetMetaItemsResponseSchema', () => {
    it('should accept items response', () => {
      const response = GetMetaItemsResponseSchema.parse({
        type: 'object',
        items: [
          { name: 'account', label: 'Account' },
          { name: 'contact', label: 'Contact' },
        ],
      });

      expect(response.type).toBe('object');
      expect(response.items).toHaveLength(2);
    });

    it('should accept empty items', () => {
      const response = GetMetaItemsResponseSchema.parse({
        type: 'object',
        items: [],
      });

      expect(response.items).toHaveLength(0);
    });
  });

  describe('GetMetaItemRequestSchema', () => {
    it('should accept type and name', () => {
      const request = GetMetaItemRequestSchema.parse({
        type: 'object',
        name: 'account',
      });

      expect(request.type).toBe('object');
      expect(request.name).toBe('account');
    });

    it('should reject request without type', () => {
      expect(() => GetMetaItemRequestSchema.parse({
        name: 'account',
      })).toThrow();
    });

    it('should reject request without name', () => {
      expect(() => GetMetaItemRequestSchema.parse({
        type: 'object',
      })).toThrow();
    });
  });

  describe('GetMetaItemResponseSchema', () => {
    it('should accept item response', () => {
      const response = GetMetaItemResponseSchema.parse({
        type: 'object',
        name: 'account',
        item: {
          name: 'account',
          label: 'Account',
          fields: {},
        },
      });

      expect(response.type).toBe('object');
      expect(response.name).toBe('account');
      expect(response.item).toBeDefined();
    });
  });

  describe('GetUiViewRequestSchema', () => {
    it('should accept list view request', () => {
      const request = GetUiViewRequestSchema.parse({
        object: 'account',
        type: 'list',
      });

      expect(request.object).toBe('account');
      expect(request.type).toBe('list');
    });

    it('should accept form view request', () => {
      const request = GetUiViewRequestSchema.parse({
        object: 'contact',
        type: 'form',
      });

      expect(request.type).toBe('form');
    });

    it('should reject invalid view type', () => {
      expect(() => GetUiViewRequestSchema.parse({
        object: 'account',
        type: 'invalid',
      })).toThrow();
    });
  });

  describe('GetUiViewResponseSchema', () => {
    it('should accept view response', () => {
      const response = GetUiViewResponseSchema.parse({
        object: 'account',
        type: 'list',
        view: {
          columns: ['name', 'email'],
        },
      });

      expect(response.object).toBe('account');
      expect(response.type).toBe('list');
      expect(response.view).toBeDefined();
    });
  });
});

describe('Data Operations', () => {
  describe('FindDataRequestSchema', () => {
    it('should accept basic find request', () => {
      const request = FindDataRequestSchema.parse({
        object: 'account',
      });

      expect(request.object).toBe('account');
    });

    it('should accept find with query', () => {
      const request = FindDataRequestSchema.parse({
        object: 'account',
        query: {
          object: 'account',
          where: { status: 'active' },
          limit: 10,
        },
      });

      expect(request.query).toBeDefined();
    });

    it('should reject request without object', () => {
      expect(() => FindDataRequestSchema.parse({})).toThrow();
    });
  });

  describe('FindDataResponseSchema', () => {
    it('should accept find response', () => {
      const response = FindDataResponseSchema.parse({
        object: 'account',
        records: [
          { id: '1', name: 'Account 1' },
          { id: '2', name: 'Account 2' },
        ],
      });

      expect(response.object).toBe('account');
      expect(response.records).toHaveLength(2);
    });

    it('should accept response with total', () => {
      const response = FindDataResponseSchema.parse({
        object: 'account',
        records: [],
        total: 100,
        hasMore: true,
      });

      expect(response.total).toBe(100);
      expect(response.hasMore).toBe(true);
    });
  });

  describe('GetDataRequestSchema', () => {
    it('should accept get request', () => {
      const request = GetDataRequestSchema.parse({
        object: 'account',
        id: '123',
      });

      expect(request.object).toBe('account');
      expect(request.id).toBe('123');
    });

    it('should reject request without id', () => {
      expect(() => GetDataRequestSchema.parse({
        object: 'account',
      })).toThrow();
    });
  });

  describe('GetDataResponseSchema', () => {
    it('should accept get response', () => {
      const response = GetDataResponseSchema.parse({
        object: 'account',
        id: '123',
        record: { id: '123', name: 'Account 1' },
      });

      expect(response.id).toBe('123');
      expect(response.record).toBeDefined();
    });
  });

  describe('CreateDataRequestSchema', () => {
    it('should accept create request', () => {
      const request = CreateDataRequestSchema.parse({
        object: 'account',
        data: { name: 'New Account', industry: 'Technology' },
      });

      expect(request.object).toBe('account');
      expect(request.data.name).toBe('New Account');
    });

    it('should accept create with nested data', () => {
      const request = CreateDataRequestSchema.parse({
        object: 'contact',
        data: {
          first_name: 'John',
          last_name: 'Doe',
          address: {
            street: '123 Main St',
            city: 'New York',
          },
        },
      });

      expect(request.data.address).toBeDefined();
    });
  });

  describe('CreateDataResponseSchema', () => {
    it('should accept create response', () => {
      const response = CreateDataResponseSchema.parse({
        object: 'account',
        id: '123',
        record: { id: '123', name: 'New Account' },
      });

      expect(response.id).toBe('123');
      expect(response.record).toBeDefined();
    });
  });

  describe('UpdateDataRequestSchema', () => {
    it('should accept update request', () => {
      const request = UpdateDataRequestSchema.parse({
        object: 'account',
        id: '123',
        data: { status: 'active' },
      });

      expect(request.object).toBe('account');
      expect(request.id).toBe('123');
      expect(request.data.status).toBe('active');
    });

    it('should accept partial update', () => {
      const request = UpdateDataRequestSchema.parse({
        object: 'contact',
        id: '456',
        data: { email: 'updated@example.com' },
      });

      expect(request.data.email).toBe('updated@example.com');
    });
  });

  describe('UpdateDataResponseSchema', () => {
    it('should accept update response', () => {
      const response = UpdateDataResponseSchema.parse({
        object: 'account',
        id: '123',
        record: { id: '123', status: 'active' },
      });

      expect(response.id).toBe('123');
      expect(response.record).toBeDefined();
    });
  });

  describe('DeleteDataRequestSchema', () => {
    it('should accept delete request', () => {
      const request = DeleteDataRequestSchema.parse({
        object: 'account',
        id: '123',
      });

      expect(request.object).toBe('account');
      expect(request.id).toBe('123');
    });
  });

  describe('DeleteDataResponseSchema', () => {
    it('should accept delete response', () => {
      const response = DeleteDataResponseSchema.parse({
        object: 'account',
        id: '123',
        success: true,
      });

      expect(response.success).toBe(true);
      expect(response.id).toBe('123');
    });

    it('should accept failed delete', () => {
      const response = DeleteDataResponseSchema.parse({
        object: 'account',
        id: '123',
        success: false,
      });

      expect(response.success).toBe(false);
    });
  });
});

describe('Batch Operations', () => {
  describe('BatchDataRequestSchema', () => {
    it('should accept batch request', () => {
      const request = BatchDataRequestSchema.parse({
        object: 'account',
        request: {
          operation: 'update',
          records: [
            { id: '1', data: { status: 'active' } },
            { id: '2', data: { status: 'inactive' } },
          ],
        },
      });

      expect(request.object).toBe('account');
      expect(request.request).toBeDefined();
    });
  });

  describe('CreateManyDataRequestSchema', () => {
    it('should accept create many request', () => {
      const request = CreateManyDataRequestSchema.parse({
        object: 'contact',
        records: [
          { first_name: 'John', last_name: 'Doe' },
          { first_name: 'Jane', last_name: 'Smith' },
        ],
      });

      expect(request.object).toBe('contact');
      expect(request.records).toHaveLength(2);
    });

    it('should accept empty records array', () => {
      const request = CreateManyDataRequestSchema.parse({
        object: 'contact',
        records: [],
      });

      expect(request.records).toHaveLength(0);
    });
  });

  describe('CreateManyDataResponseSchema', () => {
    it('should accept create many response', () => {
      const response = CreateManyDataResponseSchema.parse({
        object: 'contact',
        records: [
          { id: '1', first_name: 'John' },
          { id: '2', first_name: 'Jane' },
        ],
        count: 2,
      });

      expect(response.count).toBe(2);
      expect(response.records).toHaveLength(2);
    });
  });

  describe('UpdateManyDataRequestSchema', () => {
    it('should accept update many request', () => {
      const request = UpdateManyDataRequestSchema.parse({
        object: 'account',
        records: [
          { id: '1', data: { status: 'active' } },
          { id: '2', data: { status: 'inactive' } },
        ],
      });

      expect(request.records).toHaveLength(2);
    });

    it('should accept update many with options', () => {
      const request = UpdateManyDataRequestSchema.parse({
        object: 'account',
        records: [
          { id: '1', data: { status: 'active' } },
        ],
        options: {
          allOrNone: true,
        },
      });

      expect(request.options).toBeDefined();
    });
  });

  describe('DeleteManyDataRequestSchema', () => {
    it('should accept delete many request', () => {
      const request = DeleteManyDataRequestSchema.parse({
        object: 'account',
        ids: ['1', '2', '3'],
      });

      expect(request.ids).toHaveLength(3);
    });

    it('should accept delete many with options', () => {
      const request = DeleteManyDataRequestSchema.parse({
        object: 'account',
        ids: ['1', '2'],
        options: {
          allOrNone: false,
        },
      });

      expect(request.options).toBeDefined();
    });
  });
});

describe('Integration Tests', () => {
  it('should support complete data workflow', () => {
    // Create
    const createRequest = CreateDataRequestSchema.parse({
      object: 'account',
      data: { name: 'Test Account', industry: 'Technology' },
    });

    const createResponse = CreateDataResponseSchema.parse({
      object: 'account',
      id: '123',
      record: { id: '123', name: 'Test Account', industry: 'Technology' },
    });

    // Find
    const findRequest = FindDataRequestSchema.parse({
      object: 'account',
      query: {
        object: 'account',
        where: { industry: 'Technology' },
      },
    });

    // Update
    const updateRequest = UpdateDataRequestSchema.parse({
      object: 'account',
      id: '123',
      data: { status: 'active' },
    });

    // Delete
    const deleteRequest = DeleteDataRequestSchema.parse({
      object: 'account',
      id: '123',
    });

    expect(createRequest.object).toBe('account');
    expect(createResponse.id).toBe('123');
    expect(findRequest.object).toBe('account');
    expect(updateRequest.id).toBe('123');
    expect(deleteRequest.id).toBe('123');
  });

  it('should support metadata discovery workflow', () => {
    // Get types
    const typesResponse = GetMetaTypesResponseSchema.parse({
      types: ['object', 'view', 'flow'],
    });

    // Get items
    const itemsRequest = GetMetaItemsRequestSchema.parse({
      type: 'object',
    });

    const itemsResponse = GetMetaItemsResponseSchema.parse({
      type: 'object',
      items: [
        { name: 'account', label: 'Account' },
        { name: 'contact', label: 'Contact' },
      ],
    });

    // Get specific item
    const itemRequest = GetMetaItemRequestSchema.parse({
      type: 'object',
      name: 'account',
    });

    expect(typesResponse.types).toHaveLength(3);
    expect(itemsResponse.items).toHaveLength(2);
    expect(itemRequest.name).toBe('account');
  });
});

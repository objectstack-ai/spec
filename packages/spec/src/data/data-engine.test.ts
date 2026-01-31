import { describe, it, expect } from 'vitest';
import {
  DataEngineFilterSchema,
  DataEngineSortSchema,
  DataEngineQueryOptionsSchema,
  DataEngineInsertOptionsSchema,
  DataEngineUpdateOptionsSchema,
  DataEngineDeleteOptionsSchema,
  DataEngineAggregateOptionsSchema,
  DataEngineCountOptionsSchema,
  DataEngineFindRequestSchema,
  DataEngineFindOneRequestSchema,
  DataEngineInsertRequestSchema,
  DataEngineUpdateRequestSchema,
  DataEngineDeleteRequestSchema,
  DataEngineCountRequestSchema,
  DataEngineAggregateRequestSchema,
  DataEngineExecuteRequestSchema,
  DataEngineVectorFindRequestSchema,
  DataEngineBatchRequestSchema,
  DataEngineRequestSchema,
} from './data-engine.zod';

describe('DataEngineFilterSchema', () => {
  it('should accept simple key-value filter', () => {
    const filter = DataEngineFilterSchema.parse({
      status: 'active',
      category: 'premium',
    });

    expect(filter.status).toBe('active');
    expect(filter.category).toBe('premium');
  });

  it('should accept complex filter expressions', () => {
    const filter = DataEngineFilterSchema.parse({
      operator: 'and',
      conditions: [
        { field: 'status', operator: 'eq', value: 'active' },
        { field: 'revenue', operator: 'gt', value: 100000 },
      ],
    });

    expect(filter.operator).toBe('and');
    expect(filter.conditions).toHaveLength(2);
  });

  it('should accept nested filters', () => {
    const filter = DataEngineFilterSchema.parse({
      'address.city': 'New York',
      'address.state': 'NY',
    });

    expect(filter['address.city']).toBe('New York');
  });
});

describe('DataEngineSortSchema', () => {
  it('should accept string-based sort', () => {
    const sort = DataEngineSortSchema.parse({
      name: 'asc',
      created_at: 'desc',
    });

    expect(sort.name).toBe('asc');
    expect(sort.created_at).toBe('desc');
  });

  it('should accept number-based sort', () => {
    const sort = DataEngineSortSchema.parse({
      name: 1,
      created_at: -1,
    });

    expect(sort.name).toBe(1);
    expect(sort.created_at).toBe(-1);
  });

  it('should accept array-based sort', () => {
    const sort = DataEngineSortSchema.parse([
      { field: 'name', order: 'asc' },
      { field: 'created_at', order: 'desc' },
    ]);

    expect(sort).toHaveLength(2);
  });
});

describe('DataEngineQueryOptionsSchema', () => {
  it('should accept minimal options', () => {
    const options = DataEngineQueryOptionsSchema.parse({});

    expect(options).toBeDefined();
  });

  it('should accept filter option', () => {
    const options = DataEngineQueryOptionsSchema.parse({
      filter: { status: 'active' },
    });

    expect(options.filter).toBeDefined();
  });

  it('should accept select option', () => {
    const options = DataEngineQueryOptionsSchema.parse({
      select: ['id', 'name', 'email'],
    });

    expect(options.select).toHaveLength(3);
  });

  it('should accept sort option', () => {
    const options = DataEngineQueryOptionsSchema.parse({
      sort: { name: 'asc' },
    });

    expect(options.sort).toBeDefined();
  });

  it('should accept pagination with limit/skip', () => {
    const options = DataEngineQueryOptionsSchema.parse({
      limit: 10,
      skip: 20,
    });

    expect(options.limit).toBe(10);
    expect(options.skip).toBe(20);
  });

  it('should accept pagination with top', () => {
    const options = DataEngineQueryOptionsSchema.parse({
      top: 25,
      skip: 50,
    });

    expect(options.top).toBe(25);
    expect(options.skip).toBe(50);
  });

  it('should accept populate option', () => {
    const options = DataEngineQueryOptionsSchema.parse({
      populate: ['owner', 'contacts'],
    });

    expect(options.populate).toHaveLength(2);
  });

  it('should accept complete query options', () => {
    const options = DataEngineQueryOptionsSchema.parse({
      filter: { status: 'active' },
      select: ['id', 'name', 'email'],
      sort: { name: 'asc' },
      limit: 50,
      skip: 0,
      populate: ['owner'],
    });

    expect(options.filter).toBeDefined();
    expect(options.select).toHaveLength(3);
    expect(options.limit).toBe(50);
    expect(options.populate).toHaveLength(1);
  });
});

describe('DataEngineInsertOptionsSchema', () => {
  it('should accept returning option', () => {
    const options = DataEngineInsertOptionsSchema.parse({
      returning: true,
    });

    expect(options.returning).toBe(true);
  });

  it('should accept custom returning', () => {
    const options = DataEngineInsertOptionsSchema.parse({
      returning: false,
    });

    expect(options.returning).toBe(false);
  });
});

describe('DataEngineUpdateOptionsSchema', () => {
  it('should accept empty options', () => {
    const options = DataEngineUpdateOptionsSchema.parse({});

    expect(options).toBeDefined();
  });

  it('should accept upsert mode', () => {
    const options = DataEngineUpdateOptionsSchema.parse({
      upsert: true,
    });

    expect(options.upsert).toBe(true);
  });

  it('should accept multi-update', () => {
    const options = DataEngineUpdateOptionsSchema.parse({
      multi: true,
      returning: true,
    });

    expect(options.multi).toBe(true);
    expect(options.returning).toBe(true);
  });

  it('should accept update with filter', () => {
    const options = DataEngineUpdateOptionsSchema.parse({
      filter: { status: 'inactive' },
      multi: true,
    });

    expect(options.filter).toBeDefined();
    expect(options.multi).toBe(true);
  });
});

describe('DataEngineDeleteOptionsSchema', () => {
  it('should accept empty options', () => {
    const options = DataEngineDeleteOptionsSchema.parse({});

    expect(options).toBeDefined();
  });

  it('should accept multi-delete', () => {
    const options = DataEngineDeleteOptionsSchema.parse({
      multi: true,
    });

    expect(options.multi).toBe(true);
  });

  it('should accept delete with filter', () => {
    const options = DataEngineDeleteOptionsSchema.parse({
      filter: { status: 'archived' },
      multi: true,
    });

    expect(options.filter).toBeDefined();
  });
});

describe('DataEngineAggregateOptionsSchema', () => {
  it('should accept group by', () => {
    const options = DataEngineAggregateOptionsSchema.parse({
      groupBy: ['status', 'category'],
    });

    expect(options.groupBy).toHaveLength(2);
  });

  it('should accept aggregations', () => {
    const options = DataEngineAggregateOptionsSchema.parse({
      aggregations: [
        { field: 'revenue', method: 'sum', alias: 'total_revenue' },
        { field: 'id', method: 'count', alias: 'total_count' },
      ],
    });

    expect(options.aggregations).toHaveLength(2);
  });

  it('should accept all aggregation methods', () => {
    const methods = ['count', 'sum', 'avg', 'min', 'max', 'count_distinct'] as const;
    
    methods.forEach(method => {
      const options = DataEngineAggregateOptionsSchema.parse({
        aggregations: [
          { field: 'value', method },
        ],
      });
      expect(options.aggregations![0].method).toBe(method);
    });
  });

  it('should accept aggregation with filter and groupBy', () => {
    const options = DataEngineAggregateOptionsSchema.parse({
      filter: { status: 'active' },
      groupBy: ['category'],
      aggregations: [
        { field: 'revenue', method: 'sum' },
        { field: 'revenue', method: 'avg' },
      ],
    });

    expect(options.filter).toBeDefined();
    expect(options.groupBy).toHaveLength(1);
    expect(options.aggregations).toHaveLength(2);
  });
});

describe('DataEngineCountOptionsSchema', () => {
  it('should accept empty options', () => {
    const options = DataEngineCountOptionsSchema.parse({});

    expect(options).toBeDefined();
  });

  it('should accept count with filter', () => {
    const options = DataEngineCountOptionsSchema.parse({
      filter: { status: 'active' },
    });

    expect(options.filter).toBeDefined();
  });
});

describe('DataEngineFindRequestSchema', () => {
  it('should accept minimal find request', () => {
    const request = DataEngineFindRequestSchema.parse({
      method: 'find',
      object: 'account',
    });

    expect(request.method).toBe('find');
    expect(request.object).toBe('account');
  });

  it('should accept find with query', () => {
    const request = DataEngineFindRequestSchema.parse({
      method: 'find',
      object: 'account',
      query: {
        filter: { status: 'active' },
        limit: 10,
      },
    });

    expect(request.query?.filter).toBeDefined();
  });
});

describe('DataEngineFindOneRequestSchema', () => {
  it('should accept find one request', () => {
    const request = DataEngineFindOneRequestSchema.parse({
      method: 'findOne',
      object: 'account',
      query: {
        filter: { id: '123' },
      },
    });

    expect(request.method).toBe('findOne');
  });
});

describe('DataEngineInsertRequestSchema', () => {
  it('should accept single record insert', () => {
    const request = DataEngineInsertRequestSchema.parse({
      method: 'insert',
      object: 'account',
      data: { name: 'Test Account' },
    });

    expect(request.method).toBe('insert');
    expect(request.data.name).toBe('Test Account');
  });

  it('should accept multiple records insert', () => {
    const request = DataEngineInsertRequestSchema.parse({
      method: 'insert',
      object: 'account',
      data: [
        { name: 'Account 1' },
        { name: 'Account 2' },
      ],
    });

    expect(request.data).toHaveLength(2);
  });

  it('should accept insert with options', () => {
    const request = DataEngineInsertRequestSchema.parse({
      method: 'insert',
      object: 'account',
      data: { name: 'Test' },
      options: {
        returning: true,
      },
    });

    expect(request.options?.returning).toBe(true);
  });
});

describe('DataEngineUpdateRequestSchema', () => {
  it('should accept update with id', () => {
    const request = DataEngineUpdateRequestSchema.parse({
      method: 'update',
      object: 'account',
      id: '123',
      data: { status: 'active' },
    });

    expect(request.id).toBe('123');
  });

  it('should accept update with filter', () => {
    const request = DataEngineUpdateRequestSchema.parse({
      method: 'update',
      object: 'account',
      data: { status: 'active' },
      options: {
        filter: { category: 'premium' },
        multi: true,
      },
    });

    expect(request.options?.multi).toBe(true);
  });
});

describe('DataEngineDeleteRequestSchema', () => {
  it('should accept delete with id', () => {
    const request = DataEngineDeleteRequestSchema.parse({
      method: 'delete',
      object: 'account',
      id: '123',
    });

    expect(request.id).toBe('123');
  });

  it('should accept delete with filter', () => {
    const request = DataEngineDeleteRequestSchema.parse({
      method: 'delete',
      object: 'account',
      options: {
        filter: { status: 'archived' },
        multi: true,
      },
    });

    expect(request.options?.multi).toBe(true);
  });
});

describe('DataEngineCountRequestSchema', () => {
  it('should accept count request', () => {
    const request = DataEngineCountRequestSchema.parse({
      method: 'count',
      object: 'account',
    });

    expect(request.method).toBe('count');
  });

  it('should accept count with filter', () => {
    const request = DataEngineCountRequestSchema.parse({
      method: 'count',
      object: 'account',
      query: {
        filter: { status: 'active' },
      },
    });

    expect(request.query?.filter).toBeDefined();
  });
});

describe('DataEngineAggregateRequestSchema', () => {
  it('should accept aggregate request', () => {
    const request = DataEngineAggregateRequestSchema.parse({
      method: 'aggregate',
      object: 'account',
      query: {
        groupBy: ['status'],
        aggregations: [
          { field: 'revenue', method: 'sum' },
        ],
      },
    });

    expect(request.method).toBe('aggregate');
  });
});

describe('DataEngineExecuteRequestSchema', () => {
  it('should accept execute with SQL command', () => {
    const request = DataEngineExecuteRequestSchema.parse({
      method: 'execute',
      command: 'SELECT * FROM accounts WHERE status = ?',
    });

    expect(request.method).toBe('execute');
  });

  it('should accept execute with object command', () => {
    const request = DataEngineExecuteRequestSchema.parse({
      method: 'execute',
      command: {
        operation: 'custom_query',
        params: { limit: 10 },
      },
    });

    expect(request.command.operation).toBe('custom_query');
  });

  it('should accept execute with options', () => {
    const request = DataEngineExecuteRequestSchema.parse({
      method: 'execute',
      command: 'CUSTOM QUERY',
      options: {
        timeout: 5000,
      },
    });

    expect(request.options?.timeout).toBe(5000);
  });
});

describe('DataEngineVectorFindRequestSchema', () => {
  it('should accept vector find request', () => {
    const request = DataEngineVectorFindRequestSchema.parse({
      method: 'vectorFind',
      object: 'documents',
      vector: [0.1, 0.2, 0.3, 0.4],
    });

    expect(request.method).toBe('vectorFind');
    expect(request.vector).toHaveLength(4);
  });

  it('should accept custom limit', () => {
    const request = DataEngineVectorFindRequestSchema.parse({
      method: 'vectorFind',
      object: 'documents',
      vector: [0.1, 0.2, 0.3],
      limit: 10,
    });

    expect(request.limit).toBe(10);
  });

  it('should accept vector find with filter', () => {
    const request = DataEngineVectorFindRequestSchema.parse({
      method: 'vectorFind',
      object: 'documents',
      vector: [0.1, 0.2, 0.3],
      filter: { category: 'tech' },
      limit: 10,
      threshold: 0.8,
    });

    expect(request.filter).toBeDefined();
    expect(request.limit).toBe(10);
    expect(request.threshold).toBe(0.8);
  });

  it('should accept vector find with select', () => {
    const request = DataEngineVectorFindRequestSchema.parse({
      method: 'vectorFind',
      object: 'documents',
      vector: [0.1, 0.2],
      select: ['id', 'title', 'content'],
    });

    expect(request.select).toHaveLength(3);
  });
});

describe('DataEngineBatchRequestSchema', () => {
  it('should accept batch request', () => {
    const request = DataEngineBatchRequestSchema.parse({
      method: 'batch',
      requests: [
        {
          method: 'find',
          object: 'account',
        },
        {
          method: 'insert',
          object: 'contact',
          data: { name: 'John Doe' },
        },
      ],
    });

    expect(request.method).toBe('batch');
    expect(request.requests).toHaveLength(2);
  });

  it('should accept transaction mode', () => {
    const request = DataEngineBatchRequestSchema.parse({
      method: 'batch',
      requests: [
        { method: 'find', object: 'account' },
      ],
      transaction: true,
    });

    expect(request.transaction).toBe(true);
  });

  it('should accept non-transactional batch', () => {
    const request = DataEngineBatchRequestSchema.parse({
      method: 'batch',
      requests: [
        { method: 'find', object: 'account' },
      ],
      transaction: false,
    });

    expect(request.transaction).toBe(false);
  });

  it('should accept mixed operations batch', () => {
    const request = DataEngineBatchRequestSchema.parse({
      method: 'batch',
      requests: [
        { method: 'find', object: 'account' },
        { method: 'count', object: 'contact' },
        { method: 'insert', object: 'opportunity', data: { name: 'Deal' } },
        { method: 'update', object: 'task', id: '123', data: { status: 'done' } },
        { method: 'delete', object: 'note', id: '456' },
      ],
    });

    expect(request.requests).toHaveLength(5);
  });
});

describe('DataEngineRequestSchema', () => {
  it('should accept all request types', () => {
    const requests = [
      { method: 'find' as const, object: 'account' },
      { method: 'findOne' as const, object: 'account' },
      { method: 'insert' as const, object: 'account', data: {} },
      { method: 'update' as const, object: 'account', data: {} },
      { method: 'delete' as const, object: 'account' },
      { method: 'count' as const, object: 'account' },
      { method: 'aggregate' as const, object: 'account', query: {} },
      { method: 'execute' as const, command: 'SQL' },
      { method: 'vectorFind' as const, object: 'docs', vector: [0.1] },
      { method: 'batch' as const, requests: [] },
    ];

    requests.forEach(request => {
      expect(() => DataEngineRequestSchema.parse(request)).not.toThrow();
    });
  });
});

describe('Integration Tests', () => {
  it('should support complete CRUD workflow', () => {
    // Create
    const insertRequest = DataEngineInsertRequestSchema.parse({
      method: 'insert',
      object: 'account',
      data: { name: 'Test Account', status: 'active' },
      options: { returning: true },
    });

    // Read
    const findRequest = DataEngineFindRequestSchema.parse({
      method: 'find',
      object: 'account',
      query: {
        filter: { status: 'active' },
        select: ['id', 'name', 'status'],
        sort: { name: 'asc' },
        limit: 10,
      },
    });

    // Update
    const updateRequest = DataEngineUpdateRequestSchema.parse({
      method: 'update',
      object: 'account',
      id: '123',
      data: { status: 'inactive' },
      options: { returning: true },
    });

    // Delete
    const deleteRequest = DataEngineDeleteRequestSchema.parse({
      method: 'delete',
      object: 'account',
      id: '123',
    });

    expect(insertRequest.method).toBe('insert');
    expect(findRequest.method).toBe('find');
    expect(updateRequest.method).toBe('update');
    expect(deleteRequest.method).toBe('delete');
  });

  it('should support analytics workflow', () => {
    // Count
    const countRequest = DataEngineCountRequestSchema.parse({
      method: 'count',
      object: 'opportunity',
      query: {
        filter: { stage: 'closed_won' },
      },
    });

    // Aggregate
    const aggregateRequest = DataEngineAggregateRequestSchema.parse({
      method: 'aggregate',
      object: 'opportunity',
      query: {
        filter: { status: 'closed' },
        groupBy: ['stage', 'owner_id'],
        aggregations: [
          { field: 'amount', method: 'sum', alias: 'total_amount' },
          { field: 'amount', method: 'avg', alias: 'avg_amount' },
          { field: 'id', method: 'count', alias: 'deal_count' },
        ],
      },
    });

    expect(countRequest.method).toBe('count');
    expect(aggregateRequest.query.aggregations).toHaveLength(3);
  });

  it('should support batch operations', () => {
    const batchRequest = DataEngineBatchRequestSchema.parse({
      method: 'batch',
      transaction: true,
      requests: [
        {
          method: 'insert',
          object: 'account',
          data: { name: 'New Account' },
        },
        {
          method: 'update',
          object: 'contact',
          id: 'contact_123',
          data: { account_id: 'account_new' },
        },
        {
          method: 'count',
          object: 'opportunity',
          query: {
            filter: { account_id: 'account_new' },
          },
        },
      ],
    });

    expect(batchRequest.requests).toHaveLength(3);
    expect(batchRequest.transaction).toBe(true);
  });
});

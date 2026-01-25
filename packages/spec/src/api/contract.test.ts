import { describe, it, expect } from 'vitest';
import {
  ApiErrorSchema,
  BaseResponseSchema,
  CreateRequestSchema,
  UpdateRequestSchema,
  BulkRequestSchema,
  ExportRequestSchema,
  SingleRecordResponseSchema,
  ListRecordResponseSchema,
  ModificationResultSchema,
  BulkResponseSchema,
  DeleteResponseSchema,
  RecordDataSchema,
  ApiContracts,
} from './contract.zod';

describe('ApiErrorSchema', () => {
  it('should accept valid API error', () => {
    const error = ApiErrorSchema.parse({
      code: 'validation_error',
      message: 'Invalid input data',
    });

    expect(error.code).toBe('validation_error');
    expect(error.message).toBe('Invalid input data');
  });

  it('should accept error with details', () => {
    const error = ApiErrorSchema.parse({
      code: 'validation_error',
      message: 'Validation failed',
      details: {
        fields: {
          email: 'Invalid email format',
          age: 'Must be a positive number',
        },
      },
    });

    expect(error.details).toBeDefined();
  });
});

describe('BaseResponseSchema', () => {
  it('should accept success response', () => {
    const response = BaseResponseSchema.parse({
      success: true,
    });

    expect(response.success).toBe(true);
  });

  it('should accept error response', () => {
    const response = BaseResponseSchema.parse({
      success: false,
      error: {
        code: 'not_found',
        message: 'Record not found',
      },
    });

    expect(response.success).toBe(false);
    expect(response.error?.code).toBe('not_found');
  });

  it('should accept response with metadata', () => {
    const response = BaseResponseSchema.parse({
      success: true,
      meta: {
        timestamp: '2024-01-01T00:00:00Z',
        duration: 150,
        requestId: 'req_123',
        traceId: 'trace_456',
      },
    });

    expect(response.meta?.duration).toBe(150);
    expect(response.meta?.requestId).toBe('req_123');
  });
});

describe('RecordDataSchema', () => {
  it('should accept any key-value record', () => {
    const record = RecordDataSchema.parse({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    });

    expect(record.name).toBe('John Doe');
  });

  it('should accept nested objects', () => {
    const record = RecordDataSchema.parse({
      user: {
        name: 'John',
        profile: {
          bio: 'Developer',
        },
      },
    });

    expect(record.user).toBeDefined();
  });
});

describe('CreateRequestSchema', () => {
  it('should accept valid create request', () => {
    const request = CreateRequestSchema.parse({
      data: {
        name: 'New Account',
        industry: 'Technology',
      },
    });

    expect(request.data.name).toBe('New Account');
  });

  it('should accept create request with complex data', () => {
    const request = CreateRequestSchema.parse({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        address: {
          street: '123 Main St',
          city: 'New York',
        },
        tags: ['customer', 'vip'],
      },
    });

    expect(request.data.address).toBeDefined();
    expect(request.data.tags).toHaveLength(2);
  });
});

describe('UpdateRequestSchema', () => {
  it('should accept valid update request', () => {
    const request = UpdateRequestSchema.parse({
      data: {
        status: 'active',
        updatedAt: new Date().toISOString(),
      },
    });

    expect(request.data.status).toBe('active');
  });

  it('should accept partial update', () => {
    const request = UpdateRequestSchema.parse({
      data: {
        name: 'Updated Name',
      },
    });

    expect(request.data.name).toBe('Updated Name');
  });
});

describe('BulkRequestSchema', () => {
  it('should accept valid bulk request', () => {
    const request = BulkRequestSchema.parse({
      records: [
        { name: 'Record 1' },
        { name: 'Record 2' },
      ],
    });

    expect(request.records).toHaveLength(2);
  });

  it('should apply default allOrNone', () => {
    const request = BulkRequestSchema.parse({
      records: [{ name: 'Record 1' }],
    });

    expect(request.allOrNone).toBe(true);
  });

  it('should accept custom allOrNone', () => {
    const request = BulkRequestSchema.parse({
      records: [{ name: 'Record 1' }],
      allOrNone: false,
    });

    expect(request.allOrNone).toBe(false);
  });

  it('should accept bulk request with multiple records', () => {
    const request = BulkRequestSchema.parse({
      records: Array.from({ length: 10 }, (_, i) => ({
        name: `Record ${i + 1}`,
        index: i,
      })),
    });

    expect(request.records).toHaveLength(10);
  });
});

describe('ExportRequestSchema', () => {
  it('should accept export request with query', () => {
    const request = ExportRequestSchema.parse({
      object: 'account',
      fields: ['name', 'email'],
    });

    expect(request.object).toBe('account');
  });

  it('should apply default format', () => {
    const request = ExportRequestSchema.parse({
      object: 'account',
    });

    expect(request.format).toBe('csv');
  });

  it('should accept different export formats', () => {
    const formats = ['csv', 'json', 'xlsx'];

    formats.forEach(format => {
      const request = ExportRequestSchema.parse({
        object: 'account',
        format,
      });
      expect(request.format).toBe(format);
    });
  });

  it('should accept export with filters', () => {
    const request = ExportRequestSchema.parse({
      object: 'account',
      fields: ['name', 'email'],
      where: { status: 'active' },
      format: 'xlsx',
    });

    expect(request.format).toBe('xlsx');
    expect(request.where).toBeDefined();
  });
});

describe('SingleRecordResponseSchema', () => {
  it('should accept successful single record response', () => {
    const response = SingleRecordResponseSchema.parse({
      success: true,
      data: {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
      },
    });

    expect(response.success).toBe(true);
    expect(response.data.id).toBe('123');
  });

  it('should accept error response', () => {
    const response = SingleRecordResponseSchema.parse({
      success: false,
      error: {
        code: 'not_found',
        message: 'Record not found',
      },
      data: {},
    });

    expect(response.success).toBe(false);
  });
});

describe('ListRecordResponseSchema', () => {
  it('should accept list response', () => {
    const response = ListRecordResponseSchema.parse({
      success: true,
      data: [
        { id: '1', name: 'Record 1' },
        { id: '2', name: 'Record 2' },
      ],
      pagination: {
        total: 100,
        limit: 10,
        offset: 0,
        hasMore: true,
      },
    });

    expect(response.data).toHaveLength(2);
    expect(response.pagination.total).toBe(100);
  });

  it('should accept empty list response', () => {
    const response = ListRecordResponseSchema.parse({
      success: true,
      data: [],
      pagination: {
        total: 0,
        limit: 10,
        offset: 0,
        hasMore: false,
      },
    });

    expect(response.data).toHaveLength(0);
    expect(response.pagination.hasMore).toBe(false);
  });
});

describe('ModificationResultSchema', () => {
  it('should accept successful modification result', () => {
    const result = ModificationResultSchema.parse({
      id: '123',
      success: true,
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('123');
  });

  it('should accept failed modification result', () => {
    const result = ModificationResultSchema.parse({
      success: false,
      errors: [
        {
          code: 'validation_error',
          message: 'Invalid data',
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
  });
});

describe('BulkResponseSchema', () => {
  it('should accept successful bulk response', () => {
    const response = BulkResponseSchema.parse({
      success: true,
      data: [
        { id: '1', success: true },
        { id: '2', success: true },
      ],
    });

    expect(response.data).toHaveLength(2);
  });

  it('should accept partial success bulk response', () => {
    const response = BulkResponseSchema.parse({
      success: false,
      data: [
        { id: '1', success: true },
        {
          success: false,
          errors: [
            { code: 'validation_error', message: 'Invalid' },
          ],
        },
      ],
    });

    expect(response.data).toHaveLength(2);
    expect(response.data[1].success).toBe(false);
  });
});

describe('DeleteResponseSchema', () => {
  it('should accept successful delete response', () => {
    const response = DeleteResponseSchema.parse({
      success: true,
      id: '123',
    });

    expect(response.success).toBe(true);
    expect(response.id).toBe('123');
  });

  it('should accept delete error response', () => {
    const response = DeleteResponseSchema.parse({
      success: false,
      id: '123',
      error: {
        code: 'not_found',
        message: 'Record not found',
      },
    });

    expect(response.success).toBe(false);
  });
});

describe('ApiContracts', () => {
  it('should have all standard CRUD contracts', () => {
    expect(ApiContracts.create).toBeDefined();
    expect(ApiContracts.update).toBeDefined();
    expect(ApiContracts.delete).toBeDefined();
    expect(ApiContracts.get).toBeDefined();
    expect(ApiContracts.list).toBeDefined();
  });

  it('should have bulk operation contracts', () => {
    expect(ApiContracts.bulkCreate).toBeDefined();
    expect(ApiContracts.bulkUpdate).toBeDefined();
    expect(ApiContracts.bulkUpsert).toBeDefined();
    expect(ApiContracts.bulkDelete).toBeDefined();
  });

  it('should validate create contract input', () => {
    const input = ApiContracts.create.input.parse({
      data: { name: 'Test' },
    });

    expect(input.data.name).toBe('Test');
  });

  it('should validate create contract output', () => {
    const output = ApiContracts.create.output.parse({
      success: true,
      data: { id: '123', name: 'Test' },
    });

    expect(output.data.id).toBe('123');
  });

  it('should validate list contract input', () => {
    const input = ApiContracts.list.input.parse({
      object: 'account',
      fields: ['name', 'email'],
    });

    expect(input.object).toBe('account');
  });

  it('should validate bulk delete contract input', () => {
    const input = ApiContracts.bulkDelete.input.parse({
      ids: ['1', '2', '3'],
    });

    expect(input.ids).toHaveLength(3);
  });
});

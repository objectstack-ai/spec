import { describe, it, expect } from 'vitest';
import {
  BatchOperationType,
  BatchRecordSchema,
  BatchOptionsSchema,
  BatchUpdateRequestSchema,
  UpdateManyRequestSchema,
  BatchOperationResultSchema,
  BatchUpdateResponseSchema,
  DeleteManyRequestSchema,
  BatchApiContracts,
} from './batch.zod';

describe('BatchOperationType', () => {
  it('should accept valid operation types', () => {
    expect(BatchOperationType.parse('create')).toBe('create');
    expect(BatchOperationType.parse('update')).toBe('update');
    expect(BatchOperationType.parse('upsert')).toBe('upsert');
    expect(BatchOperationType.parse('delete')).toBe('delete');
  });

  it('should reject invalid operation types', () => {
    expect(() => BatchOperationType.parse('invalid')).toThrow();
  });
});

describe('BatchRecordSchema', () => {
  it('should accept valid batch record for update', () => {
    const record = BatchRecordSchema.parse({
      id: '123',
      data: { name: 'Updated Name', status: 'active' },
    });

    expect(record.id).toBe('123');
    expect(record.data).toEqual({ name: 'Updated Name', status: 'active' });
  });

  it('should accept record with external ID for upsert', () => {
    const record = BatchRecordSchema.parse({
      data: { name: 'New Record' },
      externalId: 'ext_123',
    });

    expect(record.externalId).toBe('ext_123');
  });

  it('should accept minimal record', () => {
    const record = BatchRecordSchema.parse({});
    expect(record).toBeDefined();
  });
});

describe('BatchOptionsSchema', () => {
  it('should use default values', () => {
    const options = BatchOptionsSchema.parse({});

    expect(options.atomic).toBe(true);
    expect(options.returnRecords).toBe(false);
    expect(options.continueOnError).toBe(false);
    expect(options.validateOnly).toBe(false);
  });

  it('should accept custom options', () => {
    const options = BatchOptionsSchema.parse({
      atomic: false,
      returnRecords: true,
      continueOnError: true,
      validateOnly: true,
    });

    expect(options.atomic).toBe(false);
    expect(options.returnRecords).toBe(true);
    expect(options.continueOnError).toBe(true);
    expect(options.validateOnly).toBe(true);
  });
});

describe('BatchUpdateRequestSchema', () => {
  it('should accept valid batch update request', () => {
    const request = BatchUpdateRequestSchema.parse({
      operation: 'update',
      records: [
        { id: '1', data: { name: 'Name 1' } },
        { id: '2', data: { name: 'Name 2' } },
      ],
      options: {
        atomic: true,
        returnRecords: true,
      },
    });

    expect(request.operation).toBe('update');
    expect(request.records).toHaveLength(2);
    expect(request.options?.atomic).toBe(true);
  });

  it('should require at least one record', () => {
    expect(() =>
      BatchUpdateRequestSchema.parse({
        operation: 'create',
        records: [],
      })
    ).toThrow();
  });

  it('should limit to 200 records', () => {
    const records = Array(201)
      .fill(null)
      .map((_, i) => ({ id: String(i), data: {} }));

    expect(() =>
      BatchUpdateRequestSchema.parse({
        operation: 'update',
        records,
      })
    ).toThrow();
  });

  it('should accept exactly 200 records', () => {
    const records = Array(200)
      .fill(null)
      .map((_, i) => ({ id: String(i), data: {} }));

    const request = BatchUpdateRequestSchema.parse({
      operation: 'update',
      records,
    });

    expect(request.records).toHaveLength(200);
  });
});

describe('UpdateManyRequestSchema', () => {
  it('should accept valid updateMany request', () => {
    const request = UpdateManyRequestSchema.parse({
      records: [
        { id: '1', data: { name: 'Updated 1' } },
        { id: '2', data: { name: 'Updated 2' } },
      ],
      options: { atomic: true },
    });

    expect(request.records).toHaveLength(2);
    expect(request.options?.atomic).toBe(true);
  });

  it('should work without options', () => {
    const request = UpdateManyRequestSchema.parse({
      records: [{ id: '1', data: { name: 'Updated' } }],
    });

    expect(request.records).toHaveLength(1);
    expect(request.options).toBeUndefined();
  });
});

describe('BatchOperationResultSchema', () => {
  it('should accept successful result', () => {
    const result = BatchOperationResultSchema.parse({
      id: '123',
      success: true,
      index: 0,
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('123');
    expect(result.errors).toBeUndefined();
  });

  it('should accept failed result with errors', () => {
    const result = BatchOperationResultSchema.parse({
      success: false,
      index: 1,
      errors: [
        {
          code: 'validation_error',
          message: 'Invalid email format',
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0].code).toBe('validation_error');
  });

  it('should accept result with full record data', () => {
    const result = BatchOperationResultSchema.parse({
      id: '123',
      success: true,
      data: { id: '123', name: 'Test Record', status: 'active' },
      index: 0,
    });

    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe('Test Record');
  });
});

describe('BatchUpdateResponseSchema', () => {
  it('should accept successful batch response', () => {
    const response = BatchUpdateResponseSchema.parse({
      success: true,
      operation: 'update',
      total: 2,
      succeeded: 2,
      failed: 0,
      results: [
        { id: '1', success: true, index: 0 },
        { id: '2', success: true, index: 1 },
      ],
      meta: {
        timestamp: '2026-01-29T12:00:00Z',
        duration: 150,
      },
    });

    expect(response.success).toBe(true);
    expect(response.total).toBe(2);
    expect(response.succeeded).toBe(2);
    expect(response.failed).toBe(0);
  });

  it('should accept partial success response', () => {
    const response = BatchUpdateResponseSchema.parse({
      success: false,
      operation: 'update',
      total: 2,
      succeeded: 1,
      failed: 1,
      results: [
        { id: '1', success: true, index: 0 },
        {
          success: false,
          index: 1,
          errors: [{ code: 'validation_error', message: 'Invalid data' }],
        },
      ],
    });

    expect(response.success).toBe(false);
    expect(response.succeeded).toBe(1);
    expect(response.failed).toBe(1);
  });

  it('should accept response with error details', () => {
    const response = BatchUpdateResponseSchema.parse({
      success: false,
      operation: 'create',
      total: 1,
      succeeded: 0,
      failed: 1,
      results: [
        {
          success: false,
          index: 0,
          errors: [
            {
              code: 'duplicate_value',
              message: 'Record already exists',
              details: { field: 'email', value: 'test@example.com' },
            },
          ],
        },
      ],
      error: {
        code: 'batch_partial_failure',
        message: 'Batch operation failed',
      },
    });

    expect(response.failed).toBe(1);
    expect(response.error?.code).toBe('batch_partial_failure');
  });
});

describe('DeleteManyRequestSchema', () => {
  it('should accept valid delete request', () => {
    const request = DeleteManyRequestSchema.parse({
      ids: ['1', '2', '3'],
      options: { atomic: true },
    });

    expect(request.ids).toHaveLength(3);
    expect(request.options?.atomic).toBe(true);
  });

  it('should require at least one ID', () => {
    expect(() =>
      DeleteManyRequestSchema.parse({
        ids: [],
      })
    ).toThrow();
  });

  it('should limit to 200 IDs', () => {
    const ids = Array(201)
      .fill(null)
      .map((_, i) => String(i));

    expect(() =>
      DeleteManyRequestSchema.parse({
        ids,
      })
    ).toThrow();
  });
});

describe('BatchApiContracts', () => {
  it('should have correct contract structure', () => {
    expect(BatchApiContracts.batchOperation).toBeDefined();
    expect(BatchApiContracts.batchOperation.input).toBeDefined();
    expect(BatchApiContracts.batchOperation.output).toBeDefined();

    expect(BatchApiContracts.updateMany).toBeDefined();
    expect(BatchApiContracts.deleteMany).toBeDefined();
  });

  it('should validate batchOperation contract', () => {
    const input = {
      operation: 'update',
      records: [{ id: '1', data: { name: 'Test' } }],
    };

    const parsedInput = BatchApiContracts.batchOperation.input.parse(input);
    expect(parsedInput.operation).toBe('update');
  });

  it('should validate updateMany contract', () => {
    const input = {
      records: [{ id: '1', data: { name: 'Test' } }],
    };

    const parsedInput = BatchApiContracts.updateMany.input.parse(input);
    expect(parsedInput.records).toHaveLength(1);
  });
});

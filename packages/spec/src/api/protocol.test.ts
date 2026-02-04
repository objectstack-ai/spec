
import { describe, it, expect } from 'vitest';
import { 
  GetDataRequestSchema, 
  GetDataResponseSchema,
  FindDataRequestSchema,
  FindDataResponseSchema,
  CreateDataRequestSchema,
  CreateDataResponseSchema,
  UpdateDataRequestSchema,
  DeleteDataResponseSchema,
  BatchDataRequestSchema,
  CreateManyDataResponseSchema,
  UpdateManyDataRequestSchema,
  DeleteManyDataRequestSchema
} from './protocol.zod';

describe('ObjectStack Protocol', () => {

  it('validates GetData', () => {
    const request = {
      object: 'project',
      id: 'p1'
    };
    expect(GetDataRequestSchema.safeParse(request).success).toBe(true);

    const response = {
      object: 'project',
      id: 'p1',
      record: { id: 'p1', name: 'Project A' }
    };
    expect(GetDataResponseSchema.safeParse(response).success).toBe(true);
  });

  it('validates FindData', () => {
    const request = {
      object: 'project',
      query: {
        object: 'project',
        where: { status: 'active' }
      }
    };
    expect(FindDataRequestSchema.safeParse(request).success).toBe(true);

    const response = {
      object: 'project',
      records: [
        { id: 'p1', name: 'Project A', status: 'active' }
      ],
      total: 1
    };
    expect(FindDataResponseSchema.safeParse(response).success).toBe(true);
  });

  it('validates CRUD Operations', () => {
    const createReq = {
      object: 'task',
      data: { title: 'New Task' }
    };
    expect(CreateDataRequestSchema.safeParse(createReq).success).toBe(true);

    const createRes = {
        object: 'task',
        id: 't1',
        record: { id: 't1', title: 'New Task' }
    };
    expect(CreateDataResponseSchema.safeParse(createRes).success).toBe(true);

    const updateReq = {
      object: 'task',
      id: 't1',
      data: { status: 'completed' }
    };
    expect(UpdateDataRequestSchema.safeParse(updateReq).success).toBe(true);

    const deleteRes = {
      object: 'task',
      id: 't1',
      success: true
    };
    expect(DeleteDataResponseSchema.safeParse(deleteRes).success).toBe(true);
  });

  it('validates Batch Operations', () => {
    const batchReq = {
      object: 'task',
      request: {
        operation: 'create',
        records: [{ data: { title: 'T1' } }]
      }
    };
    expect(BatchDataRequestSchema.safeParse(batchReq).success).toBe(true);
  });

  it('validates Bulk Operations', () => {
    const createManyRes = {
      object: 'task',
      records: [{ id: 't1' }, { id: 't2' }],
      count: 2
    };
    expect(CreateManyDataResponseSchema.safeParse(createManyRes).success).toBe(true);

    const updateManyReq = {
      object: 'task',
      records: [{ id: 't1', data: { status: 'done' } }],
      options: { atomic: true }
    };
    expect(UpdateManyDataRequestSchema.safeParse(updateManyReq).success).toBe(true);

    const deleteManyReq = {
      object: 'task',
      ids: ['t1', 't2'],
      options: { atomic: false }
    };
    expect(DeleteManyDataRequestSchema.safeParse(deleteManyReq).success).toBe(true);
  });

});

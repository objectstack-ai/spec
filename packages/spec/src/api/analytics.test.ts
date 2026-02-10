import { describe, it, expect } from 'vitest';
import {
  AnalyticsEndpoint,
  AnalyticsQueryRequestSchema,
  AnalyticsResultResponseSchema,
  GetAnalyticsMetaRequestSchema,
  AnalyticsMetadataResponseSchema,
  AnalyticsSqlResponseSchema,
} from './analytics.zod';

describe('AnalyticsEndpoint', () => {
  it('should accept all valid endpoints', () => {
    for (const ep of [
      '/api/v1/analytics/query',
      '/api/v1/analytics/meta',
      '/api/v1/analytics/sql',
    ]) {
      expect(AnalyticsEndpoint.parse(ep)).toBe(ep);
    }
  });

  it('should reject invalid endpoint', () => {
    expect(() => AnalyticsEndpoint.parse('/api/v1/analytics/unknown')).toThrow();
  });
});

describe('AnalyticsQueryRequestSchema', () => {
  it('should accept valid query request with defaults', () => {
    const req = AnalyticsQueryRequestSchema.parse({
      query: {
        measures: ['total_revenue'],
      },
      cube: 'orders',
    });
    expect(req.cube).toBe('orders');
    expect(req.format).toBe('json');
    expect(req.query.measures).toEqual(['total_revenue']);
  });

  it('should accept query with explicit format', () => {
    const req = AnalyticsQueryRequestSchema.parse({
      query: {
        measures: ['count'],
        dimensions: ['category'],
      },
      cube: 'products',
      format: 'csv',
    });
    expect(req.format).toBe('csv');
  });

  it('should accept query with filters and time dimensions', () => {
    const req = AnalyticsQueryRequestSchema.parse({
      query: {
        measures: ['total_revenue'],
        dimensions: ['product_category'],
        filters: [
          { member: 'status', operator: 'equals', values: ['active'] },
        ],
        timeDimensions: [
          { dimension: 'created_at', granularity: 'month', dateRange: 'Last 7 days' },
        ],
        order: { total_revenue: 'desc' },
        limit: 100,
      },
      cube: 'sales',
      format: 'xlsx',
    });
    expect(req.query.filters).toHaveLength(1);
    expect(req.query.timeDimensions).toHaveLength(1);
  });

  it('should reject missing cube', () => {
    expect(() =>
      AnalyticsQueryRequestSchema.parse({
        query: { measures: ['x'] },
      })
    ).toThrow();
  });

  it('should reject missing query', () => {
    expect(() =>
      AnalyticsQueryRequestSchema.parse({ cube: 'test' })
    ).toThrow();
  });

  it('should reject invalid format', () => {
    expect(() =>
      AnalyticsQueryRequestSchema.parse({
        query: { measures: ['x'] },
        cube: 'test',
        format: 'xml',
      })
    ).toThrow();
  });
});

describe('AnalyticsResultResponseSchema', () => {
  it('should accept valid result response', () => {
    const resp = AnalyticsResultResponseSchema.parse({
      success: true,
      data: {
        rows: [
          { category: 'Electronics', total: 5000 },
          { category: 'Books', total: 1200 },
        ],
        fields: [
          { name: 'category', type: 'string' },
          { name: 'total', type: 'number' },
        ],
      },
    });
    expect(resp.data.rows).toHaveLength(2);
    expect(resp.data.fields).toHaveLength(2);
    expect(resp.data.sql).toBeUndefined();
  });

  it('should accept result with sql debug info', () => {
    const resp = AnalyticsResultResponseSchema.parse({
      success: true,
      data: {
        rows: [],
        fields: [],
        sql: 'SELECT category, SUM(amount) FROM orders GROUP BY category',
      },
    });
    expect(resp.data.sql).toBeDefined();
  });

  it('should reject missing rows or fields', () => {
    expect(() =>
      AnalyticsResultResponseSchema.parse({
        success: true,
        data: { rows: [] },
      })
    ).toThrow();

    expect(() =>
      AnalyticsResultResponseSchema.parse({
        success: true,
        data: { fields: [] },
      })
    ).toThrow();
  });
});

describe('GetAnalyticsMetaRequestSchema', () => {
  it('should accept empty request', () => {
    const req = GetAnalyticsMetaRequestSchema.parse({});
    expect(req.cube).toBeUndefined();
  });

  it('should accept request with cube filter', () => {
    const req = GetAnalyticsMetaRequestSchema.parse({ cube: 'orders' });
    expect(req.cube).toBe('orders');
  });
});

describe('AnalyticsMetadataResponseSchema', () => {
  it('should accept valid metadata response', () => {
    const resp = AnalyticsMetadataResponseSchema.parse({
      success: true,
      data: {
        cubes: [
          {
            name: 'orders',
            sql: 'SELECT * FROM orders',
            measures: {
              total_revenue: {
                name: 'total_revenue',
                label: 'Total Revenue',
                type: 'sum',
                sql: 'amount',
              },
            },
            dimensions: {
              status: {
                name: 'status',
                label: 'Status',
                type: 'string',
                sql: 'status',
              },
            },
          },
        ],
      },
    });
    expect(resp.data.cubes).toHaveLength(1);
    expect(resp.data.cubes[0].name).toBe('orders');
  });

  it('should accept empty cubes list', () => {
    const resp = AnalyticsMetadataResponseSchema.parse({
      success: true,
      data: { cubes: [] },
    });
    expect(resp.data.cubes).toHaveLength(0);
  });

  it('should reject missing cubes', () => {
    expect(() =>
      AnalyticsMetadataResponseSchema.parse({
        success: true,
        data: {},
      })
    ).toThrow();
  });
});

describe('AnalyticsSqlResponseSchema', () => {
  it('should accept valid SQL response', () => {
    const resp = AnalyticsSqlResponseSchema.parse({
      success: true,
      data: {
        sql: 'SELECT COUNT(*) FROM orders WHERE status = $1',
        params: ['active'],
      },
    });
    expect(resp.data.sql).toContain('SELECT');
    expect(resp.data.params).toEqual(['active']);
  });

  it('should accept empty params', () => {
    const resp = AnalyticsSqlResponseSchema.parse({
      success: true,
      data: {
        sql: 'SELECT 1',
        params: [],
      },
    });
    expect(resp.data.params).toHaveLength(0);
  });

  it('should reject missing sql or params', () => {
    expect(() =>
      AnalyticsSqlResponseSchema.parse({
        success: true,
        data: { params: [] },
      })
    ).toThrow();

    expect(() =>
      AnalyticsSqlResponseSchema.parse({
        success: true,
        data: { sql: 'SELECT 1' },
      })
    ).toThrow();
  });
});

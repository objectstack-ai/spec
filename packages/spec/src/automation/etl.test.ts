import { describe, it, expect } from 'vitest';
import {
  ETLEndpointTypeSchema,
  ETLSourceSchema,
  ETLDestinationSchema,
  ETLTransformationTypeSchema,
  ETLTransformationSchema,
  ETLSyncModeSchema,
  ETLPipelineSchema,
  ETLRunStatusSchema,
  ETLPipelineRunSchema,
  ETL,
} from './etl.zod';

describe('ETLEndpointTypeSchema', () => {
  it('should accept all valid endpoint types', () => {
    const types = [
      'database', 'api', 'file', 'stream', 'object',
      'warehouse', 'storage', 'spreadsheet',
    ];
    types.forEach(t => {
      expect(() => ETLEndpointTypeSchema.parse(t)).not.toThrow();
    });
  });

  it('should reject invalid endpoint type', () => {
    expect(() => ETLEndpointTypeSchema.parse('ftp')).toThrow();
  });
});

describe('ETLSourceSchema', () => {
  it('should accept minimal source', () => {
    expect(() => ETLSourceSchema.parse({
      type: 'database',
      config: { table: 'users' },
    })).not.toThrow();
  });

  it('should accept full source with incremental config', () => {
    expect(() => ETLSourceSchema.parse({
      type: 'api',
      connector: 'salesforce',
      config: { object: 'Account' },
      incremental: {
        enabled: true,
        cursorField: 'updated_at',
        cursorValue: '2024-01-01T00:00:00Z',
      },
    })).not.toThrow();
  });

  it('should reject missing config', () => {
    expect(() => ETLSourceSchema.parse({
      type: 'database',
    })).toThrow();
  });

  it('should reject invalid type', () => {
    expect(() => ETLSourceSchema.parse({
      type: 'invalid',
      config: {},
    })).toThrow();
  });
});

describe('ETLDestinationSchema', () => {
  it('should accept minimal destination with defaults', () => {
    const result = ETLDestinationSchema.parse({
      type: 'database',
      config: { table: 'accounts' },
    });
    expect(result.writeMode).toBe('append');
  });

  it('should accept full destination', () => {
    expect(() => ETLDestinationSchema.parse({
      type: 'warehouse',
      connector: 'snowflake',
      config: { schema: 'public', table: 'dim_accounts' },
      writeMode: 'upsert',
      primaryKey: ['account_id'],
    })).not.toThrow();
  });

  it('should reject invalid writeMode', () => {
    expect(() => ETLDestinationSchema.parse({
      type: 'database',
      config: {},
      writeMode: 'truncate',
    })).toThrow();
  });
});

describe('ETLTransformationTypeSchema', () => {
  it('should accept all valid types', () => {
    const types = [
      'map', 'filter', 'aggregate', 'join', 'script',
      'lookup', 'split', 'merge', 'normalize', 'deduplicate',
    ];
    types.forEach(t => {
      expect(() => ETLTransformationTypeSchema.parse(t)).not.toThrow();
    });
  });

  it('should reject invalid type', () => {
    expect(() => ETLTransformationTypeSchema.parse('pivot')).toThrow();
  });
});

describe('ETLTransformationSchema', () => {
  it('should accept minimal transformation with defaults', () => {
    const result = ETLTransformationSchema.parse({
      type: 'map',
      config: { Name: 'account_name' },
    });
    expect(result.continueOnError).toBe(false);
  });

  it('should accept full transformation', () => {
    expect(() => ETLTransformationSchema.parse({
      name: 'filter_active',
      type: 'filter',
      config: { condition: 'status == "active"' },
      continueOnError: true,
    })).not.toThrow();
  });

  it('should reject missing config', () => {
    expect(() => ETLTransformationSchema.parse({
      type: 'script',
    })).toThrow();
  });
});

describe('ETLSyncModeSchema', () => {
  it('should accept all valid sync modes', () => {
    ['full', 'incremental', 'cdc'].forEach(m => {
      expect(() => ETLSyncModeSchema.parse(m)).not.toThrow();
    });
  });

  it('should reject invalid mode', () => {
    expect(() => ETLSyncModeSchema.parse('realtime')).toThrow();
  });
});

describe('ETLPipelineSchema', () => {
  const minimalPipeline = {
    name: 'sf_to_postgres',
    source: { type: 'api', config: { object: 'Account' } },
    destination: { type: 'database', config: { table: 'accounts' } },
  };

  it('should accept minimal pipeline with defaults', () => {
    const result = ETLPipelineSchema.parse(minimalPipeline);
    expect(result.syncMode).toBe('full');
    expect(result.enabled).toBe(true);
  });

  it('should accept full pipeline', () => {
    expect(() => ETLPipelineSchema.parse({
      name: 'multi_source_pipeline',
      label: 'Multi-Source Pipeline',
      description: 'Aggregates data from multiple sources',
      source: {
        type: 'api',
        connector: 'salesforce',
        config: { object: 'Account' },
        incremental: { enabled: true, cursorField: 'updated_at' },
      },
      destination: {
        type: 'warehouse',
        connector: 'snowflake',
        config: { table: 'dim_accounts' },
        writeMode: 'merge',
        primaryKey: ['account_id'],
      },
      transformations: [
        { type: 'map', config: { Name: 'account_name' } },
        { type: 'filter', config: { condition: 'status == "active"' } },
        { name: 'dedup', type: 'deduplicate', config: { key: 'account_id' }, continueOnError: true },
      ],
      syncMode: 'incremental',
      schedule: '0 2 * * *',
      enabled: true,
      retry: { maxAttempts: 5, backoffMs: 120000 },
      notifications: {
        onSuccess: ['data-team@example.com'],
        onFailure: ['ops@example.com'],
      },
      tags: ['salesforce', 'analytics'],
      metadata: { owner: 'data-team' },
    })).not.toThrow();
  });

  it('should reject invalid name (not snake_case)', () => {
    expect(() => ETLPipelineSchema.parse({
      ...minimalPipeline,
      name: 'SfToPostgres',
    })).toThrow();
  });

  it('should reject missing source', () => {
    expect(() => ETLPipelineSchema.parse({
      name: 'bad_pipeline',
      destination: { type: 'database', config: {} },
    })).toThrow();
  });

  it('should apply retry defaults when provided', () => {
    const result = ETLPipelineSchema.parse({
      ...minimalPipeline,
      retry: {},
    });
    expect(result.retry?.maxAttempts).toBe(3);
    expect(result.retry?.backoffMs).toBe(60000);
  });
});

describe('ETLRunStatusSchema', () => {
  it('should accept all valid statuses', () => {
    ['pending', 'running', 'succeeded', 'failed', 'cancelled', 'timeout'].forEach(s => {
      expect(() => ETLRunStatusSchema.parse(s)).not.toThrow();
    });
  });

  it('should reject invalid status', () => {
    expect(() => ETLRunStatusSchema.parse('completed')).toThrow();
  });
});

describe('ETLPipelineRunSchema', () => {
  it('should accept minimal run', () => {
    expect(() => ETLPipelineRunSchema.parse({
      id: 'run-001',
      pipelineName: 'sf_to_postgres',
      status: 'succeeded',
      startedAt: '2024-01-01T02:00:00Z',
    })).not.toThrow();
  });

  it('should accept full run result', () => {
    expect(() => ETLPipelineRunSchema.parse({
      id: 'run-002',
      pipelineName: 'sf_to_postgres',
      status: 'failed',
      startedAt: '2024-01-01T02:00:00Z',
      completedAt: '2024-01-01T02:15:00Z',
      durationMs: 900000,
      stats: {
        recordsRead: 5000,
        recordsWritten: 4950,
        recordsErrored: 50,
        bytesProcessed: 1048576,
      },
      error: {
        message: 'Connection timeout',
        code: 'TIMEOUT',
        details: { host: 'db.example.com' },
      },
      logs: ['Starting pipeline', 'Extraction complete', 'Load failed'],
    })).not.toThrow();
  });

  it('should reject invalid datetime', () => {
    expect(() => ETLPipelineRunSchema.parse({
      id: 'run-003',
      pipelineName: 'test',
      status: 'running',
      startedAt: 'not-a-date',
    })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => ETLPipelineRunSchema.parse({
      id: 'run-004',
    })).toThrow();
  });
});

describe('ETL factory', () => {
  it('should create database-to-database pipeline', () => {
    const pipeline = ETL.databaseSync({
      name: 'users_sync',
      sourceTable: 'users_source',
      destTable: 'users_dest',
      schedule: '0 * * * *',
    });
    expect(pipeline.source.type).toBe('database');
    expect(pipeline.destination.type).toBe('database');
    expect(pipeline.destination.writeMode).toBe('upsert');
    expect(pipeline.syncMode).toBe('incremental');
    expect(() => ETLPipelineSchema.parse(pipeline)).not.toThrow();
  });

  it('should create API-to-database pipeline', () => {
    const pipeline = ETL.apiToDatabase({
      name: 'api_ingest',
      apiConnector: 'stripe',
      destTable: 'payments',
    });
    expect(pipeline.source.type).toBe('api');
    expect(pipeline.source.connector).toBe('stripe');
    expect(pipeline.destination.writeMode).toBe('append');
    expect(pipeline.syncMode).toBe('full');
    expect(() => ETLPipelineSchema.parse(pipeline)).not.toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import {
  SyncDirectionSchema,
  SyncModeSchema,
  ConflictResolutionSchema,
  DataSourceConfigSchema,
  DataDestinationConfigSchema,
  DataSyncConfigSchema,
  SyncExecutionStatusSchema,
  SyncExecutionResultSchema,
  Sync,
} from './sync.zod';

describe('SyncDirectionSchema', () => {
  it('should accept all valid directions', () => {
    ['push', 'pull', 'bidirectional'].forEach(d => {
      expect(() => SyncDirectionSchema.parse(d)).not.toThrow();
    });
  });

  it('should reject invalid direction', () => {
    expect(() => SyncDirectionSchema.parse('both')).toThrow();
  });
});

describe('SyncModeSchema', () => {
  it('should accept all valid modes', () => {
    ['full', 'incremental', 'realtime'].forEach(m => {
      expect(() => SyncModeSchema.parse(m)).not.toThrow();
    });
  });

  it('should reject invalid mode', () => {
    expect(() => SyncModeSchema.parse('batch')).toThrow();
  });
});

describe('ConflictResolutionSchema', () => {
  it('should accept all valid strategies', () => {
    ['source_wins', 'destination_wins', 'latest_wins', 'manual', 'merge'].forEach(s => {
      expect(() => ConflictResolutionSchema.parse(s)).not.toThrow();
    });
  });

  it('should reject invalid strategy', () => {
    expect(() => ConflictResolutionSchema.parse('random')).toThrow();
  });
});

describe('DataSourceConfigSchema', () => {
  it('should accept empty object (all optional)', () => {
    expect(() => DataSourceConfigSchema.parse({})).not.toThrow();
  });

  it('should accept full source config', () => {
    expect(() => DataSourceConfigSchema.parse({
      object: 'contact',
      filters: { status: 'active' },
      fields: ['first_name', 'last_name', 'email'],
      connectorInstanceId: 'inst-123',
      externalResource: 'Contact',
    })).not.toThrow();
  });
});

describe('DataDestinationConfigSchema', () => {
  it('should accept minimal destination', () => {
    expect(() => DataDestinationConfigSchema.parse({
      operation: 'upsert',
    })).not.toThrow();
  });

  it('should accept simple mapping (record)', () => {
    expect(() => DataDestinationConfigSchema.parse({
      object: 'account',
      operation: 'upsert',
      mapping: { first_name: 'FirstName', last_name: 'LastName' },
      matchKey: ['email'],
    })).not.toThrow();
  });

  it('should accept advanced mapping (array of FieldMapping)', () => {
    expect(() => DataDestinationConfigSchema.parse({
      object: 'account',
      operation: 'insert',
      mapping: [
        { source: 'FirstName', target: 'first_name' },
        { source: 'LastName', target: 'last_name', transform: { type: 'cast', targetType: 'string' } },
      ],
    })).not.toThrow();
  });

  it('should reject invalid operation', () => {
    expect(() => DataDestinationConfigSchema.parse({
      operation: 'merge_all',
    })).toThrow();
  });

  it('should reject missing operation', () => {
    expect(() => DataDestinationConfigSchema.parse({
      object: 'contact',
    })).toThrow();
  });
});

describe('DataSyncConfigSchema', () => {
  const minimalSync = {
    name: 'contact_sync',
    source: {},
    destination: { operation: 'upsert' },
  };

  it('should accept minimal config with defaults', () => {
    const result = DataSyncConfigSchema.parse(minimalSync);
    expect(result.direction).toBe('push');
    expect(result.syncMode).toBe('incremental');
    expect(result.conflictResolution).toBe('latest_wins');
    expect(result.batchSize).toBe(100);
    expect(result.enabled).toBe(true);
  });

  it('should accept full config', () => {
    expect(() => DataSyncConfigSchema.parse({
      name: 'full_sync',
      label: 'Full Sync',
      description: 'A comprehensive sync',
      source: { object: 'contact', fields: ['email'] },
      destination: {
        object: 'account',
        operation: 'upsert',
        mapping: { email: 'Email' },
        matchKey: ['email'],
      },
      direction: 'bidirectional',
      syncMode: 'realtime',
      conflictResolution: 'manual',
      schedule: '0 * * * *',
      enabled: false,
      changeTrackingField: 'updated_at',
      batchSize: 500,
      retry: { maxAttempts: 5, backoffMs: 60000 },
      validation: {
        required: ['email'],
        unique: ['email'],
        custom: [{ name: 'email_check', condition: 'email != null', message: 'Email required' }],
      },
      errorHandling: {
        onValidationError: 'fail',
        onSyncError: 'skip',
        notifyOnError: ['admin@example.com'],
      },
      optimization: {
        parallelBatches: true,
        cacheEnabled: false,
        compressionEnabled: true,
      },
      audit: {
        logLevel: 'debug',
        retainLogsForDays: 90,
        trackChanges: false,
      },
      tags: ['crm', 'critical'],
      metadata: { priority: 'high' },
    })).not.toThrow();
  });

  it('should reject invalid name (not snake_case)', () => {
    expect(() => DataSyncConfigSchema.parse({
      ...minimalSync,
      name: 'ContactSync',
    })).toThrow();
  });

  it('should reject batchSize out of range', () => {
    expect(() => DataSyncConfigSchema.parse({
      ...minimalSync,
      batchSize: 0,
    })).toThrow();
    expect(() => DataSyncConfigSchema.parse({
      ...minimalSync,
      batchSize: 20000,
    })).toThrow();
  });

  it('should apply errorHandling defaults', () => {
    const result = DataSyncConfigSchema.parse({
      ...minimalSync,
      errorHandling: {},
    });
    expect(result.errorHandling?.onValidationError).toBe('skip');
    expect(result.errorHandling?.onSyncError).toBe('retry');
  });

  it('should apply audit defaults', () => {
    const result = DataSyncConfigSchema.parse({
      ...minimalSync,
      audit: {},
    });
    expect(result.audit?.logLevel).toBe('info');
    expect(result.audit?.retainLogsForDays).toBe(30);
    expect(result.audit?.trackChanges).toBe(true);
  });

  it('should apply optimization defaults', () => {
    const result = DataSyncConfigSchema.parse({
      ...minimalSync,
      optimization: {},
    });
    expect(result.optimization?.parallelBatches).toBe(false);
    expect(result.optimization?.cacheEnabled).toBe(true);
    expect(result.optimization?.compressionEnabled).toBe(false);
  });
});

describe('SyncExecutionStatusSchema', () => {
  it('should accept all valid statuses', () => {
    ['pending', 'running', 'completed', 'partial', 'failed', 'cancelled'].forEach(s => {
      expect(() => SyncExecutionStatusSchema.parse(s)).not.toThrow();
    });
  });

  it('should reject invalid status', () => {
    expect(() => SyncExecutionStatusSchema.parse('unknown')).toThrow();
  });
});

describe('SyncExecutionResultSchema', () => {
  it('should accept minimal result', () => {
    expect(() => SyncExecutionResultSchema.parse({
      id: 'run-001',
      syncName: 'contact_sync',
      status: 'completed',
      startedAt: '2024-01-01T00:00:00Z',
    })).not.toThrow();
  });

  it('should accept full result', () => {
    expect(() => SyncExecutionResultSchema.parse({
      id: 'run-002',
      syncName: 'contact_sync',
      status: 'partial',
      startedAt: '2024-01-01T00:00:00Z',
      completedAt: '2024-01-01T00:05:00Z',
      durationMs: 300000,
      stats: {
        recordsProcessed: 1000,
        recordsInserted: 500,
        recordsUpdated: 400,
        recordsDeleted: 50,
        recordsSkipped: 30,
        recordsErrored: 20,
        conflictsDetected: 5,
        conflictsResolved: 3,
      },
      errors: [
        { recordId: 'rec-1', field: 'email', message: 'Invalid email', code: 'VALIDATION' },
      ],
      logs: ['Started sync', 'Completed with errors'],
    })).not.toThrow();
  });

  it('should reject missing startedAt', () => {
    expect(() => SyncExecutionResultSchema.parse({
      id: 'run-003',
      syncName: 'test',
      status: 'running',
    })).toThrow();
  });

  it('should reject invalid datetime format', () => {
    expect(() => SyncExecutionResultSchema.parse({
      id: 'run-004',
      syncName: 'test',
      status: 'running',
      startedAt: 'yesterday',
    })).toThrow();
  });
});

describe('Sync factory', () => {
  it('should create object-to-object sync', () => {
    const config = Sync.objectSync({
      name: 'contact_to_lead',
      sourceObject: 'contact',
      destObject: 'lead',
      mapping: { first_name: 'FirstName' },
      schedule: '0 * * * *',
    });
    expect(config.direction).toBe('push');
    expect(config.syncMode).toBe('incremental');
    expect(config.batchSize).toBe(100);
    expect(config.enabled).toBe(true);
    expect(() => DataSyncConfigSchema.parse(config)).not.toThrow();
  });

  it('should create connector sync', () => {
    const config = Sync.connectorSync({
      name: 'sf_sync',
      sourceObject: 'contact',
      connectorInstanceId: 'inst-sf',
      externalResource: 'Contact',
      mapping: { email: 'Email' },
    });
    expect(config.destination.connectorInstanceId).toBe('inst-sf');
    expect(() => DataSyncConfigSchema.parse(config)).not.toThrow();
  });

  it('should create bidirectional sync', () => {
    const config = Sync.bidirectionalSync({
      name: 'bidir_sync',
      object: 'account',
      connectorInstanceId: 'inst-hub',
      externalResource: 'Company',
      mapping: { name: 'Name' },
    });
    expect(config.direction).toBe('bidirectional');
    expect(config.destination.operation).toBe('sync');
    expect(() => DataSyncConfigSchema.parse(config)).not.toThrow();
  });
});

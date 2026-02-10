import { describe, it, expect } from 'vitest';
import {
  DatabaseProviderSchema,
  DatabasePoolConfigSchema,
  SslConfigSchema,
  CdcConfigSchema,
  DatabaseTableSchema,
  DatabaseConnectorSchema,
} from './database.zod';

const baseAuth = { type: 'none' as const };

const minimalTable = {
  name: 'customer',
  label: 'Customer',
  tableName: 'customers',
  primaryKey: 'id',
};

const minimalConnector = {
  name: 'pg_main',
  label: 'PostgreSQL Main',
  type: 'database' as const,
  provider: 'postgresql' as const,
  authentication: baseAuth,
  connectionConfig: {
    host: 'localhost',
    port: 5432,
    database: 'mydb',
    username: 'user',
    password: 'pass',
  },
  tables: [minimalTable],
};

describe('DatabaseProviderSchema', () => {
  it('should accept all valid providers', () => {
    const providers = ['postgresql', 'mysql', 'mariadb', 'mssql', 'oracle', 'mongodb', 'redis', 'cassandra', 'snowflake', 'bigquery', 'redshift', 'custom'];
    for (const p of providers) {
      expect(DatabaseProviderSchema.parse(p)).toBe(p);
    }
  });

  it('should reject invalid provider', () => {
    expect(() => DatabaseProviderSchema.parse('sqlite')).toThrow();
  });
});

describe('DatabasePoolConfigSchema', () => {
  it('should apply defaults', () => {
    const result = DatabasePoolConfigSchema.parse({});
    expect(result.min).toBe(2);
    expect(result.max).toBe(10);
    expect(result.idleTimeoutMs).toBe(30000);
    expect(result.testOnBorrow).toBe(true);
  });

  it('should accept custom values', () => {
    const result = DatabasePoolConfigSchema.parse({ min: 0, max: 50, idleTimeoutMs: 5000 });
    expect(result.min).toBe(0);
    expect(result.max).toBe(50);
  });

  it('should reject max below 1', () => {
    expect(() => DatabasePoolConfigSchema.parse({ max: 0 })).toThrow();
  });

  it('should reject idleTimeoutMs below 1000', () => {
    expect(() => DatabasePoolConfigSchema.parse({ idleTimeoutMs: 500 })).toThrow();
  });
});

describe('SslConfigSchema', () => {
  it('should apply defaults', () => {
    const result = SslConfigSchema.parse({});
    expect(result.enabled).toBe(false);
    expect(result.rejectUnauthorized).toBe(true);
  });

  it('should accept full config', () => {
    const result = SslConfigSchema.parse({
      enabled: true,
      rejectUnauthorized: false,
      ca: 'ca-cert',
      cert: 'client-cert',
      key: 'client-key',
    });
    expect(result.enabled).toBe(true);
    expect(result.ca).toBe('ca-cert');
  });
});

describe('CdcConfigSchema', () => {
  it('should accept valid CDC config', () => {
    const result = CdcConfigSchema.parse({ method: 'log_based' });
    expect(result.enabled).toBe(false);
    expect(result.batchSize).toBe(1000);
    expect(result.pollIntervalMs).toBe(1000);
  });

  it('should accept all CDC methods', () => {
    for (const m of ['log_based', 'trigger_based', 'query_based', 'custom']) {
      expect(() => CdcConfigSchema.parse({ method: m })).not.toThrow();
    }
  });

  it('should reject missing method', () => {
    expect(() => CdcConfigSchema.parse({ enabled: true })).toThrow();
  });

  it('should reject batchSize out of range', () => {
    expect(() => CdcConfigSchema.parse({ method: 'log_based', batchSize: 0 })).toThrow();
    expect(() => CdcConfigSchema.parse({ method: 'log_based', batchSize: 10001 })).toThrow();
  });

  it('should accept optional fields', () => {
    const result = CdcConfigSchema.parse({
      method: 'log_based',
      enabled: true,
      slotName: 'slot1',
      publicationName: 'pub1',
      startPosition: '0/1234',
    });
    expect(result.slotName).toBe('slot1');
  });
});

describe('DatabaseTableSchema', () => {
  it('should accept valid table', () => {
    const result = DatabaseTableSchema.parse(minimalTable);
    expect(result.enabled).toBe(true);
  });

  it('should accept table with all optional fields', () => {
    const data = {
      ...minimalTable,
      schema: 'public',
      enabled: false,
      fieldMappings: [{ source: 'ext_id', target: 'id' }],
      whereClause: 'status = \'active\'',
    };
    expect(() => DatabaseTableSchema.parse(data)).not.toThrow();
  });

  it('should reject non-snake_case name', () => {
    expect(() => DatabaseTableSchema.parse({ ...minimalTable, name: 'Customer' })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => DatabaseTableSchema.parse({ name: 'tbl' })).toThrow();
  });
});

describe('DatabaseConnectorSchema', () => {
  it('should accept minimal valid connector', () => {
    expect(() => DatabaseConnectorSchema.parse(minimalConnector)).not.toThrow();
  });

  it('should apply defaults', () => {
    const result = DatabaseConnectorSchema.parse(minimalConnector);
    expect(result.queryTimeoutMs).toBe(30000);
    expect(result.enableQueryLogging).toBe(false);
    expect(result.enabled).toBe(true);
  });

  it('should accept full connector', () => {
    const full = {
      ...minimalConnector,
      poolConfig: { min: 5, max: 25 },
      sslConfig: { enabled: true },
      cdcConfig: { method: 'log_based', enabled: true },
      readReplicaConfig: {
        enabled: true,
        hosts: [{ host: 'replica1', port: 5432, weight: 0.5 }],
      },
      queryTimeoutMs: 60000,
      enableQueryLogging: true,
    };
    expect(() => DatabaseConnectorSchema.parse(full)).not.toThrow();
  });

  it('should reject wrong type literal', () => {
    expect(() => DatabaseConnectorSchema.parse({ ...minimalConnector, type: 'saas' })).toThrow();
  });

  it('should reject invalid port', () => {
    expect(() => DatabaseConnectorSchema.parse({
      ...minimalConnector,
      connectionConfig: { ...minimalConnector.connectionConfig, port: 0 },
    })).toThrow();
    expect(() => DatabaseConnectorSchema.parse({
      ...minimalConnector,
      connectionConfig: { ...minimalConnector.connectionConfig, port: 70000 },
    })).toThrow();
  });

  it('should reject queryTimeoutMs out of range', () => {
    expect(() => DatabaseConnectorSchema.parse({ ...minimalConnector, queryTimeoutMs: 500 })).toThrow();
    expect(() => DatabaseConnectorSchema.parse({ ...minimalConnector, queryTimeoutMs: 500000 })).toThrow();
  });

  it('should reject missing tables', () => {
    const { tables: _, ...noTables } = minimalConnector;
    expect(() => DatabaseConnectorSchema.parse(noTables)).toThrow();
  });

  it('should reject read replica with invalid weight', () => {
    expect(() => DatabaseConnectorSchema.parse({
      ...minimalConnector,
      readReplicaConfig: {
        enabled: true,
        hosts: [{ host: 'r1', port: 5432, weight: 2 }],
      },
    })).toThrow();
  });
});

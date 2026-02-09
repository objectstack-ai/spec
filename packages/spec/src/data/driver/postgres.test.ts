import { describe, it, expect } from 'vitest';
import { PostgresConfigSchema } from './postgres.zod';

describe('PostgresConfigSchema', () => {
  it('should accept valid minimal config', () => {
    const config = PostgresConfigSchema.parse({
      database: 'mydb',
    });

    expect(config.database).toBe('mydb');
    expect(config.host).toBe('localhost');
    expect(config.port).toBe(5432);
    expect(config.schema).toBe('public');
    expect(config.max).toBe(10);
    expect(config.min).toBe(0);
  });

  it('should accept config with connection URI', () => {
    const config = PostgresConfigSchema.parse({
      url: 'postgresql://user:pass@db.example.com:5432/production',
      database: 'production',
    });

    expect(config.url).toBe('postgresql://user:pass@db.example.com:5432/production');
  });

  it('should accept config with all fields', () => {
    const config = PostgresConfigSchema.parse({
      url: 'postgresql://localhost/mydb',
      database: 'production',
      host: 'db.example.com',
      port: 5433,
      username: 'app_user',
      password: 'secret',
      schema: 'app_schema',
      ssl: true,
      applicationName: 'objectstack',
      max: 50,
      min: 5,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000,
      statementTimeout: 30000,
    });

    expect(config.host).toBe('db.example.com');
    expect(config.port).toBe(5433);
    expect(config.schema).toBe('app_schema');
    expect(config.ssl).toBe(true);
    expect(config.applicationName).toBe('objectstack');
    expect(config.max).toBe(50);
    expect(config.min).toBe(5);
    expect(config.idleTimeoutMillis).toBe(60000);
    expect(config.connectionTimeoutMillis).toBe(10000);
    expect(config.statementTimeout).toBe(30000);
  });

  it('should apply correct defaults', () => {
    const config = PostgresConfigSchema.parse({
      database: 'testdb',
    });

    expect(config.host).toBe('localhost');
    expect(config.port).toBe(5432);
    expect(config.schema).toBe('public');
    expect(config.max).toBe(10);
    expect(config.min).toBe(0);
    expect(config.url).toBeUndefined();
    expect(config.username).toBeUndefined();
    expect(config.password).toBeUndefined();
    expect(config.ssl).toBeUndefined();
    expect(config.applicationName).toBeUndefined();
    expect(config.idleTimeoutMillis).toBeUndefined();
    expect(config.connectionTimeoutMillis).toBeUndefined();
    expect(config.statementTimeout).toBeUndefined();
  });

  it('should accept ssl as boolean', () => {
    const config = PostgresConfigSchema.parse({
      database: 'mydb',
      ssl: false,
    });

    expect(config.ssl).toBe(false);
  });

  it('should accept ssl as detailed object', () => {
    const config = PostgresConfigSchema.parse({
      database: 'mydb',
      ssl: {
        rejectUnauthorized: false,
        ca: '-----BEGIN CERTIFICATE-----\nMIIB...',
        key: '-----BEGIN PRIVATE KEY-----\nMIIE...',
        cert: '-----BEGIN CERTIFICATE-----\nMIIC...',
      },
    });

    expect(config.ssl).toBeDefined();
    expect(typeof config.ssl).toBe('object');
    const sslObj = config.ssl as { rejectUnauthorized?: boolean; ca?: string };
    expect(sslObj.rejectUnauthorized).toBe(false);
    expect(sslObj.ca).toBeDefined();
  });

  it('should accept ssl object with partial fields', () => {
    const config = PostgresConfigSchema.parse({
      database: 'mydb',
      ssl: {
        rejectUnauthorized: true,
      },
    });

    const sslObj = config.ssl as { rejectUnauthorized?: boolean };
    expect(sslObj.rejectUnauthorized).toBe(true);
  });

  it('should reject config without database', () => {
    expect(() => PostgresConfigSchema.parse({})).toThrow();
    expect(() => PostgresConfigSchema.parse({ host: 'localhost' })).toThrow();
  });

  it('should reject config with invalid port type', () => {
    expect(() => PostgresConfigSchema.parse({
      database: 'mydb',
      port: 'invalid',
    })).toThrow();
  });

  it('should reject config with invalid ssl value', () => {
    expect(() => PostgresConfigSchema.parse({
      database: 'mydb',
      ssl: 'yes',
    })).toThrow();
  });

  it('should reject config with invalid max pool type', () => {
    expect(() => PostgresConfigSchema.parse({
      database: 'mydb',
      max: 'ten',
    })).toThrow();
  });

  it('should accept config with environment variable patterns', () => {
    const config = PostgresConfigSchema.parse({
      database: '${DB_NAME}',
      host: '${DB_HOST}',
      username: '${DB_USER}',
      password: '${DB_PASSWORD}',
    });

    expect(config.database).toBe('${DB_NAME}');
    expect(config.host).toBe('${DB_HOST}');
  });

  it('should accept zero as min pool size', () => {
    const config = PostgresConfigSchema.parse({
      database: 'mydb',
      min: 0,
    });

    expect(config.min).toBe(0);
  });

  it('should accept custom pool configuration', () => {
    const config = PostgresConfigSchema.parse({
      database: 'mydb',
      max: 100,
      min: 10,
      idleTimeoutMillis: 120000,
      connectionTimeoutMillis: 5000,
    });

    expect(config.max).toBe(100);
    expect(config.min).toBe(10);
  });
});

import { describe, it, expect } from 'vitest';
import {
  MetadataScopeSchema,
  MetadataStateSchema,
  MetadataRecordSchema,
  MetadataFormatSchema,
  MetadataStatsSchema,
  MetadataLoaderContractSchema,
  MetadataLoadOptionsSchema,
  MetadataLoadResultSchema,
  MetadataSaveOptionsSchema,
  MetadataSaveResultSchema,
  MetadataWatchEventSchema,
  MetadataCollectionInfoSchema,
  MetadataExportOptionsSchema,
  MetadataImportOptionsSchema,
  MetadataManagerConfigSchema,
  MetadataDatasourceConfigSchema,
} from './metadata-persistence.zod';

describe('MetadataScopeSchema', () => {
  it('should accept valid scopes', () => {
    const scopes = ['system', 'platform', 'user'];
    scopes.forEach((scope) => {
      expect(() => MetadataScopeSchema.parse(scope)).not.toThrow();
    });
  });

  it('should reject invalid scopes', () => {
    expect(() => MetadataScopeSchema.parse('invalid')).toThrow();
    expect(() => MetadataScopeSchema.parse('admin')).toThrow();
  });
});

describe('MetadataStateSchema', () => {
  it('should accept valid states', () => {
    const states = ['draft', 'active', 'archived', 'deprecated'];
    states.forEach((state) => {
      expect(() => MetadataStateSchema.parse(state)).not.toThrow();
    });
  });

  it('should reject invalid states', () => {
    expect(() => MetadataStateSchema.parse('deleted')).toThrow();
  });
});

describe('MetadataRecordSchema', () => {
  it('should accept valid record with defaults', () => {
    const record = MetadataRecordSchema.parse({
      id: 'abc-123',
      name: 'account_list_view',
      type: 'view',
      metadata: { columns: ['name', 'email'] },
    });

    expect(record.id).toBe('abc-123');
    expect(record.name).toBe('account_list_view');
    expect(record.type).toBe('view');
    expect(record.namespace).toBe('default');
    expect(record.scope).toBe('platform');
    expect(record.strategy).toBe('merge');
    expect(record.state).toBe('active');
  });

  it('should accept full record', () => {
    const record = MetadataRecordSchema.parse({
      id: 'abc-123',
      name: 'account_list_view',
      type: 'view',
      namespace: 'crm',
      scope: 'system',
      metadata: { columns: ['name'] },
      extends: 'base_view',
      strategy: 'replace',
      owner: 'user-1',
      state: 'draft',
      createdBy: 'admin',
      createdAt: '2025-01-01T00:00:00Z',
      updatedBy: 'admin',
      updatedAt: '2025-01-02T00:00:00Z',
    });

    expect(record.namespace).toBe('crm');
    expect(record.scope).toBe('system');
    expect(record.extends).toBe('base_view');
    expect(record.strategy).toBe('replace');
    expect(record.state).toBe('draft');
  });

  it('should reject missing required fields', () => {
    expect(() => MetadataRecordSchema.parse({})).toThrow();
    expect(() => MetadataRecordSchema.parse({ id: 'x' })).toThrow();
    expect(() => MetadataRecordSchema.parse({ id: 'x', name: 'y', type: 'z' })).toThrow();
  });

  it('should reject invalid datetime for createdAt', () => {
    expect(() =>
      MetadataRecordSchema.parse({
        id: 'x',
        name: 'y',
        type: 'z',
        metadata: {},
        createdAt: 'not-a-date',
      }),
    ).toThrow();
  });
});

describe('MetadataFormatSchema', () => {
  it('should accept valid formats', () => {
    const formats = ['json', 'yaml', 'yml', 'ts', 'js', 'typescript', 'javascript'];
    formats.forEach((format) => {
      expect(() => MetadataFormatSchema.parse(format)).not.toThrow();
    });
  });

  it('should reject invalid formats', () => {
    expect(() => MetadataFormatSchema.parse('xml')).toThrow();
  });
});

describe('MetadataStatsSchema', () => {
  it('should accept empty object (all optional)', () => {
    const stats = MetadataStatsSchema.parse({});
    expect(stats).toBeDefined();
  });

  it('should accept full stats', () => {
    const stats = MetadataStatsSchema.parse({
      path: '/metadata/view.json',
      size: 1024,
      mtime: '2025-01-01T00:00:00Z',
      hash: 'sha256:abc',
      etag: '"abc123"',
      modifiedAt: '2025-01-01T00:00:00Z',
      format: 'json',
    });

    expect(stats.path).toBe('/metadata/view.json');
    expect(stats.size).toBe(1024);
    expect(stats.format).toBe('json');
  });
});

describe('MetadataLoaderContractSchema', () => {
  it('should accept valid loader with capability defaults', () => {
    const loader = MetadataLoaderContractSchema.parse({
      name: 'filesystem',
      protocol: 'file:',
      capabilities: {},
    });

    expect(loader.name).toBe('filesystem');
    expect(loader.capabilities.read).toBe(true);
    expect(loader.capabilities.write).toBe(false);
    expect(loader.capabilities.watch).toBe(false);
    expect(loader.capabilities.list).toBe(true);
  });

  it('should accept full loader config', () => {
    const loader = MetadataLoaderContractSchema.parse({
      name: 'http-loader',
      protocol: 'http:',
      description: 'Loads metadata over HTTP',
      supportedFormats: ['json', 'yaml'],
      supportsWatch: false,
      supportsWrite: true,
      supportsCache: true,
      capabilities: { read: true, write: true, watch: false, list: true },
    });

    expect(loader.description).toBe('Loads metadata over HTTP');
    expect(loader.supportedFormats).toEqual(['json', 'yaml']);
  });

  it('should reject missing required fields', () => {
    expect(() => MetadataLoaderContractSchema.parse({})).toThrow();
    expect(() => MetadataLoaderContractSchema.parse({ name: 'x' })).toThrow();
  });
});

describe('MetadataLoadOptionsSchema', () => {
  it('should accept empty object (all optional)', () => {
    const opts = MetadataLoadOptionsSchema.parse({});
    expect(opts).toBeDefined();
  });

  it('should accept full options', () => {
    const opts = MetadataLoadOptionsSchema.parse({
      scope: 'user',
      namespace: 'crm',
      raw: true,
      cache: true,
      useCache: true,
      validate: true,
      ifNoneMatch: '"etag-123"',
      recursive: true,
      limit: 50,
      patterns: ['*.view.json'],
      loader: 'filesystem',
    });

    expect(opts.scope).toBe('user');
    expect(opts.limit).toBe(50);
  });
});

describe('MetadataLoadResultSchema', () => {
  it('should accept minimal result', () => {
    const result = MetadataLoadResultSchema.parse({ data: null });
    expect(result.data).toBeNull();
  });

  it('should accept full result', () => {
    const result = MetadataLoadResultSchema.parse({
      data: { name: 'test' },
      stats: { size: 100 },
      format: 'yaml',
      source: '/metadata/test.yaml',
      fromCache: true,
      etag: '"abc"',
      notModified: false,
      loadTime: 42,
    });

    expect(result.format).toBe('yaml');
    expect(result.fromCache).toBe(true);
    expect(result.loadTime).toBe(42);
  });
});

describe('MetadataSaveOptionsSchema', () => {
  it('should accept empty object with defaults', () => {
    const opts = MetadataSaveOptionsSchema.parse({});
    expect(opts.create).toBe(true);
    expect(opts.overwrite).toBe(true);
  });

  it('should accept full options', () => {
    const opts = MetadataSaveOptionsSchema.parse({
      format: 'json',
      create: false,
      overwrite: false,
      path: '/metadata/out.json',
      prettify: true,
      indent: 2,
      sortKeys: true,
      backup: true,
      atomic: true,
      loader: 'filesystem',
    });

    expect(opts.create).toBe(false);
    expect(opts.indent).toBe(2);
  });
});

describe('MetadataSaveResultSchema', () => {
  it('should accept minimal result', () => {
    const result = MetadataSaveResultSchema.parse({ success: true });
    expect(result.success).toBe(true);
  });

  it('should accept full result', () => {
    const result = MetadataSaveResultSchema.parse({
      success: true,
      path: '/metadata/out.json',
      stats: { size: 200 },
      etag: '"xyz"',
      size: 200,
      saveTime: 10,
      backupPath: '/metadata/out.json.bak',
    });

    expect(result.backupPath).toBe('/metadata/out.json.bak');
  });

  it('should reject missing success', () => {
    expect(() => MetadataSaveResultSchema.parse({})).toThrow();
  });
});

describe('MetadataWatchEventSchema', () => {
  it('should accept valid event types', () => {
    const types = ['add', 'change', 'unlink', 'added', 'changed', 'deleted'];
    types.forEach((type) => {
      expect(() => MetadataWatchEventSchema.parse({ type, path: '/test' })).not.toThrow();
    });
  });

  it('should accept full event', () => {
    const event = MetadataWatchEventSchema.parse({
      type: 'change',
      path: '/metadata/view.json',
      name: 'account_view',
      stats: { size: 512 },
      metadataType: 'view',
      data: { columns: ['name'] },
      timestamp: '2025-01-01T00:00:00Z',
    });

    expect(event.name).toBe('account_view');
    expect(event.metadataType).toBe('view');
  });

  it('should reject invalid event type', () => {
    expect(() => MetadataWatchEventSchema.parse({ type: 'modify', path: '/test' })).toThrow();
  });

  it('should reject missing path', () => {
    expect(() => MetadataWatchEventSchema.parse({ type: 'add' })).toThrow();
  });
});

describe('MetadataCollectionInfoSchema', () => {
  it('should accept valid collection info', () => {
    const info = MetadataCollectionInfoSchema.parse({
      type: 'view',
      count: 15,
      namespaces: ['crm', 'finance'],
    });

    expect(info.type).toBe('view');
    expect(info.count).toBe(15);
    expect(info.namespaces).toEqual(['crm', 'finance']);
  });

  it('should reject missing required fields', () => {
    expect(() => MetadataCollectionInfoSchema.parse({})).toThrow();
    expect(() => MetadataCollectionInfoSchema.parse({ type: 'view' })).toThrow();
  });
});

describe('MetadataExportOptionsSchema', () => {
  it('should accept minimal export options with defaults', () => {
    const opts = MetadataExportOptionsSchema.parse({ output: '/export' });
    expect(opts.output).toBe('/export');
    expect(opts.format).toBe('json');
  });

  it('should accept full export options', () => {
    const opts = MetadataExportOptionsSchema.parse({
      types: ['view', 'object'],
      namespaces: ['crm'],
      output: '/export/crm',
      format: 'yaml',
    });

    expect(opts.types).toEqual(['view', 'object']);
    expect(opts.format).toBe('yaml');
  });

  it('should reject missing output', () => {
    expect(() => MetadataExportOptionsSchema.parse({})).toThrow();
  });
});

describe('MetadataImportOptionsSchema', () => {
  it('should accept minimal import options with defaults', () => {
    const opts = MetadataImportOptionsSchema.parse({ source: '/import' });
    expect(opts.source).toBe('/import');
    expect(opts.strategy).toBe('merge');
    expect(opts.validate).toBe(true);
  });

  it('should accept all strategies', () => {
    const strategies = ['merge', 'replace', 'skip'];
    strategies.forEach((strategy) => {
      expect(() => MetadataImportOptionsSchema.parse({ source: '/x', strategy })).not.toThrow();
    });
  });

  it('should reject missing source', () => {
    expect(() => MetadataImportOptionsSchema.parse({})).toThrow();
  });
});

describe('MetadataManagerConfigSchema', () => {
  it('should accept empty object (all optional)', () => {
    const config = MetadataManagerConfigSchema.parse({});
    expect(config).toBeDefined();
  });

  it('should accept full config', () => {
    const config = MetadataManagerConfigSchema.parse({
      loaders: [{ name: 'fs' }],
      watch: true,
      cache: true,
      basePath: '/app/metadata',
      rootDir: '/app',
      formats: ['json', 'yaml'],
      watchOptions: { persistent: true },
    });

    expect(config.watch).toBe(true);
    expect(config.formats).toEqual(['json', 'yaml']);
  });
});

describe('MetadataDatasourceConfigSchema', () => {
  it('should require datasource', () => {
    expect(() => MetadataDatasourceConfigSchema.parse({})).toThrow();
  });

  it('should accept minimal configuration', () => {
    const config = MetadataDatasourceConfigSchema.parse({
      datasource: 'main_db',
    });

    expect(config.datasource).toBe('main_db');
    expect(config.table).toBe('_framework_metadata');
    expect(config.autoMigrate).toBe(true);
  });

  it('should accept custom table name', () => {
    const config = MetadataDatasourceConfigSchema.parse({
      datasource: 'main_db',
      table: 'custom_metadata',
    });

    expect(config.table).toBe('custom_metadata');
  });

  it('should accept schema name', () => {
    const config = MetadataDatasourceConfigSchema.parse({
      datasource: 'main_db',
      schema: 'public',
    });

    expect(config.schema).toBe('public');
  });

  it('should accept cache configuration', () => {
    const config = MetadataDatasourceConfigSchema.parse({
      datasource: 'main_db',
      cache: {
        enabled: true,
        ttlSeconds: 7200,
        invalidateOnWrite: false,
      },
    });

    expect(config.cache!.enabled).toBe(true);
    expect(config.cache!.ttlSeconds).toBe(7200);
    expect(config.cache!.invalidateOnWrite).toBe(false);
  });

  it('should use default cache values', () => {
    const config = MetadataDatasourceConfigSchema.parse({
      datasource: 'main_db',
      cache: {},
    });

    expect(config.cache!.enabled).toBe(true);
    expect(config.cache!.ttlSeconds).toBe(3600);
    expect(config.cache!.invalidateOnWrite).toBe(true);
  });

  it('should accept query options', () => {
    const config = MetadataDatasourceConfigSchema.parse({
      datasource: 'main_db',
      queryOptions: {
        batchSize: 200,
        useIndexes: false,
        parallelLoad: true,
      },
    });

    expect(config.queryOptions!.batchSize).toBe(200);
    expect(config.queryOptions!.useIndexes).toBe(false);
    expect(config.queryOptions!.parallelLoad).toBe(true);
  });

  it('should use default query option values', () => {
    const config = MetadataDatasourceConfigSchema.parse({
      datasource: 'main_db',
      queryOptions: {},
    });

    expect(config.queryOptions!.batchSize).toBe(100);
    expect(config.queryOptions!.useIndexes).toBe(true);
    expect(config.queryOptions!.parallelLoad).toBe(false);
  });
});

describe('MetadataLoaderContractSchema - Enhanced', () => {
  it('should accept datasourceConfig', () => {
    const contract = MetadataLoaderContractSchema.parse({
      name: 'database-loader',
      protocol: 'database:',
      capabilities: {
        read: true,
        write: true,
        watch: false,
        list: true,
      },
      datasourceConfig: {
        datasource: 'main_db',
        table: 'metadata',
      },
    });

    expect(contract.name).toBe('database-loader');
    expect(contract.protocol).toBe('database:');
    expect(contract.datasourceConfig!.datasource).toBe('main_db');
  });

  it('should accept loader without datasourceConfig', () => {
    const contract = MetadataLoaderContractSchema.parse({
      name: 'file-loader',
      protocol: 'file:',
      capabilities: {
        read: true,
        write: true,
        watch: true,
        list: true,
      },
    });

    expect(contract.name).toBe('file-loader');
    expect(contract.datasourceConfig).toBeUndefined();
  });
});

describe('MetadataLoadOptionsSchema - Enhanced', () => {
  it('should accept datasource option', () => {
    const options = MetadataLoadOptionsSchema.parse({
      datasource: 'main_db',
    });

    expect(options.datasource).toBe('main_db');
  });

  it('should accept database filters', () => {
    const options = MetadataLoadOptionsSchema.parse({
      datasource: 'main_db',
      filters: {
        type: 'object',
        namespace: 'crm',
      },
    });

    expect(options.filters).toBeDefined();
    expect(options.filters!.type).toBe('object');
  });

  it('should accept sort configuration', () => {
    const options = MetadataLoadOptionsSchema.parse({
      datasource: 'main_db',
      sort: {
        field: 'name',
        order: 'desc',
      },
    });

    expect(options.sort!.field).toBe('name');
    expect(options.sort!.order).toBe('desc');
  });

  it('should use default sort order', () => {
    const options = MetadataLoadOptionsSchema.parse({
      sort: {
        field: 'createdAt',
      },
    });

    expect(options.sort!.order).toBe('asc');
  });
});

describe('MetadataSaveOptionsSchema - Enhanced', () => {
  it('should accept datasource option', () => {
    const options = MetadataSaveOptionsSchema.parse({
      datasource: 'main_db',
    });

    expect(options.datasource).toBe('main_db');
  });

  it('should accept transaction configuration', () => {
    const options = MetadataSaveOptionsSchema.parse({
      datasource: 'main_db',
      transaction: {
        enabled: true,
        isolationLevel: 'serializable',
      },
    });

    expect(options.transaction!.enabled).toBe(true);
    expect(options.transaction!.isolationLevel).toBe('serializable');
  });

  it('should validate isolation levels', () => {
    const levels = ['read_uncommitted', 'read_committed', 'repeatable_read', 'serializable'];

    levels.forEach((level) => {
      expect(() =>
        MetadataSaveOptionsSchema.parse({
          transaction: { isolationLevel: level },
        })
      ).not.toThrow();
    });
  });

  it('should accept onConflict option', () => {
    const strategies = ['error', 'skip', 'update', 'replace'];

    strategies.forEach((strategy) => {
      const options = MetadataSaveOptionsSchema.parse({
        onConflict: strategy,
      });
      expect(options.onConflict).toBe(strategy);
    });
  });

  it('should use default onConflict value', () => {
    const options = MetadataSaveOptionsSchema.parse({});
    expect(options.onConflict).toBe('update');
  });
});

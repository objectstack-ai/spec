import { describe, it, expect } from 'vitest';
import {
  MetadataFormatSchema,
  MetadataStatsSchema,
  MetadataLoadOptionsSchema,
  MetadataSaveOptionsSchema,
  MetadataExportOptionsSchema,
  MetadataImportOptionsSchema,
  MetadataLoadResultSchema,
  MetadataSaveResultSchema,
  MetadataWatchEventSchema,
  MetadataCollectionInfoSchema,
  MetadataLoaderContractSchema,
  MetadataManagerConfigSchema,
} from './metadata-loader.zod';

describe('MetadataLoaderProtocol', () => {
  describe('MetadataFormatSchema', () => {
    it('should accept valid formats', () => {
      expect(MetadataFormatSchema.parse('json')).toBe('json');
      expect(MetadataFormatSchema.parse('yaml')).toBe('yaml');
      expect(MetadataFormatSchema.parse('typescript')).toBe('typescript');
      expect(MetadataFormatSchema.parse('javascript')).toBe('javascript');
    });

    it('should reject invalid formats', () => {
      expect(() => MetadataFormatSchema.parse('xml')).toThrow();
      expect(() => MetadataFormatSchema.parse('toml')).toThrow();
    });
  });

  describe('MetadataStatsSchema', () => {
    it('should validate metadata statistics', () => {
      const stats = {
        size: 1024,
        modifiedAt: '2026-01-31T00:00:00.000Z',
        etag: '"abc123"',
        format: 'json' as const,
      };
      
      const result = MetadataStatsSchema.parse(stats);
      expect(result.size).toBe(1024);
      expect(result.etag).toBe('"abc123"');
      expect(result.format).toBe('json');
    });

    it('should allow optional fields', () => {
      const stats = {
        size: 2048,
        modifiedAt: new Date().toISOString(),
        etag: '"xyz789"',
        format: 'yaml' as const,
        path: '/metadata/objects/customer.object.yaml',
        metadata: { encoding: 'utf-8' },
      };
      
      const result = MetadataStatsSchema.parse(stats);
      expect(result.path).toBe('/metadata/objects/customer.object.yaml');
      expect(result.metadata).toEqual({ encoding: 'utf-8' });
    });

    it('should reject negative size', () => {
      const stats = {
        size: -100,
        modifiedAt: new Date().toISOString(),
        etag: '"abc"',
        format: 'json' as const,
      };
      
      expect(() => MetadataStatsSchema.parse(stats)).toThrow();
    });
  });

  describe('MetadataLoadOptionsSchema', () => {
    it('should apply default values', () => {
      const options = {};
      const result = MetadataLoadOptionsSchema.parse(options);
      
      expect(result.validate).toBe(true);
      expect(result.useCache).toBe(true);
      expect(result.recursive).toBe(true);
    });

    it('should accept all options', () => {
      const options = {
        patterns: ['**/*.object.ts', '**/*.object.json'],
        ifNoneMatch: '"etag123"',
        ifModifiedSince: '2026-01-01T00:00:00.000Z',
        validate: false,
        useCache: false,
        filter: '(item) => item.name.startsWith("sys_")',
        limit: 100,
        recursive: false,
      };
      
      const result = MetadataLoadOptionsSchema.parse(options);
      expect(result.patterns).toHaveLength(2);
      expect(result.limit).toBe(100);
      expect(result.validate).toBe(false);
    });
  });

  describe('MetadataSaveOptionsSchema', () => {
    it('should apply default values', () => {
      const options = {};
      const result = MetadataSaveOptionsSchema.parse(options);
      
      expect(result.format).toBe('typescript');
      expect(result.prettify).toBe(true);
      expect(result.indent).toBe(2);
      expect(result.overwrite).toBe(true);
      expect(result.atomic).toBe(true);
    });

    it('should validate indent range', () => {
      expect(() => 
        MetadataSaveOptionsSchema.parse({ indent: -1 })
      ).toThrow();
      
      expect(() => 
        MetadataSaveOptionsSchema.parse({ indent: 10 })
      ).toThrow();
      
      expect(
        MetadataSaveOptionsSchema.parse({ indent: 4 }).indent
      ).toBe(4);
    });

    it('should accept custom path', () => {
      const options = {
        path: '/custom/path/object.ts',
        format: 'json' as const,
      };
      
      const result = MetadataSaveOptionsSchema.parse(options);
      expect(result.path).toBe('/custom/path/object.ts');
      expect(result.format).toBe('json');
    });
  });

  describe('MetadataExportOptionsSchema', () => {
    it('should require output path', () => {
      expect(() => MetadataExportOptionsSchema.parse({})).toThrow();
      
      const options = { output: './export/objects.json' };
      const result = MetadataExportOptionsSchema.parse(options);
      expect(result.output).toBe('./export/objects.json');
    });

    it('should apply defaults', () => {
      const options = { output: './export.json' };
      const result = MetadataExportOptionsSchema.parse(options);
      
      expect(result.format).toBe('json');
      expect(result.includeStats).toBe(false);
      expect(result.compress).toBe(false);
      expect(result.prettify).toBe(true);
    });
  });

  describe('MetadataImportOptionsSchema', () => {
    it('should apply default conflict resolution', () => {
      const options = {};
      const result = MetadataImportOptionsSchema.parse(options);
      
      expect(result.conflictResolution).toBe('merge');
      expect(result.validate).toBe(true);
      expect(result.dryRun).toBe(false);
      expect(result.continueOnError).toBe(false);
    });

    it('should accept all conflict strategies', () => {
      const strategies = ['skip', 'overwrite', 'merge', 'fail'] as const;
      
      strategies.forEach(strategy => {
        const result = MetadataImportOptionsSchema.parse({ 
          conflictResolution: strategy 
        });
        expect(result.conflictResolution).toBe(strategy);
      });
    });

    it('should accept transform function', () => {
      const options = {
        transform: '(item) => ({ ...item, imported: true })',
      };
      
      const result = MetadataImportOptionsSchema.parse(options);
      expect(result.transform).toBeDefined();
    });
  });

  describe('MetadataLoadResultSchema', () => {
    it('should validate load result', () => {
      const result = {
        data: { name: 'customer', label: 'Customer' },
        fromCache: false,
        notModified: false,
      };
      
      const validated = MetadataLoadResultSchema.parse(result);
      expect(validated.data).toBeDefined();
      expect(validated.fromCache).toBe(false);
    });

    it('should accept null data (not found)', () => {
      const result = {
        data: null,
        fromCache: false,
        notModified: false,
      };
      
      const validated = MetadataLoadResultSchema.parse(result);
      expect(validated.data).toBeNull();
    });

    it('should include optional fields', () => {
      const result = {
        data: { name: 'test' },
        fromCache: true,
        notModified: true,
        etag: '"abc123"',
        stats: {
          size: 512,
          modifiedAt: new Date().toISOString(),
          etag: '"abc123"',
          format: 'typescript' as const,
        },
        loadTime: 45.5,
      };
      
      const validated = MetadataLoadResultSchema.parse(result);
      expect(validated.etag).toBe('"abc123"');
      expect(validated.loadTime).toBe(45.5);
      expect(validated.stats).toBeDefined();
    });
  });

  describe('MetadataSaveResultSchema', () => {
    it('should validate save result', () => {
      const result = {
        success: true,
        path: '/metadata/objects/customer.object.ts',
      };
      
      const validated = MetadataSaveResultSchema.parse(result);
      expect(validated.success).toBe(true);
      expect(validated.path).toBeDefined();
    });

    it('should include optional fields', () => {
      const result = {
        success: true,
        path: '/metadata/objects/customer.object.ts',
        etag: '"new-etag"',
        size: 2048,
        saveTime: 12.3,
        backupPath: '/metadata/objects/customer.object.ts.bak',
      };
      
      const validated = MetadataSaveResultSchema.parse(result);
      expect(validated.size).toBe(2048);
      expect(validated.backupPath).toBeDefined();
    });
  });

  describe('MetadataWatchEventSchema', () => {
    it('should validate watch events', () => {
      const events = [
        {
          type: 'added' as const,
          metadataType: 'object',
          name: 'customer',
          path: '/objects/customer.object.ts',
          data: { name: 'customer' },
          timestamp: new Date().toISOString(),
        },
        {
          type: 'changed' as const,
          metadataType: 'view',
          name: 'customer_list',
          path: '/views/customer_list.view.ts',
          timestamp: new Date().toISOString(),
        },
        {
          type: 'deleted' as const,
          metadataType: 'app',
          name: 'old_app',
          path: '/apps/old_app.ts',
          timestamp: new Date().toISOString(),
        },
      ];
      
      events.forEach(event => {
        const validated = MetadataWatchEventSchema.parse(event);
        expect(validated.type).toBe(event.type);
        expect(validated.metadataType).toBeDefined();
      });
    });
  });

  describe('MetadataCollectionInfoSchema', () => {
    it('should validate collection info', () => {
      const info = {
        type: 'object',
        count: 42,
        formats: ['typescript', 'json'] as const,
      };
      
      const validated = MetadataCollectionInfoSchema.parse(info);
      expect(validated.count).toBe(42);
      expect(validated.formats).toHaveLength(2);
    });

    it('should accept optional fields', () => {
      const info = {
        type: 'view',
        count: 15,
        formats: ['yaml'] as const,
        totalSize: 51200,
        lastModified: '2026-01-31T00:00:00.000Z',
        location: '/metadata/views',
      };
      
      const validated = MetadataCollectionInfoSchema.parse(info);
      expect(validated.totalSize).toBe(51200);
      expect(validated.location).toBe('/metadata/views');
    });
  });

  describe('MetadataLoaderContractSchema', () => {
    it('should validate loader contract', () => {
      const contract = {
        name: 'filesystem',
        protocol: 'file:',
        capabilities: {
          read: true,
          write: true,
          watch: false,
          list: true,
        },
        supportedFormats: ['json', 'yaml', 'typescript'] as const,
      };
      
      const validated = MetadataLoaderContractSchema.parse(contract);
      expect(validated.name).toBe('filesystem');
      expect(validated.protocol).toBe('file:');
      expect(validated.supportsWatch).toBe(false); // default
      expect(validated.supportsWrite).toBe(true); // default
      expect(validated.supportsCache).toBe(true); // default
    });

    it('should allow custom capabilities', () => {
      const contract = {
        name: 'http',
        protocol: 'http:',
        capabilities: {
          read: true,
          write: false,
          watch: false,
          list: false,
        },
        supportedFormats: ['json'] as const,
        supportsWatch: false,
        supportsWrite: false,
        supportsCache: true,
      };
      
      const validated = MetadataLoaderContractSchema.parse(contract);
      expect(validated.protocol).toBe('http:');
      expect(validated.supportsWrite).toBe(false);
      expect(validated.supportsCache).toBe(true);
    });

    it('should accept datasource protocol', () => {
      const contract = {
        name: 'database',
        protocol: 'datasource:',
        capabilities: { read: true, write: true, watch: false, list: true },
        supportedFormats: ['json'] as const,
      };
      
      const validated = MetadataLoaderContractSchema.parse(contract);
      expect(validated.protocol).toBe('datasource:');
      expect(validated.capabilities.write).toBe(true);
    });

    it('should accept all valid protocols', () => {
      const protocols = ['file:', 'http:', 's3:', 'datasource:', 'memory:'];
      protocols.forEach((protocol) => {
        expect(() => MetadataLoaderContractSchema.parse({
          name: 'test', protocol, capabilities: {}, supportedFormats: ['json'],
        })).not.toThrow();
      });
    });

    it('should reject invalid protocol', () => {
      expect(() => MetadataLoaderContractSchema.parse({
        name: 'test', protocol: 'ftp:', capabilities: {}, supportedFormats: ['json'],
      })).toThrow();
    });
  });

  describe('MetadataManagerConfigSchema', () => {
    it('should apply defaults', () => {
      const config = {};
      const validated = MetadataManagerConfigSchema.parse(config);
      
      expect(validated.formats).toEqual(['typescript', 'json', 'yaml']);
      expect(validated.watch).toBe(false);
      expect(validated.tableName).toBe('sys_metadata');
      expect(validated.fallback).toBe('none');
    });

    it('should accept datasource-backed configuration', () => {
      const config = {
        datasource: 'default',
        tableName: 'custom_metadata',
        fallback: 'filesystem' as const,
        rootDir: '/metadata',
      };

      const validated = MetadataManagerConfigSchema.parse(config);
      expect(validated.datasource).toBe('default');
      expect(validated.tableName).toBe('custom_metadata');
      expect(validated.fallback).toBe('filesystem');
    });

    it('should validate complete configuration', () => {
      const config = {
        datasource: 'postgres_main',
        tableName: 'sys_metadata',
        fallback: 'memory' as const,
        rootDir: '/metadata',
        formats: ['typescript', 'json'] as const,
        cache: {
          enabled: true,
          ttl: 7200,
          maxSize: 10485760, // 10MB
        },
        watch: true,
        watchOptions: {
          ignored: ['**/node_modules/**', '**/*.test.ts'],
          persistent: true,
          ignoreInitial: true,
        },
        validation: {
          strict: true,
          throwOnError: true,
        },
        loaderOptions: {
          encoding: 'utf-8',
        },
      };
      
      const validated = MetadataManagerConfigSchema.parse(config);
      expect(validated.datasource).toBe('postgres_main');
      expect(validated.rootDir).toBe('/metadata');
      expect(validated.cache?.ttl).toBe(7200);
      expect(validated.watchOptions?.ignored).toHaveLength(2);
      expect(validated.loaderOptions?.encoding).toBe('utf-8');
    });

    it('should accept all fallback strategies', () => {
      const strategies = ['filesystem', 'memory', 'none'] as const;
      strategies.forEach((fallback) => {
        const validated = MetadataManagerConfigSchema.parse({ fallback });
        expect(validated.fallback).toBe(fallback);
      });
    });

    it('should reject invalid fallback strategy', () => {
      expect(() => MetadataManagerConfigSchema.parse({ fallback: 'redis' })).toThrow();
    });

    it('should reject negative TTL', () => {
      const config = {
        cache: { enabled: true, ttl: -100 },
      };
      
      expect(() => MetadataManagerConfigSchema.parse(config)).toThrow();
    });
  });
});

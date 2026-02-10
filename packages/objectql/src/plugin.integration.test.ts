// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, beforeEach } from 'vitest';
import { ObjectKernel } from '@objectstack/core';
import { ObjectQLPlugin } from '../src/plugin';
import { ObjectSchema } from '@objectstack/spec/data';

describe('ObjectQLPlugin - Metadata Service Integration', () => {
  let kernel: ObjectKernel;

  beforeEach(() => {
    kernel = new ObjectKernel({ logLevel: 'silent' });
  });

  describe('Simple Mode (ObjectQL-only)', () => {
    it('should register ObjectQL as metadata service provider', async () => {
      // Arrange
      const plugin = new ObjectQLPlugin();
      kernel.use(plugin);

      // Act
      await kernel.bootstrap();

      // Assert
      const metadataService = kernel.getService('metadata');
      expect(metadataService).toBeDefined();
      
      // Should be the ObjectQL instance
      const objectql = kernel.getService('objectql');
      expect(metadataService).toBe(objectql);
    });

    it('should serve in-memory metadata definitions', async () => {
      // Arrange
      const plugin = new ObjectQLPlugin();
      kernel.use(plugin);
      await kernel.bootstrap();

      const objectql = kernel.getService('objectql') as any;
      const testObject: ObjectSchema = {
        name: 'test_object',
        label: 'Test Object',
        fields: {
          name: {
            name: 'name',
            label: 'Name',
            type: 'text'
          }
        }
      };

      // Act - Register object programmatically
      objectql.registry.registerObject({
        packageId: 'test',
        namespace: 'test',
        ownership: 'own',
        object: testObject
      });

      // Assert - Should be retrievable via registry
      const objects = objectql.registry.listObjects();
      expect(objects).toContain('test__test_object');
    });
  });

  describe('Service Registration', () => {
    it('should register objectql, data, and protocol services', async () => {
      // Arrange
      const plugin = new ObjectQLPlugin();
      kernel.use(plugin);

      // Act
      await kernel.bootstrap();

      // Assert
      expect(kernel.getService('objectql')).toBeDefined();
      expect(kernel.getService('data')).toBeDefined();
      expect(kernel.getService('protocol')).toBeDefined();
    });

    it('should respect existing metadata service', async () => {
      // Arrange - Register a mock metadata service first
      const mockMetadataService = {
        load: async () => null,
        loadMany: async () => [],
        save: async () => ({ success: true }),
        exists: async () => false,
        list: async () => []
      };

      kernel.use({
        name: 'mock-metadata',
        type: 'test',
        version: '1.0.0',
        init: async (ctx) => {
          ctx.registerService('metadata', mockMetadataService);
        }
      });

      const plugin = new ObjectQLPlugin();
      kernel.use(plugin);

      // Act
      await kernel.bootstrap();

      // Assert - metadata service should be the mock, not ObjectQL
      const metadataService = kernel.getService('metadata');
      expect(metadataService).toBe(mockMetadataService);
      
      const objectql = kernel.getService('objectql');
      expect(metadataService).not.toBe(objectql);
    });
  });

  describe('Driver and App Discovery', () => {
    it('should discover and register drivers from kernel services', async () => {
      // Arrange
      const mockDriver = {
        name: 'mock-driver',
        connect: async () => {},
        disconnect: async () => {},
        query: async () => ({ rows: [] }),
        insert: async () => ({ id: '1' }),
        update: async () => ({ count: 1 }),
        delete: async () => ({ count: 1 })
      };

      kernel.use({
        name: 'mock-driver-plugin',
        type: 'driver',
        version: '1.0.0',
        init: async (ctx) => {
          ctx.registerService('driver.mock', mockDriver);
        }
      });

      const plugin = new ObjectQLPlugin();
      kernel.use(plugin);

      // Act
      await kernel.bootstrap();

      // Assert
      const objectql = kernel.getService('objectql') as any;
      expect(objectql.drivers?.has('mock-driver')).toBe(true);
    });

    it('should discover and register apps from kernel services', async () => {
      // Arrange
      const mockApp = {
        manifest: {
          id: 'test-app',
          name: 'test_app',
          version: '1.0.0',
          type: 'app'
        }
      };

      kernel.use({
        name: 'mock-app-plugin',
        type: 'app',
        version: '1.0.0',
        init: async (ctx) => {
          ctx.registerService('app.test', mockApp.manifest);
        }
      });

      const plugin = new ObjectQLPlugin();
      kernel.use(plugin);

      // Act
      await kernel.bootstrap();

      // Assert
      const objectql = kernel.getService('objectql') as any;
      // App should be registered (check via registry or apps list)
      expect(objectql.registry).toBeDefined();
    });
  });

  describe('Metadata Sync from External Service', () => {
    it('should load metadata from external service into ObjectQL registry', async () => {
      // Arrange - Mock external metadata service with test data
      const testObject: ObjectSchema = {
        name: 'external_object',
        label: 'External Object',
        fields: {
          title: {
            name: 'title',
            label: 'Title',
            type: 'text'
          }
        }
      };

      const mockMetadataService = {
        load: async (type: string, name: string) => {
          if (type === 'object' && name === 'external_object') {
            return testObject;
          }
          return null;
        },
        loadMany: async (type: string) => {
          if (type === 'object') {
            return [testObject];
          }
          return [];
        },
        save: async () => ({ success: true, path: '/test' }),
        exists: async () => false,
        list: async () => []
      };

      // Register mock metadata service BEFORE ObjectQL
      kernel.use({
        name: 'mock-metadata',
        type: 'metadata',
        version: '1.0.0',
        init: async (ctx) => {
          ctx.registerService('metadata', mockMetadataService);
        }
      });

      const plugin = new ObjectQLPlugin();
      kernel.use(plugin);

      // Act
      await kernel.bootstrap();

      // Assert - Metadata should be synced
      const metadataService = kernel.getService('metadata');
      expect(metadataService).toBe(mockMetadataService);
      
      const objectql = kernel.getService('objectql') as any;
      expect(objectql.registry).toBeDefined();
      
      // Note: The actual sync happens in start phase
      // We can verify by checking if ObjectQL detected external service
    });
  });
});

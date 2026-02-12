// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetadataManager } from './metadata-manager';
import { MemoryLoader } from './loaders/memory-loader';
import { DEFAULT_METADATA_TYPE_REGISTRY } from '@objectstack/spec/kernel';
import type { MetadataOverlay } from '@objectstack/spec/kernel';

// Suppress logger output during tests
vi.mock('@objectstack/core', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

describe('MetadataManager — IMetadataService Contract', () => {
  let manager: MetadataManager;
  let memoryLoader: MemoryLoader;

  beforeEach(() => {
    memoryLoader = new MemoryLoader();
    manager = new MetadataManager({
      formats: ['json'],
      loaders: [memoryLoader],
    });
    manager.setTypeRegistry(DEFAULT_METADATA_TYPE_REGISTRY);
  });

  // ==========================================
  // Core CRUD Operations
  // ==========================================

  describe('register / get', () => {
    it('should register and retrieve a metadata item', async () => {
      await manager.register('object', 'account', { name: 'account', label: 'Account' });
      const result = await manager.get('object', 'account');
      expect(result).toEqual({ name: 'account', label: 'Account' });
    });

    it('should return undefined for non-existent item', async () => {
      const result = await manager.get('object', 'nonexistent');
      expect(result).toBeUndefined();
    });

    it('should overwrite existing item on re-register', async () => {
      await manager.register('object', 'account', { name: 'account', label: 'V1' });
      await manager.register('object', 'account', { name: 'account', label: 'V2' });
      const result = await manager.get('object', 'account');
      expect(result).toEqual({ name: 'account', label: 'V2' });
    });

    it('should fall back to loaders when not in registry', async () => {
      await memoryLoader.save('object', 'contact', { name: 'contact', label: 'Contact' });
      const result = await manager.get('object', 'contact');
      expect(result).toEqual({ name: 'contact', label: 'Contact' });
    });
  });

  describe('list (IMetadataService)', () => {
    it('should return all items from registry and loaders', async () => {
      await manager.register('object', 'account', { name: 'account' });
      await memoryLoader.save('object', 'contact', { name: 'contact' });
      const items = await manager.list('object');
      expect(items).toHaveLength(2);
    });

    it('should deduplicate items between registry and loaders', async () => {
      await manager.register('object', 'account', { name: 'account', label: 'Registry' });
      await memoryLoader.save('object', 'account', { name: 'account', label: 'Loader' });
      const items = await manager.list('object');
      expect(items).toHaveLength(1);
      // Registry takes precedence
      expect((items[0] as any).label).toBe('Registry');
    });

    it('should return empty array for unknown type', async () => {
      const items = await manager.list('unknown_type');
      expect(items).toEqual([]);
    });
  });

  describe('unregister', () => {
    it('should remove an item from the registry', async () => {
      await manager.register('object', 'account', { name: 'account' });
      await manager.unregister('object', 'account');
      const result = await manager.get('object', 'account');
      expect(result).toBeUndefined();
    });

    it('should not throw when unregistering non-existent item', async () => {
      await expect(manager.unregister('object', 'nonexistent')).resolves.not.toThrow();
    });
  });

  describe('exists', () => {
    it('should find items in registry', async () => {
      await manager.register('view', 'my_view', { name: 'my_view' });
      expect(await manager.exists('view', 'my_view')).toBe(true);
    });

    it('should find items in loaders', async () => {
      await memoryLoader.save('object', 'task', { name: 'task' });
      expect(await manager.exists('object', 'task')).toBe(true);
    });

    it('should return false for non-existent items', async () => {
      expect(await manager.exists('object', 'nope')).toBe(false);
    });
  });

  describe('listNames', () => {
    it('should return names from both registry and loaders', async () => {
      await manager.register('object', 'account', { name: 'account' });
      await memoryLoader.save('object', 'contact', {});
      const names = await manager.listNames('object');
      expect(names).toContain('account');
      expect(names).toContain('contact');
    });

    it('should deduplicate names', async () => {
      await manager.register('object', 'account', { name: 'account' });
      await memoryLoader.save('object', 'account', {});
      const names = await manager.listNames('object');
      expect(names.filter(n => n === 'account')).toHaveLength(1);
    });
  });

  describe('getObject / listObjects', () => {
    it('getObject should be shorthand for get("object", name)', async () => {
      await manager.register('object', 'account', { name: 'account', label: 'Account' });
      const result = await manager.getObject('account');
      expect(result).toEqual({ name: 'account', label: 'Account' });
    });

    it('listObjects should be shorthand for list("object")', async () => {
      await manager.register('object', 'account', { name: 'account' });
      await manager.register('object', 'contact', { name: 'contact' });
      const items = await manager.listObjects();
      expect(items).toHaveLength(2);
    });
  });

  // ==========================================
  // Package Management
  // ==========================================

  describe('unregisterPackage', () => {
    it('should remove all items from a package', async () => {
      await manager.register('object', 'crm_account', { name: 'crm_account', packageId: 'com.acme.crm' });
      await manager.register('object', 'crm_contact', { name: 'crm_contact', packageId: 'com.acme.crm' });
      await manager.register('object', 'sys_user', { name: 'sys_user', packageId: 'com.objectstack.core' });

      await manager.unregisterPackage('com.acme.crm');

      expect(await manager.get('object', 'crm_account')).toBeUndefined();
      expect(await manager.get('object', 'crm_contact')).toBeUndefined();
      expect(await manager.get('object', 'sys_user')).toBeDefined();
    });
  });

  // ==========================================
  // Query / Search
  // ==========================================

  describe('query', () => {
    beforeEach(async () => {
      await manager.register('object', 'account', { name: 'account', label: 'Account' });
      await manager.register('object', 'contact', { name: 'contact', label: 'Contact' });
      await manager.register('view', 'account_list', { name: 'account_list', label: 'Account List' });
    });

    it('should return all items when no filters', async () => {
      const result = await manager.query({});
      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(result.page).toBe(1);
    });

    it('should filter by type', async () => {
      const result = await manager.query({ types: ['object'] });
      expect(result.total).toBe(2);
      expect(result.items.every(i => i.type === 'object')).toBe(true);
    });

    it('should support search', async () => {
      const result = await manager.query({ search: 'account' });
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.items.every(i =>
        i.name.includes('account') || (i.label && i.label.toLowerCase().includes('account'))
      )).toBe(true);
    });

    it('should support pagination', async () => {
      const result = await manager.query({ types: ['object'], page: 1, pageSize: 1 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1);
    });

    it('should support sorting', async () => {
      const asc = await manager.query({ types: ['object'], sortBy: 'name', sortOrder: 'asc' });
      expect(asc.items[0].name).toBe('account');

      const desc = await manager.query({ types: ['object'], sortBy: 'name', sortOrder: 'desc' });
      expect(desc.items[0].name).toBe('contact');
    });
  });

  // ==========================================
  // Bulk Operations
  // ==========================================

  describe('bulkRegister', () => {
    it('should register multiple items at once', async () => {
      const result = await manager.bulkRegister([
        { type: 'object', name: 'account', data: { name: 'account' } },
        { type: 'object', name: 'contact', data: { name: 'contact' } },
        { type: 'view', name: 'account_list', data: { name: 'account_list' } },
      ]);

      expect(result.total).toBe(3);
      expect(result.succeeded).toBe(3);
      expect(result.failed).toBe(0);

      expect(await manager.get('object', 'account')).toBeDefined();
      expect(await manager.get('view', 'account_list')).toBeDefined();
    });
  });

  describe('bulkUnregister', () => {
    it('should unregister multiple items at once', async () => {
      await manager.register('object', 'account', { name: 'account' });
      await manager.register('object', 'contact', { name: 'contact' });

      const result = await manager.bulkUnregister([
        { type: 'object', name: 'account' },
        { type: 'object', name: 'contact' },
      ]);

      expect(result.total).toBe(2);
      expect(result.succeeded).toBe(2);
      expect(await manager.get('object', 'account')).toBeUndefined();
    });
  });

  // ==========================================
  // Overlay / Customization
  // ==========================================

  describe('overlay management', () => {
    const testOverlay: MetadataOverlay = {
      id: 'overlay-1',
      baseType: 'object',
      baseName: 'account',
      scope: 'platform',
      patch: { label: 'Custom Account' },
      active: true,
    };

    it('should save and retrieve an overlay', async () => {
      await manager.saveOverlay(testOverlay);
      const result = await manager.getOverlay('object', 'account', 'platform');
      expect(result).toEqual(testOverlay);
    });

    it('should return undefined for missing overlay', async () => {
      const result = await manager.getOverlay('object', 'nonexistent');
      expect(result).toBeUndefined();
    });

    it('should remove an overlay', async () => {
      await manager.saveOverlay(testOverlay);
      await manager.removeOverlay('object', 'account', 'platform');
      const result = await manager.getOverlay('object', 'account', 'platform');
      expect(result).toBeUndefined();
    });

    it('should get effective metadata with overlays applied', async () => {
      await manager.register('object', 'account', { name: 'account', label: 'Account', type: 'object' });
      await manager.saveOverlay(testOverlay);

      const effective = await manager.getEffective('object', 'account') as any;
      expect(effective.label).toBe('Custom Account');
      expect(effective.name).toBe('account');
      expect(effective.type).toBe('object');
    });

    it('should apply user overlay on top of platform overlay', async () => {
      await manager.register('object', 'account', { name: 'account', label: 'Account' });

      await manager.saveOverlay({
        id: 'platform-1',
        baseType: 'object',
        baseName: 'account',
        scope: 'platform',
        patch: { label: 'Platform Label', description: 'Platform Desc' },
        active: true,
      });

      await manager.saveOverlay({
        id: 'user-1',
        baseType: 'object',
        baseName: 'account',
        scope: 'user',
        patch: { label: 'User Label' },
        active: true,
      });

      const effective = await manager.getEffective('object', 'account') as any;
      expect(effective.label).toBe('User Label');
      expect(effective.description).toBe('Platform Desc');
    });

    it('should not apply inactive overlays', async () => {
      await manager.register('object', 'account', { name: 'account', label: 'Original' });
      await manager.saveOverlay({
        id: 'inactive-1',
        baseType: 'object',
        baseName: 'account',
        scope: 'platform',
        patch: { label: 'Should Not Apply' },
        active: false,
      });

      const effective = await manager.getEffective('object', 'account') as any;
      expect(effective.label).toBe('Original');
    });
  });

  // ==========================================
  // Watch / Subscribe (IMetadataService)
  // ==========================================

  describe('watchService', () => {
    it('should return a handle with unsubscribe', () => {
      const callback = vi.fn();
      const handle = manager.watchService('object', callback);
      expect(handle).toBeDefined();
      expect(typeof handle.unsubscribe).toBe('function');
    });

    it('should invoke callback on notification', () => {
      const callback = vi.fn();
      manager.watchService('object', callback);

      // Trigger via internal method
      (manager as any).notifyWatchers('object', {
        type: 'changed',
        metadataType: 'object',
        name: 'account',
        path: '/fake',
        timestamp: new Date().toISOString(),
      });

      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'updated', metadataType: 'object', name: 'account' })
      );
    });

    it('should stop invoking after unsubscribe', () => {
      const callback = vi.fn();
      const handle = manager.watchService('object', callback);
      handle.unsubscribe();

      (manager as any).notifyWatchers('object', {
        type: 'added',
        metadataType: 'object',
        name: 'account',
        path: '/fake',
        timestamp: new Date().toISOString(),
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // Import / Export
  // ==========================================

  describe('exportMetadata', () => {
    it('should export all registered metadata', async () => {
      await manager.register('object', 'account', { name: 'account' });
      await manager.register('view', 'account_list', { name: 'account_list' });

      const bundle = await manager.exportMetadata() as Record<string, unknown[]>;
      expect(bundle.object).toHaveLength(1);
      expect(bundle.view).toHaveLength(1);
    });

    it('should filter by types', async () => {
      await manager.register('object', 'account', { name: 'account' });
      await manager.register('view', 'account_list', { name: 'account_list' });

      const bundle = await manager.exportMetadata({ types: ['object'] }) as Record<string, unknown[]>;
      expect(bundle.object).toHaveLength(1);
      expect(bundle.view).toBeUndefined();
    });
  });

  describe('importMetadata', () => {
    it('should import metadata from bundle', async () => {
      const bundle = {
        object: [{ name: 'account', label: 'Account' }, { name: 'contact', label: 'Contact' }],
        view: [{ name: 'account_list', label: 'Account List' }],
      };

      const result = await manager.importMetadata(bundle);
      expect(result.total).toBe(3);
      expect(result.imported).toBe(3);
      expect(result.failed).toBe(0);

      expect(await manager.get('object', 'account')).toBeDefined();
    });

    it('should skip existing items with skip strategy', async () => {
      await manager.register('object', 'account', { name: 'account', label: 'Original' });

      const bundle = {
        object: [{ name: 'account', label: 'Imported' }],
      };

      const result = await manager.importMetadata(bundle, { conflictResolution: 'skip' });
      expect(result.skipped).toBe(1);
      expect(result.imported).toBe(0);

      const item = await manager.get('object', 'account') as any;
      expect(item.label).toBe('Original');
    });

    it('should overwrite existing items with overwrite strategy', async () => {
      await manager.register('object', 'account', { name: 'account', label: 'Original' });

      const bundle = {
        object: [{ name: 'account', label: 'Overwritten' }],
      };

      const result = await manager.importMetadata(bundle, { conflictResolution: 'overwrite' });
      expect(result.imported).toBe(1);

      const item = await manager.get('object', 'account') as any;
      expect(item.label).toBe('Overwritten');
    });

    it('should merge existing items with merge strategy', async () => {
      await manager.register('object', 'account', { name: 'account', label: 'Original', type: 'object' });

      const bundle = {
        object: [{ name: 'account', label: 'Merged', description: 'New desc' }],
      };

      const result = await manager.importMetadata(bundle, { conflictResolution: 'merge' });
      expect(result.imported).toBe(1);

      const item = await manager.get('object', 'account') as any;
      expect(item.label).toBe('Merged');
      expect(item.type).toBe('object');
      expect(item.description).toBe('New desc');
    });

    it('should support dry run', async () => {
      const bundle = {
        object: [{ name: 'account', label: 'Account' }],
      };

      const result = await manager.importMetadata(bundle, { dryRun: true });
      expect(result.imported).toBe(1);

      // Should not actually register
      expect(await manager.get('object', 'account')).toBeUndefined();
    });
  });

  // ==========================================
  // Validation
  // ==========================================

  describe('validate', () => {
    it('should validate valid metadata', async () => {
      const result = await manager.validate('object', { name: 'account', label: 'Account' });
      expect(result.valid).toBe(true);
    });

    it('should reject null data', async () => {
      const result = await manager.validate('object', null);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject non-object data', async () => {
      const result = await manager.validate('object', 'not-an-object');
      expect(result.valid).toBe(false);
    });

    it('should reject data without name field', async () => {
      const result = await manager.validate('object', { label: 'No Name' });
      expect(result.valid).toBe(false);
      expect(result.errors![0].path).toBe('name');
    });

    it('should warn about missing label', async () => {
      const result = await manager.validate('object', { name: 'account' });
      expect(result.valid).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.some(w => w.path === 'label')).toBe(true);
    });
  });

  // ==========================================
  // Type Registry
  // ==========================================

  describe('type registry', () => {
    it('should return all registered types', async () => {
      const types = await manager.getRegisteredTypes();
      expect(types).toContain('object');
      expect(types).toContain('view');
      expect(types).toContain('flow');
      expect(types).toContain('agent');
    });

    it('should include custom types from registry', async () => {
      await manager.register('custom_type', 'item1', { name: 'item1' });
      const types = await manager.getRegisteredTypes();
      expect(types).toContain('custom_type');
    });

    it('should return type info for known types', async () => {
      const info = await manager.getTypeInfo('object');
      expect(info).toBeDefined();
      expect(info!.type).toBe('object');
      expect(info!.label).toBe('Object');
      expect(info!.domain).toBe('data');
      expect(info!.supportsOverlay).toBe(true);
      expect(info!.filePatterns).toBeDefined();
    });

    it('should return undefined for unknown types', async () => {
      const info = await manager.getTypeInfo('unknown_type');
      expect(info).toBeUndefined();
    });
  });

  // ==========================================
  // Dependency Tracking
  // ==========================================

  describe('dependency tracking', () => {
    it('should track and retrieve dependencies', async () => {
      manager.addDependency({
        sourceType: 'view',
        sourceName: 'account_list',
        targetType: 'object',
        targetName: 'account',
        kind: 'reference',
      });

      const deps = await manager.getDependencies('view', 'account_list');
      expect(deps).toHaveLength(1);
      expect(deps[0].targetType).toBe('object');
      expect(deps[0].targetName).toBe('account');
    });

    it('should find dependents of a target', async () => {
      manager.addDependency({
        sourceType: 'view',
        sourceName: 'account_list',
        targetType: 'object',
        targetName: 'account',
        kind: 'reference',
      });

      manager.addDependency({
        sourceType: 'flow',
        sourceName: 'account_flow',
        targetType: 'object',
        targetName: 'account',
        kind: 'triggers',
      });

      const dependents = await manager.getDependents('object', 'account');
      expect(dependents).toHaveLength(2);
    });

    it('should return empty array when no dependencies', async () => {
      expect(await manager.getDependencies('object', 'nonexistent')).toEqual([]);
      expect(await manager.getDependents('object', 'nonexistent')).toEqual([]);
    });
  });
});

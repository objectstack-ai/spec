import { describe, it, expect } from 'vitest';
import type { IMetadataService } from './metadata-service';

describe('Metadata Service Contract', () => {
  it('should allow a minimal IMetadataService implementation with required methods', () => {
    const service: IMetadataService = {
      register: async (_type, _name, _data) => {},
      get: async (_type, _name) => undefined,
      list: async (_type) => [],
      unregister: async (_type, _name) => {},
      exists: async (_type, _name) => false,
      listNames: async (_type) => [],
      getObject: async (_name) => undefined,
      listObjects: async () => [],
    };

    expect(typeof service.register).toBe('function');
    expect(typeof service.get).toBe('function');
    expect(typeof service.list).toBe('function');
    expect(typeof service.unregister).toBe('function');
    expect(typeof service.exists).toBe('function');
    expect(typeof service.listNames).toBe('function');
    expect(typeof service.getObject).toBe('function');
    expect(typeof service.listObjects).toBe('function');
  });

  it('should allow a full implementation with optional methods', () => {
    const service: IMetadataService = {
      register: async () => {},
      get: async () => undefined,
      list: async () => [],
      unregister: async () => {},
      exists: async () => false,
      listNames: async () => [],
      getObject: async () => undefined,
      listObjects: async () => [],
      unregisterPackage: async (_packageName) => {},
    };

    expect(service.unregisterPackage).toBeDefined();
  });

  it('should register and retrieve metadata items asynchronously', async () => {
    const store = new Map<string, Map<string, unknown>>();

    const service: IMetadataService = {
      register: async (type, name, data) => {
        if (!store.has(type)) store.set(type, new Map());
        store.get(type)!.set(name, data);
      },
      get: async (type, name) => store.get(type)?.get(name),
      list: async (type) => Array.from(store.get(type)?.values() ?? []),
      unregister: async (type, name) => { store.get(type)?.delete(name); },
      exists: async (type, name) => store.get(type)?.has(name) ?? false,
      listNames: async (type) => Array.from(store.get(type)?.keys() ?? []),
      getObject: async (name) => store.get('object')?.get(name),
      listObjects: async () => Array.from(store.get('object')?.values() ?? []),
    };

    const objectDef = { name: 'account', label: 'Account', fields: {} };
    await service.register('object', 'account', objectDef);

    expect(await service.get('object', 'account')).toEqual(objectDef);
    expect(await service.getObject('account')).toEqual(objectDef);
    expect(await service.listObjects()).toHaveLength(1);
    expect(await service.exists('object', 'account')).toBe(true);
    expect(await service.listNames('object')).toEqual(['account']);

    await service.unregister('object', 'account');
    expect(await service.get('object', 'account')).toBeUndefined();
    expect(await service.exists('object', 'account')).toBe(false);
  });

  it('should list items by type', async () => {
    const store = new Map<string, Map<string, unknown>>();

    const service: IMetadataService = {
      register: async (type, name, data) => {
        if (!store.has(type)) store.set(type, new Map());
        store.get(type)!.set(name, data);
      },
      get: async (type, name) => store.get(type)?.get(name),
      list: async (type) => Array.from(store.get(type)?.values() ?? []),
      unregister: async (type, name) => { store.get(type)?.delete(name); },
      exists: async (type, name) => store.get(type)?.has(name) ?? false,
      listNames: async (type) => Array.from(store.get(type)?.keys() ?? []),
      getObject: async (name) => store.get('object')?.get(name),
      listObjects: async () => Array.from(store.get('object')?.values() ?? []),
    };

    await service.register('object', 'account', { name: 'account', label: 'Account' });
    await service.register('object', 'contact', { name: 'contact', label: 'Contact' });
    await service.register('view', 'account_list', { name: 'account_list', label: 'Account List' });

    expect(await service.list('object')).toHaveLength(2);
    expect(await service.list('view')).toHaveLength(1);
    expect(await service.list('flow')).toHaveLength(0);
    expect(await service.listNames('object')).toEqual(['account', 'contact']);
  });
});

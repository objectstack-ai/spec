import { describe, it, expect } from 'vitest';
import type { IMetadataService } from './metadata-service';

describe('Metadata Service Contract', () => {
  it('should allow a minimal IMetadataService implementation with required methods', () => {
    const service: IMetadataService = {
      register: (_type, _definition) => {},
      get: (_type, _name) => undefined,
      list: (_type) => [],
      unregister: (_type, _name) => {},
      getObject: (_name) => undefined,
      listObjects: () => [],
    };

    expect(typeof service.register).toBe('function');
    expect(typeof service.get).toBe('function');
    expect(typeof service.list).toBe('function');
    expect(typeof service.unregister).toBe('function');
    expect(typeof service.getObject).toBe('function');
    expect(typeof service.listObjects).toBe('function');
  });

  it('should allow a full implementation with optional methods', () => {
    const service: IMetadataService = {
      register: () => {},
      get: () => undefined,
      list: () => [],
      unregister: () => {},
      getObject: () => undefined,
      listObjects: () => [],
      unregisterPackage: (_packageName) => {},
    };

    expect(service.unregisterPackage).toBeDefined();
  });

  it('should register and retrieve metadata items', () => {
    const store = new Map<string, Map<string, unknown>>();

    const service: IMetadataService = {
      register: (type, definition) => {
        if (!store.has(type)) store.set(type, new Map());
        const def = definition as { name: string };
        store.get(type)!.set(def.name, definition);
      },
      get: (type, name) => store.get(type)?.get(name),
      list: (type) => Array.from(store.get(type)?.values() ?? []),
      unregister: (type, name) => { store.get(type)?.delete(name); },
      getObject: (name) => store.get('object')?.get(name),
      listObjects: () => Array.from(store.get('object')?.values() ?? []),
    };

    const objectDef = { name: 'account', label: 'Account', fields: {} };
    service.register('object', objectDef);

    expect(service.get('object', 'account')).toEqual(objectDef);
    expect(service.getObject('account')).toEqual(objectDef);
    expect(service.listObjects()).toHaveLength(1);

    service.unregister('object', 'account');
    expect(service.get('object', 'account')).toBeUndefined();
  });

  it('should list items by type', () => {
    const store = new Map<string, Map<string, unknown>>();

    const service: IMetadataService = {
      register: (type, definition) => {
        if (!store.has(type)) store.set(type, new Map());
        const def = definition as { name: string };
        store.get(type)!.set(def.name, definition);
      },
      get: (type, name) => store.get(type)?.get(name),
      list: (type) => Array.from(store.get(type)?.values() ?? []),
      unregister: (type, name) => { store.get(type)?.delete(name); },
      getObject: (name) => store.get('object')?.get(name),
      listObjects: () => Array.from(store.get('object')?.values() ?? []),
    };

    service.register('object', { name: 'account', label: 'Account' });
    service.register('object', { name: 'contact', label: 'Contact' });
    service.register('view', { name: 'account_list', label: 'Account List' });

    expect(service.list('object')).toHaveLength(2);
    expect(service.list('view')).toHaveLength(1);
    expect(service.list('flow')).toHaveLength(0);
  });
});

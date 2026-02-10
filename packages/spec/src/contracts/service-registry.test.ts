import { describe, it, expect } from 'vitest';
import type {
  IServiceRegistry,
  IBasicServiceRegistry,
  IAdvancedServiceRegistry,
} from './service-registry';

describe('Service Registry Contract', () => {
  describe('IServiceRegistry interface', () => {
    it('should allow a minimal implementation with required methods', () => {
      const services = new Map<string, any>();

      const registry: IServiceRegistry = {
        register<T>(name: string, service: T) {
          if (services.has(name)) throw new Error(`Service ${name} already registered`);
          services.set(name, service);
        },
        get<T>(name: string): T {
          if (!services.has(name)) throw new Error(`Service ${name} not found`);
          return services.get(name) as T;
        },
        getAsync: async <T>(name: string): Promise<T> => {
          if (!services.has(name)) throw new Error(`Service ${name} not found`);
          return services.get(name) as T;
        },
        has: (name: string) => services.has(name),
        unregister: (name: string) => services.delete(name),
      };

      expect(typeof registry.register).toBe('function');
      expect(typeof registry.get).toBe('function');
      expect(typeof registry.getAsync).toBe('function');
      expect(typeof registry.has).toBe('function');
      expect(typeof registry.unregister).toBe('function');
    });

    it('should register and retrieve services', () => {
      const services = new Map<string, any>();

      const registry: IServiceRegistry = {
        register<T>(name: string, service: T) {
          if (services.has(name)) throw new Error(`Already registered: ${name}`);
          services.set(name, service);
        },
        get<T>(name: string): T {
          if (!services.has(name)) throw new Error(`Not found: ${name}`);
          return services.get(name) as T;
        },
        getAsync: async <T>(name: string): Promise<T> => {
          return services.get(name) as T;
        },
        has: (name: string) => services.has(name),
        unregister: (name: string) => services.delete(name),
      };

      registry.register('db', { type: 'postgres' });
      expect(registry.has('db')).toBe(true);
      expect(registry.get<{ type: string }>('db').type).toBe('postgres');
    });

    it('should unregister services', () => {
      const services = new Map<string, any>();

      const registry: IServiceRegistry = {
        register: (name, service) => { services.set(name, service); },
        get: (name) => services.get(name),
        getAsync: async (name) => services.get(name),
        has: (name) => services.has(name),
        unregister: (name) => services.delete(name),
      };

      registry.register('cache', {});
      expect(registry.has('cache')).toBe(true);
      expect(registry.unregister('cache')).toBe(true);
      expect(registry.has('cache')).toBe(false);
    });

    it('should support optional getServiceNames and clear', () => {
      const services = new Map<string, any>();

      const registry: IServiceRegistry = {
        register: (name, service) => { services.set(name, service); },
        get: (name) => services.get(name),
        getAsync: async (name) => services.get(name),
        has: (name) => services.has(name),
        unregister: (name) => services.delete(name),
        getServiceNames: () => [...services.keys()],
        clear: () => services.clear(),
      };

      registry.register('a', 1);
      registry.register('b', 2);

      expect(registry.getServiceNames!()).toEqual(['a', 'b']);

      registry.clear!();
      expect(registry.has('a')).toBe(false);
    });

    it('should support async getAsync with scopeId', async () => {
      const registry: IServiceRegistry = {
        register: () => {},
        get: () => ({}),
        getAsync: async <T>(_name: string, _scopeId?: string): Promise<T> => {
          return { scoped: true } as T;
        },
        has: () => true,
        unregister: () => true,
      };

      const result = await registry.getAsync<{ scoped: boolean }>('service', 'scope-1');
      expect(result.scoped).toBe(true);
    });
  });

  describe('IBasicServiceRegistry interface', () => {
    it('should extend IServiceRegistry with no additional required methods', () => {
      const registry: IBasicServiceRegistry = {
        register: () => {},
        get: () => ({}),
        getAsync: async () => ({}),
        has: () => false,
        unregister: () => false,
      };

      expect(registry).toBeDefined();
    });
  });

  describe('IAdvancedServiceRegistry interface', () => {
    it('should extend IServiceRegistry with optional factory and scope methods', () => {
      const registry: IAdvancedServiceRegistry = {
        register: () => {},
        get: () => ({}),
        getAsync: async () => ({}),
        has: () => false,
        unregister: () => false,
        registerFactory: (_name, _factory, _singleton) => {},
        registerScoped: (_name, _factory, _scopeType) => {},
        createScope: (scopeType) => `${scopeType}-${Date.now()}`,
        disposeScope: async (_scopeId) => {},
      };

      expect(registry.registerFactory).toBeDefined();
      expect(registry.registerScoped).toBeDefined();
      expect(registry.createScope).toBeDefined();
      expect(registry.disposeScope).toBeDefined();
    });

    it('should create and dispose scopes', async () => {
      const scopes = new Map<string, string>();

      const registry: IAdvancedServiceRegistry = {
        register: () => {},
        get: () => ({}),
        getAsync: async () => ({}),
        has: () => false,
        unregister: () => false,
        createScope: (scopeType) => {
          const id = `${scopeType}-1`;
          scopes.set(id, scopeType);
          return id;
        },
        disposeScope: async (scopeId) => {
          scopes.delete(scopeId);
        },
      };

      const scopeId = registry.createScope!('request');
      expect(scopeId).toBe('request-1');
      expect(scopes.has('request-1')).toBe(true);

      await registry.disposeScope!(scopeId);
      expect(scopes.has('request-1')).toBe(false);
    });
  });
});

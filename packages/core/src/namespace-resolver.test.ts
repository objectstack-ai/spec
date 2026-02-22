import { describe, it, expect, beforeEach } from 'vitest';
import { NamespaceResolver } from './namespace-resolver.js';
import { createLogger } from './logger.js';

describe('NamespaceResolver', () => {
  let resolver: NamespaceResolver;

  beforeEach(() => {
    const logger = createLogger({ level: 'silent' });
    resolver = new NamespaceResolver(logger);
  });

  describe('register', () => {
    it('should register namespaces for a package', () => {
      resolver.register('pkg-a', ['objects.task', 'views.task_list']);

      const registry = resolver.getRegistry();
      expect(registry.size).toBe(2);
      expect(registry.get('objects.task')?.packageId).toBe('pkg-a');
      expect(registry.get('views.task_list')?.packageId).toBe('pkg-a');
    });

    it('should overwrite namespace when same package re-registers', () => {
      resolver.register('pkg-a', ['objects.task']);
      resolver.register('pkg-a', ['objects.task']);

      expect(resolver.getRegistry().size).toBe(1);
      expect(resolver.getRegistry().get('objects.task')?.packageId).toBe('pkg-a');
    });
  });

  describe('unregister', () => {
    it('should remove all namespaces for a package', () => {
      resolver.register('pkg-a', ['objects.task', 'views.task_list']);
      resolver.register('pkg-b', ['objects.project']);

      const removed = resolver.unregister('pkg-a');
      expect(removed).toEqual(['objects.task', 'views.task_list']);
      expect(resolver.getRegistry().size).toBe(1);
      expect(resolver.getRegistry().has('objects.project')).toBe(true);
    });

    it('should return empty array for unknown package', () => {
      const removed = resolver.unregister('unknown');
      expect(removed).toEqual([]);
    });
  });

  describe('checkAvailability', () => {
    it('should report no conflicts for unused namespaces', () => {
      const result = resolver.checkAvailability('pkg-a', ['objects.task']);
      expect(result.available).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should detect conflict with another package', () => {
      resolver.register('pkg-a', ['objects.task']);

      const result = resolver.checkAvailability('pkg-b', ['objects.task']);
      expect(result.available).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].namespace).toBe('objects.task');
      expect(result.conflicts[0].existingPackageId).toBe('pkg-a');
      expect(result.conflicts[0].incomingPackageId).toBe('pkg-b');
    });

    it('should not conflict with own namespaces', () => {
      resolver.register('pkg-a', ['objects.task']);

      const result = resolver.checkAvailability('pkg-a', ['objects.task']);
      expect(result.available).toBe(true);
    });

    it('should provide suggestions for conflicts', () => {
      resolver.register('pkg-a', ['objects.task']);

      const result = resolver.checkAvailability('@myorg/plugin-crm', ['objects.task']);
      expect(result.available).toBe(false);
      expect(result.suggestions['objects.task']).toBeDefined();
      expect(result.suggestions['objects.task']).toContain('crm');
    });
  });

  describe('extractNamespaces', () => {
    it('should extract namespaces from object-style metadata', () => {
      const config = {
        objects: { task: {}, project: {} },
        views: { task_list: {} },
      };

      const ns = resolver.extractNamespaces(config);
      expect(ns).toContain('objects.task');
      expect(ns).toContain('objects.project');
      expect(ns).toContain('views.task_list');
      expect(ns).toHaveLength(3);
    });

    it('should extract namespaces from array-style metadata', () => {
      const config = {
        objects: [{ name: 'task' }, { name: 'project' }],
        flows: [{ name: 'approval_flow' }],
      };

      const ns = resolver.extractNamespaces(config);
      expect(ns).toContain('objects.task');
      expect(ns).toContain('objects.project');
      expect(ns).toContain('flows.approval_flow');
      expect(ns).toHaveLength(3);
    });

    it('should return empty array for empty config', () => {
      const ns = resolver.extractNamespaces({});
      expect(ns).toEqual([]);
    });
  });

  describe('getPackageNamespaces', () => {
    it('should return namespaces for a specific package', () => {
      resolver.register('pkg-a', ['objects.task', 'views.task_list']);
      resolver.register('pkg-b', ['objects.project']);

      expect(resolver.getPackageNamespaces('pkg-a')).toEqual(['objects.task', 'views.task_list']);
      expect(resolver.getPackageNamespaces('pkg-b')).toEqual(['objects.project']);
    });

    it('should return empty for unknown package', () => {
      expect(resolver.getPackageNamespaces('unknown')).toEqual([]);
    });
  });
});

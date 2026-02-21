import { describe, it, expect, beforeEach } from 'vitest';
import { PackageManager } from './package-manager.js';
import { createLogger } from './logger.js';

describe('PackageManager', () => {
  let manager: PackageManager;

  beforeEach(() => {
    const logger = createLogger({ level: 'silent' });
    manager = new PackageManager(logger, { platformVersion: '3.0.0' });
  });

  describe('install', () => {
    it('should install a package successfully', async () => {
      const result = await manager.install('pkg-a', '1.0.0', {
        objects: { task: { label: 'Task' } },
      });

      expect(result.success).toBe(true);
      expect(result.packageId).toBe('pkg-a');
      expect(result.version).toBe('1.0.0');
      expect(manager.getPackage('pkg-a')).toBeDefined();
      expect(manager.getPackage('pkg-a')?.status).toBe('installed');
    });

    it('should reject already installed package', async () => {
      await manager.install('pkg-a', '1.0.0', {});
      const result = await manager.install('pkg-a', '1.0.0', {});

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('already installed');
    });

    it('should detect namespace conflicts', async () => {
      await manager.install('pkg-a', '1.0.0', {
        objects: { task: {} },
      });

      const result = await manager.install('pkg-b', '1.0.0', {
        objects: { task: {} },
      });

      expect(result.success).toBe(false);
      expect(result.namespaceConflicts).toHaveLength(1);
      expect(result.namespaceConflicts[0].namespace).toBe('objects.task');
      expect(result.namespaceConflicts[0].existingPackageId).toBe('pkg-a');
    });

    it('should reject incompatible platform version', async () => {
      const result = await manager.install('pkg-a', '1.0.0', {
        engine: { objectstack: '>=4.0.0' },
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('platform');
    });

    it('should reject missing dependencies', async () => {
      const result = await manager.install('pkg-a', '1.0.0', {
        dependencies: { 'pkg-b': '^1.0.0' },
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Missing dependencies');
    });

    it('should succeed when dependencies are installed', async () => {
      await manager.install('pkg-b', '1.0.0', {});
      const result = await manager.install('pkg-a', '1.0.0', {
        dependencies: { 'pkg-b': '^1.0.0' },
      });

      expect(result.success).toBe(true);
      expect(result.installedDependencies).toContain('pkg-b');
    });
  });

  describe('uninstall', () => {
    it('should uninstall a package', async () => {
      await manager.install('pkg-a', '1.0.0', {});
      const result = await manager.uninstall('pkg-a');

      expect(result.success).toBe(true);
      expect(manager.getPackage('pkg-a')).toBeUndefined();
    });

    it('should prevent uninstalling if dependents exist', async () => {
      await manager.install('pkg-a', '1.0.0', {});
      await manager.install('pkg-b', '1.0.0', {
        dependencies: { 'pkg-a': '^1.0.0' },
      });

      const result = await manager.uninstall('pkg-a');
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('depended upon');
    });

    it('should reject uninstalling unknown package', async () => {
      const result = await manager.uninstall('unknown');
      expect(result.success).toBe(false);
    });
  });

  describe('upgrade', () => {
    it('should upgrade a package and create snapshot', async () => {
      await manager.install('pkg-a', '1.0.0', {
        objects: { task: {} },
      });

      const result = await manager.upgrade('pkg-a', '2.0.0', {
        objects: { task: {}, project: {} },
      });

      expect(result.success).toBe(true);
      expect(result.fromVersion).toBe('1.0.0');
      expect(result.toVersion).toBe('2.0.0');
      expect(result.snapshot.previousVersion).toBe('1.0.0');
      expect(manager.getPackage('pkg-a')?.version).toBe('2.0.0');
    });

    it('should reject upgrade for uninstalled package', async () => {
      const result = await manager.upgrade('unknown', '2.0.0', {});
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('not installed');
    });

    it('should detect namespace conflicts during upgrade', async () => {
      await manager.install('pkg-a', '1.0.0', { objects: { task: {} } });
      await manager.install('pkg-b', '1.0.0', { objects: { project: {} } });

      // pkg-a upgrade tries to add objects.project which is owned by pkg-b
      const result = await manager.upgrade('pkg-a', '2.0.0', {
        objects: { task: {}, project: {} },
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Namespace conflicts');
    });

    it('should reject platform-incompatible upgrade', async () => {
      await manager.install('pkg-a', '1.0.0', {});

      const result = await manager.upgrade('pkg-a', '2.0.0', {
        engine: { objectstack: '>=5.0.0' },
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('platform');
    });
  });

  describe('rollback', () => {
    it('should rollback to pre-upgrade state', async () => {
      await manager.install('pkg-a', '1.0.0', {
        objects: { task: {} },
      });
      await manager.upgrade('pkg-a', '2.0.0', {
        objects: { task: {}, project: {} },
      });

      const result = await manager.rollback('pkg-a');
      expect(result.success).toBe(true);
      expect(result.restoredVersion).toBe('1.0.0');
      expect(manager.getPackage('pkg-a')?.version).toBe('1.0.0');
    });

    it('should reject rollback without snapshot', async () => {
      await manager.install('pkg-a', '1.0.0', {});
      const result = await manager.rollback('pkg-a');

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('No upgrade snapshot');
    });
  });

  describe('listPackages', () => {
    it('should list all installed packages', async () => {
      await manager.install('pkg-a', '1.0.0', {});
      await manager.install('pkg-b', '2.0.0', {});

      const list = manager.listPackages();
      expect(list).toHaveLength(2);
      expect(list.map(p => p.packageId)).toContain('pkg-a');
      expect(list.map(p => p.packageId)).toContain('pkg-b');
    });
  });

  describe('checkNamespaces', () => {
    it('should check namespace availability', async () => {
      await manager.install('pkg-a', '1.0.0', {
        objects: { task: {} },
      });

      const result = manager.checkNamespaces('pkg-b', {
        objects: { task: {} },
      });

      expect(result.available).toBe(false);
      expect(result.conflicts).toHaveLength(1);
    });

    it('should report available when no conflicts', () => {
      const result = manager.checkNamespaces('pkg-a', {
        objects: { task: {} },
      });

      expect(result.available).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe('resolveDependencies', () => {
    it('should resolve dependencies in topological order', () => {
      const packages = new Map([
        ['a', { dependencies: [] as string[] }],
        ['b', { dependencies: ['a'] }],
        ['c', { dependencies: ['a', 'b'] }],
      ]);

      const order = manager.resolveDependencies(packages);
      expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'));
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('c'));
    });
  });
});

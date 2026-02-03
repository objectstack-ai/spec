import { describe, it, expect, beforeEach } from 'vitest';
import { SemanticVersionManager, DependencyResolver } from './dependency-resolver.js';
import { createLogger } from './logger.js';

describe('SemanticVersionManager', () => {
  describe('parse', () => {
    it('should parse standard semver', () => {
      const version = SemanticVersionManager.parse('1.2.3');
      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        preRelease: undefined,
        build: undefined,
      });
    });

    it('should parse semver with pre-release', () => {
      const version = SemanticVersionManager.parse('1.2.3-alpha.1');
      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        preRelease: 'alpha.1',
        build: undefined,
      });
    });

    it('should parse semver with build metadata', () => {
      const version = SemanticVersionManager.parse('1.2.3+build.123');
      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        preRelease: undefined,
        build: 'build.123',
      });
    });

    it('should parse semver with both pre-release and build', () => {
      const version = SemanticVersionManager.parse('1.2.3-beta.2+build.456');
      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        preRelease: 'beta.2',
        build: 'build.456',
      });
    });

    it('should handle v prefix', () => {
      const version = SemanticVersionManager.parse('v1.2.3');
      expect(version.major).toBe(1);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(3);
    });
  });

  describe('compare', () => {
    it('should compare major versions', () => {
      const v1 = SemanticVersionManager.parse('2.0.0');
      const v2 = SemanticVersionManager.parse('1.0.0');
      expect(SemanticVersionManager.compare(v1, v2)).toBeGreaterThan(0);
      expect(SemanticVersionManager.compare(v2, v1)).toBeLessThan(0);
    });

    it('should compare minor versions', () => {
      const v1 = SemanticVersionManager.parse('1.2.0');
      const v2 = SemanticVersionManager.parse('1.1.0');
      expect(SemanticVersionManager.compare(v1, v2)).toBeGreaterThan(0);
    });

    it('should compare patch versions', () => {
      const v1 = SemanticVersionManager.parse('1.0.2');
      const v2 = SemanticVersionManager.parse('1.0.1');
      expect(SemanticVersionManager.compare(v1, v2)).toBeGreaterThan(0);
    });

    it('should handle equal versions', () => {
      const v1 = SemanticVersionManager.parse('1.2.3');
      const v2 = SemanticVersionManager.parse('1.2.3');
      expect(SemanticVersionManager.compare(v1, v2)).toBe(0);
    });

    it('should treat pre-release as lower than release', () => {
      const v1 = SemanticVersionManager.parse('1.0.0-alpha');
      const v2 = SemanticVersionManager.parse('1.0.0');
      expect(SemanticVersionManager.compare(v1, v2)).toBeLessThan(0);
    });
  });

  describe('satisfies', () => {
    it('should match exact version', () => {
      const version = SemanticVersionManager.parse('1.2.3');
      expect(SemanticVersionManager.satisfies(version, '1.2.3')).toBe(true);
      expect(SemanticVersionManager.satisfies(version, '1.2.4')).toBe(false);
    });

    it('should match caret range', () => {
      const version = SemanticVersionManager.parse('1.2.5');
      expect(SemanticVersionManager.satisfies(version, '^1.2.3')).toBe(true);
      expect(SemanticVersionManager.satisfies(version, '^1.3.0')).toBe(false);
      expect(SemanticVersionManager.satisfies(version, '^2.0.0')).toBe(false);
    });

    it('should match tilde range', () => {
      const version = SemanticVersionManager.parse('1.2.5');
      expect(SemanticVersionManager.satisfies(version, '~1.2.3')).toBe(true);
      expect(SemanticVersionManager.satisfies(version, '~1.3.0')).toBe(false);
    });

    it('should match greater than or equal', () => {
      const version = SemanticVersionManager.parse('1.2.5');
      expect(SemanticVersionManager.satisfies(version, '>=1.2.3')).toBe(true);
      expect(SemanticVersionManager.satisfies(version, '>=1.2.5')).toBe(true);
      expect(SemanticVersionManager.satisfies(version, '>=1.3.0')).toBe(false);
    });

    it('should match less than', () => {
      const version = SemanticVersionManager.parse('1.2.5');
      expect(SemanticVersionManager.satisfies(version, '<1.3.0')).toBe(true);
      expect(SemanticVersionManager.satisfies(version, '<1.2.5')).toBe(false);
    });

    it('should match range', () => {
      const version = SemanticVersionManager.parse('1.2.5');
      expect(SemanticVersionManager.satisfies(version, '1.2.0 - 1.3.0')).toBe(true);
      expect(SemanticVersionManager.satisfies(version, '1.3.0 - 1.4.0')).toBe(false);
    });

    it('should match wildcard', () => {
      const version = SemanticVersionManager.parse('1.2.5');
      expect(SemanticVersionManager.satisfies(version, '*')).toBe(true);
      expect(SemanticVersionManager.satisfies(version, 'latest')).toBe(true);
    });
  });

  describe('getCompatibilityLevel', () => {
    it('should detect fully compatible versions', () => {
      const from = SemanticVersionManager.parse('1.2.3');
      const to = SemanticVersionManager.parse('1.2.3');
      expect(SemanticVersionManager.getCompatibilityLevel(from, to)).toBe('fully-compatible');
    });

    it('should detect backward compatible versions', () => {
      const from = SemanticVersionManager.parse('1.2.3');
      const to = SemanticVersionManager.parse('1.3.0');
      expect(SemanticVersionManager.getCompatibilityLevel(from, to)).toBe('backward-compatible');
    });

    it('should detect breaking changes', () => {
      const from = SemanticVersionManager.parse('1.2.3');
      const to = SemanticVersionManager.parse('2.0.0');
      expect(SemanticVersionManager.getCompatibilityLevel(from, to)).toBe('breaking-changes');
    });

    it('should detect incompatible (downgrade)', () => {
      const from = SemanticVersionManager.parse('1.3.0');
      const to = SemanticVersionManager.parse('1.2.0');
      expect(SemanticVersionManager.getCompatibilityLevel(from, to)).toBe('incompatible');
    });
  });
});

describe('DependencyResolver', () => {
  let resolver: DependencyResolver;
  let logger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    logger = createLogger({ level: 'silent' });
    resolver = new DependencyResolver(logger);
  });

  describe('resolve', () => {
    it('should resolve dependencies in topological order', () => {
      const plugins = new Map([
        ['a', { dependencies: [] }],
        ['b', { dependencies: ['a'] }],
        ['c', { dependencies: ['a', 'b'] }],
      ]);

      const order = resolver.resolve(plugins);
      
      expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'));
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('c'));
    });

    it('should handle plugins with no dependencies', () => {
      const plugins = new Map([
        ['a', { dependencies: [] }],
        ['b', { dependencies: [] }],
      ]);

      const order = resolver.resolve(plugins);
      expect(order).toHaveLength(2);
      expect(order).toContain('a');
      expect(order).toContain('b');
    });

    it('should detect circular dependencies', () => {
      const plugins = new Map([
        ['a', { dependencies: ['b'] }],
        ['b', { dependencies: ['a'] }],
      ]);

      expect(() => resolver.resolve(plugins)).toThrow('Circular dependency');
    });

    it('should detect missing dependencies', () => {
      const plugins = new Map([
        ['a', { dependencies: ['missing'] }],
      ]);

      expect(() => resolver.resolve(plugins)).toThrow('Missing dependency');
    });
  });

  describe('detectConflicts', () => {
    it('should detect version mismatches', () => {
      const plugins = new Map([
        ['core', { version: '1.0.0', dependencies: {} }],
        ['plugin-a', { version: '1.0.0', dependencies: { core: '^2.0.0' } }],
      ]);

      const conflicts = resolver.detectConflicts(plugins);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].type).toBe('version-mismatch');
    });

    it('should return no conflicts for compatible versions', () => {
      const plugins = new Map([
        ['core', { version: '1.2.0', dependencies: {} }],
        ['plugin-a', { version: '1.0.0', dependencies: { core: '^1.0.0' } }],
      ]);

      const conflicts = resolver.detectConflicts(plugins);
      expect(conflicts.length).toBe(0);
    });
  });

  describe('findBestVersion', () => {
    it('should find highest matching version', () => {
      const available = ['1.0.0', '1.1.0', '1.2.0', '2.0.0'];
      const constraints = ['^1.0.0'];
      
      const best = resolver.findBestVersion(available, constraints);
      expect(best).toBe('1.2.0');
    });

    it('should satisfy all constraints', () => {
      const available = ['1.0.0', '1.1.0', '1.2.0', '2.0.0'];
      const constraints = ['^1.0.0', '>=1.1.0', '<2.0.0'];
      
      const best = resolver.findBestVersion(available, constraints);
      expect(best).toBe('1.2.0');
    });

    it('should return undefined if no version satisfies', () => {
      const available = ['1.0.0', '1.1.0'];
      const constraints = ['^2.0.0'];
      
      const best = resolver.findBestVersion(available, constraints);
      expect(best).toBeUndefined();
    });
  });

  describe('isAcyclic', () => {
    it('should detect acyclic graph', () => {
      const deps = new Map([
        ['a', []],
        ['b', ['a']],
        ['c', ['a', 'b']],
      ]);

      expect(resolver.isAcyclic(deps)).toBe(true);
    });

    it('should detect cyclic graph', () => {
      const deps = new Map([
        ['a', ['b']],
        ['b', ['a']],
      ]);

      expect(resolver.isAcyclic(deps)).toBe(false);
    });
  });
});

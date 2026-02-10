import { describe, it, expect } from 'vitest';
import type { ValidationResult, Plugin, IPluginValidator } from './plugin-validator';

describe('Plugin Validator Contract', () => {
  describe('ValidationResult interface', () => {
    it('should allow a minimal valid result', () => {
      const result: ValidationResult = {
        valid: true,
      };

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(result.warnings).toBeUndefined();
    });

    it('should allow a result with errors and warnings', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          { field: 'name', message: 'Name is required', code: 'REQUIRED' },
          { field: 'version', message: 'Invalid semver' },
        ],
        warnings: [
          { field: 'description', message: 'Description recommended', code: 'RECOMMENDED' },
        ],
      };

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.warnings).toHaveLength(1);
      expect(result.errors![0].code).toBe('REQUIRED');
      expect(result.errors![1].code).toBeUndefined();
    });
  });

  describe('Plugin interface', () => {
    it('should allow a minimal plugin with only name', () => {
      const plugin: Plugin = {
        name: 'my-plugin',
      };

      expect(plugin.name).toBe('my-plugin');
    });

    it('should allow a full plugin with all optional properties', () => {
      const plugin: Plugin = {
        name: 'full-plugin',
        version: '1.2.3',
        dependencies: ['core', 'data'],
        init: async (_ctx) => {},
        start: async (_ctx) => {},
        destroy: async (_ctx) => {},
        signature: 'sha256:abc123',
        customField: 'custom-value',
      };

      expect(plugin.name).toBe('full-plugin');
      expect(plugin.version).toBe('1.2.3');
      expect(plugin.dependencies).toEqual(['core', 'data']);
      expect(plugin.signature).toBe('sha256:abc123');
      expect(plugin.customField).toBe('custom-value');
    });

    it('should allow lifecycle methods to return void or Promise<void>', () => {
      const syncPlugin: Plugin = {
        name: 'sync-plugin',
        init: (_ctx) => {},
        start: (_ctx) => {},
        destroy: (_ctx) => {},
      };

      const asyncPlugin: Plugin = {
        name: 'async-plugin',
        init: async (_ctx) => {},
        start: async (_ctx) => {},
        destroy: async (_ctx) => {},
      };

      expect(syncPlugin.init).toBeDefined();
      expect(asyncPlugin.init).toBeDefined();
    });
  });

  describe('IPluginValidator interface', () => {
    it('should allow a minimal validator implementation', () => {
      const validator: IPluginValidator = {
        validate: (_plugin: unknown): ValidationResult => ({
          valid: true,
        }),
        validateVersion: (version: string) => /^\d+\.\d+\.\d+$/.test(version),
        validateDependencies: (_plugin: Plugin, _registry: Map<string, Plugin>) => {},
      };

      expect(validator.validate({ name: 'test' }).valid).toBe(true);
      expect(validator.validateVersion('1.0.0')).toBe(true);
      expect(validator.validateVersion('bad')).toBe(false);
    });

    it('should support optional validateSignature method', () => {
      const validator: IPluginValidator = {
        validate: () => ({ valid: true }),
        validateVersion: () => true,
        validateDependencies: () => {},
        validateSignature: async (_plugin: Plugin) => true,
      };

      expect(validator.validateSignature).toBeDefined();
    });

    it('should support optional validateLifecycle method', () => {
      const validator: IPluginValidator = {
        validate: () => ({ valid: true }),
        validateVersion: () => true,
        validateDependencies: () => {},
        validateLifecycle: (plugin: Plugin) => !!plugin.init && !!plugin.start,
      };

      expect(validator.validateLifecycle!({ name: 'test', init: () => {}, start: () => {} })).toBe(true);
      expect(validator.validateLifecycle!({ name: 'test' })).toBe(false);
    });

    it('should validate dependencies against a registry', () => {
      const validator: IPluginValidator = {
        validate: () => ({ valid: true }),
        validateVersion: () => true,
        validateDependencies: (plugin: Plugin, registry: Map<string, Plugin>) => {
          for (const dep of plugin.dependencies || []) {
            if (!registry.has(dep)) {
              throw new Error(`Missing dependency: ${dep}`);
            }
          }
        },
      };

      const registry = new Map<string, Plugin>();
      registry.set('core', { name: 'core' });

      expect(() =>
        validator.validateDependencies({ name: 'test', dependencies: ['core'] }, registry)
      ).not.toThrow();

      expect(() =>
        validator.validateDependencies({ name: 'test', dependencies: ['missing'] }, registry)
      ).toThrow('Missing dependency: missing');
    });
  });
});

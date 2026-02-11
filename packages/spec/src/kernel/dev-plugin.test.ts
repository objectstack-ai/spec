import { describe, it, expect } from 'vitest';
import {
  DevServiceOverrideSchema,
  DevFixtureConfigSchema,
  DevToolsConfigSchema,
  DevPluginPreset,
  DevPluginConfigSchema,
} from './dev-plugin.zod';

describe('Dev Mode Plugin Protocol', () => {
  // ==========================================================================
  // DevServiceOverrideSchema
  // ==========================================================================
  describe('DevServiceOverrideSchema', () => {
    it('should validate minimal service override', () => {
      const result = DevServiceOverrideSchema.safeParse({ service: 'auth' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enabled).toBe(true);
        expect(result.data.strategy).toBe('memory');
      }
    });

    it('should validate full service override', () => {
      const override = {
        service: 'eventBus',
        enabled: true,
        strategy: 'mock' as const,
        config: { recordCalls: true },
      };

      const result = DevServiceOverrideSchema.safeParse(override);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.strategy).toBe('mock');
        expect(result.data.config?.recordCalls).toBe(true);
      }
    });

    it('should accept all strategy values', () => {
      const strategies = ['mock', 'memory', 'stub', 'passthrough'] as const;
      for (const strategy of strategies) {
        const result = DevServiceOverrideSchema.safeParse({ service: 'svc', strategy });
        expect(result.success).toBe(true);
      }
    });

    it('should reject empty service name', () => {
      const result = DevServiceOverrideSchema.safeParse({ service: '' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid strategy', () => {
      const result = DevServiceOverrideSchema.safeParse({
        service: 'auth',
        strategy: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // DevFixtureConfigSchema
  // ==========================================================================
  describe('DevFixtureConfigSchema', () => {
    it('should apply default values', () => {
      const result = DevFixtureConfigSchema.parse({});
      expect(result.enabled).toBe(true);
      expect(result.resetBeforeLoad).toBe(true);
    });

    it('should validate full fixture config', () => {
      const config = {
        enabled: true,
        paths: ['./fixtures/*.json', './test/data/*.yml'],
        resetBeforeLoad: false,
        envFilter: ['dev', 'demo'],
      };

      const result = DevFixtureConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paths).toHaveLength(2);
        expect(result.data.envFilter).toEqual(['dev', 'demo']);
      }
    });

    it('should allow disabled fixtures', () => {
      const result = DevFixtureConfigSchema.parse({ enabled: false });
      expect(result.enabled).toBe(false);
    });
  });

  // ==========================================================================
  // DevToolsConfigSchema
  // ==========================================================================
  describe('DevToolsConfigSchema', () => {
    it('should apply default values', () => {
      const result = DevToolsConfigSchema.parse({});
      expect(result.hotReload).toBe(true);
      expect(result.requestInspector).toBe(false);
      expect(result.dbExplorer).toBe(false);
      expect(result.verboseLogging).toBe(true);
      expect(result.apiDocs).toBe(true);
      expect(result.mailCatcher).toBe(false);
    });

    it('should accept all tools enabled', () => {
      const config = {
        hotReload: true,
        requestInspector: true,
        dbExplorer: true,
        verboseLogging: true,
        apiDocs: true,
        mailCatcher: true,
      };

      const result = DevToolsConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mailCatcher).toBe(true);
        expect(result.data.dbExplorer).toBe(true);
      }
    });
  });

  // ==========================================================================
  // DevPluginPreset
  // ==========================================================================
  describe('DevPluginPreset', () => {
    it('should validate preset values', () => {
      expect(DevPluginPreset.safeParse('minimal').success).toBe(true);
      expect(DevPluginPreset.safeParse('standard').success).toBe(true);
      expect(DevPluginPreset.safeParse('full').success).toBe(true);
    });

    it('should reject invalid preset', () => {
      expect(DevPluginPreset.safeParse('custom').success).toBe(false);
    });
  });

  // ==========================================================================
  // DevPluginConfigSchema
  // ==========================================================================
  describe('DevPluginConfigSchema', () => {
    it('should accept zero-config (empty object)', () => {
      const result = DevPluginConfigSchema.parse({});
      expect(result.preset).toBe('standard');
      expect(result.port).toBe(4400);
      expect(result.open).toBe(false);
      expect(result.seedAdminUser).toBe(true);
      expect(result.simulatedLatency).toBe(0);
    });

    it('should accept preset-only config', () => {
      const result = DevPluginConfigSchema.parse({ preset: 'full' });
      expect(result.preset).toBe('full');
    });

    it('should accept config with per-service overrides', () => {
      const config = {
        preset: 'standard' as const,
        services: {
          auth: { enabled: true, strategy: 'mock' as const },
          fileStorage: { enabled: false },
        },
      };

      const result = DevPluginConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.services?.auth.enabled).toBe(true);
        expect(result.data.services?.auth.strategy).toBe('mock');
        expect(result.data.services?.fileStorage.enabled).toBe(false);
      }
    });

    it('should accept full configuration', () => {
      const config = {
        preset: 'full' as const,
        services: {
          auth: { enabled: true, strategy: 'mock' as const },
          eventBus: { enabled: true, strategy: 'memory' as const },
          fileStorage: { enabled: false },
        },
        fixtures: {
          enabled: true,
          paths: ['./fixtures/*.json'],
          resetBeforeLoad: true,
        },
        tools: {
          hotReload: true,
          dbExplorer: true,
          apiDocs: true,
        },
        port: 5500,
        open: true,
        seedAdminUser: true,
        simulatedLatency: 200,
      };

      const result = DevPluginConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.port).toBe(5500);
        expect(result.data.open).toBe(true);
        expect(result.data.simulatedLatency).toBe(200);
        expect(result.data.fixtures?.paths).toEqual(['./fixtures/*.json']);
      }
    });

    it('should reject invalid port', () => {
      expect(
        DevPluginConfigSchema.safeParse({ port: 0 }).success,
      ).toBe(false);
      expect(
        DevPluginConfigSchema.safeParse({ port: 99999 }).success,
      ).toBe(false);
    });

    it('should reject negative simulated latency', () => {
      expect(
        DevPluginConfigSchema.safeParse({ simulatedLatency: -10 }).success,
      ).toBe(false);
    });
  });
});

import { describe, expect, it } from 'vitest';
import {
  PluginHealthStatusSchema,
  PluginHealthCheckSchema,
  PluginHealthReportSchema,
  HotReloadConfigSchema,
  GracefulDegradationSchema,
  PluginUpdateStrategySchema,
  PluginStateSnapshotSchema,
  AdvancedPluginLifecycleConfigSchema,
} from './plugin-lifecycle-advanced.zod';

describe('Plugin Lifecycle Advanced Schemas', () => {
  describe('PluginHealthStatusSchema', () => {
    it('should validate valid health statuses', () => {
      expect(() => PluginHealthStatusSchema.parse('healthy')).not.toThrow();
      expect(() => PluginHealthStatusSchema.parse('degraded')).not.toThrow();
      expect(() => PluginHealthStatusSchema.parse('unhealthy')).not.toThrow();
      expect(() => PluginHealthStatusSchema.parse('failed')).not.toThrow();
      expect(() => PluginHealthStatusSchema.parse('recovering')).not.toThrow();
      expect(() => PluginHealthStatusSchema.parse('unknown')).not.toThrow();
    });

    it('should reject invalid health statuses', () => {
      expect(() => PluginHealthStatusSchema.parse('invalid')).toThrow();
      expect(() => PluginHealthStatusSchema.parse('')).toThrow();
    });
  });

  describe('PluginHealthCheckSchema', () => {
    it('should validate health check with defaults', () => {
      const healthCheck = PluginHealthCheckSchema.parse({});
      expect(healthCheck.interval).toBe(30000);
      expect(healthCheck.timeout).toBe(5000);
      expect(healthCheck.failureThreshold).toBe(3);
      expect(healthCheck.successThreshold).toBe(1);
      expect(healthCheck.autoRestart).toBe(false);
      expect(healthCheck.maxRestartAttempts).toBe(3);
      expect(healthCheck.restartBackoff).toBe('exponential');
    });

    it('should validate custom health check configuration', () => {
      const config = {
        interval: 60000,
        timeout: 10000,
        failureThreshold: 5,
        successThreshold: 2,
        autoRestart: true,
        maxRestartAttempts: 5,
        restartBackoff: 'linear' as const,
        checkMethod: 'healthCheck',
      };
      const healthCheck = PluginHealthCheckSchema.parse(config);
      expect(healthCheck).toEqual(config);
    });

    it('should enforce minimum interval', () => {
      expect(() => PluginHealthCheckSchema.parse({ interval: 500 })).toThrow();
    });

    it('should enforce minimum timeout', () => {
      expect(() => PluginHealthCheckSchema.parse({ timeout: 50 })).toThrow();
    });
  });

  describe('PluginHealthReportSchema', () => {
    it('should validate complete health report', () => {
      const report = {
        status: 'healthy' as const,
        timestamp: new Date().toISOString(),
        message: 'Plugin is operating normally',
        metrics: {
          uptime: 3600000,
          memoryUsage: 52428800,
          cpuUsage: 15.5,
          activeConnections: 10,
          errorRate: 0.1,
          responseTime: 150,
        },
        checks: [
          {
            name: 'database',
            status: 'passed' as const,
            message: 'Database connection is healthy',
          },
          {
            name: 'cache',
            status: 'passed' as const,
          },
        ],
        dependencies: [
          {
            pluginId: 'com.objectstack.driver.postgres',
            status: 'healthy' as const,
          },
        ],
      };
      const result = PluginHealthReportSchema.parse(report);
      expect(result.status).toBe('healthy');
      expect(result.metrics?.uptime).toBe(3600000);
      expect(result.checks).toHaveLength(2);
    });

    it('should validate minimal health report', () => {
      const report = {
        status: 'healthy' as const,
        timestamp: new Date().toISOString(),
      };
      const result = PluginHealthReportSchema.parse(report);
      expect(result.status).toBe('healthy');
    });
  });

  describe('HotReloadConfigSchema', () => {
    it('should validate hot reload with defaults', () => {
      const config = HotReloadConfigSchema.parse({});
      expect(config.enabled).toBe(false);
      expect(config.debounceDelay).toBe(1000);
      expect(config.preserveState).toBe(true);
      expect(config.stateStrategy).toBe('memory');
      expect(config.shutdownTimeout).toBe(30000);
    });

    it('should validate custom hot reload configuration', () => {
      const config = {
        enabled: true,
        watchPatterns: ['src/**/*.ts', 'config/**/*.json'],
        debounceDelay: 2000,
        preserveState: false,
        stateStrategy: 'disk' as const,
        shutdownTimeout: 60000,
        beforeReload: ['beforeReloadHook'],
        afterReload: ['afterReloadHook'],
      };
      const result = HotReloadConfigSchema.parse(config);
      expect(result).toEqual(config);
    });
  });

  describe('GracefulDegradationSchema', () => {
    it('should validate graceful degradation with defaults', () => {
      const config = GracefulDegradationSchema.parse({});
      expect(config.enabled).toBe(true);
      expect(config.fallbackMode).toBe('minimal');
    });

    it('should validate complete degradation configuration', () => {
      const config = {
        enabled: true,
        fallbackMode: 'readonly' as const,
        criticalDependencies: ['com.objectstack.driver.postgres'],
        optionalDependencies: ['com.acme.analytics'],
        degradedFeatures: [
          {
            feature: 'advanced-search',
            enabled: false,
            reason: 'Search engine unavailable',
          },
        ],
        autoRecovery: {
          enabled: true,
          retryInterval: 120000,
          maxAttempts: 10,
        },
      };
      const result = GracefulDegradationSchema.parse(config);
      expect(result.fallbackMode).toBe('readonly');
      expect(result.criticalDependencies).toHaveLength(1);
    });
  });

  describe('PluginUpdateStrategySchema', () => {
    it('should validate update strategy with defaults', () => {
      const strategy = PluginUpdateStrategySchema.parse({});
      expect(strategy.mode).toBe('manual');
    });

    it('should validate automatic update strategy', () => {
      const strategy = {
        mode: 'automatic' as const,
        autoUpdateConstraints: {
          major: false,
          minor: true,
          patch: true,
        },
        rollback: {
          enabled: true,
          automatic: true,
          keepVersions: 5,
          timeout: 60000,
        },
        validation: {
          checkCompatibility: true,
          runTests: true,
          testSuite: 'integration',
        },
      };
      const result = PluginUpdateStrategySchema.parse(strategy);
      expect(result.mode).toBe('automatic');
      expect(result.autoUpdateConstraints?.patch).toBe(true);
    });

    it('should validate scheduled update strategy', () => {
      const strategy = {
        mode: 'scheduled' as const,
        schedule: {
          cron: '0 2 * * 0',
          timezone: 'America/New_York',
          maintenanceWindow: 120,
        },
      };
      const result = PluginUpdateStrategySchema.parse(strategy);
      expect(result.mode).toBe('scheduled');
      expect(result.schedule?.timezone).toBe('America/New_York');
    });
  });

  describe('PluginStateSnapshotSchema', () => {
    it('should validate state snapshot', () => {
      const snapshot = {
        pluginId: 'com.acme.plugin',
        version: '1.2.3',
        timestamp: new Date().toISOString(),
        state: {
          counter: 42,
          cache: { key1: 'value1' },
          settings: { theme: 'dark' },
        },
        metadata: {
          checksum: 'abc123def456',
          compressed: true,
          encryption: 'AES-256',
        },
      };
      const result = PluginStateSnapshotSchema.parse(snapshot);
      expect(result.pluginId).toBe('com.acme.plugin');
      expect(result.state.counter).toBe(42);
      expect(result.metadata?.compressed).toBe(true);
    });
  });

  describe('AdvancedPluginLifecycleConfigSchema', () => {
    it('should validate empty config', () => {
      const config = AdvancedPluginLifecycleConfigSchema.parse({});
      expect(config).toBeDefined();
    });

    it('should validate complete lifecycle configuration', () => {
      const config = {
        health: {
          interval: 60000,
          timeout: 10000,
          failureThreshold: 3,
          autoRestart: true,
        },
        hotReload: {
          enabled: true,
          watchPatterns: ['src/**/*.ts'],
          preserveState: true,
        },
        degradation: {
          enabled: true,
          fallbackMode: 'minimal' as const,
        },
        updates: {
          mode: 'automatic' as const,
          autoUpdateConstraints: {
            patch: true,
          },
        },
        resources: {
          maxMemory: 536870912,
          maxCpu: 80,
          maxConnections: 100,
          timeout: 30000,
        },
        observability: {
          enableMetrics: true,
          enableTracing: true,
          enableProfiling: false,
          metricsInterval: 60000,
        },
      };
      const result = AdvancedPluginLifecycleConfigSchema.parse(config);
      expect(result.health?.interval).toBe(60000);
      expect(result.hotReload?.enabled).toBe(true);
      expect(result.resources?.maxMemory).toBe(536870912);
      expect(result.observability?.enableMetrics).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should support plugin with health monitoring and hot reload', () => {
      const config = AdvancedPluginLifecycleConfigSchema.parse({
        health: {
          interval: 30000,
          autoRestart: true,
          maxRestartAttempts: 3,
        },
        hotReload: {
          enabled: true,
          preserveState: true,
          stateStrategy: 'memory' as const,
        },
      });
      expect(config.health?.autoRestart).toBe(true);
      expect(config.hotReload?.enabled).toBe(true);
    });

    it('should support plugin with graceful degradation', () => {
      const config = AdvancedPluginLifecycleConfigSchema.parse({
        degradation: {
          enabled: true,
          fallbackMode: 'readonly' as const,
          criticalDependencies: ['database'],
          optionalDependencies: ['cache', 'analytics'],
          autoRecovery: {
            enabled: true,
            retryInterval: 60000,
            maxAttempts: 5,
          },
        },
      });
      expect(config.degradation?.fallbackMode).toBe('readonly');
      expect(config.degradation?.criticalDependencies).toHaveLength(1);
    });
  });
});

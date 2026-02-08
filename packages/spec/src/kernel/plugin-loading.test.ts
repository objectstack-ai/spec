import { describe, it, expect } from 'vitest';
import {
  PluginLoadingStrategySchema,
  PluginLoadingConfigSchema,
  PluginPreloadConfigSchema,
  PluginCodeSplittingSchema,
  PluginDynamicImportSchema,
  PluginInitializationSchema,
  PluginDependencyResolutionSchema,
  PluginHotReloadSchema,
  PluginCachingSchema,
  PluginSandboxingSchema,
  PluginPerformanceMonitoringSchema,
  PluginLoadingEventSchema,
  PluginLoadingStateSchema,
} from './plugin-loading.zod';

describe('Plugin Loading Protocol', () => {
  describe('PluginLoadingStrategySchema', () => {
    it('should accept valid loading strategies', () => {
      expect(PluginLoadingStrategySchema.parse('eager')).toBe('eager');
      expect(PluginLoadingStrategySchema.parse('lazy')).toBe('lazy');
      expect(PluginLoadingStrategySchema.parse('parallel')).toBe('parallel');
      expect(PluginLoadingStrategySchema.parse('deferred')).toBe('deferred');
      expect(PluginLoadingStrategySchema.parse('on-demand')).toBe('on-demand');
    });

    it('should reject invalid strategies', () => {
      expect(() => PluginLoadingStrategySchema.parse('invalid')).toThrow();
    });
  });

  describe('PluginPreloadConfigSchema', () => {
    it('should accept minimal preload config', () => {
      const config = {
        enabled: true,
      };
      const result = PluginPreloadConfigSchema.parse(config);
      expect(result.enabled).toBe(true);
      expect(result.priority).toBe(100); // default
    });

    it('should accept full preload config', () => {
      const config = {
        enabled: true,
        priority: 50,
        resources: ['metadata', 'code', 'services'],
        conditions: {
          routes: ['/dashboard', '/settings'],
          roles: ['admin', 'manager'],
          deviceType: ['desktop'],
          minNetworkSpeed: '4g',
        },
      };
      const result = PluginPreloadConfigSchema.parse(config);
      expect(result.enabled).toBe(true);
      expect(result.priority).toBe(50);
      expect(result.resources).toHaveLength(3);
      expect(result.conditions?.routes).toHaveLength(2);
    });

    it('should apply defaults', () => {
      const result = PluginPreloadConfigSchema.parse({});
      expect(result.enabled).toBe(false);
      expect(result.priority).toBe(100);
    });
  });

  describe('PluginCodeSplittingSchema', () => {
    it('should accept code splitting config', () => {
      const config = {
        enabled: true,
        strategy: 'feature',
        chunkNaming: 'hashed',
        maxChunkSize: 500,
        sharedDependencies: {
          enabled: true,
          minChunks: 3,
        },
      };
      const result = PluginCodeSplittingSchema.parse(config);
      expect(result.enabled).toBe(true);
      expect(result.strategy).toBe('feature');
      expect(result.maxChunkSize).toBe(500);
    });

    it('should apply defaults', () => {
      const result = PluginCodeSplittingSchema.parse({});
      expect(result.enabled).toBe(true);
      expect(result.strategy).toBe('feature');
      expect(result.chunkNaming).toBe('hashed');
    });
  });

  describe('PluginDynamicImportSchema', () => {
    it('should accept dynamic import config', () => {
      const config = {
        enabled: true,
        mode: 'async',
        prefetch: true,
        preload: false,
        timeout: 15000,
        retry: {
          enabled: true,
          maxAttempts: 5,
          backoffMs: 2000,
        },
      };
      const result = PluginDynamicImportSchema.parse(config);
      expect(result.enabled).toBe(true);
      expect(result.mode).toBe('async');
      expect(result.retry?.maxAttempts).toBe(5);
    });

    it('should apply defaults', () => {
      const result = PluginDynamicImportSchema.parse({});
      expect(result.enabled).toBe(true);
      expect(result.mode).toBe('async');
      expect(result.timeout).toBe(30000);
    });
  });

  describe('PluginInitializationSchema', () => {
    it('should accept initialization config', () => {
      const config = {
        mode: 'parallel',
        timeout: 60000,
        priority: 10,
        critical: true,
        retry: {
          enabled: true,
          maxAttempts: 3,
          backoffMs: 1000,
        },
        healthCheckInterval: 30000,
      };
      const result = PluginInitializationSchema.parse(config);
      expect(result.mode).toBe('parallel');
      expect(result.critical).toBe(true);
      expect(result.healthCheckInterval).toBe(30000);
    });

    it('should apply defaults', () => {
      const result = PluginInitializationSchema.parse({});
      expect(result.mode).toBe('async');
      expect(result.timeout).toBe(30000);
      expect(result.priority).toBe(100);
      expect(result.critical).toBe(false);
    });
  });

  describe('PluginDependencyResolutionSchema', () => {
    it('should accept dependency resolution config', () => {
      const config = {
        strategy: 'compatible',
        peerDependencies: {
          resolve: true,
          onMissing: 'warn',
          onMismatch: 'error',
        },
        optionalDependencies: {
          load: true,
          onFailure: 'ignore',
        },
        conflictResolution: 'latest',
        circularDependencies: 'warn',
      };
      const result = PluginDependencyResolutionSchema.parse(config);
      expect(result.strategy).toBe('compatible');
      expect(result.peerDependencies?.onMismatch).toBe('error');
      expect(result.conflictResolution).toBe('latest');
    });

    it('should apply defaults', () => {
      const result = PluginDependencyResolutionSchema.parse({});
      expect(result.strategy).toBe('compatible');
      expect(result.conflictResolution).toBe('latest');
      expect(result.circularDependencies).toBe('warn');
    });
  });

  describe('PluginHotReloadSchema', () => {
    it('should accept hot reload config', () => {
      const config = {
        enabled: true,
        strategy: 'partial',
        watchPatterns: ['src/**/*.ts', 'src/**/*.tsx'],
        ignorePatterns: ['**/*.test.ts', '**/*.spec.ts'],
        debounceMs: 500,
        preserveState: true,
        stateSerialization: {
          enabled: true,
          handler: './state-handler.js',
        },
        hooks: {
          beforeReload: 'onBeforeReload',
          afterReload: 'onAfterReload',
          onError: 'onReloadError',
        },
      };
      const result = PluginHotReloadSchema.parse(config);
      expect(result.enabled).toBe(true);
      expect(result.strategy).toBe('partial');
      expect(result.preserveState).toBe(true);
    });

    it('should apply defaults', () => {
      const result = PluginHotReloadSchema.parse({});
      expect(result.enabled).toBe(false);
      expect(result.strategy).toBe('full');
      expect(result.debounceMs).toBe(300);
      expect(result.environment).toBe('development');
    });

    it('should accept production environment with safety config', () => {
      const config = {
        enabled: true,
        environment: 'production' as const,
        strategy: 'state-preserve' as const,
        productionSafety: {
          healthValidation: true,
          rollbackOnFailure: true,
          healthTimeout: 60000,
          drainConnections: true,
          drainTimeout: 30000,
          maxConcurrentReloads: 2,
          minReloadInterval: 10000,
        },
      };
      const result = PluginHotReloadSchema.parse(config);
      expect(result.environment).toBe('production');
      expect(result.productionSafety?.healthValidation).toBe(true);
      expect(result.productionSafety?.rollbackOnFailure).toBe(true);
      expect(result.productionSafety?.maxConcurrentReloads).toBe(2);
    });

    it('should apply production safety defaults', () => {
      const config = {
        enabled: true,
        environment: 'production' as const,
        productionSafety: {},
      };
      const result = PluginHotReloadSchema.parse(config);
      expect(result.productionSafety?.healthValidation).toBe(true);
      expect(result.productionSafety?.rollbackOnFailure).toBe(true);
      expect(result.productionSafety?.drainConnections).toBe(true);
      expect(result.productionSafety?.maxConcurrentReloads).toBe(1);
      expect(result.productionSafety?.minReloadInterval).toBe(5000);
    });

    it('should accept all environment values', () => {
      const envs = ['development', 'staging', 'production'];
      envs.forEach((env) => {
        const result = PluginHotReloadSchema.parse({ environment: env });
        expect(result.environment).toBe(env);
      });
    });
  });

  describe('PluginCachingSchema', () => {
    it('should accept caching config', () => {
      const config = {
        enabled: true,
        storage: 'hybrid',
        keyStrategy: 'hash',
        ttl: 3600,
        maxSize: 100,
        invalidateOn: ['version-change', 'dependency-change'],
        compression: {
          enabled: true,
          algorithm: 'brotli',
        },
      };
      const result = PluginCachingSchema.parse(config);
      expect(result.enabled).toBe(true);
      expect(result.storage).toBe('hybrid');
      expect(result.compression?.algorithm).toBe('brotli');
    });

    it('should apply defaults', () => {
      const result = PluginCachingSchema.parse({});
      expect(result.enabled).toBe(true);
      expect(result.storage).toBe('memory');
      expect(result.keyStrategy).toBe('version');
    });
  });

  describe('PluginSandboxingSchema', () => {
    it('should accept sandboxing config', () => {
      const config = {
        enabled: true,
        isolationLevel: 'process',
        allowedCapabilities: ['com.objectstack.protocol.storage.v1'],
        resourceQuotas: {
          maxMemoryMB: 512,
          maxCpuTimeMs: 5000,
          maxFileDescriptors: 100,
          maxNetworkKBps: 1024,
        },
        permissions: {
          allowedAPIs: ['objectql', 'storage'],
          allowedPaths: ['/data', '/tmp'],
          allowedEndpoints: ['https://api.example.com'],
          allowedEnvVars: ['NODE_ENV', 'API_KEY'],
        },
      };
      const result = PluginSandboxingSchema.parse(config);
      expect(result.enabled).toBe(true);
      expect(result.isolationLevel).toBe('process');
      expect(result.resourceQuotas?.maxMemoryMB).toBe(512);
    });

    it('should apply defaults', () => {
      const result = PluginSandboxingSchema.parse({});
      expect(result.enabled).toBe(false);
      expect(result.isolationLevel).toBe('none');
      expect(result.scope).toBe('automation-only');
    });

    it('should accept all isolation scope values', () => {
      const scopes = ['automation-only', 'untrusted-only', 'all-plugins'];
      scopes.forEach((scope) => {
        const result = PluginSandboxingSchema.parse({ scope });
        expect(result.scope).toBe(scope);
      });
    });

    it('should accept full plugin isolation with IPC', () => {
      const config = {
        enabled: true,
        scope: 'all-plugins' as const,
        isolationLevel: 'process' as const,
        ipc: {
          enabled: true,
          transport: 'unix-socket' as const,
          maxMessageSize: 2097152,
          timeout: 15000,
          allowedServices: ['metadata', 'data', 'auth'],
        },
      };
      const result = PluginSandboxingSchema.parse(config);
      expect(result.scope).toBe('all-plugins');
      expect(result.ipc?.enabled).toBe(true);
      expect(result.ipc?.transport).toBe('unix-socket');
      expect(result.ipc?.allowedServices).toHaveLength(3);
    });

    it('should apply IPC defaults', () => {
      const config = {
        enabled: true,
        scope: 'all-plugins' as const,
        isolationLevel: 'process' as const,
        ipc: {},
      };
      const result = PluginSandboxingSchema.parse(config);
      expect(result.ipc?.enabled).toBe(true);
      expect(result.ipc?.transport).toBe('message-port');
      expect(result.ipc?.maxMessageSize).toBe(1048576);
      expect(result.ipc?.timeout).toBe(30000);
    });
  });

  describe('PluginPerformanceMonitoringSchema', () => {
    it('should accept performance monitoring config', () => {
      const config = {
        enabled: true,
        metrics: ['load-time', 'init-time', 'memory-usage'],
        samplingRate: 0.5,
        reportingInterval: 120,
        budgets: {
          maxLoadTimeMs: 1000,
          maxInitTimeMs: 2000,
          maxMemoryMB: 256,
        },
        onBudgetViolation: 'error',
      };
      const result = PluginPerformanceMonitoringSchema.parse(config);
      expect(result.enabled).toBe(true);
      expect(result.samplingRate).toBe(0.5);
      expect(result.budgets?.maxLoadTimeMs).toBe(1000);
    });

    it('should apply defaults', () => {
      const result = PluginPerformanceMonitoringSchema.parse({});
      expect(result.enabled).toBe(false);
      expect(result.samplingRate).toBe(1);
      expect(result.reportingInterval).toBe(60);
    });
  });

  describe('PluginLoadingConfigSchema', () => {
    it('should accept complete loading config', () => {
      const config = {
        strategy: 'lazy',
        preload: {
          enabled: true,
          priority: 50,
        },
        codeSplitting: {
          enabled: true,
          strategy: 'feature',
        },
        dynamicImport: {
          enabled: true,
          mode: 'async',
        },
        initialization: {
          mode: 'parallel',
          timeout: 30000,
        },
        caching: {
          enabled: true,
          storage: 'memory',
        },
      };
      const result = PluginLoadingConfigSchema.parse(config);
      expect(result.strategy).toBe('lazy');
      expect(result.preload?.enabled).toBe(true);
      expect(result.codeSplitting?.strategy).toBe('feature');
    });

    it('should apply defaults', () => {
      const result = PluginLoadingConfigSchema.parse({});
      expect(result.strategy).toBe('lazy');
    });

    it('should accept all optional configurations', () => {
      const config = {
        strategy: 'eager',
        preload: { enabled: true },
        codeSplitting: { enabled: false },
        dynamicImport: { enabled: true },
        initialization: { mode: 'sync' },
        dependencyResolution: { strategy: 'strict' },
        hotReload: { enabled: true },
        caching: { enabled: true },
        sandboxing: { enabled: true },
        monitoring: { enabled: true },
      };
      const result = PluginLoadingConfigSchema.parse(config);
      expect(result.hotReload?.enabled).toBe(true);
      expect(result.sandboxing?.enabled).toBe(true);
    });
  });

  describe('PluginLoadingEventSchema', () => {
    it('should accept loading events', () => {
      const event = {
        type: 'load-completed',
        pluginId: 'com.example.plugin',
        timestamp: Date.now(),
        durationMs: 150,
        metadata: {
          version: '1.0.0',
          size: 1024,
        },
      };
      const result = PluginLoadingEventSchema.parse(event);
      expect(result.type).toBe('load-completed');
      expect(result.durationMs).toBe(150);
    });

    it('should accept error events', () => {
      const event = {
        type: 'load-failed',
        pluginId: 'com.example.plugin',
        timestamp: Date.now(),
        error: {
          message: 'Failed to load plugin',
          code: 'LOAD_ERROR',
          stack: 'Error stack trace',
        },
      };
      const result = PluginLoadingEventSchema.parse(event);
      expect(result.type).toBe('load-failed');
      expect(result.error?.message).toBe('Failed to load plugin');
    });

    it('should accept all event types', () => {
      const types = [
        'load-started',
        'load-completed',
        'load-failed',
        'init-started',
        'init-completed',
        'init-failed',
        'preload-started',
        'preload-completed',
        'cache-hit',
        'cache-miss',
        'hot-reload',
        'dynamic-load',
        'dynamic-unload',
        'dynamic-discover',
      ];

      types.forEach((type) => {
        const event = {
          type,
          pluginId: 'com.example.plugin',
          timestamp: Date.now(),
        };
        const result = PluginLoadingEventSchema.parse(event);
        expect(result.type).toBe(type);
      });
    });
  });

  describe('PluginLoadingStateSchema', () => {
    it('should accept loading state', () => {
      const state = {
        pluginId: 'com.example.plugin',
        state: 'loading',
        progress: 45,
        startedAt: Date.now(),
        retryCount: 1,
      };
      const result = PluginLoadingStateSchema.parse(state);
      expect(result.state).toBe('loading');
      expect(result.progress).toBe(45);
    });

    it('should accept all state values', () => {
      const states = [
        'pending',
        'loading',
        'loaded',
        'initializing',
        'ready',
        'failed',
        'reloading',
        'unloading',
        'unloaded',
      ];

      states.forEach((stateValue) => {
        const state = {
          pluginId: 'com.example.plugin',
          state: stateValue,
        };
        const result = PluginLoadingStateSchema.parse(state);
        expect(result.state).toBe(stateValue);
      });
    });

    it('should apply defaults', () => {
      const state = {
        pluginId: 'com.example.plugin',
        state: 'pending',
      };
      const result = PluginLoadingStateSchema.parse(state);
      expect(result.progress).toBe(0);
      expect(result.retryCount).toBe(0);
    });

    it('should validate progress range', () => {
      expect(() =>
        PluginLoadingStateSchema.parse({
          pluginId: 'com.example.plugin',
          state: 'loading',
          progress: 150,
        })
      ).toThrow();

      expect(() =>
        PluginLoadingStateSchema.parse({
          pluginId: 'com.example.plugin',
          state: 'loading',
          progress: -10,
        })
      ).toThrow();
    });
  });

  describe('Integration scenarios', () => {
    it('should support eager loading with preloading', () => {
      const config = {
        strategy: 'eager' as const,
        preload: {
          enabled: true,
          priority: 1,
          resources: ['metadata', 'dependencies', 'code'],
        },
        initialization: {
          mode: 'sequential' as const,
          critical: true,
        },
      };
      const result = PluginLoadingConfigSchema.parse(config);
      expect(result.strategy).toBe('eager');
      expect(result.initialization?.critical).toBe(true);
    });

    it('should support lazy loading with caching', () => {
      const config = {
        strategy: 'lazy' as const,
        caching: {
          enabled: true,
          storage: 'hybrid' as const,
          ttl: 3600,
        },
        dynamicImport: {
          enabled: true,
          mode: 'async' as const,
          prefetch: true,
        },
      };
      const result = PluginLoadingConfigSchema.parse(config);
      expect(result.strategy).toBe('lazy');
      expect(result.caching?.storage).toBe('hybrid');
    });

    it('should support development mode with hot reload', () => {
      const config = {
        strategy: 'eager' as const,
        hotReload: {
          enabled: true,
          strategy: 'state-preserve' as const,
          preserveState: true,
          debounceMs: 500,
        },
        monitoring: {
          enabled: true,
          metrics: ['load-time', 'init-time', 'memory-usage'],
        },
      };
      const result = PluginLoadingConfigSchema.parse(config);
      expect(result.hotReload?.enabled).toBe(true);
      expect(result.hotReload?.strategy).toBe('state-preserve');
    });

    it('should support production optimizations', () => {
      const config = {
        strategy: 'parallel' as const,
        codeSplitting: {
          enabled: true,
          strategy: 'feature' as const,
          maxChunkSize: 500,
          sharedDependencies: {
            enabled: true,
            minChunks: 2,
          },
        },
        caching: {
          enabled: true,
          storage: 'hybrid' as const,
          keyStrategy: 'hash' as const,
          compression: {
            enabled: true,
            algorithm: 'brotli' as const,
          },
        },
        monitoring: {
          enabled: true,
          budgets: {
            maxLoadTimeMs: 1000,
            maxInitTimeMs: 2000,
          },
          onBudgetViolation: 'error' as const,
        },
      };
      const result = PluginLoadingConfigSchema.parse(config);
      expect(result.codeSplitting?.enabled).toBe(true);
      expect(result.caching?.compression?.enabled).toBe(true);
    });
  });
});

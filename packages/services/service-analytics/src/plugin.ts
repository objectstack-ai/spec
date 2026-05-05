// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Plugin, PluginContext } from '@objectstack/core';
import type { Cube } from '@objectstack/spec/data';
import type { IAnalyticsService } from '@objectstack/spec/contracts';
import { AnalyticsService } from './analytics-service.js';
import type { AnalyticsServiceConfig } from './analytics-service.js';
import type { DriverCapabilities } from './strategies/types.js';

/**
 * Minimal IDataEngine surface required for the auto-bridge.
 * ObjectQL exposes `aggregate(object, { where, groupBy, aggregations: [{ function, field, alias }] })`.
 */
interface DataEngineLike {
  aggregate(object: string, options: {
    where?: Record<string, unknown>;
    groupBy?: string[];
    aggregations?: Array<{ function: string; field: string; alias: string }>;
  }): Promise<unknown[]>;
}

/**
 * Configuration for AnalyticsServicePlugin.
 */
export interface AnalyticsServicePluginOptions {
  /** Pre-defined cube definitions (from manifest). */
  cubes?: Cube[];
  /**
   * Probe driver capabilities for a given cube.
   * When omitted, defaults to in-memory only.
   */
  queryCapabilities?: (cubeName: string) => DriverCapabilities;
  /**
   * Execute raw SQL on a driver. Enables NativeSQLStrategy.
   */
  executeRawSql?: (objectName: string, sql: string, params: unknown[]) => Promise<Record<string, unknown>[]>;
  /**
   * Execute ObjectQL aggregate. Enables ObjectQLStrategy.
   */
  executeAggregate?: (objectName: string, options: {
    groupBy?: string[];
    aggregations?: Array<{ field: string; method: string; alias: string }>;
    filter?: Record<string, unknown>;
  }) => Promise<Record<string, unknown>[]>;
  /** Enable debug logging. */
  debug?: boolean;
}

/**
 * AnalyticsServicePlugin — Kernel plugin for multi-driver analytics.
 *
 * Lifecycle:
 * 1. **init** — Creates `AnalyticsService`, registers as `'analytics'` service.
 *    If an existing analytics service is already registered (e.g. MemoryAnalyticsService
 *    from dev-plugin), it is captured as the `fallbackService`.
 * 2. **start** — Triggers `'analytics:ready'` hook so other plugins can
 *    register cubes or extend the service.
 * 3. **destroy** — Cleans up references.
 *
 * @example
 * ```ts
 * import { LiteKernel } from '@objectstack/core';
 * import { AnalyticsServicePlugin } from '@objectstack/service-analytics';
 *
 * const kernel = new LiteKernel();
 * kernel.use(new AnalyticsServicePlugin({
 *   cubes: [ordersCube],
 *   queryCapabilities: (cube) => ({ nativeSql: true, objectqlAggregate: true, inMemory: false }),
 *   executeRawSql: async (obj, sql, params) => pgPool.query(sql, params).then(r => r.rows),
 * }));
 * await kernel.bootstrap();
 *
 * const analytics = kernel.getService<IAnalyticsService>('analytics');
 * const result = await analytics.query({ cube: 'orders', measures: ['orders.count'] });
 * ```
 */
export class AnalyticsServicePlugin implements Plugin {
  name = 'com.objectstack.service-analytics';
  version = '1.0.0';
  type = 'standard' as const;
  dependencies: string[] = [];

  private service?: AnalyticsService;
  private readonly options: AnalyticsServicePluginOptions;

  constructor(options: AnalyticsServicePluginOptions = {}) {
    this.options = options;
  }

  async init(ctx: PluginContext): Promise<void> {
    // Check if there is an existing analytics service (e.g. from dev-plugin)
    let fallbackService: IAnalyticsService | undefined;
    try {
      const existing = ctx.getService<IAnalyticsService>('analytics');
      if (existing && typeof existing.query === 'function') {
        fallbackService = existing;
        ctx.logger.debug('[Analytics] Found existing analytics service, using as fallback');
      }
    } catch {
      // No existing service — that's fine
    }

    // Auto-bridge: when caller did not supply executeAggregate, look up the
    // kernel's IDataEngine (registered as 'data' by ObjectQLPlugin) lazily and
    // translate AnalyticsStrategy's `{method, filter}` shape into the engine's
    // `{function, where}` shape. This lets users write
    //   `new AnalyticsServicePlugin({ cubes })`
    // without re-implementing the bridge in every app.
    let executeAggregate = this.options.executeAggregate;
    let autoBridged = false;
    if (!executeAggregate) {
      const tryGetDataEngine = (): DataEngineLike | undefined => {
        try {
          const svc = ctx.getService<DataEngineLike>('data');
          return svc && typeof svc.aggregate === 'function' ? svc : undefined;
        } catch {
          return undefined;
        }
      };
      // Probe now (warn if missing) but resolve at call time so plugin order
      // does not matter as long as 'data' exists by the time a query runs.
      if (!tryGetDataEngine()) {
        ctx.logger.warn(
          '[Analytics] No "data" service registered yet at init; ' +
          'will retry per-query. Register ObjectQLPlugin or pass executeAggregate.',
        );
      }
      executeAggregate = async (objectName, { groupBy, aggregations, filter }) => {
        const engine = tryGetDataEngine();
        if (!engine) {
          throw new Error(
            '[Analytics] Cannot execute aggregate: no IDataEngine ("data") service is registered. ' +
            'Add ObjectQLPlugin to the kernel or supply AnalyticsServicePlugin({ executeAggregate }).',
          );
        }
        const rows = await engine.aggregate(objectName, {
          where: filter,
          groupBy,
          aggregations: aggregations?.map((a) => ({
            function: a.method,
            field: a.field,
            alias: a.alias,
          })),
        });
        return rows as Record<string, unknown>[];
      };
      autoBridged = true;
    }

    // Default capabilities: when we have an aggregate bridge, advertise
    // ObjectQL support so ObjectQLStrategy is selected. Callers can still
    // override via options.queryCapabilities.
    const queryCapabilities = this.options.queryCapabilities
      ?? (() => ({
        nativeSql: !!this.options.executeRawSql,
        objectqlAggregate: !!executeAggregate,
        inMemory: false,
      }));

    const config: AnalyticsServiceConfig = {
      cubes: this.options.cubes,
      logger: ctx.logger,
      queryCapabilities,
      executeRawSql: this.options.executeRawSql,
      executeAggregate,
      fallbackService,
    };

    if (autoBridged) {
      ctx.logger.info('[Analytics] Auto-bridged executeAggregate → "data" service (IDataEngine)');
    }

    this.service = new AnalyticsService(config);

    // Register or replace the analytics service
    if (fallbackService) {
      ctx.replaceService('analytics', this.service);
    } else {
      ctx.registerService('analytics', this.service);
    }

    if (this.options.debug) {
      ctx.hook('analytics:beforeQuery', async (query: unknown) => {
        ctx.logger.debug('[Analytics] Before query', { query });
      });
    }

    ctx.logger.info('[Analytics] Service initialized');
  }

  async start(ctx: PluginContext): Promise<void> {
    if (!this.service) return;

    // Notify other plugins that analytics is ready
    await ctx.trigger('analytics:ready', this.service);

    ctx.logger.info(
      `[Analytics] Service started with ${this.service.cubeRegistry.size} cubes: ` +
      `${this.service.cubeRegistry.names().join(', ') || '(none)'}`,
    );
  }

  async destroy(): Promise<void> {
    this.service = undefined;
  }
}

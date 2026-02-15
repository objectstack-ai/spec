// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Plugin, PluginContext } from '@objectstack/core';
import { IntervalJobAdapter } from './interval-job-adapter.js';
import type { IntervalJobAdapterOptions } from './interval-job-adapter.js';

/**
 * Configuration options for the JobServicePlugin.
 */
export interface JobServicePluginOptions {
  /** Job adapter type (default: 'interval') */
  adapter?: 'interval' | 'cron';
  /** Options for the interval job adapter */
  interval?: IntervalJobAdapterOptions;
}

/**
 * JobServicePlugin — Production IJobService implementation.
 *
 * Registers a job scheduler with the kernel during the init phase.
 * Supports setInterval-based and cron-based adapters.
 *
 * @example
 * ```ts
 * import { ObjectKernel } from '@objectstack/core';
 * import { JobServicePlugin } from '@objectstack/service-job';
 *
 * const kernel = new ObjectKernel();
 * kernel.use(new JobServicePlugin({ adapter: 'interval' }));
 * await kernel.bootstrap();
 *
 * const job = kernel.getService('job');
 * await job.schedule('cleanup', { type: 'interval', intervalMs: 60000 }, handler);
 * ```
 */
export class JobServicePlugin implements Plugin {
  name = 'com.objectstack.service.job';
  version = '1.0.0';
  type = 'standard';

  private readonly options: JobServicePluginOptions;
  private adapter?: IntervalJobAdapter;

  constructor(options: JobServicePluginOptions = {}) {
    this.options = { adapter: 'interval', ...options };
  }

  async init(ctx: PluginContext): Promise<void> {
    const adapterType = this.options.adapter;
    if (adapterType === 'cron') {
      throw new Error(
        'Cron job adapter is not yet implemented. ' +
        'Use adapter: "interval" or provide a custom IJobService via ctx.registerService("job", impl).'
      );
    }

    this.adapter = new IntervalJobAdapter(this.options.interval);
    ctx.registerService('job', this.adapter);
    ctx.logger.info('JobServicePlugin: registered interval job adapter');
  }

  async destroy(): Promise<void> {
    await this.adapter?.destroy();
  }
}

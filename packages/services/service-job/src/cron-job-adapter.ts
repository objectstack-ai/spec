// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { IJobService, JobSchedule, JobHandler, JobExecution } from '@objectstack/spec/contracts';

/**
 * Configuration for the cron-based job adapter.
 */
export interface CronJobAdapterOptions {
  /** Timezone for cron expressions (default: 'UTC') */
  timezone?: string;
}

/**
 * Cron-based job adapter skeleton implementing IJobService.
 *
 * This is a placeholder for future cron integration (e.g., `node-cron` or `croner`).
 * Concrete implementation will parse cron expressions and schedule jobs accordingly.
 *
 * @example
 * ```ts
 * const scheduler = new CronJobAdapter({ timezone: 'America/New_York' });
 * await scheduler.schedule('nightly-cleanup', { type: 'cron', expression: '0 0 * * *' }, handler);
 * ```
 */
export class CronJobAdapter implements IJobService {
  private readonly timezone: string;

  constructor(options: CronJobAdapterOptions = {}) {
    this.timezone = options.timezone ?? 'UTC';
  }

  async schedule(_name: string, _schedule: JobSchedule, _handler: JobHandler): Promise<void> {
    throw new Error(`CronJobAdapter not yet implemented (timezone: ${this.timezone})`);
  }

  async cancel(_name: string): Promise<void> {
    throw new Error('CronJobAdapter not yet implemented');
  }

  async trigger(_name: string, _data?: unknown): Promise<void> {
    throw new Error('CronJobAdapter not yet implemented');
  }

  async getExecutions(_name: string, _limit?: number): Promise<JobExecution[]> {
    throw new Error('CronJobAdapter not yet implemented');
  }

  async listJobs(): Promise<string[]> {
    throw new Error('CronJobAdapter not yet implemented');
  }
}

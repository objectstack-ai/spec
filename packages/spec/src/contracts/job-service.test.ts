import { describe, it, expect } from 'vitest';
import type { IJobService, JobHandler, JobExecution } from './job-service';

describe('Job Service Contract', () => {
  it('should allow a minimal IJobService implementation with required methods', () => {
    const service: IJobService = {
      schedule: async (_name, _schedule, _handler) => {},
      cancel: async (_name) => {},
      trigger: async (_name, _data?) => {},
    };

    expect(typeof service.schedule).toBe('function');
    expect(typeof service.cancel).toBe('function');
    expect(typeof service.trigger).toBe('function');
  });

  it('should allow a full implementation with optional methods', () => {
    const service: IJobService = {
      schedule: async () => {},
      cancel: async () => {},
      trigger: async () => {},
      getExecutions: async (_name, _limit?) => [],
      listJobs: async () => [],
    };

    expect(service.getExecutions).toBeDefined();
    expect(service.listJobs).toBeDefined();
  });

  it('should schedule and trigger a job', async () => {
    const jobs = new Map<string, JobHandler>();

    const service: IJobService = {
      schedule: async (name, _schedule, handler) => {
        jobs.set(name, handler);
      },
      cancel: async (name) => { jobs.delete(name); },
      trigger: async (name, data?) => {
        const handler = jobs.get(name);
        if (handler) await handler({ jobId: name, data });
      },
    };

    const executed: string[] = [];
    await service.schedule(
      'sync_metadata',
      { type: 'cron', expression: '0 0 * * *' },
      async (ctx) => { executed.push(ctx.jobId); },
    );

    await service.trigger('sync_metadata');
    expect(executed).toEqual(['sync_metadata']);
  });

  it('should cancel a scheduled job', async () => {
    const jobs = new Map<string, JobHandler>();

    const service: IJobService = {
      schedule: async (name, _schedule, handler) => { jobs.set(name, handler); },
      cancel: async (name) => { jobs.delete(name); },
      trigger: async (name) => {
        const handler = jobs.get(name);
        if (handler) await handler({ jobId: name });
      },
    };

    const executed: string[] = [];
    await service.schedule('cleanup', { type: 'interval', intervalMs: 60000 }, async (ctx) => {
      executed.push(ctx.jobId);
    });

    await service.cancel('cleanup');
    await service.trigger('cleanup');
    expect(executed).toHaveLength(0);
  });

  it('should return job executions', async () => {
    const executions: JobExecution[] = [
      { jobId: 'sync', status: 'success', startedAt: '2025-01-01T00:00:00Z', completedAt: '2025-01-01T00:00:05Z', durationMs: 5000 },
      { jobId: 'sync', status: 'failed', startedAt: '2025-01-02T00:00:00Z', error: 'Connection timeout' },
    ];

    const service: IJobService = {
      schedule: async () => {},
      cancel: async () => {},
      trigger: async () => {},
      getExecutions: async (name, limit?) => {
        const filtered = executions.filter(e => e.jobId === name);
        return limit ? filtered.slice(0, limit) : filtered;
      },
    };

    const results = await service.getExecutions!('sync');
    expect(results).toHaveLength(2);
    expect(results[0].status).toBe('success');
    expect(results[1].error).toBe('Connection timeout');
  });

  it('should list registered jobs', async () => {
    const service: IJobService = {
      schedule: async () => {},
      cancel: async () => {},
      trigger: async () => {},
      listJobs: async () => ['sync_metadata', 'cleanup_logs', 'send_reports'],
    };

    const jobs = await service.listJobs!();
    expect(jobs).toHaveLength(3);
    expect(jobs).toContain('cleanup_logs');
  });
});

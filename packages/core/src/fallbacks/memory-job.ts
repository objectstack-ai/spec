// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * In-memory job scheduler fallback.
 *
 * Implements the IJobService contract with basic schedule/cancel/trigger
 * operations.  Used by ObjectKernel as an automatic fallback when no real
 * job plugin (e.g. Agenda / BullMQ) is registered.
 */
export function createMemoryJob() {
  const jobs = new Map<string, any>();
  return {
    _fallback: true, _serviceName: 'job',
    async schedule(name: string, schedule: any, handler: any): Promise<void> { jobs.set(name, { schedule, handler }); },
    async cancel(name: string): Promise<void> { jobs.delete(name); },
    async trigger(name: string, data?: unknown): Promise<void> {
      const job = jobs.get(name);
      if (job?.handler) await job.handler({ jobId: name, data });
    },
    async getExecutions(): Promise<any[]> { return []; },
    async listJobs(): Promise<string[]> { return [...jobs.keys()]; },
  };
}

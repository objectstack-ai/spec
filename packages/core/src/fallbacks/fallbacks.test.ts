import { describe, it, expect } from 'vitest';
import { createMemoryCache } from './memory-cache';
import { createMemoryQueue } from './memory-queue';
import { createMemoryJob } from './memory-job';
import { CORE_FALLBACK_FACTORIES } from './index';

describe('CORE_FALLBACK_FACTORIES', () => {
    it('should have exactly 3 entries: cache, queue, job', () => {
        expect(Object.keys(CORE_FALLBACK_FACTORIES)).toEqual(['cache', 'queue', 'job']);
    });

    it('should map to factory functions', () => {
        for (const factory of Object.values(CORE_FALLBACK_FACTORIES)) {
            expect(typeof factory).toBe('function');
        }
    });
});

describe('createMemoryCache', () => {
    it('should return an object with _fallback: true', () => {
        const cache = createMemoryCache();
        expect(cache._fallback).toBe(true);
        expect(cache._serviceName).toBe('cache');
    });

    it('should set and get a value', async () => {
        const cache = createMemoryCache();
        await cache.set('key1', 'value1');
        expect(await cache.get('key1')).toBe('value1');
    });

    it('should return undefined for missing key', async () => {
        const cache = createMemoryCache();
        expect(await cache.get('nonexistent')).toBeUndefined();
    });

    it('should delete a key', async () => {
        const cache = createMemoryCache();
        await cache.set('key1', 'value1');
        expect(await cache.delete('key1')).toBe(true);
        expect(await cache.get('key1')).toBeUndefined();
    });

    it('should check if a key exists with has()', async () => {
        const cache = createMemoryCache();
        expect(await cache.has('key1')).toBe(false);
        await cache.set('key1', 'value1');
        expect(await cache.has('key1')).toBe(true);
    });

    it('should clear all entries', async () => {
        const cache = createMemoryCache();
        await cache.set('a', 1);
        await cache.set('b', 2);
        await cache.clear();
        expect(await cache.has('a')).toBe(false);
        expect(await cache.has('b')).toBe(false);
    });

    it('should expire entries based on TTL', async () => {
        const cache = createMemoryCache();
        // Set with very short TTL (0.001 seconds = 1ms)
        await cache.set('temp', 'data', 0.001);
        // Wait for expiry
        await new Promise(r => setTimeout(r, 20));
        expect(await cache.get('temp')).toBeUndefined();
    });

    it('should track hit/miss stats', async () => {
        const cache = createMemoryCache();
        await cache.set('key1', 'value1');
        await cache.get('key1');      // hit
        await cache.get('missing');   // miss
        const stats = await cache.stats();
        expect(stats.hits).toBe(1);
        expect(stats.misses).toBe(1);
        expect(stats.keyCount).toBe(1);
    });
});

describe('createMemoryQueue', () => {
    it('should return an object with _fallback: true', () => {
        const queue = createMemoryQueue();
        expect(queue._fallback).toBe(true);
        expect(queue._serviceName).toBe('queue');
    });

    it('should publish and deliver to subscriber synchronously', async () => {
        const queue = createMemoryQueue();
        const received: any[] = [];
        await queue.subscribe('test-q', async (msg: any) => { received.push(msg); });
        const id = await queue.publish('test-q', { hello: 'world' });
        expect(id).toMatch(/^fallback-msg-/);
        expect(received).toHaveLength(1);
        expect(received[0].data).toEqual({ hello: 'world' });
    });

    it('should not deliver to unsubscribed queue', async () => {
        const queue = createMemoryQueue();
        const received: any[] = [];
        await queue.subscribe('q1', async (msg: any) => { received.push(msg); });
        await queue.unsubscribe('q1');
        await queue.publish('q1', 'data');
        expect(received).toHaveLength(0);
    });

    it('should return queue size of 0', async () => {
        const queue = createMemoryQueue();
        expect(await queue.getQueueSize()).toBe(0);
    });

    it('should purge a queue', async () => {
        const queue = createMemoryQueue();
        const received: any[] = [];
        await queue.subscribe('q1', async (msg: any) => { received.push(msg); });
        await queue.purge('q1');
        await queue.publish('q1', 'data');
        expect(received).toHaveLength(0);
    });
});

describe('createMemoryJob', () => {
    it('should return an object with _fallback: true', () => {
        const job = createMemoryJob();
        expect(job._fallback).toBe(true);
        expect(job._serviceName).toBe('job');
    });

    it('should schedule and list jobs', async () => {
        const job = createMemoryJob();
        await job.schedule('daily-report', '0 0 * * *', async () => {});
        expect(await job.listJobs()).toEqual(['daily-report']);
    });

    it('should cancel a job', async () => {
        const job = createMemoryJob();
        await job.schedule('temp-job', '* * * * *', async () => {});
        await job.cancel('temp-job');
        expect(await job.listJobs()).toEqual([]);
    });

    it('should trigger a job handler', async () => {
        const job = createMemoryJob();
        let triggered = false;
        await job.schedule('my-job', '* * * * *', async (ctx: any) => {
            triggered = true;
            expect(ctx.jobId).toBe('my-job');
            expect(ctx.data).toEqual({ key: 'val' });
        });
        await job.trigger('my-job', { key: 'val' });
        expect(triggered).toBe(true);
    });

    it('should return empty executions', async () => {
        const job = createMemoryJob();
        expect(await job.getExecutions()).toEqual([]);
    });
});

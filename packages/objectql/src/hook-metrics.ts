// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Hook Execution Metrics
 *
 * Lightweight, transport-agnostic recorder interface for per-hook execution
 * counters and latencies. The default implementation is a no-op so the
 * engine pays zero cost when nobody is observing.
 *
 * Wire a real recorder by calling `engine.setHookMetricsRecorder(recorder)`.
 * The runtime / kernel can adapt this to Otel, Prometheus, StatsD, or
 * whatever telemetry pipeline ships with the deployment.
 *
 * Recorded events:
 *   - `recordExecution(label, outcome, durationMs)`
 *       outcome ∈ 'success' | 'error' | 'timeout' | 'capability_rejected'
 *   - `recordSkip(label, reason)`
 *       reason ∈ 'condition' | 'fire_and_forget'
 *   - `recordRetry(label, attempt)`
 */

export type HookMetricOutcome =
    | 'success'
    | 'error'
    | 'timeout'
    | 'capability_rejected';

export type HookSkipReason = 'condition' | 'fire_and_forget';

export interface HookMetricLabel {
    /** Hook name (stable id from metadata). */
    hook: string;
    /** Object name the hook is bound to. May be undefined for global hooks. */
    object?: string;
    /** Lifecycle event (`beforeInsert`, `afterUpdate`, etc.). */
    event?: string;
    /** True when the handler comes from a metadata `body` (sandboxed JS). */
    body?: boolean;
}

export interface HookMetricsRecorder {
    recordExecution(label: HookMetricLabel, outcome: HookMetricOutcome, durationMs: number): void;
    recordSkip(label: HookMetricLabel, reason: HookSkipReason): void;
    recordRetry(label: HookMetricLabel, attempt: number): void;
}

export const noopHookMetricsRecorder: HookMetricsRecorder = {
    recordExecution: () => {},
    recordSkip: () => {},
    recordRetry: () => {},
};

/**
 * In-memory recorder useful for tests, dev-mode dashboards, and as a
 * starting point for adapter implementations. Aggregates counts + a
 * rolling sum of latency per (hook, outcome).
 */
export class InMemoryHookMetricsRecorder implements HookMetricsRecorder {
    private executions = new Map<string, { count: number; totalMs: number }>();
    private skips = new Map<string, number>();
    private retries = new Map<string, number>();

    recordExecution(label: HookMetricLabel, outcome: HookMetricOutcome, durationMs: number): void {
        const key = `${label.hook}|${outcome}`;
        const cur = this.executions.get(key) ?? { count: 0, totalMs: 0 };
        cur.count += 1;
        cur.totalMs += Math.max(0, durationMs);
        this.executions.set(key, cur);
    }

    recordSkip(label: HookMetricLabel, reason: HookSkipReason): void {
        const key = `${label.hook}|${reason}`;
        this.skips.set(key, (this.skips.get(key) ?? 0) + 1);
    }

    recordRetry(label: HookMetricLabel, _attempt: number): void {
        this.retries.set(label.hook, (this.retries.get(label.hook) ?? 0) + 1);
    }

    snapshot(): {
        executions: Array<{ hook: string; outcome: HookMetricOutcome; count: number; totalMs: number }>;
        skips: Array<{ hook: string; reason: HookSkipReason; count: number }>;
        retries: Array<{ hook: string; count: number }>;
    } {
        return {
            executions: Array.from(this.executions, ([key, v]) => {
                const [hook, outcome] = key.split('|');
                return { hook, outcome: outcome as HookMetricOutcome, count: v.count, totalMs: v.totalMs };
            }),
            skips: Array.from(this.skips, ([key, count]) => {
                const [hook, reason] = key.split('|');
                return { hook, reason: reason as HookSkipReason, count };
            }),
            retries: Array.from(this.retries, ([hook, count]) => ({ hook, count })),
        };
    }

    reset(): void {
        this.executions.clear();
        this.skips.clear();
        this.retries.clear();
    }
}

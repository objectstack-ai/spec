// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { FlowParsed, FlowNodeParsed } from '@objectstack/spec/automation';
import type { AutomationContext, AutomationResult, IAutomationService } from '@objectstack/spec/contracts';
import type { Logger } from '@objectstack/spec/contracts';
import { FlowSchema } from '@objectstack/spec/automation';

// ─── Node Executor Interface (Plugin Extension Point) ───────────────

/**
 * Each node type corresponds to a NodeExecutor.
 * Third-party plugins only need to implement this interface and register
 * it with the engine to extend automation capabilities.
 */
export interface NodeExecutor {
    /** Corresponds to FlowNodeAction enum value */
    readonly type: string;

    /**
     * Execute a node
     * @param node - Current node definition
     * @param variables - Flow variable context (read/write)
     * @param context - Trigger context
     * @returns Execution result (may include output data, branch conditions, etc.)
     */
    execute(
        node: FlowNodeParsed,
        variables: Map<string, unknown>,
        context: AutomationContext,
    ): Promise<NodeExecutionResult>;
}

export interface NodeExecutionResult {
    success: boolean;
    output?: Record<string, unknown>;
    error?: string;
    /** Used by decision nodes — returns the selected branch label */
    branchLabel?: string;
}

// ─── Trigger Interface (Plugin Extension Point) ─────────────────────

/**
 * Trigger interface. Schedule/Event/API triggers are registered via plugins.
 */
export interface FlowTrigger {
    readonly type: string;
    start(flowName: string, callback: (ctx: AutomationContext) => Promise<void>): void;
    stop(flowName: string): void;
}

// ─── Core Automation Engine ─────────────────────────────────────────

/**
 * Internal execution log entry.
 */
interface ExecutionLogEntry {
    id: string;
    flowName: string;
    status: 'completed' | 'failed';
    startedAt: string;
    completedAt: string;
    durationMs: number;
    trigger: { type: string; userId?: string; object?: string };
    steps: Array<{
        nodeId: string;
        nodeType: string;
        status: 'success' | 'failure' | 'skipped';
        startedAt: string;
        durationMs?: number;
    }>;
    output?: unknown;
    error?: string;
}

export class AutomationEngine implements IAutomationService {
    private flows = new Map<string, FlowParsed>();
    private flowEnabled = new Map<string, boolean>();
    private nodeExecutors = new Map<string, NodeExecutor>();
    private triggers = new Map<string, FlowTrigger>();
    private executionLogs: ExecutionLogEntry[] = [];
    private logger: Logger;
    private runCounter = 0;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    // ── Plugin Extension API ──────────────────────────────

    /** Register a node executor (called by plugins) */
    registerNodeExecutor(executor: NodeExecutor): void {
        if (this.nodeExecutors.has(executor.type)) {
            this.logger.warn(`Node executor '${executor.type}' replaced`);
        }
        this.nodeExecutors.set(executor.type, executor);
        this.logger.info(`Node executor registered: ${executor.type}`);
    }

    /** Unregister a node executor (hot-unplug) */
    unregisterNodeExecutor(type: string): void {
        this.nodeExecutors.delete(type);
        this.logger.info(`Node executor unregistered: ${type}`);
    }

    /** Register a trigger (called by plugins) */
    registerTrigger(trigger: FlowTrigger): void {
        this.triggers.set(trigger.type, trigger);
        this.logger.info(`Trigger registered: ${trigger.type}`);
    }

    /** Unregister a trigger (hot-unplug) */
    unregisterTrigger(type: string): void {
        this.triggers.delete(type);
        this.logger.info(`Trigger unregistered: ${type}`);
    }

    /** Get all registered node types */
    getRegisteredNodeTypes(): string[] {
        return [...this.nodeExecutors.keys()];
    }

    /** Get all registered trigger types */
    getRegisteredTriggerTypes(): string[] {
        return [...this.triggers.keys()];
    }

    // ── IAutomationService Contract Implementation ────────

    registerFlow(name: string, definition: unknown): void {
        const parsed = FlowSchema.parse(definition);
        this.flows.set(name, parsed);
        if (!this.flowEnabled.has(name)) {
            this.flowEnabled.set(name, true);
        }
        this.logger.info(`Flow registered: ${name}`);
    }

    unregisterFlow(name: string): void {
        this.flows.delete(name);
        this.flowEnabled.delete(name);
        this.logger.info(`Flow unregistered: ${name}`);
    }

    async listFlows(): Promise<string[]> {
        return [...this.flows.keys()];
    }

    async getFlow(name: string): Promise<FlowParsed | null> {
        return this.flows.get(name) ?? null;
    }

    async toggleFlow(name: string, enabled: boolean): Promise<void> {
        if (!this.flows.has(name)) {
            throw new Error(`Flow '${name}' not found`);
        }
        this.flowEnabled.set(name, enabled);
        this.logger.info(`Flow '${name}' ${enabled ? 'enabled' : 'disabled'}`);
    }

    async listRuns(flowName: string, options?: { limit?: number; cursor?: string }): Promise<ExecutionLogEntry[]> {
        const limit = options?.limit ?? 20;
        const logs = this.executionLogs.filter(l => l.flowName === flowName);
        return logs.slice(-limit).reverse();
    }

    async getRun(runId: string): Promise<ExecutionLogEntry | null> {
        return this.executionLogs.find(l => l.id === runId) ?? null;
    }

    async execute(flowName: string, context?: AutomationContext): Promise<AutomationResult> {
        const startTime = Date.now();
        const flow = this.flows.get(flowName);

        if (!flow) {
            return { success: false, error: `Flow '${flowName}' not found` };
        }

        // Check if flow is disabled
        if (this.flowEnabled.get(flowName) === false) {
            return { success: false, error: `Flow '${flowName}' is disabled` };
        }

        // Initialize variable context
        const variables = new Map<string, unknown>();
        if (flow.variables) {
            for (const v of flow.variables) {
                if (v.isInput && context?.params?.[v.name] !== undefined) {
                    variables.set(v.name, context.params[v.name]);
                }
            }
        }
        // Inject trigger record
        if (context?.record) {
            variables.set('$record', context.record);
        }

        const runId = `run_${++this.runCounter}`;
        const startedAt = new Date().toISOString();

        try {
            // Find the start node
            const startNode = flow.nodes.find(n => n.type === 'start');
            if (!startNode) {
                return { success: false, error: 'Flow has no start node' };
            }

            // DAG traversal execution
            await this.executeNode(startNode, flow, variables, context ?? {});

            // Collect output variables
            const output: Record<string, unknown> = {};
            if (flow.variables) {
                for (const v of flow.variables) {
                    if (v.isOutput) {
                        output[v.name] = variables.get(v.name);
                    }
                }
            }

            const durationMs = Date.now() - startTime;

            // Record execution log
            this.executionLogs.push({
                id: runId,
                flowName,
                status: 'completed',
                startedAt,
                completedAt: new Date().toISOString(),
                durationMs,
                trigger: {
                    type: context?.event ?? 'manual',
                    userId: context?.userId,
                    object: context?.object,
                },
                steps: [],
                output,
            });

            return {
                success: true,
                output,
                durationMs,
            };
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);

            // Record failed execution log
            const durationMs = Date.now() - startTime;
            this.executionLogs.push({
                id: runId,
                flowName,
                status: 'failed',
                startedAt,
                completedAt: new Date().toISOString(),
                durationMs,
                trigger: {
                    type: context?.event ?? 'manual',
                    userId: context?.userId,
                    object: context?.object,
                },
                steps: [],
                error: errorMessage,
            });

            // Error handling strategy
            if (flow.errorHandling?.strategy === 'retry') {
                return this.retryExecution(flowName, context, startTime, flow.errorHandling);
            }
            return {
                success: false,
                error: errorMessage,
                durationMs,
            };
        }
    }

    // ── DAG Traversal Core ──────────────────────────────────

    private async executeNode(
        node: FlowNodeParsed,
        flow: FlowParsed,
        variables: Map<string, unknown>,
        context: AutomationContext,
    ): Promise<void> {
        if (node.type === 'end') return;

        // Find executor
        const executor = this.nodeExecutors.get(node.type);
        if (!executor) {
            // start node without executor is fine — just skip
            if (node.type !== 'start') {
                throw new Error(`No executor registered for node type '${node.type}'`);
            }
        } else {
            // Execute node
            const result = await executor.execute(node, variables, context);
            if (!result.success) {
                throw new Error(`Node '${node.id}' failed: ${result.error}`);
            }
            // Write back output variables
            if (result.output) {
                for (const [key, value] of Object.entries(result.output)) {
                    variables.set(`${node.id}.${key}`, value);
                }
            }
        }

        // Find next nodes (filter by edge conditions)
        const outEdges = flow.edges.filter(e => e.source === node.id);
        for (const edge of outEdges) {
            if (edge.condition && !this.evaluateCondition(edge.condition, variables)) {
                continue;
            }
            const nextNode = flow.nodes.find(n => n.id === edge.target);
            if (nextNode) {
                await this.executeNode(nextNode, flow, variables, context);
            }
        }
    }

    private evaluateCondition(expression: string, variables: Map<string, unknown>): boolean {
        // MVP: Simple template replacement + expression evaluation.
        // Flow definitions are authored by trusted developers/admins.
        // TODO: Replace with safe expression evaluator (e.g., jexl) for production.
        let resolved = expression;
        for (const [key, value] of variables) {
            resolved = resolved.split(`{${key}}`).join(String(value));
        }
        try {
            return new Function(`return (${resolved})`)() as boolean;
        } catch {
            return false;
        }
    }

    private async retryExecution(
        flowName: string,
        context: AutomationContext | undefined,
        startTime: number,
        errorHandling: { maxRetries?: number; retryDelayMs?: number },
    ): Promise<AutomationResult> {
        const maxRetries = errorHandling.maxRetries ?? 3;
        const delay = errorHandling.retryDelayMs ?? 1000;

        for (let i = 0; i < maxRetries; i++) {
            await new Promise(r => setTimeout(r, delay));
            const result = await this.execute(flowName, context);
            if (result.success) return result;
        }
        return { success: false, error: 'Max retries exceeded', durationMs: Date.now() - startTime };
    }
}

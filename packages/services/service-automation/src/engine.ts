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

export class AutomationEngine implements IAutomationService {
    private flows = new Map<string, FlowParsed>();
    private nodeExecutors = new Map<string, NodeExecutor>();
    private triggers = new Map<string, FlowTrigger>();
    private logger: Logger;

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
        this.logger.info(`Flow registered: ${name}`);
    }

    unregisterFlow(name: string): void {
        this.flows.delete(name);
        this.logger.info(`Flow unregistered: ${name}`);
    }

    async listFlows(): Promise<string[]> {
        return [...this.flows.keys()];
    }

    async execute(flowName: string, context?: AutomationContext): Promise<AutomationResult> {
        const startTime = Date.now();
        const flow = this.flows.get(flowName);

        if (!flow) {
            return { success: false, error: `Flow '${flowName}' not found` };
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

            return {
                success: true,
                output,
                durationMs: Date.now() - startTime,
            };
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);

            // Error handling strategy
            if (flow.errorHandling?.strategy === 'retry') {
                return this.retryExecution(flowName, context, startTime, flow.errorHandling);
            }
            return {
                success: false,
                error: errorMessage,
                durationMs: Date.now() - startTime,
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
        // Simple template replacement + expression evaluation (MVP version)
        let resolved = expression;
        for (const [key, value] of variables) {
            resolved = resolved.replaceAll(`{${key}}`, String(value));
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

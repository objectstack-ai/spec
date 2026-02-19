// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Plugin, PluginContext } from '@objectstack/core';
import type { AutomationEngine } from '../engine.js';

/**
 * Logic Node Plugin — Provides decision / assignment / loop nodes
 *
 * Dependencies: service-automation (engine)
 */
export class LogicNodesPlugin implements Plugin {
    name = 'com.objectstack.automation.logic-nodes';
    version = '1.0.0';
    type = 'standard' as const;
    dependencies = ['com.objectstack.service-automation'];

    async init(ctx: PluginContext): Promise<void> {
        const engine = ctx.getService<AutomationEngine>('automation');

        // decision node — conditional branching
        engine.registerNodeExecutor({
            type: 'decision',
            async execute(node, variables, _context) {
                const config = node.config as Record<string, unknown> | undefined;
                const conditions = (config?.conditions ?? []) as Array<{ label: string; expression: string }>;

                for (const cond of conditions) {
                    let expr = cond.expression;
                    for (const [k, v] of variables) {
                        expr = expr.replaceAll(`{${k}}`, String(v));
                    }
                    try {
                        if (new Function(`return (${expr})`)()) {
                            return { success: true, branchLabel: cond.label };
                        }
                    } catch {
                        // Continue to next condition
                    }
                }
                return { success: true, branchLabel: 'default' };
            },
        });

        // assignment node — set variables
        engine.registerNodeExecutor({
            type: 'assignment',
            async execute(node, variables, _context) {
                const config = (node.config ?? {}) as Record<string, unknown>;
                for (const [key, value] of Object.entries(config)) {
                    variables.set(key, value);
                }
                return { success: true };
            },
        });

        // loop node — iterate over a collection
        engine.registerNodeExecutor({
            type: 'loop',
            async execute(node, variables, _context) {
                const config = node.config as Record<string, unknown> | undefined;
                const collectionName = config?.collection as string | undefined;
                if (collectionName) {
                    const collection = variables.get(collectionName);
                    if (Array.isArray(collection)) {
                        variables.set('$loopItems', collection);
                        variables.set('$loopIndex', 0);
                    }
                }
                return { success: true };
            },
        });

        ctx.logger.info('[Logic Nodes] 3 node executors registered');
    }
}

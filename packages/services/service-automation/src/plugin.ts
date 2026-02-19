// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Plugin, PluginContext } from '@objectstack/core';
import { AutomationEngine } from './engine.js';

/**
 * Configuration options for the AutomationServicePlugin.
 */
export interface AutomationServicePluginOptions {
    /** Enable debug logging for flow execution */
    debug?: boolean;
}

/**
 * AutomationServicePlugin — Core engine plugin
 *
 * Responsibilities:
 * 1. init phase: Create engine instance, register as 'automation' service
 * 2. start phase: Trigger 'automation:ready' hook for node plugin registration
 * 3. destroy phase: Clean up resources
 *
 * Does NOT implement any specific nodes — nodes are registered by other plugins
 * via the engine's extension API.
 *
 * @example
 * ```ts
 * import { LiteKernel } from '@objectstack/core';
 * import { AutomationServicePlugin } from '@objectstack/service-automation';
 *
 * const kernel = new LiteKernel();
 * kernel.use(new AutomationServicePlugin());
 * await kernel.bootstrap();
 *
 * const automation = kernel.getService('automation');
 * ```
 */
export class AutomationServicePlugin implements Plugin {
    name = 'com.objectstack.service-automation';
    version = '1.0.0';
    type = 'standard' as const;
    dependencies: string[] = [];

    private engine?: AutomationEngine;
    private readonly options: AutomationServicePluginOptions;

    constructor(options: AutomationServicePluginOptions = {}) {
        this.options = options;
    }

    async init(ctx: PluginContext): Promise<void> {
        this.engine = new AutomationEngine(ctx.logger);

        // Register as global service — other plugins access via ctx.getService('automation')
        ctx.registerService('automation', this.engine);

        if (this.options.debug) {
            ctx.hook('automation:beforeExecute', async (flowName: string) => {
                ctx.logger.debug(`[Automation] Before execute: ${flowName}`);
            });
        }

        ctx.logger.info('[Automation] Engine initialized');
    }

    async start(ctx: PluginContext): Promise<void> {
        if (!this.engine) return;

        // Trigger hook to notify engine is ready — other plugins can start registering nodes
        await ctx.trigger('automation:ready', this.engine);

        const nodeTypes = this.engine.getRegisteredNodeTypes();
        ctx.logger.info(
            `[Automation] Engine started with ${nodeTypes.length} node types: ${nodeTypes.join(', ') || '(none)'}`,
        );
    }

    async destroy(): Promise<void> {
        this.engine = undefined;
    }
}

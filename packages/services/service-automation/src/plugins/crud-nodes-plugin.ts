// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Plugin, PluginContext } from '@objectstack/core';
import type { AutomationEngine } from '../engine.js';

/**
 * CRUD Node Plugin — Provides get_record / create_record / update_record / delete_record
 *
 * Dependencies: service-automation (engine)
 *
 * In a full runtime environment these nodes would delegate to ObjectQL (data layer).
 * This MVP implementation provides the extension point structure.
 */
export class CrudNodesPlugin implements Plugin {
    name = 'com.objectstack.automation.crud-nodes';
    version = '1.0.0';
    type = 'standard' as const;
    dependencies = ['com.objectstack.service-automation'];

    async init(ctx: PluginContext): Promise<void> {
        const engine = ctx.getService<AutomationEngine>('automation');

        // get_record node executor
        engine.registerNodeExecutor({
            type: 'get_record',
            async execute(node, _variables, _context) {
                const config = node.config as Record<string, unknown> | undefined;
                // In production, this would query via ObjectQL:
                // const ql = ctx.getService('objectql');
                // const records = await ql.find(config.object, config.filters);
                return {
                    success: true,
                    output: { records: [], object: config?.object },
                };
            },
        });

        // create_record node executor
        engine.registerNodeExecutor({
            type: 'create_record',
            async execute(node, _variables, _context) {
                const config = node.config as Record<string, unknown> | undefined;
                return {
                    success: true,
                    output: { id: 'new-record-id', object: config?.object },
                };
            },
        });

        // update_record node executor
        engine.registerNodeExecutor({
            type: 'update_record',
            async execute(_node, _variables, _context) {
                return { success: true };
            },
        });

        // delete_record node executor
        engine.registerNodeExecutor({
            type: 'delete_record',
            async execute(_node, _variables, _context) {
                return { success: true };
            },
        });

        ctx.logger.info('[CRUD Nodes] 4 node executors registered');
    }
}

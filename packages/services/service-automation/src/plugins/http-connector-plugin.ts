// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Plugin, PluginContext } from '@objectstack/core';
import type { AutomationEngine } from '../engine.js';

/**
 * HTTP + Connector Node Plugin — Provides http_request / connector_action nodes
 *
 * Dependencies: service-automation (engine)
 */
export class HttpConnectorPlugin implements Plugin {
    name = 'com.objectstack.automation.http-connector';
    version = '1.0.0';
    type = 'standard' as const;
    dependencies = ['com.objectstack.service-automation'];

    async init(ctx: PluginContext): Promise<void> {
        const engine = ctx.getService<AutomationEngine>('automation');

        // http_request node executor
        engine.registerNodeExecutor({
            type: 'http_request',
            async execute(node, _variables, _context) {
                const config = node.config as Record<string, unknown> | undefined;
                const url = config?.url as string | undefined;
                const method = (config?.method as string) ?? 'GET';
                const headers = config?.headers as Record<string, string> | undefined;
                const body = config?.body;

                if (!url) {
                    return { success: false, error: 'http_request: url is required' };
                }

                const response = await fetch(url, {
                    method,
                    headers,
                    body: body ? JSON.stringify(body) : undefined,
                });
                const data = await response.json();

                return {
                    success: response.ok,
                    output: { response: data, status: response.status },
                    error: response.ok ? undefined : `HTTP ${response.status}`,
                };
            },
        });

        // connector_action node — calls a registered connector
        engine.registerNodeExecutor({
            type: 'connector_action',
            async execute(node, _variables, _context) {
                const connectorConfig = node.connectorConfig;
                if (!connectorConfig) {
                    return { success: false, error: 'connector_action: connectorConfig is required' };
                }

                ctx.logger.info(
                    `Connector action: ${connectorConfig.connectorId}.${connectorConfig.actionId}`,
                );

                // In production, this would look up the connector from a registry
                // and execute the specified action with the mapped inputs
                return { success: true, output: { connectorResult: {} } };
            },
        });

        ctx.logger.info('[HTTP Connector] 2 node executors registered');
    }
}

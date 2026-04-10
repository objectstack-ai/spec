// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Logger } from '@objectstack/spec/contracts';
import type { AIService } from '../ai-service.js';
import type { RouteDefinition } from './ai-routes.js';

/**
 * Extract string value from tool execution result output.
 */
function extractOutputValue(output: any): string {
  if (!output) return '';
  if (typeof output === 'string') return output;
  if (typeof output === 'object' && 'value' in output) {
    return String(output.value ?? '');
  }
  return JSON.stringify(output);
}

/**
 * Build tool-specific REST routes.
 *
 * | Method | Path | Description |
 * |:---|:---|:---|
 * | GET  | /api/v1/ai/tools | List all registered tools |
 * | POST | /api/v1/ai/tools/:toolName/execute | Execute a tool with parameters |
 */
export function buildToolRoutes(
  aiService: AIService,
  logger: Logger,
): RouteDefinition[] {
  return [
    // ── List registered tools ──────────────────────────────────────
    {
      method: 'GET',
      path: '/api/v1/ai/tools',
      description: 'List all registered AI tools',
      auth: true,
      permissions: ['ai:tools'],
      handler: async () => {
        try {
          const tools = aiService.toolRegistry.getAll();
          return {
            status: 200,
            body: {
              tools: tools.map(t => ({
                name: t.name,
                description: t.description,
                category: (t as any).category,
              }))
            }
          };
        } catch (err) {
          logger.error(
            '[AI Route] /tools list error',
            err instanceof Error ? err : undefined,
          );
          return { status: 500, body: { error: 'Internal AI service error' } };
        }
      },
    },

    // ── Execute a tool ──────────────────────────────────────────────
    //
    // Executes a tool with the provided parameters.
    // This is intended for testing/playground use.
    //
    {
      method: 'POST',
      path: '/api/v1/ai/tools/:toolName/execute',
      description: 'Execute a tool with parameters (playground/testing)',
      auth: true,
      permissions: ['ai:tools', 'ai:execute'],
      handler: async (req) => {
        const toolName = req.params?.toolName;
        if (!toolName) {
          return { status: 400, body: { error: 'toolName parameter is required' } };
        }

        // Parse request body
        const body = (req.body ?? {}) as Record<string, unknown>;
        const { parameters } = body as {
          parameters?: Record<string, unknown>;
        };

        if (!parameters || typeof parameters !== 'object') {
          return { status: 400, body: { error: 'parameters object is required' } };
        }

        try {
          // Check if tool exists
          if (!aiService.toolRegistry.has(toolName)) {
            return { status: 404, body: { error: `Tool "${toolName}" not found` } };
          }

          // Execute the tool using ToolRegistry's execute method
          const startTime = Date.now();

          const toolCallPart = {
            type: 'tool-call' as const,
            toolCallId: `playground-${Date.now()}`,
            toolName,
            input: parameters,
          };

          const result = await aiService.toolRegistry.execute(toolCallPart);
          const duration = Date.now() - startTime;

          // Check if execution resulted in an error
          if (result.isError) {
            const errorMsg = extractOutputValue(result.output);
            logger.error(
              `[AI Route] Tool execution error: ${toolName}`,
              new Error(errorMsg),
            );
            return {
              status: 500,
              body: {
                error: errorMsg,
                duration,
              },
            };
          }

          return {
            status: 200,
            body: {
              result: extractOutputValue(result.output),
              duration,
              toolName,
            },
          };
        } catch (err) {
          logger.error(
            '[AI Route] /tools/:toolName/execute error',
            err instanceof Error ? err : undefined,
          );
          return { status: 500, body: { error: 'Internal AI service error' } };
        }
      },
    },
  ];
}

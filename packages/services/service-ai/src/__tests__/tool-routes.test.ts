// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildToolRoutes } from '../routes/tool-routes.js';
import { AIService } from '../ai-service.js';
import { InMemoryConversationService } from '../conversation/in-memory-conversation-service.js';
import { ToolRegistry } from '../tools/tool-registry.js';
import type { Logger } from '@objectstack/spec/contracts';

const silentLogger: Logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  fatal: vi.fn(),
};

describe('Tool Routes', () => {
  let aiService: AIService;
  let routes: ReturnType<typeof buildToolRoutes>;

  beforeEach(() => {
    const conversationService = new InMemoryConversationService();
    aiService = new AIService({
      adapter: 'memory',
      conversationService,
    });

    // Register a test tool
    aiService.toolRegistry.register(
      {
        name: 'test_tool',
        description: 'A test tool for playground',
        parameters: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
        },
      },
      async (params: any) => {
        return JSON.stringify({ echo: params.message });
      }
    );

    routes = buildToolRoutes(aiService, silentLogger);
  });

  describe('GET /api/v1/ai/tools', () => {
    it('should list all registered tools', async () => {
      const listRoute = routes.find(r => r.method === 'GET' && r.path === '/api/v1/ai/tools');
      expect(listRoute).toBeDefined();

      const response = await listRoute!.handler({});
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tools');
      expect(Array.isArray((response.body as any).tools)).toBe(true);

      const tools = (response.body as any).tools;
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.some((t: any) => t.name === 'test_tool')).toBe(true);
    });

    it('should require authentication', () => {
      const listRoute = routes.find(r => r.method === 'GET' && r.path === '/api/v1/ai/tools');
      expect(listRoute?.auth).toBe(true);
      expect(listRoute?.permissions).toContain('ai:tools');
    });
  });

  describe('POST /api/v1/ai/tools/:toolName/execute', () => {
    it('should execute a tool with parameters', async () => {
      const executeRoute = routes.find(
        r => r.method === 'POST' && r.path === '/api/v1/ai/tools/:toolName/execute'
      );
      expect(executeRoute).toBeDefined();

      const response = await executeRoute!.handler({
        params: { toolName: 'test_tool' },
        body: {
          parameters: { message: 'Hello, Playground!' },
        },
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('result');
      // Result is a JSON string from the handler
      expect((response.body as any).result).toBe('{"echo":"Hello, Playground!"}');
      expect((response.body as any).toolName).toBe('test_tool');
      expect((response.body as any).duration).toBeTypeOf('number');
    });

    it('should return 404 for non-existent tool', async () => {
      const executeRoute = routes.find(
        r => r.method === 'POST' && r.path === '/api/v1/ai/tools/:toolName/execute'
      );

      const response = await executeRoute!.handler({
        params: { toolName: 'non_existent_tool' },
        body: {
          parameters: {},
        },
      });

      expect(response.status).toBe(404);
      expect((response.body as any).error).toContain('not found');
    });

    it('should return 400 when toolName is missing', async () => {
      const executeRoute = routes.find(
        r => r.method === 'POST' && r.path === '/api/v1/ai/tools/:toolName/execute'
      );

      const response = await executeRoute!.handler({
        body: {
          parameters: {},
        },
      });

      expect(response.status).toBe(400);
      expect((response.body as any).error).toContain('toolName');
    });

    it('should return 400 when parameters are missing', async () => {
      const executeRoute = routes.find(
        r => r.method === 'POST' && r.path === '/api/v1/ai/tools/:toolName/execute'
      );

      const response = await executeRoute!.handler({
        params: { toolName: 'test_tool' },
        body: {},
      });

      expect(response.status).toBe(400);
      expect((response.body as any).error).toContain('parameters');
    });

    it('should handle tool execution errors', async () => {
      // Register a tool that throws an error
      aiService.toolRegistry.register(
        {
          name: 'error_tool',
          description: 'A tool that throws an error',
          parameters: { type: 'object', properties: {} },
        },
        async () => {
          throw new Error('Tool execution failed');
        }
      );

      const executeRoute = routes.find(
        r => r.method === 'POST' && r.path === '/api/v1/ai/tools/:toolName/execute'
      );

      const response = await executeRoute!.handler({
        params: { toolName: 'error_tool' },
        body: {
          parameters: {},
        },
      });

      expect(response.status).toBe(500);
      expect((response.body as any).error).toContain('Tool execution failed');
      expect((response.body as any).duration).toBeTypeOf('number');
    });

    it('should require authentication and permissions', () => {
      const executeRoute = routes.find(
        r => r.method === 'POST' && r.path === '/api/v1/ai/tools/:toolName/execute'
      );

      expect(executeRoute?.auth).toBe(true);
      expect(executeRoute?.permissions).toContain('ai:tools');
      expect(executeRoute?.permissions).toContain('ai:execute');
    });
  });

  describe('Route Configuration', () => {
    it('should register exactly 2 routes', () => {
      expect(routes).toHaveLength(2);
    });

    it('should have descriptive route descriptions', () => {
      routes.forEach(route => {
        expect(route.description).toBeTruthy();
        expect(route.description.length).toBeGreaterThan(10);
      });
    });
  });
});

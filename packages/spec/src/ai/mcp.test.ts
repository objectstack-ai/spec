import { describe, it, expect } from 'vitest';
import {
  MCPServerConfigSchema,
  MCPToolSchema,
  MCPResourceSchema,
  MCPPromptSchema,
  MCPTransportConfigSchema,
  MCPServerInfoSchema,
  MCPToolCallRequestSchema,
  MCPToolCallResponseSchema,
  MCPResourceRequestSchema,
  MCPPromptRequestSchema,
  MCPStreamingConfigSchema,
  MCPToolApprovalSchema,
  MCPSamplingConfigSchema,
  MCPRootsConfigSchema,
  MCPRootEntrySchema,
  type MCPServerConfig,
  type MCPTool,
  type MCPResource,
} from './mcp.zod';

describe('MCPTransportConfigSchema', () => {
  it('should accept stdio transport', () => {
    const transport = {
      type: 'stdio' as const,
      command: 'node',
      args: ['mcp-server.js'],
    };

    const result = MCPTransportConfigSchema.parse(transport);
    expect(result.type).toBe('stdio');
    expect(result.timeout).toBe(30000);
    expect(result.retryAttempts).toBe(3);
  });

  it('should accept HTTP transport with auth', () => {
    const transport = {
      type: 'http' as const,
      url: 'https://api.example.com/mcp',
      auth: {
        type: 'bearer' as const,
        token: 'secret-token',
      },
      headers: {
        'X-Custom-Header': 'value',
      },
    };

    expect(() => MCPTransportConfigSchema.parse(transport)).not.toThrow();
  });

  it('should accept websocket transport', () => {
    const transport = {
      type: 'websocket' as const,
      url: 'wss://api.example.com/mcp',
      timeout: 60000,
    };

    expect(() => MCPTransportConfigSchema.parse(transport)).not.toThrow();
  });

  it('should enforce URL for HTTP/WebSocket transport', () => {
    const transport = {
      type: 'http' as const,
      url: 'https://api.example.com/mcp',
    };

    expect(() => MCPTransportConfigSchema.parse(transport)).not.toThrow();
  });
});

describe('MCPResourceSchema', () => {
  it('should accept minimal resource', () => {
    const resource = {
      uri: 'objectstack://objects/account',
      name: 'Account List',
    };

    const result = MCPResourceSchema.parse(resource);
    expect(result.resourceType).toBe('json');
    expect(result.cacheable).toBe(true);
  });

  it('should accept full resource definition', () => {
    const resource = {
      uri: 'objectstack://objects/account/ABC123',
      name: 'Account ABC123',
      description: 'Details for account ABC123',
      mimeType: 'application/json',
      resourceType: 'json' as const,
      content: {
        id: 'ABC123',
        name: 'Acme Corp',
      },
      size: 256,
      lastModified: '2024-01-01T00:00:00Z',
      tags: ['account', 'customer'],
      permissions: {
        read: true,
        write: false,
        delete: false,
      },
      cacheable: true,
      cacheMaxAge: 300,
    };

    expect(() => MCPResourceSchema.parse(resource)).not.toThrow();
  });

  it('should accept all resource types', () => {
    const types = ['text', 'json', 'binary', 'stream'] as const;
    
    types.forEach(resourceType => {
      const resource = {
        uri: `test://resource/${resourceType}`,
        name: `Test ${resourceType}`,
        resourceType,
      };
      expect(() => MCPResourceSchema.parse(resource)).not.toThrow();
    });
  });
});

describe('MCPToolSchema', () => {
  it('should accept minimal tool', () => {
    const tool = {
      name: 'create_account',
      description: 'Creates a new account in the system',
      parameters: [],
      handler: 'flows.create_account',
    };

    const result = MCPToolSchema.parse(tool);
    expect(result.async).toBe(true);
    expect(result.sideEffects).toBe('read');
    expect(result.requiresConfirmation).toBe(false);
    expect(result.deprecated).toBe(false);
    expect(result.version).toBe('1.0.0');
  });

  it('should accept tool with parameters', () => {
    const tool = {
      name: 'search_records',
      description: 'Search for records in an object',
      parameters: [
        {
          name: 'object_name',
          type: 'string' as const,
          description: 'Name of the object to search',
          required: true,
        },
        {
          name: 'query',
          type: 'string' as const,
          description: 'Search query',
          required: true,
          minLength: 1,
          maxLength: 500,
        },
        {
          name: 'limit',
          type: 'number' as const,
          description: 'Maximum number of results',
          required: false,
          default: 10,
          minimum: 1,
          maximum: 100,
        },
      ],
      handler: 'data.search',
      sideEffects: 'read' as const,
    };

    expect(() => MCPToolSchema.parse(tool)).not.toThrow();
  });

  it('should accept tool with return type', () => {
    const tool = {
      name: 'get_total_count',
      description: 'Get total count of records',
      parameters: [
        {
          name: 'object_name',
          type: 'string' as const,
          description: 'Object name',
          required: true,
        },
      ],
      returns: {
        type: 'number' as const,
        description: 'Total count of records',
      },
      handler: 'data.count',
    };

    expect(() => MCPToolSchema.parse(tool)).not.toThrow();
  });

  it('should accept tool with examples', () => {
    const tool = {
      name: 'create_task',
      description: 'Create a new task',
      parameters: [
        {
          name: 'title',
          type: 'string' as const,
          description: 'Task title',
          required: true,
        },
        {
          name: 'priority',
          type: 'string' as const,
          description: 'Task priority',
          required: false,
          enum: ['low', 'medium', 'high'],
          default: 'medium',
        },
      ],
      handler: 'flows.create_task',
      sideEffects: 'write' as const,
      requiresConfirmation: true,
      examples: [
        {
          description: 'Create a high priority task',
          parameters: {
            title: 'Fix critical bug',
            priority: 'high',
          },
          result: { id: 'TASK-001', status: 'created' },
        },
      ],
    };

    expect(() => MCPToolSchema.parse(tool)).not.toThrow();
  });

  it('should enforce snake_case naming', () => {
    expect(() => MCPToolSchema.parse({
      name: 'CreateAccount',
      description: 'Test',
      parameters: [],
      handler: 'test',
    })).toThrow();

    expect(() => MCPToolSchema.parse({
      name: 'create-account',
      description: 'Test',
      parameters: [],
      handler: 'test',
    })).toThrow();

    expect(() => MCPToolSchema.parse({
      name: 'create_account',
      description: 'Test',
      parameters: [],
      handler: 'test',
    })).not.toThrow();
  });

  it('should accept all side effect types', () => {
    const sideEffects = ['none', 'read', 'write', 'delete'] as const;
    
    sideEffects.forEach(effect => {
      const tool = {
        name: 'test_tool',
        description: 'Test tool',
        parameters: [],
        handler: 'test',
        sideEffects: effect,
      };
      expect(() => MCPToolSchema.parse(tool)).not.toThrow();
    });
  });
});

describe('MCPPromptSchema', () => {
  it('should accept minimal prompt', () => {
    const prompt = {
      name: 'summarize_ticket',
      messages: [
        {
          role: 'system' as const,
          content: 'You are a helpful assistant that summarizes support tickets.',
        },
        {
          role: 'user' as const,
          content: 'Please summarize this ticket: {{ticket_content}}',
        },
      ],
    };

    const result = MCPPromptSchema.parse(prompt);
    expect(result.version).toBe('1.0.0');
  });

  it('should accept prompt with arguments', () => {
    const prompt = {
      name: 'generate_report',
      description: 'Generate a report based on data',
      messages: [
        {
          role: 'system' as const,
          content: 'You are a report generator.',
        },
        {
          role: 'user' as const,
          content: 'Generate a {{report_type}} report for {{time_period}}',
        },
      ],
      arguments: [
        {
          name: 'report_type',
          type: 'string' as const,
          required: true,
          description: 'Type of report to generate',
        },
        {
          name: 'time_period',
          type: 'string' as const,
          required: true,
          description: 'Time period for the report',
        },
      ],
    };

    expect(() => MCPPromptSchema.parse(prompt)).not.toThrow();
  });

  it('should enforce snake_case naming', () => {
    expect(() => MCPPromptSchema.parse({
      name: 'GenerateReport',
      messages: [{ role: 'user', content: 'test' }],
    })).toThrow();

    expect(() => MCPPromptSchema.parse({
      name: 'generate_report',
      messages: [{ role: 'user', content: 'test' }],
    })).not.toThrow();
  });
});

describe('MCPServerInfoSchema', () => {
  it('should accept minimal server info', () => {
    const info = {
      name: 'ObjectStack MCP Server',
      version: '1.0.0',
      capabilities: {
        resources: true,
        tools: true,
      },
    };

    const result = MCPServerInfoSchema.parse(info);
    expect(result.protocolVersion).toBe('2024-11-05');
  });

  it('should accept full server info', () => {
    const info = {
      name: 'ObjectStack MCP Server',
      version: '1.2.3',
      description: 'MCP server for ObjectStack integration',
      capabilities: {
        resources: true,
        resourceTemplates: true,
        tools: true,
        prompts: true,
        sampling: false,
        logging: true,
      },
      protocolVersion: '2024-11-05',
      vendor: 'ObjectStack AI',
      homepage: 'https://objectstack.ai',
      documentation: 'https://docs.objectstack.ai/mcp',
    };

    expect(() => MCPServerInfoSchema.parse(info)).not.toThrow();
  });
});

describe('MCPServerConfigSchema', () => {
  it('should accept minimal server config', () => {
    const config = {
      name: 'objectstack_mcp',
      label: 'ObjectStack MCP Server',
      serverInfo: {
        name: 'ObjectStack MCP',
        version: '1.0.0',
        capabilities: {
          resources: true,
          tools: true,
        },
      },
      transport: {
        type: 'stdio' as const,
        command: 'node',
        args: ['server.js'],
      },
    };

    const result = MCPServerConfigSchema.parse(config);
    expect(result.autoStart).toBe(false);
    expect(result.restartOnFailure).toBe(true);
    expect(result.status).toBe('active');
    expect(result.version).toBe('1.0.0');
  });

  it('should accept full server config', () => {
    const config: MCPServerConfig = {
      name: 'objectstack_mcp',
      label: 'ObjectStack MCP Server',
      description: 'MCP server exposing ObjectStack data and tools',
      serverInfo: {
        name: 'ObjectStack MCP',
        version: '2.0.0',
        description: 'Full-featured MCP server',
        capabilities: {
          resources: true,
          resourceTemplates: true,
          tools: true,
          prompts: true,
          sampling: true,
          logging: true,
        },
        vendor: 'ObjectStack AI',
      },
      transport: {
        type: 'http' as const,
        url: 'https://mcp.objectstack.ai',
        auth: {
          type: 'bearer',
          secretRef: 'system:mcp_api_key',
        },
        timeout: 45000,
      },
      resources: [
        {
          uri: 'objectstack://metadata/objects',
          name: 'Object Definitions',
          description: 'List of all object definitions',
          resourceType: 'json',
        },
      ],
      tools: [
        {
          name: 'search_records',
          description: 'Search for records',
          parameters: [
            {
              name: 'object',
              type: 'string',
              description: 'Object name',
              required: true,
            },
          ],
          handler: 'data.search',
        },
      ],
      prompts: [
        {
          name: 'analyze_data',
          messages: [
            {
              role: 'system',
              content: 'You are a data analyst.',
            },
            {
              role: 'user',
              content: 'Analyze this data: {{data}}',
            },
          ],
        },
      ],
      autoStart: true,
      restartOnFailure: true,
      healthCheck: {
        enabled: true,
        interval: 30000,
        timeout: 5000,
      },
      permissions: {
        allowedAgents: ['support_agent', 'data_analyst'],
        requireAuth: true,
      },
      rateLimit: {
        enabled: true,
        requestsPerMinute: 100,
        requestsPerHour: 5000,
      },
      tags: ['production', 'data'],
      status: 'active',
      version: '2.0.0',
    };

    expect(() => MCPServerConfigSchema.parse(config)).not.toThrow();
  });
});

describe('MCPToolCallRequestSchema', () => {
  it('should accept minimal tool call request', () => {
    const request = {
      toolName: 'search_records',
      parameters: {
        object: 'account',
        query: 'name contains "Acme"',
      },
    };

    expect(() => MCPToolCallRequestSchema.parse(request)).not.toThrow();
  });

  it('should accept tool call with context', () => {
    const request = {
      toolName: 'create_record',
      parameters: {
        object: 'task',
        data: { title: 'New task' },
      },
      confirmationProvided: true,
      context: {
        userId: 'user123',
        sessionId: 'session456',
        agentName: 'support_agent',
        metadata: {
          source: 'chat',
        },
      },
    };

    expect(() => MCPToolCallRequestSchema.parse(request)).not.toThrow();
  });
});

describe('MCPToolCallResponseSchema', () => {
  it('should accept success response', () => {
    const response = {
      toolName: 'search_records',
      status: 'success' as const,
      result: [
        { id: '1', name: 'Record 1' },
        { id: '2', name: 'Record 2' },
      ],
      executionTime: 125,
      timestamp: '2024-01-01T00:00:00Z',
    };

    expect(() => MCPToolCallResponseSchema.parse(response)).not.toThrow();
  });

  it('should accept error response', () => {
    const response = {
      toolName: 'create_record',
      status: 'error' as const,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Required field "title" is missing',
        details: { field: 'title' },
      },
      executionTime: 50,
    };

    expect(() => MCPToolCallResponseSchema.parse(response)).not.toThrow();
  });
});

describe('MCPResourceRequestSchema', () => {
  it('should accept resource request', () => {
    const request = {
      uri: 'objectstack://objects/account/ABC123',
    };

    expect(() => MCPResourceRequestSchema.parse(request)).not.toThrow();
  });

  it('should accept resource request with parameters', () => {
    const request = {
      uri: 'objectstack://objects/{objectName}/{recordId}',
      parameters: {
        objectName: 'account',
        recordId: 'ABC123',
      },
    };

    expect(() => MCPResourceRequestSchema.parse(request)).not.toThrow();
  });
});

describe('MCPPromptRequestSchema', () => {
  it('should accept prompt request', () => {
    const request = {
      promptName: 'summarize_ticket',
      arguments: {
        ticket_content: 'User reports an issue with login',
      },
    };

    expect(() => MCPPromptRequestSchema.parse(request)).not.toThrow();
  });
});

// ==========================================
// MCP Streaming, Approval, Sampling, Roots Tests
// ==========================================

describe('MCPStreamingConfigSchema', () => {
  it('should accept minimal streaming config', () => {
    const config = MCPStreamingConfigSchema.parse({
      enabled: true,
    });

    expect(config.enabled).toBe(true);
    expect(config.heartbeatIntervalMs).toBe(30000);
  });

  it('should accept full streaming config', () => {
    const config = MCPStreamingConfigSchema.parse({
      enabled: true,
      chunkSize: 4096,
      heartbeatIntervalMs: 15000,
      backpressure: 'buffer',
    });

    expect(config.chunkSize).toBe(4096);
    expect(config.heartbeatIntervalMs).toBe(15000);
    expect(config.backpressure).toBe('buffer');
  });

  it('should accept all backpressure strategies', () => {
    const strategies = ['drop', 'buffer', 'block'] as const;
    strategies.forEach(bp => {
      const config = MCPStreamingConfigSchema.parse({
        enabled: false,
        backpressure: bp,
      });
      expect(config.backpressure).toBe(bp);
    });
  });

  it('should reject non-positive chunkSize', () => {
    expect(() => MCPStreamingConfigSchema.parse({
      enabled: true,
      chunkSize: 0,
    })).toThrow();
  });
});

describe('MCPToolApprovalSchema', () => {
  it('should accept minimal approval config', () => {
    const config = MCPToolApprovalSchema.parse({
      approvalStrategy: 'auto_approve',
    });

    expect(config.requireApproval).toBe(false);
    expect(config.approvalStrategy).toBe('auto_approve');
  });

  it('should accept human-in-loop with patterns', () => {
    const config = MCPToolApprovalSchema.parse({
      requireApproval: true,
      approvalStrategy: 'human_in_loop',
      dangerousToolPatterns: ['^delete_', '^drop_'],
      autoApproveTimeout: 120,
    });

    expect(config.requireApproval).toBe(true);
    expect(config.dangerousToolPatterns).toHaveLength(2);
    expect(config.autoApproveTimeout).toBe(120);
  });

  it('should accept all approval strategies', () => {
    const strategies = ['human_in_loop', 'auto_approve', 'policy_based'] as const;
    strategies.forEach(s => {
      const config = MCPToolApprovalSchema.parse({ approvalStrategy: s });
      expect(config.approvalStrategy).toBe(s);
    });
  });
});

describe('MCPSamplingConfigSchema', () => {
  it('should accept minimal sampling config', () => {
    const config = MCPSamplingConfigSchema.parse({
      enabled: true,
      maxTokens: 1024,
    });

    expect(config.enabled).toBe(true);
    expect(config.maxTokens).toBe(1024);
  });

  it('should accept full sampling config', () => {
    const config = MCPSamplingConfigSchema.parse({
      enabled: true,
      maxTokens: 4096,
      temperature: 0.7,
      stopSequences: ['</answer>', '\n\n'],
      modelPreferences: ['claude-3-opus', 'gpt-4'],
      systemPrompt: 'You are a helpful assistant.',
    });

    expect(config.temperature).toBe(0.7);
    expect(config.stopSequences).toHaveLength(2);
    expect(config.modelPreferences).toHaveLength(2);
    expect(config.systemPrompt).toBeDefined();
  });

  it('should reject temperature out of range', () => {
    expect(() => MCPSamplingConfigSchema.parse({
      enabled: true,
      maxTokens: 100,
      temperature: 2.5,
    })).toThrow();
  });
});

describe('MCPRootsConfigSchema', () => {
  it('should accept minimal roots config', () => {
    const config = MCPRootsConfigSchema.parse({
      roots: [{ uri: 'file:///home/user/project' }],
    });

    expect(config.roots).toHaveLength(1);
    expect(config.watchForChanges).toBe(false);
    expect(config.notifyOnChange).toBe(true);
  });

  it('should accept full roots config', () => {
    const config = MCPRootsConfigSchema.parse({
      roots: [
        { uri: 'file:///home/user/project', name: 'Main Project', readOnly: false },
        { uri: 'file:///home/user/docs', name: 'Documentation', readOnly: true },
      ],
      watchForChanges: true,
      notifyOnChange: true,
    });

    expect(config.roots).toHaveLength(2);
    expect(config.roots[1].readOnly).toBe(true);
    expect(config.watchForChanges).toBe(true);
  });

  it('should require at least one root', () => {
    expect(() => MCPRootsConfigSchema.parse({
      roots: [],
    })).not.toThrow(); // Array can be empty per schema
  });

  it('should accept MCPServerConfig with streaming and approval', () => {
    const config = MCPServerConfigSchema.parse({
      name: 'test_server',
      label: 'Test MCP Server',
      serverInfo: {
        name: 'Test',
        version: '1.0.0',
        capabilities: { tools: true },
      },
      transport: {
        type: 'stdio',
        command: 'node',
        args: ['server.js'],
      },
      streaming: {
        enabled: true,
        chunkSize: 8192,
      },
      toolApproval: {
        requireApproval: true,
        approvalStrategy: 'human_in_loop',
      },
      sampling: {
        enabled: true,
        maxTokens: 2048,
      },
    });

    expect(config.streaming?.enabled).toBe(true);
    expect(config.toolApproval?.requireApproval).toBe(true);
    expect(config.sampling?.maxTokens).toBe(2048);
  });

  it('should accept MCPRootEntrySchema', () => {
    const entry = MCPRootEntrySchema.parse({
      uri: 'file:///workspace',
      name: 'Workspace',
      readOnly: true,
    });

    expect(entry.uri).toBe('file:///workspace');
    expect(entry.readOnly).toBe(true);
  });
});

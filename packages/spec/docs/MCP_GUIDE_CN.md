# MCP (Model Context Protocol) 集成指南

## 概述

Model Context Protocol (MCP) 是一个标准化协议，用于将 AI 助手连接到外部工具、数据源和资源。ObjectStack 通过 MCP 协议实现了 AI 代理与业务数据、工作流和服务的无缝集成。

## 核心概念

### 1. MCP 服务器 (MCP Server)

MCP 服务器是向 AI 代理公开能力的服务端点。每个服务器可以提供：

- **资源 (Resources)**: 上下文信息（数据、文档、记录）
- **工具 (Tools)**: 可调用的函数和操作
- **提示模板 (Prompts)**: 预定义的提示词模板

### 2. 传输方式 (Transport)

支持多种传输协议：

- **stdio**: 标准输入/输出（本地进程）
- **http**: HTTP REST API
- **websocket**: WebSocket 双向通信
- **grpc**: gRPC 高性能通信

### 3. 能力 (Capabilities)

MCP 服务器可以声明支持的功能：

- `resources`: 支持资源列表和检索
- `resourceTemplates`: 支持动态资源模板
- `tools`: 支持工具/函数调用
- `prompts`: 支持提示模板
- `sampling`: 支持 LLM 采样
- `logging`: 支持日志记录

## 快速开始

### 定义 MCP 服务器

```typescript
import { MCPServerConfigSchema } from '@objectstack/spec/ai';

export const objectStackMCP = MCPServerConfigSchema.parse({
  // 服务器标识
  name: 'objectstack_mcp',
  label: 'ObjectStack MCP 服务器',
  description: '将 AI 代理连接到 ObjectStack 数据和工作流',
  
  // 服务器信息
  serverInfo: {
    name: 'ObjectStack MCP',
    version: '1.0.0',
    capabilities: {
      resources: true,
      resourceTemplates: true,
      tools: true,
      prompts: true,
    },
  },
  
  // 传输配置
  transport: {
    type: 'http',
    url: 'https://api.objectstack.ai/mcp',
    auth: {
      type: 'bearer',
      secretRef: 'system:mcp_api_key',
    },
  },
  
  // 将业务数据公开为资源
  resourceTemplates: [
    {
      uriPattern: 'objectstack://objects/{objectName}',
      name: '对象数据',
      description: '访问对象记录',
      parameters: [
        {
          name: 'objectName',
          type: 'string',
          required: true,
          description: '要访问的对象名称',
        },
      ],
      handler: 'resources.getObjectData',
    },
  ],
  
  // 将业务操作公开为工具
  tools: [
    {
      name: 'create_record',
      description: '在任何对象中创建新记录',
      parameters: [
        {
          name: 'object',
          type: 'string',
          description: '对象名称（例如 "account", "contact"）',
          required: true,
        },
        {
          name: 'data',
          type: 'object',
          description: '记录数据，键值对格式',
          required: true,
        },
      ],
      handler: 'flows.create_record',
      sideEffects: 'write',
      requiresConfirmation: true,
    },
  ],
  
  // 提供提示模板
  prompts: [
    {
      name: 'analyze_customer_data',
      description: '分析客户数据并生成洞察',
      messages: [
        {
          role: 'system',
          content: '你是一位专注于客户洞察的数据分析师。',
        },
        {
          role: 'user',
          content: '分析以下客户数据并提供洞察：{{customer_data}}',
        },
      ],
      arguments: [
        {
          name: 'customer_data',
          type: 'string',
          required: true,
          description: 'JSON 格式的客户数据',
        },
      ],
    },
  ],
});
```

## 详细使用场景

### 场景 1: 将 ObjectStack 对象公开为 MCP 资源

```typescript
// 定义动态资源模板
const resourceTemplates = [
  {
    uriPattern: 'objectstack://objects/{objectName}/{recordId}',
    name: '对象记录详情',
    description: '获取特定对象的单条记录',
    parameters: [
      {
        name: 'objectName',
        type: 'string',
        required: true,
        description: '对象名称（如 account, contact, task）',
      },
      {
        name: 'recordId',
        type: 'string',
        required: true,
        description: '记录 ID',
      },
    ],
    handler: 'resources.getRecordDetail',
    mimeType: 'application/json',
    resourceType: 'json',
  },
  
  // 列表视图资源
  {
    uriPattern: 'objectstack://views/{viewName}',
    name: '视图数据',
    description: '获取特定视图的记录列表',
    parameters: [
      {
        name: 'viewName',
        type: 'string',
        required: true,
        description: '视图名称',
      },
    ],
    handler: 'resources.getViewData',
  },
  
  // 报表资源
  {
    uriPattern: 'objectstack://reports/{reportId}',
    name: '报表数据',
    description: '获取报表结果',
    parameters: [
      {
        name: 'reportId',
        type: 'string',
        required: true,
        description: '报表 ID',
      },
    ],
    handler: 'resources.getReportData',
  },
];
```

### 场景 2: 将业务流程公开为 MCP 工具

```typescript
const tools = [
  // 数据查询工具
  {
    name: 'search_records',
    description: '使用自然语言或过滤器搜索记录',
    parameters: [
      {
        name: 'object',
        type: 'string',
        description: '要搜索的对象',
        required: true,
      },
      {
        name: 'query',
        type: 'string',
        description: '搜索查询',
        required: true,
      },
      {
        name: 'limit',
        type: 'number',
        description: '最大结果数',
        required: false,
        default: 10,
        minimum: 1,
        maximum: 100,
      },
    ],
    handler: 'data.search',
    sideEffects: 'read',
  },
  
  // 数据创建工具
  {
    name: 'create_task',
    description: '创建新任务',
    parameters: [
      {
        name: 'title',
        type: 'string',
        description: '任务标题',
        required: true,
        maxLength: 200,
      },
      {
        name: 'description',
        type: 'string',
        description: '任务描述',
        required: false,
      },
      {
        name: 'priority',
        type: 'string',
        description: '优先级',
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
      },
      {
        name: 'assignee',
        type: 'string',
        description: '分配给（用户 ID）',
        required: false,
      },
      {
        name: 'due_date',
        type: 'string',
        description: '截止日期（ISO 8601 格式）',
        required: false,
      },
    ],
    handler: 'flows.create_task',
    sideEffects: 'write',
    requiresConfirmation: true,
    confirmationMessage: '确认创建此任务？',
    examples: [
      {
        description: '创建高优先级任务',
        parameters: {
          title: '修复关键 Bug',
          priority: 'high',
          assignee: 'user_123',
        },
        result: {
          id: 'TASK-001',
          status: 'created',
        },
      },
    ],
  },
  
  // 工作流触发工具
  {
    name: 'trigger_approval',
    description: '触发审批流程',
    parameters: [
      {
        name: 'record_id',
        type: 'string',
        description: '需要审批的记录 ID',
        required: true,
      },
      {
        name: 'approval_process',
        type: 'string',
        description: '审批流程名称',
        required: true,
      },
      {
        name: 'approvers',
        type: 'array',
        description: '审批人 ID 列表',
        items: {
          name: 'approver_id',
          type: 'string',
          description: '审批人 ID',
          required: true,
        },
      },
    ],
    handler: 'workflows.trigger_approval',
    sideEffects: 'write',
  },
  
  // 数据分析工具
  {
    name: 'generate_report',
    description: '生成业务报表',
    parameters: [
      {
        name: 'report_type',
        type: 'string',
        description: '报表类型',
        enum: ['sales', 'revenue', 'customer_analysis', 'inventory'],
        required: true,
      },
      {
        name: 'time_period',
        type: 'string',
        description: '时间段',
        enum: ['today', 'week', 'month', 'quarter', 'year'],
        default: 'month',
      },
      {
        name: 'filters',
        type: 'object',
        description: '额外的过滤条件',
        required: false,
      },
    ],
    handler: 'reports.generate',
    sideEffects: 'read',
    timeout: 60000, // 60 秒超时
  },
];
```

### 场景 3: 提供业务提示模板

```typescript
const prompts = [
  // 客户分析提示
  {
    name: 'analyze_customer_behavior',
    description: '分析客户行为模式',
    messages: [
      {
        role: 'system',
        content: '你是一位客户行为分析专家，擅长从客户数据中发现模式和趋势。',
      },
      {
        role: 'user',
        content: `分析以下客户的行为模式：
客户 ID: {{customer_id}}
购买历史: {{purchase_history}}
互动记录: {{interaction_history}}

请提供：
1. 客户行为模式总结
2. 购买偏好分析
3. 流失风险评估
4. 个性化推荐建议`,
      },
    ],
    arguments: [
      {
        name: 'customer_id',
        type: 'string',
        required: true,
        description: '客户唯一标识符',
      },
      {
        name: 'purchase_history',
        type: 'string',
        required: true,
        description: 'JSON 格式的购买历史',
      },
      {
        name: 'interaction_history',
        type: 'string',
        required: true,
        description: 'JSON 格式的互动记录',
      },
    ],
    category: 'analytics',
  },
  
  // 销售线索评分提示
  {
    name: 'score_lead',
    description: '评估销售线索质量',
    messages: [
      {
        role: 'system',
        content: '你是一位销售线索评分专家，根据多个维度评估线索质量。',
      },
      {
        role: 'user',
        content: `评估以下销售线索：
公司信息: {{company_info}}
联系人信息: {{contact_info}}
互动历史: {{engagement_data}}

请提供：
1. 线索评分（0-100）
2. 评分依据
3. 跟进建议
4. 预计成交概率`,
      },
    ],
    arguments: [
      {
        name: 'company_info',
        type: 'string',
        required: true,
      },
      {
        name: 'contact_info',
        type: 'string',
        required: true,
      },
      {
        name: 'engagement_data',
        type: 'string',
        required: true,
      },
    ],
    category: 'sales',
  },
  
  // 支持工单分类提示
  {
    name: 'classify_support_ticket',
    description: '自动分类支持工单',
    messages: [
      {
        role: 'system',
        content: '你是一位客户支持专家，负责对工单进行分类和优先级评估。',
      },
      {
        role: 'user',
        content: `分类以下支持工单：
标题: {{ticket_title}}
描述: {{ticket_description}}
客户: {{customer_tier}}

请提供：
1. 工单类别（技术/账户/计费/功能请求）
2. 优先级（低/中/高/紧急）
3. 建议分配的团队
4. 预估解决时间`,
      },
    ],
    arguments: [
      {
        name: 'ticket_title',
        type: 'string',
        required: true,
      },
      {
        name: 'ticket_description',
        type: 'string',
        required: true,
      },
      {
        name: 'customer_tier',
        type: 'string',
        required: false,
        default: 'standard',
      },
    ],
    category: 'support',
  },
];
```

## 高级配置

### 传输配置示例

#### HTTP 传输
```typescript
{
  type: 'http',
  url: 'https://api.objectstack.ai/mcp',
  auth: {
    type: 'bearer',
    secretRef: 'system:mcp_api_key',
  },
  headers: {
    'X-API-Version': '1.0',
  },
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
}
```

#### WebSocket 传输
```typescript
{
  type: 'websocket',
  url: 'wss://api.objectstack.ai/mcp',
  auth: {
    type: 'bearer',
    token: 'your-token-here',
  },
  timeout: 60000,
}
```

#### stdio 传输（本地进程）
```typescript
{
  type: 'stdio',
  command: 'node',
  args: ['./mcp-server.js'],
  env: {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgres://...',
  },
  workingDirectory: '/opt/objectstack',
}
```

### 健康检查和监控

```typescript
{
  healthCheck: {
    enabled: true,
    interval: 60000,      // 每 60 秒检查一次
    timeout: 5000,        // 5 秒超时
    endpoint: '/health',  // HTTP 健康检查端点
  },
  
  // 自动重启配置
  autoStart: true,
  restartOnFailure: true,
}
```

### 访问控制

```typescript
{
  permissions: {
    allowedAgents: [
      'support_agent',
      'sales_agent',
      'data_analyst_agent',
    ],
    allowedUsers: [
      'admin@example.com',
      'user_123',
    ],
    requireAuth: true,
  },
  
  // 限流配置
  rateLimit: {
    enabled: true,
    requestsPerMinute: 100,
    requestsPerHour: 5000,
    burstSize: 20,
  },
}
```

## 与 AI 代理集成

### 在 Agent 中使用 MCP 服务器

```typescript
import { AgentSchema } from '@objectstack/spec/ai';

export const supportAgent = AgentSchema.parse({
  name: 'support_tier_1',
  label: '一线支持代理',
  role: '客户支持助理',
  instructions: `你是一位专业的客户支持助理。
你可以访问客户数据、工单系统和知识库。
始终保持友好和专业的态度。`,
  
  model: {
    provider: 'openai',
    model: 'gpt-4-turbo',
    temperature: 0.3,
  },
  
  // 引用 MCP 服务器的工具
  tools: [
    {
      type: 'action',
      name: 'search_records',
      description: '搜索客户记录和工单',
    },
    {
      type: 'action',
      name: 'create_task',
      description: '创建跟进任务',
    },
    {
      type: 'flow',
      name: 'trigger_approval',
      description: '触发退款审批流程',
    },
  ],
  
  knowledge: {
    topics: ['support_docs', 'product_manual', 'faq'],
    indexes: ['support_knowledge_base'],
  },
});
```

## 最佳实践

### 1. 工具命名规范

- 使用 `snake_case` 命名
- 使用动词开头（`create_`, `update_`, `search_`, `trigger_`）
- 名称应清晰描述功能

### 2. 参数设计

- 提供详细的描述，帮助 AI 理解如何使用
- 使用合适的类型和验证规则
- 提供合理的默认值
- 使用 `enum` 限制可选值

### 3. 副作用声明

- `none`: 无副作用（纯查询）
- `read`: 只读操作
- `write`: 修改数据
- `delete`: 删除数据

对于有副作用的操作，考虑设置 `requiresConfirmation: true`

### 4. 错误处理

- 提供清晰的错误消息
- 使用适当的超时配置
- 实现重试机制

### 5. 性能优化

- 使用资源缓存（`cacheable: true`）
- 设置合理的 `cacheMaxAge`
- 实施限流保护
- 监控和记录性能指标

## 调试和测试

### 启用日志记录

```typescript
{
  serverInfo: {
    capabilities: {
      logging: true,
    },
  },
}
```

### 工具调用示例

```typescript
import { MCPToolCallRequestSchema } from '@objectstack/spec/ai';

const request = MCPToolCallRequestSchema.parse({
  toolName: 'create_task',
  parameters: {
    title: '跟进客户 ABC Corp',
    priority: 'high',
    assignee: 'user_123',
  },
  context: {
    userId: 'agent_001',
    sessionId: 'session_456',
    agentName: 'support_agent',
  },
});
```

## 常见问题

### Q: MCP 与 Agent Actions 的区别？

- **Agent Actions**: ObjectStack 内部的 UI 操作（导航、表单填写）
- **MCP Tools**: 通用的函数调用协议，可以是数据操作、外部 API 调用等

### Q: 如何选择传输方式？

- **stdio**: 本地开发和测试
- **http**: 生产环境、跨网络通信
- **websocket**: 需要实时双向通信
- **grpc**: 高性能场景

### Q: 如何保护 MCP 服务器？

1. 使用身份验证（Bearer Token、API Key）
2. 实施访问控制（`allowedAgents`, `allowedUsers`）
3. 启用限流（`rateLimit`）
4. 使用 HTTPS 传输
5. 定期轮换密钥

## 参考资料

- [Model Context Protocol 官方文档](https://modelcontextprotocol.io)
- [ObjectStack Agent 配置](./agent.zod.ts)
- [ObjectStack API 协议](../api/protocol.zod.ts)

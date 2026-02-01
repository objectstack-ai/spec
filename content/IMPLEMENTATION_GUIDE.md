# ObjectStack 实施指南 - 企业级低代码平台最佳实践
# ObjectStack Implementation Guide - Enterprise Low-Code Platform Best Practices

> **面向**: 架构师、开发者、产品经理
> 
> **Audience**: Architects, Developers, Product Managers

**版本 / Version**: 1.0  
**更新日期 / Last Updated**: 2026-02-01

---

## 📚 目录 / Table of Contents

1. [快速开始 / Quick Start](#quick-start)
2. [核心概念 / Core Concepts](#core-concepts)
3. [协议实现模式 / Protocol Implementation Patterns](#protocol-implementation-patterns)
4. [企业级特性 / Enterprise Features](#enterprise-features)
5. [AI 自动化 / AI Automation](#ai-automation)
6. [性能优化 / Performance Optimization](#performance-optimization)
7. [安全最佳实践 / Security Best Practices](#security-best-practices)
8. [测试策略 / Testing Strategy](#testing-strategy)
9. [部署指南 / Deployment Guide](#deployment-guide)
10. [故障排除 / Troubleshooting](#troubleshooting)

---

## <a name="quick-start"></a>🚀 快速开始 / Quick Start

### 环境准备 / Environment Setup

```bash
# 1. 安装依赖 / Install dependencies
pnpm install

# 2. 构建协议 / Build protocols
pnpm --filter @objectstack/spec build

# 3. 运行示例 / Run examples
cd examples/todo
pnpm dev

# 4. 运行测试 / Run tests
pnpm test

# 5. 启动文档 / Start documentation
pnpm docs:dev
```

### 创建第一个应用 / Create Your First App

```typescript
// objectstack.config.ts
import { defineStack } from '@objectstack/spec';

export default defineStack({
  manifest: {
    name: 'my_first_app',
    version: '1.0.0',
    label: 'My First App',
    description: 'Learning ObjectStack',
  },
  
  // 定义数据对象 / Define data objects
  objects: {
    task: {
      name: 'task',
      label: 'Task',
      fields: {
        title: {
          type: 'text',
          label: 'Title',
          required: true,
        },
        description: {
          type: 'textarea',
          label: 'Description',
        },
        status: {
          type: 'select',
          label: 'Status',
          options: ['todo', 'in_progress', 'done'],
          default: 'todo',
        },
        due_date: {
          type: 'date',
          label: 'Due Date',
        },
      },
    },
  },
  
  // 定义 UI 视图 / Define UI views
  ui: {
    apps: {
      main: {
        name: 'main',
        label: 'Task Manager',
        navigation: {
          items: [
            {
              type: 'object',
              object: 'task',
              label: 'Tasks',
            },
          ],
        },
      },
    },
    views: {
      task_list: {
        name: 'task_list',
        object: 'task',
        type: 'grid',
        fields: ['title', 'status', 'due_date'],
        sort: [{ field: 'due_date', order: 'asc' }],
      },
    },
  },
});
```

---

## <a name="core-concepts"></a>🎯 核心概念 / Core Concepts

### 三层架构 / Three-Layer Architecture

```
┌─────────────────────────────────────────────┐
│          ObjectUI (View Layer)              │
│  • Views (Grid, Kanban, Calendar)          │
│  • Apps & Navigation                        │
│  • Dashboards & Reports                     │
│  • Actions & Workflows                      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          ObjectOS (Control Layer)           │
│  • Plugin System & Kernel                   │
│  • Auth & Permissions (RBAC, RLS)          │
│  • Events & Hooks                           │
│  • Logging, Metrics, Tracing                │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          ObjectQL (Data Layer)              │
│  • Objects & Fields (28 types)             │
│  • Validation & Hooks                       │
│  • Query Engine                             │
│  • Database Drivers                         │
└─────────────────────────────────────────────┘
```

### 协议优先设计 / Protocol-First Design

**核心原则 / Core Principles:**

1. **Zod Schema First**: 所有定义必须从 Zod Schema 开始
2. **Runtime Validation**: 运行时验证，确保类型安全
3. **Type Derivation**: TypeScript 类型从 Zod 推导
4. **JSON Schema Generation**: 自动生成 JSON Schema 供 IDE 使用

**命名约定 / Naming Conventions:**

```typescript
// ✅ 正确 / Correct
export const FieldSchema = z.object({
  // 配置键: camelCase / Configuration keys: camelCase
  maxLength: z.number().optional(),
  defaultValue: z.any().optional(),
  
  // 机器名: snake_case / Machine names: snake_case
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/),
});

// ❌ 错误 / Wrong
export const FieldSchema = z.object({
  max_length: z.number().optional(), // 应该是 camelCase
  Name: z.string(), // 应该是 snake_case
});
```

---

## <a name="protocol-implementation-patterns"></a>🔧 协议实现模式 / Protocol Implementation Patterns

### 模式 1: 数据对象定义 / Pattern 1: Data Object Definition

**场景**: 创建复杂的业务对象，如客户、订单、产品

```typescript
// src/data/customer.object.ts
import { defineObject } from '@objectstack/spec';

export const customerObject = defineObject({
  name: 'customer',
  label: 'Customer',
  description: 'Enterprise customer management',
  
  fields: {
    // 基础字段 / Basic fields
    company_name: {
      type: 'text',
      label: 'Company Name',
      required: true,
      unique: true,
      maxLength: 255,
      validation: {
        required: {
          message: 'Company name is required',
        },
      },
    },
    
    // 枚举字段 / Enum field
    industry: {
      type: 'select',
      label: 'Industry',
      options: [
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'retail', label: 'Retail' },
        { value: 'technology', label: 'Technology' },
        { value: 'finance', label: 'Finance' },
      ],
    },
    
    // 数值字段 / Numeric field
    annual_revenue: {
      type: 'number',
      label: 'Annual Revenue',
      precision: 2,
      min: 0,
      format: 'currency',
      currency: 'USD',
    },
    
    // 关系字段 / Relationship field
    contacts: {
      type: 'lookup',
      label: 'Contacts',
      reference: 'contact',
      referenceField: 'customer',
      multiple: true,
      cascade: {
        onDelete: 'set_null',
      },
    },
    
    // 计算字段 / Formula field
    customer_since_days: {
      type: 'formula',
      label: 'Customer Since (Days)',
      returnType: 'number',
      expression: 'DAYS(TODAY(), created_date)',
    },
    
    // 汇总字段 / Rollup field
    total_orders: {
      type: 'rollup',
      label: 'Total Orders',
      relationship: 'orders',
      field: 'id',
      operation: 'count',
    },
  },
  
  // 启用特性 / Enable features
  enable: {
    trackHistory: true,
    apiEnabled: true,
    searchEnabled: true,
    auditTrail: true,
  },
  
  // 索引 / Indexes
  indexes: [
    {
      fields: ['company_name'],
      unique: true,
    },
    {
      fields: ['industry', 'annual_revenue'],
    },
  ],
});
```

### 模式 2: 视图和 UI 配置 / Pattern 2: Views and UI Configuration

**场景**: 为数据对象创建多种视图

```typescript
// src/ui/customer.views.ts
import { defineView } from '@objectstack/spec';

// Grid 视图 / Grid view
export const customerListView = defineView({
  name: 'customer_list',
  type: 'grid',
  object: 'customer',
  label: 'All Customers',
  
  fields: [
    'company_name',
    'industry',
    'annual_revenue',
    'total_orders',
    'created_date',
  ],
  
  filters: [
    {
      field: 'industry',
      operator: 'in',
      values: ['technology', 'finance'],
    },
  ],
  
  sort: [
    { field: 'annual_revenue', order: 'desc' },
  ],
  
  groupBy: 'industry',
  
  actions: [
    {
      name: 'send_email',
      label: 'Send Email',
      type: 'modal',
    },
  ],
});

// Kanban 视图 / Kanban view
export const customerKanbanView = defineView({
  name: 'customer_kanban',
  type: 'kanban',
  object: 'customer',
  label: 'Customer Pipeline',
  
  statusField: 'stage',
  groupField: 'industry',
  
  columns: [
    { value: 'lead', label: 'Lead', color: '#gray' },
    { value: 'qualified', label: 'Qualified', color: '#blue' },
    { value: 'proposal', label: 'Proposal', color: '#yellow' },
    { value: 'negotiation', label: 'Negotiation', color: '#orange' },
    { value: 'closed_won', label: 'Closed Won', color: '#green' },
    { value: 'closed_lost', label: 'Closed Lost', color: '#red' },
  ],
  
  cardFields: ['company_name', 'annual_revenue', 'owner'],
});

// Calendar 视图 / Calendar view
export const customerCalendarView = defineView({
  name: 'customer_calendar',
  type: 'calendar',
  object: 'customer_meeting',
  label: 'Customer Meetings',
  
  startDateField: 'start_time',
  endDateField: 'end_time',
  titleField: 'subject',
  
  views: ['month', 'week', 'day'],
  defaultView: 'week',
});
```

### 模式 3: 工作流和自动化 / Pattern 3: Workflows and Automation

**场景**: 实现业务流程自动化

```typescript
// src/automation/customer-onboarding.workflow.ts
import { defineWorkflow } from '@objectstack/spec';

export const customerOnboardingWorkflow = defineWorkflow({
  name: 'customer_onboarding',
  label: 'Customer Onboarding',
  object: 'customer',
  
  trigger: {
    type: 'record_created',
    conditions: [
      {
        field: 'stage',
        operator: 'equals',
        value: 'closed_won',
      },
    ],
  },
  
  actions: [
    // 1. 创建项目 / Create project
    {
      type: 'create_record',
      object: 'project',
      fields: {
        name: '{{customer.company_name}} - Onboarding',
        customer: '{{customer.id}}',
        status: 'planning',
        start_date: 'TODAY()',
      },
    },
    
    // 2. 分配客户经理 / Assign account manager
    {
      type: 'update_record',
      object: 'customer',
      recordId: '{{trigger.record_id}}',
      fields: {
        account_manager: '{{ASSIGN_ROUND_ROBIN("account_managers")}}',
      },
    },
    
    // 3. 发送欢迎邮件 / Send welcome email
    {
      type: 'send_notification',
      notification: 'customer_welcome',
      recipients: {
        dynamic: '{{customer.primary_contact.email}}',
      },
      variables: {
        customer_name: '{{customer.company_name}}',
        manager_name: '{{customer.account_manager.name}}',
      },
    },
    
    // 4. 创建任务清单 / Create task checklist
    {
      type: 'loop',
      collection: [
        'Schedule kickoff meeting',
        'Send onboarding materials',
        'Setup training session',
        'Complete technical integration',
      ],
      actions: [
        {
          type: 'create_record',
          object: 'task',
          fields: {
            title: '{{loop.item}}',
            assignee: '{{customer.account_manager.id}}',
            due_date: 'ADDDAYS(TODAY(), {{loop.index}} * 7)',
            related_customer: '{{customer.id}}',
          },
        },
      ],
    },
    
    // 5. 记录日志 / Log activity
    {
      type: 'create_record',
      object: 'activity_log',
      fields: {
        type: 'onboarding_started',
        customer: '{{customer.id}}',
        description: 'Customer onboarding workflow initiated',
        timestamp: 'NOW()',
      },
    },
  ],
  
  errorHandling: {
    strategy: 'retry',
    maxRetries: 3,
    notifyOnFailure: true,
    notificationRecipients: ['admin@example.com'],
  },
});
```

### 模式 4: AI 代理和 RAG / Pattern 4: AI Agents and RAG

**场景**: 实现智能客户支持助手

```typescript
// src/ai/customer-support-agent.ts
import { defineAgent, defineRAGPipeline } from '@objectstack/spec';

// 定义 RAG 管道 / Define RAG pipeline
export const supportKnowledgeBase = defineRAGPipeline({
  name: 'support_knowledge_base',
  label: 'Support Knowledge Base',
  
  sources: [
    {
      type: 'object',
      object: 'knowledge_article',
      fields: ['title', 'content', 'tags', 'category'],
      filters: [
        { field: 'status', operator: 'equals', value: 'published' },
      ],
    },
    {
      type: 'document',
      collection: 'product_documentation',
    },
    {
      type: 'api',
      endpoint: 'https://api.example.com/faq',
    },
  ],
  
  indexing: {
    vectorizer: 'openai-embedding-3-large',
    chunkSize: 512,
    chunkOverlap: 50,
    metadata: ['source', 'category', 'last_updated'],
  },
  
  retrieval: {
    topK: 5,
    minScore: 0.7,
    reranking: {
      enabled: true,
      model: 'cross-encoder',
    },
  },
});

// 定义 AI 代理 / Define AI agent
export const customerSupportAgent = defineAgent({
  name: 'customer_support_agent',
  label: 'Customer Support Assistant',
  
  model: {
    provider: 'openai',
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
  },
  
  role: 'customer_support_specialist',
  
  instructions: `
    You are a helpful customer support specialist for ObjectStack.
    
    Your responsibilities:
    1. Answer customer questions accurately using the knowledge base
    2. Create support tickets for issues you cannot resolve
    3. Escalate urgent issues to human agents
    4. Maintain a friendly and professional tone
    
    Guidelines:
    - Always search the knowledge base before responding
    - If uncertain, admit it and offer to escalate
    - Provide step-by-step instructions when appropriate
    - Reference relevant documentation links
  `,
  
  tools: [
    {
      name: 'search_knowledge_base',
      ragPipeline: 'support_knowledge_base',
    },
    {
      name: 'create_support_ticket',
      type: 'create_record',
      object: 'support_ticket',
      fields: {
        subject: '{{input.subject}}',
        description: '{{input.description}}',
        customer: '{{context.customer_id}}',
        priority: '{{input.priority}}',
        source: 'ai_agent',
      },
    },
    {
      name: 'get_customer_history',
      type: 'query',
      object: 'support_ticket',
      filters: [
        { field: 'customer', operator: 'equals', value: '{{context.customer_id}}' },
      ],
      sort: [{ field: 'created_date', order: 'desc' }],
      limit: 5,
    },
  ],
  
  conversation: {
    maxTurns: 20,
    contextWindow: 10,
    persistHistory: true,
  },
  
  guardrails: {
    contentFiltering: true,
    piiDetection: true,
    maxResponseLength: 1000,
    forbiddenTopics: ['pricing_negotiation', 'contract_modification'],
  },
});
```

### 模式 5: 仪表盘和报表 / Pattern 5: Dashboards and Reports

**场景**: 创建执行仪表盘

```typescript
// src/ui/executive-dashboard.ts
import { defineDashboard, defineReport } from '@objectstack/spec';

export const executiveDashboard = defineDashboard({
  name: 'executive_dashboard',
  label: 'Executive Dashboard',
  
  layout: {
    columns: 12,
    rows: 'auto',
  },
  
  widgets: [
    // KPI 卡片 / KPI Cards
    {
      id: 'total_revenue',
      type: 'metric',
      position: { x: 0, y: 0, w: 3, h: 2 },
      config: {
        object: 'order',
        metric: 'sum',
        field: 'total_amount',
        label: 'Total Revenue',
        format: 'currency',
        comparison: {
          period: 'previous_month',
          showTrend: true,
        },
      },
    },
    
    {
      id: 'active_customers',
      type: 'metric',
      position: { x: 3, y: 0, w: 3, h: 2 },
      config: {
        object: 'customer',
        metric: 'count',
        filters: [
          { field: 'status', operator: 'equals', value: 'active' },
        ],
        label: 'Active Customers',
        comparison: {
          period: 'previous_month',
          showTrend: true,
        },
      },
    },
    
    // 图表 / Charts
    {
      id: 'revenue_trend',
      type: 'chart',
      position: { x: 0, y: 2, w: 6, h: 4 },
      config: {
        chartType: 'line',
        object: 'order',
        xAxis: {
          field: 'created_date',
          groupBy: 'month',
        },
        yAxis: [
          {
            field: 'total_amount',
            aggregation: 'sum',
            label: 'Revenue',
          },
        ],
        timeRange: 'last_12_months',
      },
    },
    
    {
      id: 'top_products',
      type: 'chart',
      position: { x: 6, y: 2, w: 6, h: 4 },
      config: {
        chartType: 'bar',
        object: 'order_item',
        xAxis: {
          field: 'product.name',
        },
        yAxis: [
          {
            field: 'quantity',
            aggregation: 'sum',
            label: 'Units Sold',
          },
        ],
        limit: 10,
        sort: { field: 'quantity', order: 'desc' },
      },
    },
    
    // 表格 / Table
    {
      id: 'recent_orders',
      type: 'table',
      position: { x: 0, y: 6, w: 12, h: 4 },
      config: {
        object: 'order',
        fields: [
          'order_number',
          'customer.company_name',
          'total_amount',
          'status',
          'created_date',
        ],
        sort: [{ field: 'created_date', order: 'desc' }],
        limit: 10,
        filters: [
          { field: 'created_date', operator: 'gte', value: 'ADDDAYS(TODAY(), -7)' },
        ],
      },
    },
  ],
  
  refreshInterval: 300, // 5 minutes
  
  access: {
    roles: ['executive', 'admin'],
  },
});

// 详细报表 / Detailed report
export const salesReport = defineReport({
  name: 'sales_report',
  label: 'Sales Performance Report',
  type: 'tabular',
  
  object: 'opportunity',
  
  columns: [
    { field: 'name', label: 'Opportunity' },
    { field: 'account.name', label: 'Account' },
    { field: 'owner.name', label: 'Owner' },
    { field: 'amount', label: 'Amount', format: 'currency' },
    { field: 'stage', label: 'Stage' },
    { field: 'probability', label: 'Probability', format: 'percent' },
    { field: 'close_date', label: 'Close Date', format: 'date' },
  ],
  
  groupBy: ['owner.name', 'stage'],
  
  aggregations: [
    {
      field: 'amount',
      operation: 'sum',
      label: 'Total Amount',
    },
    {
      field: 'id',
      operation: 'count',
      label: 'Count',
    },
  ],
  
  filters: [
    {
      field: 'close_date',
      operator: 'between',
      value: ['{{START_OF_QUARTER}}', '{{END_OF_QUARTER}}'],
    },
  ],
  
  sort: [
    { field: 'owner.name', order: 'asc' },
    { field: 'amount', order: 'desc' },
  ],
  
  export: {
    formats: ['pdf', 'excel', 'csv'],
    scheduling: {
      enabled: true,
      cron: '0 9 * * MON', // Every Monday at 9 AM
      recipients: ['sales-team@example.com'],
    },
  },
});
```

---

## <a name="enterprise-features"></a>🏢 企业级特性 / Enterprise Features

### 多租户架构 / Multi-Tenancy Architecture

```typescript
// src/system/tenant.config.ts
import { defineTenant } from '@objectstack/spec';

export const enterpriseTenant = defineTenant({
  id: 'tenant_acme_corp',
  name: 'ACME Corporation',
  domain: 'acme.example.com',
  
  plan: {
    tier: 'enterprise',
    limits: {
      users: 1000,
      storage: 1000, // GB
      apiCalls: 10000000, // per month
      records: 10000000,
    },
    features: [
      'advanced_analytics',
      'custom_branding',
      'sso',
      'audit_logs',
      'dedicated_support',
    ],
  },
  
  isolation: 'dedicated', // 专用数据库 / Dedicated database
  
  dataResidency: 'us-east-1',
  
  customization: {
    logo: 'https://cdn.example.com/acme-logo.png',
    theme: {
      primaryColor: '#0066cc',
      secondaryColor: '#ff6600',
    },
    domain: 'acme.objectstack.app',
  },
  
  security: {
    encryption: {
      atRest: true,
      inTransit: true,
      algorithm: 'AES256',
    },
    compliance: ['SOC2', 'HIPAA', 'GDPR'],
    sso: {
      enabled: true,
      provider: 'okta',
      config: {
        issuer: 'https://acme.okta.com',
        clientId: '***',
      },
    },
  },
});
```

### 行级安全 (RLS) / Row-Level Security

```typescript
// src/auth/security-policies.ts
import { definePolicy } from '@objectstack/spec';

// 销售机会访问策略 / Opportunity access policy
export const opportunityAccessPolicy = definePolicy({
  name: 'opportunity_access',
  object: 'opportunity',
  
  rules: [
    // Rule 1: 所有者可以看到自己的机会 / Owner can see their own opportunities
    {
      name: 'owner_access',
      priority: 1,
      condition: 'record.owner_id == $user.id',
      permissions: ['read', 'update', 'delete'],
    },
    
    // Rule 2: 经理可以看到团队的机会 / Manager can see team's opportunities
    {
      name: 'manager_access',
      priority: 2,
      condition: 'record.owner.manager_id == $user.id',
      permissions: ['read', 'update'],
    },
    
    // Rule 3: 销售总监可以看到所有 / Sales Director can see all
    {
      name: 'director_access',
      priority: 3,
      condition: '$user.role == "sales_director"',
      permissions: ['read', 'update', 'delete'],
    },
    
    // Rule 4: 共享规则 / Sharing rules
    {
      name: 'shared_access',
      priority: 4,
      condition: 'record.shared_with CONTAINS $user.id',
      permissions: ['read'],
    },
  ],
  
  defaultPermission: 'deny',
});
```

### 审计和合规 / Audit and Compliance

```typescript
// src/system/audit.config.ts
import { defineAudit } from '@objectstack/spec';

export const auditConfig = defineAudit({
  enabled: true,
  
  // 审计事件 / Audit events
  events: [
    'record_created',
    'record_updated',
    'record_deleted',
    'record_viewed',
    'login',
    'logout',
    'permission_changed',
    'data_exported',
  ],
  
  // 审计的对象 / Objects to audit
  objects: ['customer', 'opportunity', 'user', 'permission'],
  
  // 存储配置 / Storage configuration
  storage: {
    type: 'dedicated_table',
    retention: 2555, // 7 years in days
    encryption: true,
  },
  
  // 合规报告 / Compliance reports
  compliance: {
    gdpr: {
      enabled: true,
      dataSubjectRequests: true,
      rightToBeForgotten: true,
      dataPortability: true,
    },
    hipaa: {
      enabled: true,
      accessLogs: true,
      encryptionRequired: true,
    },
    soc2: {
      enabled: true,
      changeTracking: true,
      accessControls: true,
    },
  },
  
  // 告警 / Alerts
  alerts: [
    {
      name: 'suspicious_access',
      condition: 'COUNT(record_viewed) > 100 IN 1 HOUR',
      severity: 'high',
      notification: 'security_team',
    },
    {
      name: 'mass_deletion',
      condition: 'COUNT(record_deleted) > 50 IN 10 MINUTES',
      severity: 'critical',
      notification: 'admin_team',
    },
  ],
});
```

---

## <a name="ai-automation"></a>🤖 AI 自动化 / AI Automation

### AI 驱动的代码生成 / AI-Powered Code Generation

```typescript
// 从自然语言生成对象定义 / Generate object definition from natural language
import { AICodeGenerator } from '@objectstack/ai-bridge';

const generator = new AICodeGenerator({
  model: 'gpt-4',
  temperature: 0.3,
});

const input = `
创建一个项目管理对象，包含：
- 项目名称（必填）
- 项目描述
- 开始日期和结束日期
- 项目状态（规划中、进行中、已完成、已取消）
- 项目经理（关联到用户）
- 项目成员（多个用户）
- 预算金额
- 实际花费
- 完成百分比（0-100）
`;

const generated = await generator.generateObject(input);

console.log(generated);
// Output:
// {
//   name: 'project',
//   label: 'Project',
//   fields: {
//     name: { type: 'text', label: 'Project Name', required: true },
//     description: { type: 'textarea', label: 'Description' },
//     start_date: { type: 'date', label: 'Start Date' },
//     end_date: { type: 'date', label: 'End Date' },
//     status: {
//       type: 'select',
//       label: 'Status',
//       options: ['planning', 'in_progress', 'completed', 'cancelled'],
//     },
//     manager: { type: 'lookup', label: 'Manager', reference: 'user' },
//     members: { type: 'lookup', label: 'Members', reference: 'user', multiple: true },
//     budget: { type: 'number', label: 'Budget', precision: 2, format: 'currency' },
//     actual_cost: { type: 'number', label: 'Actual Cost', precision: 2, format: 'currency' },
//     completion_percentage: { type: 'number', label: 'Completion %', min: 0, max: 100 },
//   },
// }
```

### 智能数据验证 / Intelligent Data Validation

```typescript
// src/automation/smart-validation.ts
import { defineValidation } from '@objectstack/spec';

export const emailValidation = defineValidation({
  name: 'business_email_validation',
  field: 'email',
  
  rules: [
    // 基础格式验证 / Basic format validation
    {
      type: 'format',
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: 'Invalid email format',
    },
    
    // AI 驱动的验证 / AI-powered validation
    {
      type: 'ai',
      model: 'gpt-4',
      prompt: `
        Validate if this email is a business email (not personal email like @gmail.com).
        Return true if business email, false otherwise.
        Email: {{value}}
      `,
      message: 'Please provide a business email address',
    },
    
    // 实时域名验证 / Real-time domain validation
    {
      type: 'api',
      endpoint: 'https://api.hunter.io/v2/email-verifier',
      method: 'GET',
      params: { email: '{{value}}' },
      validation: 'response.status == "valid"',
      message: 'Email address could not be verified',
    },
  ],
});
```

---

## <a name="performance-optimization"></a>⚡ 性能优化 / Performance Optimization

### 查询优化 / Query Optimization

```typescript
// 使用索引 / Use indexes
export const customerObject = defineObject({
  name: 'customer',
  fields: { /* ... */ },
  
  indexes: [
    // 单字段索引 / Single field index
    {
      fields: ['email'],
      unique: true,
    },
    // 复合索引 / Composite index
    {
      fields: ['industry', 'annual_revenue'],
    },
    // 部分索引 / Partial index
    {
      fields: ['status'],
      filter: { status: 'active' },
    },
  ],
});

// 使用查询优化器 / Use query optimizer
const query = {
  object: 'customer',
  filters: [
    { field: 'industry', operator: 'equals', value: 'technology' },
    { field: 'annual_revenue', operator: 'gte', value: 1000000 },
  ],
  // 只返回需要的字段 / Only return needed fields
  fields: ['id', 'company_name', 'email'],
  limit: 100,
  // 使用索引提示 / Use index hint
  hint: 'industry_annual_revenue_idx',
};
```

### 缓存策略 / Caching Strategy

```typescript
// src/system/cache.config.ts
import { defineCache } from '@objectstack/spec';

export const cacheConfig = defineCache({
  // L1: 内存缓存 / L1: Memory cache
  l1: {
    enabled: true,
    provider: 'memory',
    ttl: 60, // seconds
    maxSize: 1000, // items
  },
  
  // L2: Redis 缓存 / L2: Redis cache
  l2: {
    enabled: true,
    provider: 'redis',
    connection: {
      host: 'localhost',
      port: 6379,
    },
    ttl: 3600, // seconds
    keyPrefix: 'objectstack:',
  },
  
  // 缓存策略 / Cache strategies
  strategies: [
    {
      name: 'customer_data',
      pattern: 'customer:*',
      ttl: 300,
      invalidateOn: ['customer.updated', 'customer.deleted'],
    },
    {
      name: 'lookup_data',
      pattern: 'lookup:*',
      ttl: 86400, // 24 hours
      warmup: true, // Pre-populate cache
    },
  ],
});
```

---

## <a name="security-best-practices"></a>🔒 安全最佳实践 / Security Best Practices

### 1. 输入验证和清理 / Input Validation and Sanitization

```typescript
// 防止 SQL 注入 / Prevent SQL injection
import { sanitize } from '@objectstack/core';

// ✅ 正确: 使用参数化查询 / Correct: Use parameterized queries
const query = {
  object: 'customer',
  filters: [
    { field: 'email', operator: 'equals', value: userInput }, // 自动清理
  ],
};

// ❌ 错误: 直接拼接 SQL / Wrong: Direct SQL concatenation
// const sql = `SELECT * FROM customer WHERE email = '${userInput}'`;

// 防止 XSS / Prevent XSS
import { escapeHtml } from '@objectstack/core';

const safeContent = escapeHtml(userInput);
```

### 2. 认证和授权 / Authentication and Authorization

```typescript
// src/auth/auth.config.ts
import { defineAuth } from '@objectstack/spec';

export const authConfig = defineAuth({
  // 密码策略 / Password policy
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: 90,
    preventReuse: 5, // Remember last 5 passwords
  },
  
  // MFA / 多因素认证
  mfa: {
    enabled: true,
    methods: ['totp', 'sms', 'email'],
    required: true, // Force MFA for all users
  },
  
  // 会话管理 / Session management
  session: {
    timeout: 3600, // 1 hour
    maxConcurrentSessions: 3,
    extendOnActivity: true,
  },
  
  // 登录保护 / Login protection
  loginProtection: {
    maxAttempts: 5,
    lockoutDuration: 900, // 15 minutes
    captchaAfterAttempts: 3,
  },
});
```

### 3. 数据加密 / Data Encryption

```typescript
// src/system/encryption.config.ts
import { defineEncryption } from '@objectstack/spec';

export const encryptionConfig = defineEncryption({
  // 静态加密 / Encryption at rest
  atRest: {
    enabled: true,
    algorithm: 'AES256',
    keyRotation: {
      enabled: true,
      frequency: 90, // days
    },
    fields: [
      // 加密敏感字段 / Encrypt sensitive fields
      'customer.credit_card',
      'customer.ssn',
      'customer.tax_id',
    ],
  },
  
  // 传输加密 / Encryption in transit
  inTransit: {
    enabled: true,
    protocol: 'TLS1.3',
    certificateValidation: true,
  },
  
  // 字段级加密 / Field-level encryption
  fieldLevel: {
    enabled: true,
    kmsProvider: 'aws',
    kmsKeyId: 'arn:aws:kms:us-east-1:123456789:key/***',
  },
});
```

---

## <a name="testing-strategy"></a>🧪 测试策略 / Testing Strategy

### 单元测试 / Unit Tests

```typescript
// tests/objects/customer.test.ts
import { describe, it, expect } from 'vitest';
import { customerObject } from '../src/data/customer.object';

describe('Customer Object', () => {
  it('should validate required fields', () => {
    const result = customerObject.safeParse({
      // Missing required company_name
      industry: 'technology',
    });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('company_name');
    }
  });
  
  it('should enforce unique email', async () => {
    // Test unique constraint
    const email = 'test@example.com';
    
    // Create first record
    await createRecord('customer', { email });
    
    // Try to create duplicate
    await expect(
      createRecord('customer', { email })
    ).rejects.toThrow('Email must be unique');
  });
});
```

### 集成测试 / Integration Tests

```typescript
// tests/workflows/customer-onboarding.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { runWorkflow } from '@objectstack/runtime';
import { customerOnboardingWorkflow } from '../src/automation/customer-onboarding.workflow';

describe('Customer Onboarding Workflow', () => {
  beforeEach(async () => {
    // Setup test data
    await setupTestData();
  });
  
  it('should create project and tasks on customer win', async () => {
    // Create customer
    const customer = await createRecord('customer', {
      company_name: 'Test Corp',
      stage: 'closed_won',
    });
    
    // Wait for workflow to complete
    await waitForWorkflow(customerOnboardingWorkflow.name);
    
    // Verify project was created
    const projects = await queryRecords('project', {
      filters: [{ field: 'customer', operator: 'equals', value: customer.id }],
    });
    expect(projects.length).toBe(1);
    
    // Verify tasks were created
    const tasks = await queryRecords('task', {
      filters: [{ field: 'related_customer', operator: 'equals', value: customer.id }],
    });
    expect(tasks.length).toBe(4);
  });
});
```

---

## <a name="deployment-guide"></a>🚀 部署指南 / Deployment Guide

### Docker 部署 / Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/objectstack
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=objectstack
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes 部署 / Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: objectstack
spec:
  replicas: 3
  selector:
    matchLabels:
      app: objectstack
  template:
    metadata:
      labels:
        app: objectstack
    spec:
      containers:
      - name: objectstack
        image: objectstack:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: objectstack-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## <a name="troubleshooting"></a>🔧 故障排除 / Troubleshooting

### 常见问题 / Common Issues

#### 1. 构建失败 / Build Failures

```bash
# 清理缓存 / Clear cache
pnpm clean
rm -rf node_modules
rm -rf packages/*/node_modules
rm pnpm-lock.yaml

# 重新安装 / Reinstall
pnpm install

# 重新构建 / Rebuild
pnpm build
```

#### 2. 类型错误 / Type Errors

```typescript
// 确保使用正确的类型 / Ensure using correct types
import type { Field } from '@objectstack/spec';

// 使用 z.input 而不是 z.infer 用于配置
import { z } from 'zod';
const schema = z.object({ /* ... */ });
type Input = z.input<typeof schema>; // ✅
type Output = z.infer<typeof schema>; // Use for runtime values
```

#### 3. 性能问题 / Performance Issues

```bash
# 启用性能分析 / Enable performance profiling
NODE_ENV=production node --prof app.js

# 分析结果 / Analyze results
node --prof-process isolate-*.log > profile.txt

# 检查慢查询 / Check slow queries
pnpm analyze:queries
```

---

## 📚 其他资源 / Additional Resources

- **Architecture Guide**: `/ARCHITECTURE.md`
- **Protocol Reference**: `/PROTOCOL-QUICK-REFERENCE.md`
- **Examples**: `/examples/`
- **API Documentation**: https://docs.objectstack.ai
- **Community Forum**: https://community.objectstack.ai
- **GitHub Issues**: https://github.com/objectstack-ai/spec/issues

---

## 🤝 贡献 / Contributing

欢迎贡献！请阅读 [CONTRIBUTING.md](/CONTRIBUTING.md)

We welcome contributions! Please read [CONTRIBUTING.md](/CONTRIBUTING.md)

---

**© 2026 ObjectStack. All rights reserved.**

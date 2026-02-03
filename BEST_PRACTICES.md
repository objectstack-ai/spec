# ObjectStack Best Practices Guide
## 构建世界级企业管理软件的最佳实践

> **目标读者**: 企业架构师、技术负责人、开发团队、产品经理  
> **更新日期**: 2026年2月

---

## 📚 Table of Contents

1. [Architecture Best Practices](#architecture-best-practices)
2. [Data Modeling Excellence](#data-modeling-excellence)
3. [AI Integration Patterns](#ai-integration-patterns)
4. [Security & Compliance](#security--compliance)
5. [Performance Optimization](#performance-optimization)
6. [Development Workflow](#development-workflow)
7. [Testing Strategies](#testing-strategies)
8. [Deployment & Operations](#deployment--operations)

---

## 1. Architecture Best Practices

### 1.1 Metadata-Driven Design

**原则**: Everything as Code - 所有业务逻辑和配置都应该是声明式的、可版本控制的元数据。

#### ✅ Good Practice

```typescript
// 声明式对象定义
export const CustomerObject = {
  name: 'customer',
  label: 'Customer',
  fields: {
    name: { type: 'text', required: true, maxLength: 100 },
    email: { type: 'email', unique: true },
    tier: { 
      type: 'select', 
      options: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    lifetime_value: { 
      type: 'currency',
      formula: 'SUM(orders.total)'
    }
  },
  validation: {
    rules: [
      { field: 'email', pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' }
    ]
  }
};
```

#### ❌ Bad Practice

```typescript
// 硬编码业务逻辑
class Customer {
  validateEmail(email: string) {
    // 逻辑分散，难以维护和测试
    if (!email.includes('@')) {
      throw new Error('Invalid email');
    }
  }
}
```

### 1.2 Protocol-First Development

**原则**: 先定义协议（Zod Schema），再实现功能。

#### Protocol Definition Checklist

- [ ] 使用 Zod 定义所有数据结构
- [ ] 为配置属性使用 `camelCase`
- [ ] 为数据值使用 `snake_case`
- [ ] 添加完整的 JSDoc 注释
- [ ] 包含示例和最佳实践
- [ ] 生成 JSON Schema 用于工具集成
- [ ] 生成 TypeScript 类型用于类型安全

```typescript
/**
 * Customer Entity Protocol
 * 
 * Defines the structure and validation rules for customer records.
 * 
 * @example
 * ```typescript
 * const customer: Customer = {
 *   name: 'customer',
 *   label: 'Customer',
 *   fields: { ... }
 * };
 * ```
 */
export const CustomerSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/),
  label: z.string().min(1),
  fields: z.record(FieldSchema)
});

export type Customer = z.infer<typeof CustomerSchema>;
```

### 1.3 Microkernel Architecture

**原则**: 保持核心精简，通过插件扩展功能。

#### Plugin Design Patterns

1. **单一职责原则** - 每个插件只做一件事
2. **最小依赖** - 只依赖核心包，避免插件间直接依赖
3. **服务注册** - 通过 DI 容器暴露服务
4. **事件驱动** - 使用事件总线进行插件间通信

```typescript
export class CRMPlugin implements Plugin {
  name = 'com.acme.crm';
  dependencies = ['com.objectstack.engine.objectql'];
  
  async init(ctx: PluginContext) {
    // 注册服务
    ctx.kernel.registerService('crm.customer', new CustomerService());
    
    // 订阅事件
    ctx.kernel.hook('data:record:afterCreate', async (record) => {
      if (record.object === 'customer') {
        await this.onCustomerCreated(record);
      }
    });
  }
  
  async start(ctx: PluginContext) {
    // 启动服务
    const customerService = ctx.kernel.getService('crm.customer');
    await customerService.start();
  }
}
```

---

## 2. Data Modeling Excellence

### 2.1 Object Naming Conventions

| Type | Convention | Example | Description |
|------|------------|---------|-------------|
| **Object Name** | `snake_case` | `customer_order` | 数据库表名、API路径 |
| **Field Name** | `snake_case` | `first_name` | 数据库列名 |
| **Label** | `Title Case` | `Customer Order` | UI显示标签 |
| **API Name** | `camelCase` | `customerOrder` | JavaScript属性名 |

### 2.2 Relationship Design

**1:1 关系** - 使用 Lookup 字段
```typescript
{
  user_profile: {
    type: 'lookup',
    reference: 'user',
    relationship: 'one-to-one'
  }
}
```

**1:N 关系** - 使用 Master-Detail 或 Lookup
```typescript
{
  account: {
    type: 'lookup',
    reference: 'account',
    relationship: 'many-to-one',
    cascadeDelete: true // Master-Detail 特性
  }
}
```

**N:M 关系** - 使用 Junction Object
```typescript
// 产品和类别的多对多关系
export const ProductCategoryObject = {
  name: 'product_category',
  label: 'Product Category',
  fields: {
    product: { type: 'lookup', reference: 'product', required: true },
    category: { type: 'lookup', reference: 'category', required: true }
  },
  uniqueConstraints: [['product', 'category']]
};
```

### 2.3 Field Type Selection Guide

| 业务需求 | 推荐字段类型 | 说明 |
|---------|------------|------|
| 姓名、标题 | `text` | 单行文本 |
| 描述、备注 | `textarea` | 多行文本 |
| 价格、金额 | `currency` | 自动格式化货币 |
| 百分比 | `percent` | 自动显示 % |
| 邮箱 | `email` | 内置验证 |
| 电话 | `phone` | 格式化显示 |
| 网址 | `url` | 可点击链接 |
| 日期 | `date` | 日期选择器 |
| 日期时间 | `datetime` | 日期时间选择器 |
| 是/否 | `boolean` | 复选框 |
| 单选 | `select` | 下拉列表 |
| 多选 | `multiselect` | 多选列表 |
| 关联记录 | `lookup` | 外键关联 |
| 自动计算 | `formula` | 公式字段 |
| 累计统计 | `rollup` | 汇总字段 |

---

## 3. AI Integration Patterns

### 3.1 Agent Design Patterns

#### Pattern 1: Task-Specific Agent

专注于单一任务的代理（如客户服务、销售助手）

```typescript
export const CustomerServiceAgentSchema = z.object({
  name: z.literal('customer_service_agent'),
  role: z.literal('customer-support'),
  instructions: z.string().default(`
    You are a helpful customer service agent.
    - Always be polite and professional
    - Gather customer information before escalating
    - Suggest knowledge base articles when relevant
  `),
  tools: z.array(z.string()).default([
    'search_knowledge_base',
    'create_support_ticket',
    'check_order_status'
  ]),
  capabilities: MultiModalCapabilitiesSchema.extend({
    voice: z.literal(true),
    sentiment_analysis: z.literal(true)
  })
});
```

#### Pattern 2: Orchestrator Agent

协调多个子代理的主代理

```typescript
export const SalesOrchestrator = {
  name: 'sales_orchestrator',
  role: 'coordinator',
  subAgents: [
    'lead_qualification_agent',
    'product_recommendation_agent',
    'pricing_optimization_agent',
    'contract_generation_agent'
  ],
  orchestration: {
    strategy: 'sequential', // or 'parallel', 'conditional'
    errorHandling: 'retry-with-fallback'
  }
};
```

### 3.2 RAG (Retrieval Augmented Generation) Best Practices

#### Knowledge Base Indexing

```typescript
export const RAGPipelineConfig = {
  name: 'customer_support_rag',
  sources: [
    {
      type: 'object',
      object: 'knowledge_article',
      fields: ['title', 'content', 'category'],
      filters: { published: true }
    },
    {
      type: 'object',
      object: 'product_documentation',
      fields: ['name', 'description', 'features']
    }
  ],
  indexing: {
    chunkSize: 512,
    chunkOverlap: 128,
    embedding: {
      model: 'text-embedding-3-small',
      dimensions: 1536
    }
  },
  retrieval: {
    topK: 5,
    similarityThreshold: 0.7,
    reranking: true
  }
};
```

### 3.3 AI Governance Checklist

使用 AI 时必须遵循的治理原则：

- [ ] **数据隐私** - 不向 AI 发送 PII 数据（除非明确授权）
- [ ] **偏见检测** - 定期审计 AI 决策的公平性
- [ ] **可解释性** - 记录 AI 决策的依据
- [ ] **人工审核** - 关键决策需要人工确认
- [ ] **监控告警** - 设置性能和质量阈值
- [ ] **模型版本** - 使用模型版本控制和回滚能力
- [ ] **成本控制** - 设置 Token 使用预算和限额

---

## 4. Security & Compliance

### 4.1 Authentication & Authorization

#### Best Practice: Role-Based Access Control (RBAC)

```typescript
export const SalesManagerRole = {
  name: 'sales_manager',
  label: 'Sales Manager',
  permissions: {
    // 对象级权限
    objects: {
      account: ['read', 'create', 'update'],
      opportunity: ['read', 'create', 'update', 'delete'],
      customer: ['read', 'update']
    },
    // 字段级权限
    fields: {
      'opportunity.revenue': ['read', 'update'],
      'account.credit_limit': ['read'] // 只读
    },
    // 记录级权限 (条件)
    conditions: {
      opportunity: {
        owner: 'current_user.id',
        status: { in: ['open', 'negotiation'] }
      }
    }
  }
};
```

#### Advanced: Attribute-Based Access Control (ABAC)

```typescript
export const DynamicAccessPolicy = {
  name: 'high_value_deal_approval',
  effect: 'allow',
  resources: ['opportunity.*'],
  actions: ['approve'],
  conditions: {
    and: [
      { 'opportunity.amount': { '>': 100000 } },
      { 'user.role': { in: ['vp_sales', 'ceo'] } },
      { 'user.location': { '=': 'opportunity.region' } }
    ]
  }
};
```

### 4.2 Data Encryption

| 数据状态 | 加密方式 | 实施级别 |
|---------|---------|---------|
| **传输中** | TLS 1.3+ | 必须 |
| **静态存储** | AES-256 | 敏感数据必须 |
| **应用层** | Field-level encryption | PII数据推荐 |
| **备份** | Encrypted backups | 必须 |

```typescript
export const EncryptionConfig = {
  fields: {
    ssn: { 
      encrypt: true, 
      algorithm: 'AES-256-GCM',
      keyRotation: '90d' 
    },
    credit_card: { 
      encrypt: true, 
      tokenize: true,  // 使用令牌化
      pciCompliant: true 
    }
  }
};
```

### 4.3 Audit Logging

**完整审计日志** - 记录 Who、What、When、Where、Why

```typescript
export const AuditLogEntry = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  timestamp: '2026-02-03T10:30:00Z',
  actor: {
    type: 'user',
    id: 'user_12345',
    name: 'John Smith',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...'
  },
  action: {
    type: 'update',
    object: 'opportunity',
    recordId: 'opp_67890',
    operation: 'update'
  },
  changes: {
    amount: { before: 50000, after: 75000 },
    stage: { before: 'qualification', after: 'proposal' }
  },
  result: {
    status: 'success',
    duration: 125 // ms
  },
  compliance: ['sox', 'gdpr']
};
```

---

## 5. Performance Optimization

### 5.1 Query Optimization

#### Use Selective Queries

✅ **Good** - 只查询需要的字段
```typescript
const customers = await client.data.find('customer', {
  select: ['name', 'email', 'tier'],
  filters: [['tier', '=', 'platinum']],
  top: 10
});
```

❌ **Bad** - 查询所有字段
```typescript
const customers = await client.data.find('customer', {
  // 没有 select，返回所有字段
  top: 10
});
```

#### Use Indexes

```typescript
export const CustomerObject = {
  name: 'customer',
  fields: { ... },
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['tier', 'created_at'] },
    { fields: ['company', 'status'], where: { status: 'active' } } // 部分索引
  ]
};
```

### 5.2 Caching Strategies

| 缓存级别 | 使用场景 | TTL |
|---------|---------|-----|
| **Browser Cache** | 静态资源 | 1年 |
| **CDN Cache** | 公共内容 | 1小时-1天 |
| **Application Cache** | 元数据、配置 | 5-15分钟 |
| **Query Cache** | 常用查询结果 | 1-5分钟 |
| **Session Cache** | 用户会话数据 | 会话期间 |

```typescript
export const CacheConfig = {
  metadata: {
    enabled: true,
    ttl: 900, // 15分钟
    invalidateOn: ['schema-change']
  },
  queries: {
    enabled: true,
    ttl: 300, // 5分钟
    invalidateOn: ['data-change'],
    maxSize: 1000 // 最多缓存1000个查询
  }
};
```

### 5.3 Real-Time Data Streaming

对于需要实时更新的场景，使用 Streaming Protocol 而不是轮询：

```typescript
// ✅ Good - WebSocket 实时推送
const stream = await client.stream.subscribe({
  source: 'opportunity',
  subscription: {
    events: ['create', 'update'],
    filters: [{ field: 'status', operator: '=', value: 'open' }]
  },
  delivery: {
    protocol: 'websocket',
    batching: { enabled: true, maxSize: 10, maxWait: 1000 }
  }
});

// ❌ Bad - 轮询（浪费资源）
setInterval(async () => {
  const opportunities = await client.data.find('opportunity', {
    filters: [['status', '=', 'open']]
  });
}, 5000); // 每5秒查询一次
```

---

## 6. Development Workflow

### 6.1 Git Workflow

推荐使用 **Trunk-Based Development** + **Feature Flags**：

```
main (production)
  │
  ├─ feature/crm-customer-360
  ├─ feature/ai-sales-agent
  └─ feature/real-time-dashboard
```

#### Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链

**Example**:
```
feat(crm): add Customer 360 view protocol

- Implement comprehensive customer profile schema
- Add lifecycle tracking and health scoring
- Support AI-powered customer intelligence

Closes #123
```

### 6.2 Code Review Checklist

审查人员应检查：

- [ ] **协议优先** - 是否定义了 Zod Schema？
- [ ] **命名规范** - camelCase vs snake_case 使用正确？
- [ ] **类型安全** - 是否充分利用 TypeScript 类型？
- [ ] **文档完整** - 是否有 JSDoc 注释和示例？
- [ ] **测试覆盖** - 是否有单元测试和集成测试？
- [ ] **安全性** - 是否有安全漏洞？
- [ ] **性能** - 是否有性能瓶颈？
- [ ] **可维护性** - 代码是否清晰易懂？

---

## 7. Testing Strategies

### 7.1 Testing Pyramid

```
        ╱ ╲
       ╱E2E╲         10% - 端到端测试
      ╱─────╲
     ╱ Integ ╲       30% - 集成测试
    ╱─────────╲
   ╱   Unit    ╲     60% - 单元测试
  ╱─────────────╲
```

### 7.2 Unit Testing Best Practices

```typescript
import { describe, it, expect } from 'vitest';
import { Customer360Schema } from './customer-360.zod';

describe('Customer360Schema', () => {
  it('should validate valid customer data', () => {
    const validCustomer = {
      customerId: 'cust_123',
      profile: {
        demographics: { firstName: 'John', lastName: 'Doe' },
        preferences: { communication: { channels: ['email'] } },
        segmentation: { segments: [], primarySegment: 'new' }
      },
      engagement: { /* ... */ },
      lifecycle: { /* ... */ },
      health: { /* ... */ },
      intelligence: { /* ... */ },
      lastUpdated: new Date()
    };
    
    expect(() => Customer360Schema.parse(validCustomer)).not.toThrow();
  });
  
  it('should reject invalid customer ID', () => {
    const invalidCustomer = {
      customerId: '', // 空字符串
      // ...
    };
    
    expect(() => Customer360Schema.parse(invalidCustomer)).toThrow();
  });
});
```

### 7.3 Integration Testing

```typescript
describe('Customer Service Integration', () => {
  let kernel: ObjectKernel;
  let customerService: CustomerService;
  
  beforeAll(async () => {
    kernel = new ObjectKernel();
    kernel.use(new ObjectQLPlugin());
    kernel.use(new CRMPlugin());
    await kernel.bootstrap();
    
    customerService = kernel.getService('crm.customer');
  });
  
  afterAll(async () => {
    await kernel.shutdown();
  });
  
  it('should create customer and calculate health score', async () => {
    const customer = await customerService.create({
      name: 'Test Customer',
      email: 'test@example.com'
    });
    
    expect(customer.id).toBeDefined();
    expect(customer.health.score).toBeGreaterThan(0);
  });
});
```

---

## 8. Deployment & Operations

### 8.1 Deployment Checklist

部署前检查清单：

- [ ] **代码审查** - 所有代码已通过审查
- [ ] **测试通过** - 所有自动化测试通过
- [ ] **性能测试** - 负载测试和压力测试完成
- [ ] **安全扫描** - 无高危漏洞
- [ ] **文档更新** - 变更日志和文档已更新
- [ ] **回滚计划** - 准备好回滚方案
- [ ] **监控配置** - 配置好告警和监控
- [ ] **备份验证** - 确认备份可用

### 8.2 Monitoring & Observability

#### The Three Pillars

1. **Metrics** - 量化指标
   - Response time
   - Error rate
   - Throughput
   - Resource utilization

2. **Logs** - 结构化日志
   - Error logs
   - Audit logs
   - Performance logs

3. **Traces** - 分布式追踪
   - Request flow
   - Latency breakdown
   - Dependency mapping

```typescript
export const MonitoringConfig = {
  metrics: {
    prometheus: {
      enabled: true,
      port: 9090,
      path: '/metrics'
    }
  },
  logging: {
    level: 'info',
    format: 'json',
    destinations: ['stdout', 'loki']
  },
  tracing: {
    opentelemetry: {
      enabled: true,
      endpoint: 'http://jaeger:4318'
    }
  },
  alerts: [
    {
      name: 'high_error_rate',
      condition: 'error_rate > 0.01',
      severity: 'critical',
      notification: ['pagerduty', 'slack']
    }
  ]
};
```

### 8.3 Disaster Recovery

#### RTO & RPO Targets

| 服务等级 | RTO (Recovery Time) | RPO (Recovery Point) |
|---------|---------------------|----------------------|
| **Critical** | < 1 hour | < 5 minutes |
| **High** | < 4 hours | < 1 hour |
| **Medium** | < 24 hours | < 24 hours |
| **Low** | < 72 hours | < 7 days |

#### Backup Strategy

```typescript
export const BackupConfig = {
  database: {
    full: { frequency: 'daily', retention: 30 },
    incremental: { frequency: 'hourly', retention: 7 },
    transaction_log: { frequency: '15min', retention: 3 }
  },
  verification: {
    enabled: true,
    frequency: 'weekly',
    testRestore: true
  },
  storage: {
    primary: 's3://backups-primary',
    replica: 's3://backups-replica', // 异地备份
    encryption: 'AES-256'
  }
};
```

---

## 9. Additional Resources

### 9.1 Learning Path

1. **Week 1-2**: ObjectStack 基础
   - 核心概念和架构
   - Protocol 定义和使用
   - 基础 CRUD 操作

2. **Week 3-4**: 高级特性
   - 复杂查询和聚合
   - 工作流和自动化
   - AI 集成

3. **Week 5-6**: 企业应用
   - 安全和合规
   - 性能优化
   - 生产部署

### 9.2 Community Resources

- **官方文档**: https://docs.objectstack.ai
- **示例代码**: https://github.com/objectstack-ai/examples
- **社区论坛**: https://community.objectstack.ai
- **Discord**: https://discord.gg/objectstack
- **Stack Overflow**: Tag `objectstack`

### 9.3 Support

- **Community Support**: 免费社区支持
- **Business Support**: 8x5 支持，响应时间 < 24h
- **Enterprise Support**: 24x7 支持，响应时间 < 1h
- **Dedicated Support**: 专属技术客户成功团队

---

**文档版本**: 1.0  
**最后更新**: 2026年2月  
**维护者**: ObjectStack 核心团队  
**反馈**: docs@objectstack.ai

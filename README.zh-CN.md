# 🌟 ObjectStack - 全球顶级企业管理软件平台框架

![ObjectStack Banner](https://img.shields.io/badge/ObjectStack-Enterprise%20Platform-black?style=for-the-badge)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

> **The Post-SaaS Operating System** - 元数据驱动、AI 原生、开放核心的企业管理软件平台

[English](./README.md) | **中文** | [日本語](./README.ja.md)

---

## 🎯 什么是 ObjectStack?

ObjectStack 是新一代企业管理软件平台框架,旨在成为全球最先进、最受欢迎的低代码/无代码开发平台。

### 核心特性

🚀 **元数据驱动** - Everything as Code  
一切皆配置,业务逻辑完全声明式定义,无需编写代码

🤖 **AI 原生** - Built-in Intelligence  
内置 AI 代理、自然语言查询、智能代码生成

🔌 **微内核架构** - Plugin Ecosystem  
插件化设计,轻松扩展,构建专属生态系统

🌐 **多数据源** - Polyglot Data  
统一查询语言,支持 SQL、NoSQL、Redis、Excel

🛡️ **企业级** - Production Ready  
完整的安全、审计、合规和治理框架

---

## 📚 核心文档

### 快速开始

- **[战略愿景](./STRATEGIC_VISION.md)** - ObjectStack 的战略定位和市场愿景
- **[实施计划](./IMPLEMENTATION_PLAN.md)** - 详细的技术实施路线图
- **[架构文档](./ARCHITECTURE.md)** - 完整的微内核架构说明
- **[最佳实践](./BEST_PRACTICES.md)** - 开发和部署最佳实践指南
- **[迁移指南](./MIGRATION_GUIDE.md)** - 从其他平台迁移到 ObjectStack

### API 参考

- **[协议参考](./content/docs/references/)** - 完整的 109 个协议规范
- **[ObjectQL](./content/docs/objectql/)** - 数据层协议
- **[ObjectUI](./content/docs/objectui/)** - UI 层协议  
- **[ObjectOS](./content/docs/objectos/)** - 系统层协议

---

## 🌟 核心协议

### 1. AI 协议套件

#### Multi-Modal Agent (多模态代理)
支持文本、语音、视觉、视频和流式交互的智能代理

```typescript
import { MultiModalAgent } from '@objectstack/spec/ai';

const agent: MultiModalAgent = {
  name: 'customer_service_agent',
  label: 'Customer Service Agent',
  capabilities: {
    text: true,
    voice: true,
    vision: true,
    streaming: true
  },
  modalities: [
    {
      type: 'text',
      inputFormats: ['plain', 'markdown'],
      outputFormats: ['plain', 'markdown', 'html']
    },
    {
      type: 'audio',
      inputFormats: ['mp3', 'wav'],
      outputFormats: ['mp3']
    }
  ],
  context: {
    maxTokens: 4096,
    temperature: 0.7,
    streaming: true
  },
  instructions: 'You are a helpful customer service agent...'
};
```

#### Code Generation (智能代码生成)
从自然语言描述自动生成应用代码

```typescript
import { CodeGenerationRequest } from '@objectstack/spec/ai';

const request: CodeGenerationRequest = {
  naturalLanguage: '创建一个客户管理系统，包含客户列表、详情页和创建表单',
  context: {
    existingObjects: [
      { name: 'account', label: 'Account', fields: ['name', 'industry'] }
    ]
  },
  targetFramework: 'react',
  codeStyle: 'production',
  output: {
    includeTests: true,
    includeDocumentation: true,
    testCoverage: 80
  }
};

// AI 自动生成:
// - 数据模型定义
// - React 组件
// - API 接口
// - 单元测试
// - 文档
```

#### AI Governance (AI 治理)
企业级 AI 合规和治理框架

```typescript
import { AIGovernance } from '@objectstack/spec/ai';

const governance: AIGovernance = {
  compliance: {
    dataPrivacy: {
      enabled: true,
      frameworks: ['gdpr', 'ccpa', 'hipaa'],
      consent: { required: true, granular: true }
    },
    auditLogging: {
      enabled: true,
      events: ['ai-decision', 'model-inference'],
      immutable: true
    }
  },
  monitoring: {
    biasDetection: {
      enabled: true,
      protectedAttributes: ['race', 'gender', 'age'],
      threshold: 0.1
    }
  },
  explainability: {
    requireExplanations: true,
    traceDecisions: true
  }
};
```

### 2. 实时数据流协议

#### Real-Time Streaming
支持 WebSocket、SSE、gRPC 的实时数据同步

```typescript
import { StreamingQuery } from '@objectstack/spec/data';

const stream: StreamingQuery = {
  source: 'opportunity',
  subscription: {
    events: ['create', 'update'],
    filters: [
      { field: 'status', operator: '=', value: 'open' },
      { field: 'amount', operator: '>', value: 100000 }
    ],
    debounce: 1000
  },
  delivery: {
    protocol: 'websocket',
    compression: true,
    batching: {
      enabled: true,
      maxSize: 100,
      maxWait: 1000
    },
    qos: 'at-least-once'
  }
};
```

### 3. 企业模块协议

#### Customer 360 (客户360视图)
全面的客户数据平台

```typescript
import { Customer360 } from '@objectstack/spec/modules/crm';

const customerView: Customer360 = {
  customerId: 'cust_12345',
  profile: {
    demographics: {
      firstName: 'John',
      lastName: 'Doe',
      company: 'Acme Corp',
      industry: 'Technology'
    },
    preferences: {
      communication: {
        channels: ['email', 'chat'],
        frequency: 'weekly'
      }
    },
    segmentation: {
      segments: [
        { id: 'high-value', name: 'High Value Customer' }
      ],
      primarySegment: 'high-value'
    }
  },
  engagement: {
    score: 85,
    sentiment: 0.8,
    rfm: {
      recency: 5,
      frequency: 4,
      monetary: 5,
      score: 14
    }
  },
  lifecycle: {
    currentStage: 'retention',
    customerSince: new Date('2020-01-01'),
    tenure: 1500
  },
  health: {
    score: 92,
    status: 'thriving',
    trend: 'improving'
  },
  intelligence: {
    predictions: {
      churnProbability: 0.05,
      lifetimeValue: 250000
    },
    recommendations: [
      {
        type: 'product-recommendation',
        title: 'Upgrade to Enterprise Plan',
        confidence: 0.85,
        priority: 'high'
      }
    ]
  }
};
```

---

## 🚀 快速开始

### 1. 安装

```bash
# 克隆仓库
git clone https://github.com/objectstack-ai/spec.git
cd spec

# 安装依赖
pnpm install

# 构建协议
pnpm --filter @objectstack/spec build

# 运行测试
pnpm --filter @objectstack/spec test
```

### 2. 创建第一个应用

```typescript
// customer.object.ts
import { Object } from '@objectstack/spec';

export const CustomerObject: Object = {
  name: 'customer',
  label: 'Customer',
  fields: {
    name: { 
      type: 'text', 
      label: 'Full Name',
      required: true 
    },
    email: { 
      type: 'email',
      label: 'Email',
      unique: true 
    },
    tier: { 
      type: 'select',
      label: 'Customer Tier',
      options: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    lifetime_value: {
      type: 'currency',
      label: 'Lifetime Value',
      formula: 'SUM(orders.total)'
    }
  },
  validation: {
    rules: [
      {
        field: 'email',
        pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
        message: 'Invalid email format'
      }
    ]
  }
};
```

### 3. 使用 AI 自动生成代码

```bash
# 使用自然语言描述创建应用
npx @objectstack/cli generate app \
  --description "客户管理系统，支持列表、详情和编辑" \
  --framework react \
  --style production

# AI 自动生成:
# ✓ 数据模型
# ✓ React 组件
# ✓ API 接口
# ✓ 单元测试
# ✓ 文档
```

---

## 🏗️ 三层架构

```
┌──────────────────────────────────────┐
│    ObjectUI (View Layer)             │
│  Apps, Views, Dashboards, Reports    │
└────────────────┬─────────────────────┘
                 │ REST/GraphQL API
┌────────────────▼─────────────────────┐
│    ObjectOS (Control Layer)          │
│  Auth, Permissions, Workflows        │
└────────────────┬─────────────────────┘
                 │ ObjectQL Protocol
┌────────────────▼─────────────────────┐
│    ObjectQL (Data Layer)             │
│  Objects, Queries, Drivers           │
└──────────────────────────────────────┘
```

---

## 🎯 核心优势

### vs. Salesforce
✅ **开源开放** - 无供应商锁定  
✅ **本地优先** - 数据隐私保护  
✅ **AI 原生** - 内置智能能力  
✅ **更低成本** - 无按用户收费

### vs. OutSystems/Mendix
✅ **真正元数据驱动** - 100% 声明式  
✅ **更强大的 AI** - 代码自动生成  
✅ **更好的 DX** - TypeScript, React  
✅ **开放生态** - 插件市场

### vs. 传统开发
✅ **10x 生产力** - 元数据 + AI  
✅ **更少 Bug** - 声明式配置  
✅ **快速迭代** - 零停机部署  
✅ **易于维护** - 清晰的架构

---

## 📦 Monorepo 结构

```
objectstack/
├── packages/
│   ├── spec/          # 协议定义 (Zod Schemas)
│   ├── core/          # 微内核运行时
│   ├── objectql/      # 数据查询引擎
│   ├── runtime/       # 运行时工具
│   ├── client/        # 客户端 SDK
│   ├── client-react/  # React Hooks
│   └── cli/           # 命令行工具
├── examples/
│   ├── crm/           # CRM 示例
│   ├── todo/          # Todo 示例
│   └── features/      # 功能演示
└── content/
    ├── docs/          # 完整文档
    └── prompts/       # AI 提示词
```

---

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 贡献方式

1. **代码贡献** - 提交 PR 改进代码
2. **文档贡献** - 完善文档和示例
3. **Bug 报告** - 提交 Issue 报告问题
4. **功能建议** - 提出新功能想法
5. **社区支持** - 帮助其他开发者

### 开发规范

- **协议优先** - 所有功能先定义 Zod Schema
- **命名规范** - camelCase (配置) / snake_case (数据)
- **类型安全** - 充分利用 TypeScript
- **测试覆盖** - 最低 80% 覆盖率
- **文档完整** - JSDoc + 使用示例

详见: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📖 学习资源

### 官方文档
- 📘 [入门指南](./content/docs/introduction/)
- 📗 [协议参考](./content/docs/references/)
- 📙 [示例代码](./examples/)
- 📕 [API 文档](./content/docs/api/)

### 视频教程
- 🎥 [5分钟快速上手](https://www.youtube.com/watch?v=xxx)
- 🎬 [构建 CRM 系统](https://www.youtube.com/watch?v=xxx)
- 📹 [AI 代理开发](https://www.youtube.com/watch?v=xxx)

### 社区
- 💬 [Discord 社区](https://discord.gg/objectstack)
- 🗨️ [GitHub Discussions](https://github.com/objectstack-ai/spec/discussions)
- 📮 [Stack Overflow](https://stackoverflow.com/questions/tagged/objectstack)

---

## 🌍 生态系统

### 插件
- **数据驱动**
  - `@objectstack/driver-postgres` - PostgreSQL 驱动
  - `@objectstack/driver-mysql` - MySQL 驱动
  - `@objectstack/driver-mongodb` - MongoDB 驱动
  - `@objectstack/driver-redis` - Redis 驱动

- **服务集成**
  - `@objectstack/connector-salesforce` - Salesforce 集成
  - `@objectstack/connector-sap` - SAP 集成
  - `@objectstack/connector-stripe` - Stripe 支付

- **AI 增强**
  - `@objectstack/ai-openai` - OpenAI 集成
  - `@objectstack/ai-anthropic` - Claude 集成
  - `@objectstack/ai-azure` - Azure OpenAI

### 模板
- **行业方案**
  - CRM (客户关系管理)
  - ERP (企业资源规划)
  - HCM (人力资源管理)
  - SCM (供应链管理)
  - BI (商业智能)

---

## 📊 项目状态

| 指标 | 当前值 | 目标 |
|-----|-------|------|
| **协议数量** | 122 | 200+ |
| **测试覆盖率** | 85% | 90%+ |
| **文档完整度** | 90% | 95%+ |
| **示例应用** | 5 | 20+ |
| **插件数量** | 8 | 50+ |

---

## 🏆 里程碑

- ✅ **v0.9** - AI 协议增强 (2026年2月)
- 🔄 **v1.0** - 正式发布 (2026年Q2)
- 📅 **v1.1** - 企业功能 (2026年Q3)
- 📅 **v2.0** - 云原生增强 (2026年Q4)

---

## 📄 许可证

本项目采用 Apache 2.0 许可证 - 详见 [LICENSE](./LICENSE)

### 核心包许可
- `@objectstack/spec` - Apache 2.0
- `@objectstack/core` - Apache 2.0
- `@objectstack/objectql` - Apache 2.0
- `@objectstack/client` - Apache 2.0

---

## 💼 商业支持

### 支持级别

| 级别 | 响应时间 | 价格 |
|-----|---------|------|
| **Community** | 最佳努力 | 免费 |
| **Business** | < 24h | ¥999/月 |
| **Enterprise** | < 4h | ¥9,999/月 |
| **Dedicated** | < 1h | 面议 |

### 联系方式
- 📧 Email: enterprise@objectstack.ai
- 💬 WeChat: objectstack-cn
- 📱 Phone: +86 400-xxx-xxxx

---

## 🙏 致谢

感谢所有贡献者对 ObjectStack 的支持！

### 核心贡献者
- [@contributor1](https://github.com/contributor1)
- [@contributor2](https://github.com/contributor2)
- [@contributor3](https://github.com/contributor3)

### 技术支持
- Zod - 运行时验证
- TypeScript - 类型安全
- React - UI 框架
- Pino - 日志系统

---

## 🔗 链接

- 🌐 官网: https://objectstack.ai
- 📚 文档: https://docs.objectstack.ai
- 💻 GitHub: https://github.com/objectstack-ai
- 🐦 Twitter: [@objectstack](https://twitter.com/objectstack)
- 📺 YouTube: [ObjectStack Channel](https://youtube.com/@objectstack)

---

**Made with ❤️ by the ObjectStack Team**

*打造全球最顶级的企业管理软件平台框架*

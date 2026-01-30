# 🤖 AI Agent 企业应用开发指南
# AI Agent Enterprise Application Development Guide

> **目标 | Objective:** 让 AI Agent 能够快速、规范地基于 ObjectStack 协议开发企业管理应用（CRM、ERP等），并支持迭代开发与版本发布。
> 
> Enable AI Agents to rapidly and standardically develop enterprise management applications (CRM, ERP, etc.) based on ObjectStack protocols, with support for iterative development and version releases.

---

## 📖 目录 | Table of Contents

1. [核心理念 | Core Philosophy](#核心理念--core-philosophy)
2. [快速启动 | Quick Start](#快速启动--quick-start)
3. [开发工作流 | Development Workflow](#开发工作流--development-workflow)
4. [协议映射指南 | Protocol Mapping Guide](#协议映射指南--protocol-mapping-guide)
5. [迭代开发策略 | Iterative Development Strategy](#迭代开发策略--iterative-development-strategy)
6. [版本发布流程 | Version Release Process](#版本发布流程--version-release-process)
7. [最佳实践 | Best Practices](#最佳实践--best-practices)
8. [常见应用模板 | Common Application Templates](#常见应用模板--common-application-templates)
9. [故障排查 | Troubleshooting](#故障排查--troubleshooting)

---

## 🎯 核心理念 | Core Philosophy

### ObjectStack 三层协议架构 | Three-Layer Protocol Architecture

```
┌─────────────────────────────────────────┐
│  ObjectUI (View Layer)                  │  ← 用户界面协议 | UI Protocol
│  - Apps, Views, Actions, Dashboards     │
├─────────────────────────────────────────┤
│  ObjectOS (Control Layer)               │  ← 业务逻辑协议 | Business Logic
│  - Workflows, Permissions, Validations  │
├─────────────────────────────────────────┤
│  ObjectQL (Data Layer)                  │  ← 数据模型协议 | Data Model
│  - Objects, Fields, Relationships       │
└─────────────────────────────────────────┘
```

### 核心原则 | Core Principles

1. **元数据驱动 | Metadata-Driven**: 一切皆配置，无需编写运行时代码 | Everything is configuration, no runtime code needed
2. **Zod First**: 所有定义从 Zod Schema 开始，确保类型安全 | All definitions start with Zod Schema for type safety
3. **约定优于配置 | Convention over Configuration**: 遵循文件后缀系统 | Follow file suffix system
4. **渐进式开发 | Progressive Development**: 从简单到复杂，分层迭代 | From simple to complex, iterative layers

---

## ⚡ 快速启动 | Quick Start

### Step 1: 环境准备 | Environment Setup

```bash
# Clone the spec repository
git clone https://github.com/objectstack-ai/spec.git
cd spec

# Install dependencies
pnpm install

# Build core protocols
pnpm --filter @objectstack/spec build
```

### Step 2: 创建新应用 | Create New Application

```bash
# Create app directory
mkdir -p examples/my-erp
cd examples/my-erp

# Initialize package.json
pnpm init

# Install dependencies
pnpm add @objectstack/spec
```

### Step 3: 定义应用配置 | Define Application Config

创建 `objectstack.config.ts`:

```typescript
import { defineStack } from '@objectstack/spec';
import { App } from '@objectstack/spec/ui';

export default defineStack({
  manifest: {
    id: 'com.mycompany.erp',
    version: '1.0.0',
    type: 'app',
    name: 'My ERP System',
    description: 'Enterprise Resource Planning system built with ObjectStack'
  },
  
  objects: [],  // Add objects here
  apps: [
    App.create({
      name: 'erp_app',
      label: 'ERP System',
      icon: 'factory',
      navigation: []
    })
  ]
});
```

---

## 🔄 开发工作流 | Development Workflow

### 完整开发流程 | Complete Development Process

```mermaid
graph TB
    A[需求分析 | Requirements] --> B[数据建模 | Data Modeling]
    B --> C[创建 Objects | Create Objects]
    C --> D[定义 Fields | Define Fields]
    D --> E[配置关系 | Configure Relations]
    E --> F[添加验证 | Add Validations]
    F --> G[配置工作流 | Configure Workflows]
    G --> H[设计UI | Design UI]
    H --> I[创建 Views | Create Views]
    I --> J[添加 Actions | Add Actions]
    J --> K[构建 Dashboards | Build Dashboards]
    K --> L[测试验证 | Test & Validate]
    L --> M[版本发布 | Release Version]
```

### AI Agent 工作步骤 | AI Agent Work Steps

#### Phase 1: 数据层开发 | Data Layer Development (60% effort)

**目标:** 定义业务对象、字段、关系和验证规则

1. **分析业务需求 | Analyze Business Requirements**
   ```
   Input: 用户需求描述
   Output: 对象清单、关系图
   ```

2. **创建对象文件 | Create Object Files**
   ```bash
   # File naming: {object_name}.object.ts
   src/domains/{domain}/{object_name}.object.ts
   ```

3. **使用协议模板 | Use Protocol Templates**
   ```typescript
   import { defineObject } from '@objectstack/spec/data';
   import type { ObjectDefinition } from '@objectstack/spec/data';
   
   export const Product: ObjectDefinition = defineObject({
     name: 'product',
     label: 'Product',
     labelPlural: 'Products',
     
     fields: {
       name: {
         type: 'text',
         label: 'Product Name',
         required: true,
         maxLength: 255
       },
       price: {
         type: 'currency',
         label: 'Price',
         required: true
       },
       // ... more fields
     },
     
     // Enable capabilities
     enable: {
       trackHistory: true,
       apiEnabled: true,
       searchEnabled: true
     }
   });
   ```

#### Phase 2: 业务逻辑层 | Business Logic Layer (20% effort)

**目标:** 添加验证规则、工作流自动化、权限控制

1. **添加验证规则 | Add Validation Rules**
   ```typescript
   validations: [
     {
       type: 'script',
       name: 'price_must_be_positive',
       errorMessage: 'Price must be greater than 0',
       formula: 'price > 0'
     }
   ]
   ```

2. **配置工作流 | Configure Workflows**
   ```typescript
   workflows: [
     {
       type: 'field_update',
       name: 'update_status_on_approval',
       trigger: {
         on: 'update',
         when: 'approval_status == "approved"'
       },
       actions: [
         {
           type: 'update_field',
           field: 'status',
           value: 'active'
         }
       ]
     }
   ]
   ```

3. **配置权限 | Configure Permissions**
   ```typescript
   permissions: [
     {
       profile: 'sales_user',
       objectPermissions: {
         create: true,
         read: true,
         update: true,
         delete: false
       },
       fieldPermissions: {
         price: { read: true, edit: false }
       }
     }
   ]
   ```

#### Phase 3: UI层开发 | UI Layer Development (20% effort)

**目标:** 创建视图、操作、仪表盘和报表

1. **创建列表视图 | Create List Views**
   ```typescript
   views: [
     {
       type: 'list',
       name: 'all_products',
       viewType: 'grid',
       label: 'All Products',
       columns: ['name', 'price', 'category', 'status'],
       filters: [],
       defaultSort: { field: 'name', direction: 'asc' }
     }
   ]
   ```

2. **创建表单视图 | Create Form Views**
   ```typescript
   {
     type: 'form',
     name: 'product_form',
     layout: 'simple',
     sections: [
       {
         label: 'Basic Information',
         columns: 2,
         fields: ['name', 'sku', 'price', 'category']
       }
     ]
   }
   ```

3. **添加自定义操作 | Add Custom Actions**
   ```typescript
   import { defineAction } from '@objectstack/spec/ui';
   
   export const DuplicateProduct = defineAction({
     name: 'duplicate_product',
     label: 'Duplicate Product',
     type: 'script',
     script: `
       // Clone product logic
       const newRecord = {...currentRecord};
       newRecord.name = newRecord.name + ' (Copy)';
       return createRecord('product', newRecord);
     `
   });
   ```

4. **创建仪表盘 | Create Dashboards**
   ```typescript
   import { defineDashboard } from '@objectstack/spec/ui';
   
   export const SalesDashboard = defineDashboard({
     name: 'sales_dashboard',
     label: 'Sales Dashboard',
     layout: {
       type: 'grid',
       columns: 12
     },
     widgets: [
       {
         type: 'metric',
         title: 'Total Revenue',
         object: 'opportunity',
         aggregation: 'sum',
         field: 'amount',
         size: { w: 3, h: 2 }
       }
     ]
   });
   ```

---

## 📋 协议映射指南 | Protocol Mapping Guide

### 文件后缀系统 | File Suffix System

AI Agent 必须严格遵循文件后缀约定 | AI Agents MUST strictly follow file suffix conventions:

| 文件后缀 | 业务含义 | Zod Schema | 使用场景 |
|---------|---------|------------|---------|
| `*.object.ts` | 业务对象定义 | `ObjectSchema` | 定义数据表结构（如：Product, Customer） |
| `*.field.ts` | 可复用字段 | `FieldSchema` | 定义通用字段配置 |
| `*.view.ts` | 视图配置 | `ViewSchema` | 列表视图、表单视图 |
| `*.action.ts` | 操作按钮 | `ActionSchema` | 自定义操作逻辑 |
| `*.dashboard.ts` | 仪表盘 | `DashboardSchema` | 数据可视化面板 |
| `*.report.ts` | 报表 | `ReportSchema` | 数据分析报表 |
| `*.flow.ts` | 可视化流程 | `FlowSchema` | 审批流、业务流程 |
| `*.workflow.ts` | 工作流规则 | `WorkflowSchema` | 自动化规则 |
| `*.validation.ts` | 验证规则 | `ValidationSchema` | 数据验证逻辑 |
| `*.permission.ts` | 权限配置 | `PermissionSchema` | 访问控制 |
| `*.agent.ts` | AI代理 | `AgentSchema` | AI功能集成 |

### 命名约定 | Naming Conventions

```typescript
// ✅ CORRECT
export const ProjectTask: ObjectDefinition = defineObject({
  name: 'project_task',           // snake_case (machine name)
  label: 'Project Task',          // Human readable
  
  fields: {
    taskName: {                   // camelCase (config key)
      type: 'text',
      label: 'Task Name',
      maxLength: 255              // camelCase (config key)
    }
  }
});

// ❌ WRONG
export const projectTask = {      // Missing type annotation
  name: 'ProjectTask',            // Wrong: should be snake_case
  fields: {
    task_name: {                  // Wrong: should be camelCase
      max_length: 255             // Wrong: should be camelCase
    }
  }
};
```

---

## 🔁 迭代开发策略 | Iterative Development Strategy

### MVP 开发路径 | MVP Development Path

#### Iteration 1: 核心对象 (Week 1)
**目标:** 建立基础数据模型

```typescript
// Step 1: 识别核心对象
// CRM Example: Account, Contact, Opportunity
// ERP Example: Product, Order, Inventory

// Step 2: 创建最小字段集
fields: {
  name: { type: 'text', required: true },
  status: { type: 'select', options: ['active', 'inactive'] }
}

// Step 3: 基础视图
views: [
  { type: 'list', name: 'all', viewType: 'grid' }
]
```

**验证标准:**
- [ ] 所有对象可创建、读取、更新、删除（CRUD）
- [ ] 列表视图正常显示
- [ ] 字段类型正确渲染

#### Iteration 2: 关系与验证 (Week 2)
**目标:** 建立对象间关系和数据完整性

```typescript
// Step 1: 添加关系字段
fields: {
  account: {
    type: 'lookup',
    reference: 'account',
    relationshipName: 'contacts'
  }
}

// Step 2: 添加验证规则
validations: [
  {
    type: 'uniqueness',
    fields: ['email'],
    errorMessage: 'Email must be unique'
  }
]
```

**验证标准:**
- [ ] 关系字段正确关联
- [ ] 验证规则生效
- [ ] 错误提示友好

#### Iteration 3: 业务逻辑 (Week 3)
**目标:** 添加自动化和工作流

```typescript
// Step 1: 添加工作流
workflows: [
  {
    type: 'field_update',
    name: 'auto_assign_owner',
    trigger: { on: 'create' },
    actions: [
      { type: 'update_field', field: 'owner', value: '$CurrentUser' }
    ]
  }
]

// Step 2: 添加公式字段
fields: {
  fullName: {
    type: 'formula',
    returnType: 'text',
    formula: 'firstName + " " + lastName'
  }
}
```

**验证标准:**
- [ ] 工作流自动触发
- [ ] 公式字段正确计算
- [ ] 审批流程正常运行

#### Iteration 4: UI增强 (Week 4)
**目标:** 优化用户体验

```typescript
// Step 1: 多视图类型
views: [
  { type: 'list', viewType: 'grid' },
  { type: 'list', viewType: 'kanban', groupBy: 'status' },
  { type: 'list', viewType: 'calendar', dateField: 'dueDate' }
]

// Step 2: 自定义操作
actions: [
  { name: 'convert_lead', label: 'Convert to Customer', type: 'flow' }
]

// Step 3: 仪表盘
dashboards: [
  { name: 'sales_dashboard', widgets: [...] }
]
```

**验证标准:**
- [ ] 多种视图切换流畅
- [ ] 自定义操作按预期工作
- [ ] 仪表盘数据准确

#### Iteration 5: 高级功能 (Week 5+)
**目标:** AI集成、高级报表、权限精细化

```typescript
// AI Agent集成
agents: [
  {
    name: 'sales_assistant',
    type: 'chat',
    capabilities: ['answer_questions', 'create_records'],
    model: 'gpt-4',
    systemPrompt: 'You are a sales assistant...'
  }
]

// 高级报表
reports: [
  {
    type: 'matrix',
    groupBy: ['region', 'product_category'],
    aggregations: [
      { field: 'revenue', function: 'sum' }
    ]
  }
]
```

### 迭代检查清单 | Iteration Checklist

每次迭代结束时检查 | Check at end of each iteration:

```markdown
- [ ] 所有新增字段有明确的 label 和 type
- [ ] 关系字段配置了 relationshipName
- [ ] 验证规则有清晰的 errorMessage
- [ ] 工作流有明确的触发条件
- [ ] 视图配置了合理的默认排序
- [ ] 操作按钮有适当的权限检查
- [ ] 所有改动通过 TypeScript 类型检查
- [ ] 更新了 CHANGELOG.md
```

---

## 📦 版本发布流程 | Version Release Process

### 语义化版本规范 | Semantic Versioning

遵循 [SemVer 2.0.0](https://semver.org/) 规范:

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1  (Patch: Bug fixes)
1.0.0 → 1.1.0  (Minor: New features, backward compatible)
1.0.0 → 2.0.0  (Major: Breaking changes)
```

### 版本发布步骤 | Release Steps

#### Step 1: 准备发布 | Prepare Release

```bash
# 1. 确保所有测试通过
pnpm test

# 2. 更新版本号
# 编辑 objectstack.config.ts
manifest: {
  version: '1.1.0',  // 更新版本号
  // ...
}

# 3. 更新 CHANGELOG.md
```

#### Step 2: 编写变更日志 | Write Changelog

创建 `CHANGELOG.md`:

```markdown
# Changelog

## [1.1.0] - 2024-01-30

### Added
- New Product object with inventory tracking
- Kanban view for Order management
- Sales dashboard with revenue metrics

### Changed
- Improved validation rules for Customer email
- Updated Contact form layout to tabbed view

### Fixed
- Fixed calculation error in Order total amount
- Resolved permission issue for sales_user role

### Deprecated
- Legacy status field will be removed in v2.0.0
```

#### Step 3: Git 提交 | Git Commit

```bash
# 暂存变更
git add .

# 提交（使用约定式提交）
git commit -m "chore(release): version 1.1.0

- Add Product object with inventory tracking
- Add Sales dashboard
- Fix Order calculation bug
"

# 打标签
git tag -a v1.1.0 -m "Release version 1.1.0"

# 推送
git push origin main --tags
```

#### Step 4: 构建发布 | Build Release

```bash
# 构建包
pnpm build

# 如果是发布到 npm
pnpm publish
```

### 版本管理最佳实践 | Version Management Best Practices

1. **功能分支 | Feature Branches**
   ```bash
   # 创建功能分支
   git checkout -b feature/add-inventory-module
   
   # 开发完成后合并
   git checkout main
   git merge feature/add-inventory-module
   ```

2. **变更集管理 | Changeset Management**
   
   使用 `@changesets/cli` 管理版本:
   
   ```bash
   # 添加变更集
   pnpm changeset add
   
   # 版本升级
   pnpm changeset version
   
   # 发布
   pnpm changeset publish
   ```

3. **向后兼容性检查 | Backward Compatibility Check**
   
   ```typescript
   // ✅ 向后兼容：添加新字段（optional）
   fields: {
     newField: { type: 'text', required: false }
   }
   
   // ❌ 破坏兼容：删除现有字段
   // fields: {
   //   oldField: { ... }  // 不要直接删除
   // }
   
   // ✅ 正确做法：标记为 deprecated
   fields: {
     oldField: { 
       type: 'text',
       deprecated: true,
       deprecationMessage: 'Use newField instead'
     }
   }
   ```

---

## 💡 最佳实践 | Best Practices

### 1. 数据建模最佳实践 | Data Modeling Best Practices

#### 对象设计原则 | Object Design Principles

```typescript
// ✅ GOOD: 单一职责原则
export const Customer = defineObject({
  name: 'customer',
  label: 'Customer',
  fields: {
    // 只包含客户相关字段
    companyName: { type: 'text' },
    industry: { type: 'select' },
    annualRevenue: { type: 'currency' }
  }
});

// ❌ BAD: 混合职责
export const CustomerAndOrder = defineObject({
  name: 'customer_and_order',
  fields: {
    companyName: { type: 'text' },
    orderTotal: { type: 'currency' },  // 应该在 Order 对象中
    productSKU: { type: 'text' }       // 应该在 Product 对象中
  }
});
```

#### 关系设计模式 | Relationship Design Patterns

```typescript
// Pattern 1: Lookup (多对一)
// 多个 Contact 属于一个 Account
export const Contact = defineObject({
  fields: {
    account: {
      type: 'lookup',
      reference: 'account',
      relationshipName: 'contacts',  // Account.contacts 访问关联
      required: true
    }
  }
});

// Pattern 2: Master-Detail (级联删除)
// Order Item 随 Order 删除
export const OrderItem = defineObject({
  fields: {
    order: {
      type: 'master_detail',
      reference: 'order',
      relationshipName: 'items',
      cascadeDelete: true
    }
  }
});

// Pattern 3: Many-to-Many (通过中间对象)
// Product 和 Category 的多对多关系
export const ProductCategory = defineObject({
  name: 'product_category',
  fields: {
    product: { type: 'lookup', reference: 'product' },
    category: { type: 'lookup', reference: 'category' }
  },
  indexes: [
    { fields: ['product', 'category'], unique: true }
  ]
});
```

### 2. 性能优化最佳实践 | Performance Optimization

#### 索引策略 | Index Strategy

```typescript
export const Order = defineObject({
  fields: {
    orderNumber: { type: 'text' },
    customer: { type: 'lookup', reference: 'customer' },
    status: { type: 'select' },
    createdDate: { type: 'datetime' }
  },
  
  // 添加索引提升查询性能
  indexes: [
    { fields: ['orderNumber'], unique: true },           // 唯一索引
    { fields: ['customer'] },                            // 外键索引
    { fields: ['status'] },                              // 常用过滤字段
    { fields: ['createdDate'], direction: 'desc' },      // 排序字段
    { fields: ['customer', 'status'] }                   // 组合索引
  ]
});
```

#### 字段选择优化 | Field Selection Optimization

```typescript
// ✅ GOOD: 只查询需要的字段
views: [{
  type: 'list',
  name: 'order_list',
  columns: ['orderNumber', 'customer', 'total', 'status'],
  // 自动优化：只查询显示的字段
}]

// ❌ BAD: 查询所有字段（包括大文本、文件）
// 避免在列表视图中显示 markdown, html, file 类型字段
```

### 3. 安全最佳实践 | Security Best Practices

#### 字段级安全 | Field-Level Security

```typescript
export const Employee = defineObject({
  fields: {
    name: { type: 'text' },
    salary: { 
      type: 'currency',
      // 敏感字段：仅 HR 可见
      encrypted: true
    }
  },
  
  permissions: [
    {
      profile: 'hr_manager',
      fieldPermissions: {
        salary: { read: true, edit: true }
      }
    },
    {
      profile: 'regular_user',
      fieldPermissions: {
        salary: { read: false, edit: false }
      }
    }
  ]
});
```

#### 行级安全 | Row-Level Security

```typescript
export const SalesOrder = defineObject({
  permissions: [
    {
      profile: 'sales_rep',
      objectPermissions: {
        create: true,
        read: true,
        update: true,
        delete: false
      },
      // RLS: 只能看到自己负责的订单
      recordAccess: {
        type: 'owner_based',
        ownerField: 'sales_rep'
      }
    }
  ]
});
```

### 4. 用户体验最佳实践 | User Experience Best Practices

#### 表单布局优化 | Form Layout Optimization

```typescript
// ✅ GOOD: 分组相关字段
views: [{
  type: 'form',
  name: 'customer_form',
  layout: 'tabbed',
  tabs: [
    {
      label: 'Basic Info',
      sections: [
        {
          label: 'Company Details',
          columns: 2,
          fields: ['companyName', 'industry', 'website', 'phone']
        }
      ]
    },
    {
      label: 'Address',
      sections: [
        {
          label: 'Billing Address',
          columns: 2,
          fields: ['billingStreet', 'billingCity', 'billingState', 'billingZip']
        }
      ]
    }
  ]
}]
```

#### 默认值和自动填充 | Defaults and Auto-population

```typescript
fields: {
  status: {
    type: 'select',
    options: ['draft', 'submitted', 'approved'],
    defaultValue: 'draft'  // 新记录默认值
  },
  createdDate: {
    type: 'datetime',
    defaultValue: '$Now'  // 系统变量
  },
  owner: {
    type: 'lookup',
    reference: 'user',
    defaultValue: '$CurrentUser'  // 当前用户
  }
}
```

---

## 📚 常见应用模板 | Common Application Templates

### CRM 应用模板 | CRM Application Template

```typescript
// File: examples/my-crm/objectstack.config.ts

import { defineStack } from '@objectstack/spec';
import { App } from '@objectstack/spec/ui';

// Import objects
import { Account } from './src/objects/account.object';
import { Contact } from './src/objects/contact.object';
import { Opportunity } from './src/objects/opportunity.object';
import { Lead } from './src/objects/lead.object';

export default defineStack({
  manifest: {
    id: 'com.mycompany.crm',
    version: '1.0.0',
    type: 'app',
    name: 'CRM System'
  },
  
  objects: [Account, Contact, Opportunity, Lead],
  
  apps: [
    App.create({
      name: 'crm_app',
      label: 'CRM',
      icon: 'users',
      navigation: [
        {
          id: 'sales',
          type: 'group',
          label: 'Sales',
          children: [
            { id: 'leads', type: 'object', objectName: 'lead' },
            { id: 'accounts', type: 'object', objectName: 'account' },
            { id: 'contacts', type: 'object', objectName: 'contact' },
            { id: 'opportunities', type: 'object', objectName: 'opportunity' }
          ]
        }
      ]
    })
  ]
});
```

**核心对象清单:**
- Account (客户账户)
- Contact (联系人)
- Opportunity (销售机会)
- Lead (潜在客户)
- Case (客户服务案例)
- Task (任务活动)

**参考实现:** `examples/crm/`

### ERP 应用模板 | ERP Application Template

```typescript
// File: examples/my-erp/objectstack.config.ts

export default defineStack({
  manifest: {
    id: 'com.mycompany.erp',
    version: '1.0.0',
    type: 'app',
    name: 'ERP System'
  },
  
  objects: [
    Product,
    Inventory,
    PurchaseOrder,
    SalesOrder,
    Supplier,
    Customer,
    Invoice
  ],
  
  apps: [
    App.create({
      name: 'erp_app',
      label: 'ERP',
      navigation: [
        {
          id: 'procurement',
          type: 'group',
          label: 'Procurement',
          children: [
            { id: 'suppliers', type: 'object', objectName: 'supplier' },
            { id: 'purchase_orders', type: 'object', objectName: 'purchase_order' }
          ]
        },
        {
          id: 'inventory',
          type: 'group',
          label: 'Inventory',
          children: [
            { id: 'products', type: 'object', objectName: 'product' },
            { id: 'inventory', type: 'object', objectName: 'inventory' }
          ]
        },
        {
          id: 'sales',
          type: 'group',
          label: 'Sales',
          children: [
            { id: 'customers', type: 'object', objectName: 'customer' },
            { id: 'sales_orders', type: 'object', objectName: 'sales_order' },
            { id: 'invoices', type: 'object', objectName: 'invoice' }
          ]
        }
      ]
    })
  ]
});
```

**核心对象清单:**
- Product (产品)
- Inventory (库存)
- PurchaseOrder (采购订单)
- SalesOrder (销售订单)
- Supplier (供应商)
- Customer (客户)
- Invoice (发票)

### 项目管理应用模板 | Project Management Template

```typescript
export default defineStack({
  manifest: {
    id: 'com.mycompany.pm',
    version: '1.0.0',
    type: 'app',
    name: 'Project Management'
  },
  
  objects: [
    Project,
    Task,
    Milestone,
    TimeEntry,
    TeamMember,
    Sprint
  ],
  
  apps: [
    App.create({
      name: 'pm_app',
      label: 'Projects',
      navigation: [
        { id: 'projects', type: 'object', objectName: 'project' },
        { id: 'tasks', type: 'object', objectName: 'task' },
        { id: 'sprints', type: 'object', objectName: 'sprint' },
        { id: 'team', type: 'object', objectName: 'team_member' }
      ]
    })
  ]
});
```

---

## 🔧 故障排查 | Troubleshooting

### 常见问题与解决方案 | Common Issues and Solutions

#### 1. 类型错误 | Type Errors

**问题:** TypeScript 报告类型不匹配

```typescript
// ❌ Error: Type 'string' is not assignable to type 'FieldType'
fields: {
  status: {
    type: 'dropdown'  // Wrong type name
  }
}
```

**解决方案:**
```typescript
// ✅ Solution: Use correct type from spec
import type { FieldType } from '@objectstack/spec/data';

fields: {
  status: {
    type: 'select' as FieldType  // Correct type
  }
}
```

#### 2. 关系字段配置错误 | Relationship Configuration Error

**问题:** 关系字段无法正确关联

```typescript
// ❌ Missing relationshipName
fields: {
  account: {
    type: 'lookup',
    reference: 'account'
    // Missing relationshipName!
  }
}
```

**解决方案:**
```typescript
// ✅ Add relationshipName
fields: {
  account: {
    type: 'lookup',
    reference: 'account',
    relationshipName: 'contacts'  // Required for reverse lookup
  }
}
```

#### 3. 验证规则不生效 | Validation Rules Not Working

**问题:** 验证规则没有触发

```typescript
// ❌ Incorrect formula syntax
validations: [
  {
    type: 'script',
    formula: 'amount > 0'  // Missing error handling
  }
]
```

**解决方案:**
```typescript
// ✅ Complete validation configuration
validations: [
  {
    type: 'script',
    name: 'amount_positive',
    errorMessage: 'Amount must be greater than 0',
    formula: 'amount > 0',
    errorField: 'amount'  // Specify which field shows error
  }
]
```

#### 4. 构建错误 | Build Errors

**问题:** `pnpm build` 失败

```bash
# Check error message
pnpm build

# Common causes:
# - Missing dependencies
# - Circular imports
# - Invalid Zod schema
```

**解决方案:**
```bash
# 1. Clear cache
rm -rf node_modules dist
pnpm install

# 2. Build dependencies first
pnpm --filter @objectstack/spec build

# 3. Build your app
pnpm build
```

### 调试技巧 | Debugging Tips

#### 1. 使用 TypeScript 编译器检查 | Use TypeScript Compiler

```bash
# Check types without building
pnpm tsc --noEmit

# Watch mode for continuous checking
pnpm tsc --noEmit --watch
```

#### 2. 验证 Zod Schema | Validate Zod Schema

```typescript
import { ObjectSchema } from '@objectstack/spec/data';

// Validate your definition
try {
  ObjectSchema.parse(myObjectDefinition);
  console.log('✅ Valid schema');
} catch (error) {
  console.error('❌ Schema validation failed:', error);
}
```

#### 3. 查看生成的 JSON Schema | Inspect Generated JSON Schema

```bash
# Build generates JSON schemas
pnpm build

# Check output
cat dist/schemas/object.schema.json
```

---

## 🚀 下一步 | Next Steps

### 学习路径 | Learning Path

1. **初学者 | Beginner**
   - 阅读 [Quick Start Guide](./README.md)
   - 学习 [Todo Example](./examples/todo/)
   - 了解 [Basic Protocol Examples](./examples/basic/)

2. **中级 | Intermediate**
   - 深入学习 [CRM Example](./examples/crm/)
   - 阅读 [Protocol Reference](./packages/spec/README.md)
   - 实践构建自己的应用

3. **高级 | Advanced**
   - 学习 [Plugin Development](./content/prompts/plugin/)
   - 探索 [AI Integration](./content/prompts/platform/agent.prompt.md)
   - 贡献代码到开源项目

### 资源链接 | Resource Links

- **官方文档 | Official Docs**: [ObjectStack Documentation](./content/docs/)
- **API 参考 | API Reference**: [Protocol Reference](./packages/spec/src/)
- **社区支持 | Community**: [GitHub Discussions](https://github.com/objectstack-ai/spec/discussions)
- **示例代码 | Examples**: [Examples Directory](./examples/)

### 获取帮助 | Getting Help

- **问题反馈 | Report Issues**: [GitHub Issues](https://github.com/objectstack-ai/spec/issues)
- **功能请求 | Feature Requests**: [GitHub Discussions](https://github.com/objectstack-ai/spec/discussions)
- **贡献指南 | Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📝 附录 | Appendix

### A. 完整字段类型参考 | Complete Field Type Reference

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `text` | 单行文本 | "John Doe" |
| `textarea` | 多行文本 | "Long description..." |
| `email` | 邮箱地址 | "user@example.com" |
| `url` | 网址 | "https://example.com" |
| `phone` | 电话号码 | "+1-555-1234" |
| `number` | 数字 | 42 |
| `currency` | 货币 | 99.99 |
| `percent` | 百分比 | 75 |
| `boolean` | 布尔值 | true/false |
| `date` | 日期 | "2024-01-30" |
| `datetime` | 日期时间 | "2024-01-30T10:00:00Z" |
| `time` | 时间 | "10:00:00" |
| `select` | 单选 | "option1" |
| `multiselect` | 多选 | ["option1", "option2"] |
| `lookup` | 查找关系 | { id: "123", name: "..." } |
| `master_detail` | 主从关系 | { id: "123", name: "..." } |
| `formula` | 公式字段 | (computed) |
| `summary` | 汇总字段 | (computed) |
| `autonumber` | 自动编号 | "ACC-0001" |
| `avatar` | 头像 | { url: "..." } |
| `image` | 图片 | { url: "..." } |
| `file` | 文件 | { url: "...", name: "..." } |
| `markdown` | Markdown | "# Title\n..." |
| `html` | HTML | "<p>Content</p>" |
| `json` | JSON数据 | { key: "value" } |

### B. 工作流操作类型 | Workflow Action Types

| 操作类型 | 说明 | 配置示例 |
|----------|------|----------|
| `update_field` | 更新字段值 | `{ type: 'update_field', field: 'status', value: 'approved' }` |
| `send_email` | 发送邮件 | `{ type: 'send_email', template: 'approval_notification', to: '$Owner' }` |
| `create_record` | 创建新记录 | `{ type: 'create_record', object: 'task', fields: {...} }` |
| `call_api` | 调用API | `{ type: 'call_api', endpoint: '/api/notify', method: 'POST' }` |
| `execute_script` | 执行脚本 | `{ type: 'execute_script', script: '...' }` |

### C. 视图类型参考 | View Type Reference

| 视图类型 | 最佳用途 | 配置要点 |
|----------|----------|----------|
| `grid` | 表格列表 | 指定 columns, filters, sort |
| `kanban` | 看板视图 | 指定 groupBy (status 等) |
| `calendar` | 日历视图 | 指定 dateField, endDateField |
| `gantt` | 甘特图 | 指定 startDateField, endDateField |
| `timeline` | 时间线 | 指定 dateField |
| `map` | 地图视图 | 指定 locationField |

---

**版本 | Version:** 1.0.0  
**更新日期 | Last Updated:** 2024-01-30  
**维护者 | Maintainer:** ObjectStack Team

**许可证 | License:** Apache 2.0 © ObjectStack

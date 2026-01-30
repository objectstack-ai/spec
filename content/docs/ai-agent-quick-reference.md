# 🤖 AI Agent Quick Reference | AI 代理快速参考

> **快速查询手册** | Quick lookup guide for AI agents developing ObjectStack applications

---

## 🎯 核心决策树 | Core Decision Tree

```
用户需求
    │
    ├─ 需要存储数据？ → 创建 *.object.ts
    ├─ 需要显示列表？ → 在 object 中添加 views
    ├─ 需要自定义操作？ → 创建 *.action.ts
    ├─ 需要数据验证？ → 在 object 中添加 validations
    ├─ 需要自动化流程？ → 在 object 中添加 workflows
    ├─ 需要数据分析？ → 创建 *.dashboard.ts 或 *.report.ts
    ├─ 需要AI功能？ → 创建 *.agent.ts
    └─ 需要自定义页面？ → 创建 *.page.ts
```

---

## 📁 文件创建速查 | File Creation Quick Lookup

### 我应该创建什么文件？ | What file should I create?

| 用户需求 | 创建文件 | 示例文件名 |
|---------|---------|-----------|
| 客户管理功能 | `*.object.ts` | `customer.object.ts` |
| 产品列表显示 | 在 object 中配置 views | (在 object 文件中) |
| "导出"按钮 | `*.action.ts` | `export_data.action.ts` |
| 销售仪表盘 | `*.dashboard.ts` | `sales_dashboard.dashboard.ts` |
| 月度销售报表 | `*.report.ts` | `monthly_sales.report.ts` |
| 审批流程 | `*.flow.ts` | `approval_flow.flow.ts` |
| 客服AI助手 | `*.agent.ts` | `support_agent.agent.ts` |
| 自动发送邮件 | 在 object 中添加 workflows | (在 object 文件中) |
| 权限控制 | 在 object 中添加 permissions | (在 object 文件中) |

---

## 🏗️ Object 定义模板 | Object Definition Templates

### 基础对象模板 | Basic Object Template

```typescript
import { defineObject } from '@objectstack/spec/data';
import type { ObjectDefinition } from '@objectstack/spec/data';

export const MyObject: ObjectDefinition = defineObject({
  name: 'my_object',           // snake_case
  label: 'My Object',
  labelPlural: 'My Objects',
  description: 'Description of this object',
  
  fields: {
    name: {
      type: 'text',
      label: 'Name',
      required: true,
      maxLength: 255
    },
    // ... more fields
  },
  
  enable: {
    trackHistory: true,
    apiEnabled: true,
    searchEnabled: true
  }
});
```

### 带关系的对象模板 | Object with Relationships Template

```typescript
export const Contact: ObjectDefinition = defineObject({
  name: 'contact',
  label: 'Contact',
  
  fields: {
    firstName: { type: 'text', required: true },
    lastName: { type: 'text', required: true },
    
    // Lookup 关系 (多对一)
    account: {
      type: 'lookup',
      reference: 'account',
      relationshipName: 'contacts',  // account.contacts
      required: true
    },
    
    // 公式字段
    fullName: {
      type: 'formula',
      returnType: 'text',
      formula: 'firstName + " " + lastName'
    }
  },
  
  // 列表视图
  views: [
    {
      type: 'list',
      name: 'all_contacts',
      viewType: 'grid',
      label: 'All Contacts',
      columns: ['fullName', 'account', 'email', 'phone'],
      defaultSort: { field: 'lastName', direction: 'asc' }
    }
  ]
});
```

### 带验证和工作流的对象 | Object with Validation and Workflow

```typescript
export const Opportunity: ObjectDefinition = defineObject({
  name: 'opportunity',
  label: 'Opportunity',
  
  fields: {
    name: { type: 'text', required: true },
    amount: { type: 'currency', required: true },
    stage: {
      type: 'select',
      options: [
        { value: 'prospecting', label: 'Prospecting' },
        { value: 'qualification', label: 'Qualification' },
        { value: 'proposal', label: 'Proposal' },
        { value: 'negotiation', label: 'Negotiation' },
        { value: 'closed_won', label: 'Closed Won' },
        { value: 'closed_lost', label: 'Closed Lost' }
      ],
      defaultValue: 'prospecting'
    },
    closeDate: { type: 'date', required: true }
  },
  
  // 验证规则
  validations: [
    {
      type: 'script',
      name: 'amount_positive',
      errorMessage: 'Amount must be greater than 0',
      formula: 'amount > 0'
    },
    {
      type: 'script',
      name: 'close_date_future',
      errorMessage: 'Close date must be in the future',
      formula: 'closeDate >= TODAY()'
    }
  ],
  
  // 工作流自动化
  workflows: [
    {
      type: 'field_update',
      name: 'auto_set_win_date',
      trigger: {
        on: 'update',
        when: 'stage == "closed_won"'
      },
      actions: [
        {
          type: 'update_field',
          field: 'actualCloseDate',
          value: '$Today'
        }
      ]
    }
  ]
});
```

---

## 🎨 字段类型速查 | Field Types Quick Reference

### 常用字段配置 | Common Field Configurations

```typescript
// 文本字段
name: {
  type: 'text',
  label: 'Name',
  required: true,
  maxLength: 255,
  unique: true
}

// 邮箱字段
email: {
  type: 'email',
  label: 'Email',
  required: true,
  unique: true
}

// 电话字段
phone: {
  type: 'phone',
  label: 'Phone Number'
}

// 数字字段
quantity: {
  type: 'number',
  label: 'Quantity',
  min: 0,
  max: 9999,
  precision: 0  // 整数
}

// 货币字段
price: {
  type: 'currency',
  label: 'Price',
  required: true,
  min: 0,
  precision: 2
}

// 百分比字段
discount: {
  type: 'percent',
  label: 'Discount',
  min: 0,
  max: 100,
  precision: 2
}

// 日期字段
dueDate: {
  type: 'date',
  label: 'Due Date',
  required: true
}

// 日期时间字段
createdAt: {
  type: 'datetime',
  label: 'Created At',
  defaultValue: '$Now'
}

// 布尔字段
isActive: {
  type: 'boolean',
  label: 'Active',
  defaultValue: true
}

// 单选字段
status: {
  type: 'select',
  label: 'Status',
  options: [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'archived', label: 'Archived', color: 'red' }
  ],
  defaultValue: 'draft'
}

// 多选字段
tags: {
  type: 'multiselect',
  label: 'Tags',
  options: ['important', 'urgent', 'followup']
}

// 查找关系字段
account: {
  type: 'lookup',
  label: 'Account',
  reference: 'account',
  relationshipName: 'contacts',
  required: true
}

// 主从关系字段
order: {
  type: 'master_detail',
  label: 'Order',
  reference: 'order',
  relationshipName: 'items',
  cascadeDelete: true
}

// 公式字段
totalAmount: {
  type: 'formula',
  label: 'Total Amount',
  returnType: 'currency',
  formula: 'quantity * price * (1 - discount / 100)'
}

// 汇总字段
totalRevenue: {
  type: 'summary',
  label: 'Total Revenue',
  summarizedObject: 'opportunity',
  summarizedField: 'amount',
  aggregation: 'sum',
  filter: 'stage == "closed_won"'
}

// 自动编号字段
accountNumber: {
  type: 'autonumber',
  label: 'Account Number',
  format: 'ACC-{0000}',
  startingNumber: 1
}

// 文件字段
attachment: {
  type: 'file',
  label: 'Attachment',
  accept: ['.pdf', '.doc', '.docx'],
  maxSize: 10485760  // 10MB
}

// Markdown 字段
notes: {
  type: 'markdown',
  label: 'Notes'
}
```

---

## 🔄 验证规则模板 | Validation Rule Templates

```typescript
validations: [
  // 脚本验证
  {
    type: 'script',
    name: 'amount_positive',
    errorMessage: 'Amount must be greater than 0',
    formula: 'amount > 0',
    errorField: 'amount'
  },
  
  // 唯一性验证
  {
    type: 'uniqueness',
    fields: ['email'],
    errorMessage: 'Email must be unique',
    scope: 'global'  // or 'account' for scoped uniqueness
  },
  
  // 必填验证（条件性）
  {
    type: 'script',
    name: 'phone_required_for_hot_leads',
    errorMessage: 'Phone is required for hot leads',
    formula: 'rating != "hot" || phone != null'
  },
  
  // 日期范围验证
  {
    type: 'script',
    name: 'end_after_start',
    errorMessage: 'End date must be after start date',
    formula: 'endDate > startDate'
  },
  
  // 格式验证
  {
    type: 'format',
    field: 'website',
    pattern: '^https?://.*',
    errorMessage: 'Website must start with http:// or https://'
  },
  
  // 状态机验证
  {
    type: 'state_machine',
    field: 'status',
    transitions: [
      { from: 'draft', to: ['submitted'] },
      { from: 'submitted', to: ['approved', 'rejected'] },
      { from: 'approved', to: ['active'] },
      { from: 'rejected', to: ['draft'] }
    ]
  }
]
```

---

## ⚙️ 工作流模板 | Workflow Templates

```typescript
workflows: [
  // 字段更新
  {
    type: 'field_update',
    name: 'set_close_date',
    trigger: {
      on: 'update',
      when: 'stage == "closed_won" && previousStage != "closed_won"'
    },
    actions: [
      { type: 'update_field', field: 'closeDate', value: '$Today' }
    ]
  },
  
  // 发送邮件
  {
    type: 'email_alert',
    name: 'notify_manager',
    trigger: {
      on: 'create',
      when: 'amount > 100000'
    },
    actions: [
      {
        type: 'send_email',
        template: 'high_value_opportunity',
        to: '$Manager',
        cc: ['sales-team@example.com']
      }
    ]
  },
  
  // 创建相关记录
  {
    type: 'record_create',
    name: 'create_task',
    trigger: {
      on: 'update',
      when: 'status == "new"'
    },
    actions: [
      {
        type: 'create_record',
        object: 'task',
        fields: {
          subject: 'Follow up on lead: ' + name,
          relatedTo: '$RecordId',
          owner: '$Owner',
          dueDate: '$Today + 3'
        }
      }
    ]
  },
  
  // 调用API
  {
    type: 'api_call',
    name: 'sync_to_external_system',
    trigger: {
      on: 'create,update',
      when: 'syncEnabled == true'
    },
    actions: [
      {
        type: 'call_api',
        endpoint: '/api/external/sync',
        method: 'POST',
        body: {
          id: '$RecordId',
          data: '$Record'
        }
      }
    ]
  }
]
```

---

## 🖼️ 视图配置模板 | View Configuration Templates

### Grid View (表格视图)

```typescript
views: [
  {
    type: 'list',
    name: 'all_records',
    viewType: 'grid',
    label: 'All Records',
    columns: ['name', 'status', 'createdDate', 'owner'],
    filters: [
      {
        field: 'status',
        operator: 'in',
        value: ['active', 'pending']
      }
    ],
    defaultSort: { field: 'createdDate', direction: 'desc' },
    pageSize: 50
  }
]
```

### Kanban View (看板视图)

```typescript
{
  type: 'list',
  name: 'opportunity_kanban',
  viewType: 'kanban',
  label: 'Sales Pipeline',
  groupBy: 'stage',
  cardFields: ['name', 'amount', 'account', 'closeDate'],
  sumField: 'amount',  // 显示每列总和
  filters: [
    { field: 'isClosed', operator: 'equals', value: false }
  ]
}
```

### Calendar View (日历视图)

```typescript
{
  type: 'list',
  name: 'task_calendar',
  viewType: 'calendar',
  label: 'Task Calendar',
  dateField: 'dueDate',
  titleField: 'subject',
  colorField: 'priority'
}
```

### Gantt View (甘特图)

```typescript
{
  type: 'list',
  name: 'project_timeline',
  viewType: 'gantt',
  label: 'Project Timeline',
  startDateField: 'startDate',
  endDateField: 'endDate',
  titleField: 'name',
  progressField: 'percentComplete',
  parentField: 'parent'  // 支持层级关系
}
```

### Form View (表单视图)

```typescript
{
  type: 'form',
  name: 'contact_form',
  layout: 'tabbed',
  tabs: [
    {
      label: 'Basic Info',
      sections: [
        {
          label: 'Name',
          columns: 2,
          fields: ['firstName', 'lastName', 'title', 'email']
        }
      ]
    },
    {
      label: 'Address',
      sections: [
        {
          label: 'Mailing Address',
          columns: 2,
          fields: ['street', 'city', 'state', 'zip']
        }
      ]
    }
  ]
}
```

---

## 🎬 Action 定义模板 | Action Definition Templates

### Script Action (脚本操作)

```typescript
import { defineAction } from '@objectstack/spec/ui';

export const CloneRecord = defineAction({
  name: 'clone_record',
  label: 'Clone',
  type: 'script',
  icon: 'copy',
  context: 'record',  // record, list, global
  script: `
    const newRecord = {...currentRecord};
    delete newRecord.id;
    newRecord.name = newRecord.name + ' (Copy)';
    return createRecord(objectName, newRecord);
  `
});
```

### Flow Action (流程操作)

```typescript
export const ConvertLead = defineAction({
  name: 'convert_lead',
  label: 'Convert to Customer',
  type: 'flow',
  flowName: 'lead_conversion_flow',
  context: 'record',
  showWhen: 'status == "qualified"'
});
```

### URL Action (链接操作)

```typescript
export const ViewOnMap = defineAction({
  name: 'view_on_map',
  label: 'View on Map',
  type: 'url',
  url: 'https://maps.google.com/maps?q={address}',
  target: '_blank'
});
```

### Modal Action (弹窗操作)

```typescript
export const QuickEdit = defineAction({
  name: 'quick_edit',
  label: 'Quick Edit',
  type: 'modal',
  modalType: 'form',
  fields: ['name', 'status', 'priority'],
  onSave: 'refresh'
});
```

---

## 📊 Dashboard 配置模板 | Dashboard Configuration Templates

```typescript
import { defineDashboard } from '@objectstack/spec/ui';

export const SalesDashboard = defineDashboard({
  name: 'sales_dashboard',
  label: 'Sales Dashboard',
  description: 'Overview of sales metrics',
  
  layout: {
    type: 'grid',
    columns: 12,
    gap: 16
  },
  
  widgets: [
    // Metric Widget (指标卡片)
    {
      type: 'metric',
      title: 'Total Revenue',
      object: 'opportunity',
      aggregation: 'sum',
      field: 'amount',
      filters: [
        { field: 'stage', operator: 'equals', value: 'closed_won' }
      ],
      size: { w: 3, h: 2 },
      position: { x: 0, y: 0 }
    },
    
    // Chart Widget (图表)
    {
      type: 'chart',
      title: 'Revenue by Month',
      chartType: 'line',
      object: 'opportunity',
      groupBy: { field: 'closeDate', interval: 'month' },
      aggregations: [
        { field: 'amount', function: 'sum', label: 'Revenue' }
      ],
      size: { w: 6, h: 4 },
      position: { x: 0, y: 2 }
    },
    
    // Table Widget (表格)
    {
      type: 'table',
      title: 'Top Opportunities',
      object: 'opportunity',
      columns: ['name', 'account', 'amount', 'stage'],
      sortBy: { field: 'amount', direction: 'desc' },
      limit: 10,
      size: { w: 6, h: 4 },
      position: { x: 6, y: 2 }
    },
    
    // Funnel Chart (漏斗图)
    {
      type: 'chart',
      title: 'Sales Funnel',
      chartType: 'funnel',
      object: 'opportunity',
      groupBy: 'stage',
      aggregations: [
        { field: 'amount', function: 'sum' }
      ],
      size: { w: 3, h: 4 },
      position: { x: 9, y: 0 }
    }
  ]
});
```

---

## 📈 Report 配置模板 | Report Configuration Templates

### Tabular Report (表格报表)

```typescript
import { defineReport } from '@objectstack/spec/ui';

export const AccountList = defineReport({
  name: 'account_list',
  label: 'Account List',
  type: 'tabular',
  
  object: 'account',
  columns: ['name', 'industry', 'annualRevenue', 'owner'],
  filters: [
    { field: 'status', operator: 'equals', value: 'active' }
  ],
  sortBy: { field: 'annualRevenue', direction: 'desc' }
});
```

### Summary Report (汇总报表)

```typescript
export const SalesByRegion = defineReport({
  name: 'sales_by_region',
  label: 'Sales by Region',
  type: 'summary',
  
  object: 'opportunity',
  groupBy: ['region'],
  aggregations: [
    { field: 'amount', function: 'sum', label: 'Total Revenue' },
    { field: 'id', function: 'count', label: 'Number of Deals' },
    { field: 'amount', function: 'avg', label: 'Average Deal Size' }
  ],
  
  chart: {
    type: 'bar',
    xAxis: 'region',
    yAxis: 'Total Revenue'
  }
});
```

### Matrix Report (矩阵报表)

```typescript
export const SalesByRegionAndProduct = defineReport({
  name: 'sales_matrix',
  label: 'Sales by Region and Product',
  type: 'matrix',
  
  object: 'opportunity',
  rowGroupBy: 'region',
  columnGroupBy: 'productCategory',
  aggregations: [
    { field: 'amount', function: 'sum' }
  ]
});
```

---

## 🤖 AI Agent 配置模板 | AI Agent Configuration Templates

```typescript
import { defineAgent } from '@objectstack/spec/ai';

export const SalesAssistant = defineAgent({
  name: 'sales_assistant',
  label: 'Sales Assistant',
  type: 'chat',
  
  model: {
    provider: 'openai',
    name: 'gpt-4',
    temperature: 0.7
  },
  
  systemPrompt: `
    You are a helpful sales assistant for a CRM system.
    You can help users with:
    - Finding customer information
    - Creating new opportunities
    - Analyzing sales data
    - Generating reports
  `,
  
  capabilities: [
    'answer_questions',
    'create_records',
    'update_records',
    'search_records',
    'generate_reports'
  ],
  
  tools: [
    {
      name: 'search_accounts',
      description: 'Search for accounts by name or industry',
      parameters: {
        query: { type: 'string' },
        industry: { type: 'string', optional: true }
      }
    },
    {
      name: 'create_opportunity',
      description: 'Create a new sales opportunity',
      parameters: {
        accountId: { type: 'string' },
        amount: { type: 'number' },
        stage: { type: 'string' }
      }
    }
  ],
  
  ragPipeline: {
    enabled: true,
    vectorStore: 'pinecone',
    embeddingModel: 'text-embedding-ada-002',
    sources: ['account', 'opportunity', 'contact']
  }
});
```

---

## 🔑 权限配置模板 | Permission Configuration Templates

```typescript
permissions: [
  {
    profile: 'sales_manager',
    objectPermissions: {
      create: true,
      read: true,
      update: true,
      delete: true,
      viewAll: true,
      modifyAll: true
    },
    fieldPermissions: {
      // 所有字段可读写
      '*': { read: true, edit: true }
    }
  },
  {
    profile: 'sales_rep',
    objectPermissions: {
      create: true,
      read: true,
      update: true,
      delete: false,
      viewAll: false,    // 只能看到自己的记录
      modifyAll: false
    },
    fieldPermissions: {
      // 大部分字段可读写
      '*': { read: true, edit: true },
      // 敏感字段只读
      'cost': { read: true, edit: false },
      'margin': { read: false, edit: false }
    },
    // 行级安全
    recordAccess: {
      type: 'owner_based',
      ownerField: 'owner'
    }
  },
  {
    profile: 'customer_support',
    objectPermissions: {
      create: false,
      read: true,
      update: false,
      delete: false
    },
    fieldPermissions: {
      // 只读访问，隐藏财务字段
      '*': { read: true, edit: false },
      'amount': { read: false, edit: false },
      'cost': { read: false, edit: false }
    }
  }
]
```

---

## 🔄 常用系统变量 | Common System Variables

```typescript
// 当前用户
owner: {
  defaultValue: '$CurrentUser'
}

// 当前日期/时间
createdDate: {
  defaultValue: '$Today'
}
createdDateTime: {
  defaultValue: '$Now'
}

// 日期计算
dueDate: {
  defaultValue: '$Today + 7'  // 7天后
}

// 记录引用
parentId: {
  defaultValue: '$RecordId'
}

// 在公式中使用
formula: 'closeDate > $Today'  // 未来的日期
formula: 'owner == $CurrentUser'  // 当前用户拥有
```

---

## 📝 命名规范速查 | Naming Conventions Quick Reference

```typescript
// ✅ CORRECT

// 文件名: snake_case
// customer_account.object.ts
// sales_dashboard.dashboard.ts

// 对象名称: snake_case
name: 'customer_account'

// 字段名（配置键）: camelCase
fields: {
  firstName: { ... },
  accountName: { ... },
  totalAmount: { ... }
}

// 配置属性: camelCase
maxLength: 255
defaultValue: 'draft'
relationshipName: 'contacts'

// 类型常量导出: PascalCase
export const CustomerAccount: ObjectDefinition = ...
export const SalesDashboard: DashboardDefinition = ...

// ❌ WRONG

// 对象名使用 PascalCase 或 camelCase
name: 'CustomerAccount'  // Wrong
name: 'customerAccount'  // Wrong

// 字段名使用 snake_case
fields: {
  first_name: { ... }    // Wrong
  account_name: { ... }  // Wrong
}

// 配置属性使用 snake_case
max_length: 255          // Wrong
default_value: 'draft'   // Wrong
```

---

## ⚡ 快速命令 | Quick Commands

```bash
# 创建新应用结构
mkdir -p my-app/src/{objects,ui,workflows}
cd my-app
pnpm init
pnpm add @objectstack/spec

# 构建应用
pnpm build

# 类型检查
pnpm tsc --noEmit

# 清理构建
rm -rf dist node_modules
pnpm install

# 构建依赖
pnpm --filter @objectstack/spec build
```

---

## 🐛 调试检查清单 | Debugging Checklist

当出现问题时，按顺序检查 | When things go wrong, check in order:

```markdown
1. [ ] 文件后缀是否正确？ (*.object.ts, *.view.ts, etc.)
2. [ ] 导入语句是否正确？ (from '@objectstack/spec/...')
3. [ ] 类型注解是否添加？ (: ObjectDefinition)
4. [ ] 对象名是否使用 snake_case？ (name: 'my_object')
5. [ ] 配置键是否使用 camelCase？ (maxLength, defaultValue)
6. [ ] 关系字段是否有 relationshipName？
7. [ ] 验证规则是否有 errorMessage？
8. [ ] 工作流是否有明确的 trigger？
9. [ ] 视图是否指定了 columns 或 fields？
10. [ ] TypeScript 编译是否通过？ (pnpm tsc --noEmit)
```

---

## 📚 进一步学习 | Further Learning

- **完整指南**: [AI Development Guide](../AI_DEVELOPMENT_GUIDE.md)
- **CRM 示例**: [examples/crm/](../../examples/crm/)
- **协议参考**: [packages/spec/src/](../../packages/spec/src/)
- **提示词库**: [content/prompts/](../prompts/)

---

**版本**: 1.0.0  
**最后更新**: 2024-01-30

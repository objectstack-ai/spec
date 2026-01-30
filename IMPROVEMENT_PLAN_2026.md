# ObjectStack Protocol Improvement Plan 2026
# ObjectStack 协议改进计划 2026

**制定日期 / Created**: 2026-01-30  
**执行周期 / Duration**: 3个月 (12周)  
**目标 / Objective**: 消除冗余、解决冲突、提升实施就绪度

---

## 📋 Executive Summary / 执行摘要

基于架构评估报告 (ARCHITECTURE_EVALUATION_2026.md)，本计划提供具体的、可执行的改进步骤。

### Success Criteria / 成功标准

```markdown
✅ Phase 1 完成: 消除 12 处冗余中的 8 处 (67%)
✅ Phase 2 完成: 解决 5 处关键冲突 (100%)
✅ Phase 3 完成: 实现 1 个生产级驱动 (PostgreSQL)
✅ 全部完成: 协议质量评分从 85/100 提升到 95/100
```

---

## Phase 1: Critical Protocol Fixes (Week 1-4)
## 第一阶段: 关键协议修复

**Duration**: 4 weeks  
**Effort**: 85 hours  
**Risk**: Low-Medium

---

### Week 1: Quick Wins / 快速见效

#### Task 1.1: Delete Duplicate UI Component File ⚡
**删除重复的 UI 组件文件**

**File**: `packages/spec/src/ui/block.zod.ts`

**Issue**: `block.zod.ts` 和 `component.zod.ts` 完全相同 (300+ lines)

**Steps**:
```bash
# 1. Verify files are identical
diff packages/spec/src/ui/block.zod.ts packages/spec/src/ui/component.zod.ts

# 2. Check references
grep -r "from './block" packages/spec/src/

# 3. Update page.zod.ts
sed -i "s/from '.\/block'/from '.\/component'/g" packages/spec/src/ui/page.zod.ts

# 4. Remove duplicate
rm packages/spec/src/ui/block.zod.ts

# 5. Update tests
npm test -- ui/page
```

**Verification**:
```bash
# Should pass
npm test -- ui/page
npm run build
```

**Effort**: 1 hour  
**Risk**: Low  
**Impact**: Eliminates 300 lines duplication

**PR Title**: `refactor(ui): consolidate block.zod.ts into component.zod.ts`

---

#### Task 1.2: Consolidate RLS Definitions ⚡
**统一 RLS 定义**

**Files**: 
- `packages/spec/src/permission/permission.zod.ts` (embedded RLS)
- `packages/spec/src/permission/rls.zod.ts` (comprehensive RLS)

**Issue**: Two sources of truth for Row-Level Security

**Steps**:

**Step 1**: Update `permission.zod.ts`
```typescript
// packages/spec/src/permission/permission.zod.ts

// BEFORE (lines 38-52) - REMOVE THIS
export const RLSRuleSchema = z.object({
  name: z.string(),
  condition: FilterConditionSchema,
  applyToOperations: z.array(z.enum(['read', 'create', 'update', 'delete'])),
});

// AFTER - ADD THIS
import { RowLevelSecurityPolicySchema } from './rls.zod';

export const ObjectPermissionSchema = z.object({
  object: SnakeCaseIdentifierSchema,
  create: z.boolean().default(false),
  read: z.boolean().default(false),
  update: z.boolean().default(false),
  delete: z.boolean().default(false),
  viewAll: z.boolean().default(false),
  modifyAll: z.boolean().default(false),
  // ... existing fields

  // UPDATED: Reference canonical RLS
  rowLevelSecurity: z.array(RowLevelSecurityPolicySchema).optional()
    .describe('Row-level security policies (see rls.zod.ts for full spec)'),
});
```

**Step 2**: Update tests
```bash
# Update permission tests
npm test -- permission/permission.test.ts

# Update RLS tests  
npm test -- permission/rls.test.ts
```

**Effort**: 4 hours  
**Risk**: Medium (affects permission model)  
**Impact**: Single source of truth for RLS

**PR Title**: `refactor(permission): consolidate RLS into canonical rls.zod.ts`

---

#### Task 1.3: Create Shared Mapping Protocol ⚡
**创建共享映射协议**

**Issue**: Field mapping defined in 4 places:
- `data/mapping.zod.ts`
- `data/external-lookup.zod.ts`
- `automation/sync.zod.ts`
- `integration/connector.zod.ts`

**Steps**:

**Step 1**: Create base mapping protocol
```typescript
// packages/spec/src/shared/mapping.zod.ts (NEW)

import { z } from 'zod';

/**
 * Base Field Mapping Schema
 * 
 * Shared by: ETL, Sync, Connector, External Lookup
 * 
 * @example
 * ```typescript
 * const mapping: FieldMapping = {
 *   source: 'external_user_id',
 *   target: 'user_id',
 *   transform: { type: 'cast', targetType: 'number' }
 * };
 * ```
 */
export const TransformTypeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('constant'),
    value: z.any(),
  }),
  z.object({
    type: z.literal('cast'),
    targetType: z.enum(['string', 'number', 'boolean', 'date']),
  }),
  z.object({
    type: z.literal('lookup'),
    table: z.string(),
    keyField: z.string(),
    valueField: z.string(),
  }),
  z.object({
    type: z.literal('javascript'),
    expression: z.string(),
  }),
  z.object({
    type: z.literal('map'),
    mappings: z.record(z.any()),
  }),
]);

export type TransformType = z.infer<typeof TransformTypeSchema>;

export const FieldMappingSchema = z.object({
  source: z.string().describe('Source field name'),
  target: z.string().describe('Target field name'),
  transform: TransformTypeSchema.optional().describe('Transformation to apply'),
  defaultValue: z.any().optional().describe('Default if source is null/undefined'),
});

export type FieldMapping = z.infer<typeof FieldMappingSchema>;
```

**Step 2**: Update data/mapping.zod.ts
```typescript
// packages/spec/src/data/mapping.zod.ts

import { FieldMappingSchema as BaseFieldMapping } from '../shared/mapping.zod';

// Extend for ETL-specific features
export const ETLFieldMappingSchema = BaseFieldMapping.extend({
  aggregation: z.enum(['sum', 'avg', 'count', 'min', 'max']).optional(),
});
```

**Step 3**: Update automation/sync.zod.ts
```typescript
// packages/spec/src/automation/sync.zod.ts

import { FieldMappingSchema } from '../shared/mapping.zod';

// Use directly (no extension needed for simple sync)
export const DataSyncConfigSchema = z.object({
  // ... existing fields
  fieldMappings: z.array(FieldMappingSchema),
});
```

**Step 4**: Update integration/connector.zod.ts
```typescript
// packages/spec/src/integration/connector.zod.ts

import { FieldMappingSchema } from '../shared/mapping.zod';

// Use directly
export const DataSyncConfigSchema = z.object({
  // ... existing fields
  fieldMappings: z.array(FieldMappingSchema),
});
```

**Step 5**: Update data/external-lookup.zod.ts
```typescript
// packages/spec/src/data/external-lookup.zod.ts

import { FieldMappingSchema } from '../shared/mapping.zod';

// Use directly
export const ExternalLookupSchema = z.object({
  // ... existing fields
  fieldMappings: z.array(FieldMappingSchema),
});
```

**Step 6**: Update shared/index.ts
```typescript
// packages/spec/src/shared/index.ts

export * from './identifiers.zod';
export * from './mapping.zod'; // NEW
```

**Effort**: 4 hours  
**Risk**: Low  
**Impact**: Eliminates 4-way duplication

**PR Title**: `refactor(shared): create unified field mapping protocol`

---

#### Task 1.4: Add Sync Layer Cross-References ⚡
**添加同步层交叉引用**

**Files**:
- `automation/sync.zod.ts` (L1)
- `automation/etl.zod.ts` (L2)
- `integration/connector.zod.ts` (L3)

**Issue**: Developers unsure when to use which layer

**Steps**:

**Step 1**: Update sync.zod.ts
```typescript
// packages/spec/src/automation/sync.zod.ts

/**
 * Level 1: Simple Bidirectional Sync
 * 
 * **Use when:**
 * - Syncing 1:1 fields between two systems
 * - Simple field transformations
 * - No complex logic required
 * 
 * **Examples:**
 * - Salesforce Contact ↔ Google Sheets
 * - HubSpot Company ↔ CRM Account
 * 
 * **When to upgrade:**
 * - Need multi-source joins → Use {@link ETLPipelineSchema}
 * - Need complex authentication → Use {@link ConnectorSchema}
 * 
 * @see {@link ETLPipelineSchema} for Level 2 (data engineering)
 * @see {@link ConnectorSchema} for Level 3 (enterprise integration)
 * @see {@link file://../../docs/SYNC_ARCHITECTURE.md} for architecture guide
 */
export const DataSyncConfigSchema = z.object({
  // ... existing schema
});
```

**Step 2**: Update etl.zod.ts
```typescript
// packages/spec/src/automation/etl.zod.ts

/**
 * Level 2: ETL Pipeline
 * 
 * **Use when:**
 * - Combining data from multiple sources
 * - Need aggregations, joins, transformations
 * - Building data warehouses
 * 
 * **Examples:**
 * - Sales data from Salesforce + Marketing from HubSpot → Data Warehouse
 * - Multi-region databases → Consolidated reporting
 * 
 * **When to downgrade:**
 * - Simple 1:1 sync → Use {@link DataSyncConfigSchema}
 * 
 * **When to upgrade:**
 * - Need full connector lifecycle → Use {@link ConnectorSchema}
 * 
 * @see {@link DataSyncConfigSchema} for Level 1 (simple sync)
 * @see {@link ConnectorSchema} for Level 3 (enterprise integration)
 * @see {@link file://../../docs/SYNC_ARCHITECTURE.md} for architecture guide
 */
export const ETLPipelineSchema = z.object({
  // ... existing schema
});
```

**Step 3**: Update connector.zod.ts
```typescript
// packages/spec/src/integration/connector.zod.ts

/**
 * Level 3: Enterprise Connector
 * 
 * **Use when:**
 * - Full system integration (auth, webhooks, rate limits)
 * - Need bidirectional sync with complex mappings
 * - Enterprise SaaS platforms (Salesforce, SAP, Workday)
 * 
 * **Examples:**
 * - Full Salesforce integration with webhooks
 * - SAP ERP connector with CDC
 * 
 * **When to downgrade:**
 * - Simple field sync → Use {@link DataSyncConfigSchema}
 * - Data transformation only → Use {@link ETLPipelineSchema}
 * 
 * @see {@link DataSyncConfigSchema} for Level 1 (simple sync)
 * @see {@link ETLPipelineSchema} for Level 2 (data engineering)
 * @see {@link file://../../docs/SYNC_ARCHITECTURE.md} for architecture guide
 */
export const ConnectorSchema = z.object({
  // ... existing schema
});
```

**Effort**: 2 hours  
**Risk**: Low  
**Impact**: Clarifies sync layer selection

**PR Title**: `docs(automation): add cross-references to sync layers`

---

**Week 1 Summary**:
- ✅ 4 tasks completed
- ✅ 11 hours effort
- ✅ Eliminated 3 major redundancies
- ✅ Added critical documentation

---

### Week 2: Security & Permission Model

#### Task 2.1: Document Permission Model 📖
**文档化权限模型**

**Files**: Create `packages/spec/docs/PERMISSION_MODEL.md`

**Content**:

```markdown
# ObjectStack Permission Model
# ObjectStack 权限模型

## Overview / 概览

ObjectStack 提供三层记录级访问控制:

1. **RLS (Row-Level Security)** - 数据库级强制策略
2. **Permission** - 应用级 CRUD 权限
3. **Sharing** - 业务规则扩展

## Precedence Order / 优先级顺序

访问权限计算公式:

```
Final Access = RLS ∩ Permission ∩ Sharing
```

**Most Restrictive Wins** (最严格的规则获胜)

### Evaluation Flow / 评估流程

```
1. RLS Policies (cannot bypass)
   ↓ PASS
2. Object Permissions (CRUD + VAMA)
   ↓ PASS
3. Sharing Rules (OWD + Criteria)
   ↓ PASS
4. GRANT ACCESS
```

## Layer 1: Row-Level Security (RLS)

### Purpose / 用途
PostgreSQL-inspired database-level policies that **cannot be bypassed** even by admins.

### When to Use / 使用场景
- Multi-tenant data isolation
- Regulatory compliance (GDPR, HIPAA)
- Hard security boundaries

### Example / 示例
```typescript
const rlsPolicy: RowLevelSecurityPolicy = {
  name: 'tenant_isolation',
  type: 'restrictive',
  operations: ['select', 'update', 'delete'],
  using: {
    field: 'tenant_id',
    operator: '$eq',
    value: { $context: 'user.tenant_id' }
  }
};
```

### Schema Reference / 架构引用
See `permission/rls.zod.ts`

---

## Layer 2: Object Permissions

### Purpose / 用途
Application-level CRUD permissions with additional modifiers.

### Permission Matrix / 权限矩阵

| Permission | Abbreviation | Grants |
|------------|--------------|--------|
| Create     | C            | Insert new records |
| Read       | R            | View records (subject to RLS/Sharing) |
| Update     | U            | Edit records (subject to RLS/Sharing) |
| Delete     | D            | Delete records (subject to RLS/Sharing) |
| View All   | VA           | See all records (bypasses sharing) |
| Modify All | MA           | Edit all records (bypasses sharing) |

### Lifecycle Permissions / 生命周期权限

Additional permissions for state transitions:
- `approve` - Approve records
- `publish` - Publish records
- `archive` - Archive records

### Example / 示例
```typescript
const permission: ObjectPermission = {
  object: 'sales_order',
  create: true,
  read: true,
  update: true,
  delete: false,
  viewAll: false,
  modifyAll: false,
  rowLevelSecurity: [rlsPolicy] // Links to RLS layer
};
```

### Schema Reference / 架构引用
See `permission/permission.zod.ts`

---

## Layer 3: Sharing Rules

### Purpose / 用途
Salesforce-inspired sharing that **extends** base permissions.

### Organization-Wide Defaults (OWD)

| Level | Meaning |
|-------|---------|
| Private | Only owner sees record |
| Public Read Only | Everyone can read |
| Public Read/Write | Everyone can edit |

### Sharing Rule Types / 规则类型

1. **Criteria-Based Sharing**
   ```typescript
   {
     type: 'criteria',
     condition: {
       field: 'region',
       operator: '$eq',
       value: 'APAC'
     },
     shareWith: { role: 'regional_manager' },
     accessLevel: 'read'
   }
   ```

2. **Owner-Based Sharing**
   ```typescript
   {
     type: 'owner',
     ownerField: 'account_owner',
     shareWith: { role: 'sales_team' },
     accessLevel: 'read_write'
   }
   ```

### Schema Reference / 架构引用
See `permission/sharing.zod.ts`

---

## Composition Rules / 组合规则

### Rule 1: RLS is Always Evaluated First
RLS policies filter data at the database level before any application logic.

**Example**:
```
User has Permission.viewAll = true
BUT tenant_id RLS policy filters to only their tenant
→ User can ONLY see their tenant's data (RLS wins)
```

### Rule 2: Permission Controls Capabilities
Object permissions define what operations are possible.

**Example**:
```
User has Permission.read = false
→ User cannot read ANY records (even if sharing grants access)
```

### Rule 3: Sharing Extends Access
Sharing rules can grant access to records beyond ownership.

**Example**:
```
User is NOT owner
BUT sharing rule grants 'read' access to region='APAC' records
→ User can read APAC records (sharing extends)
```

---

## Complete Example / 完整示例

### Scenario / 场景
Sales organization with regional structure.

### Configuration / 配置

**RLS**:
```typescript
{
  name: 'tenant_isolation',
  type: 'restrictive',
  operations: ['select', 'update', 'delete'],
  using: { field: 'tenant_id', operator: '$eq', value: { $context: 'user.tenant_id' } }
}
```

**Permission**:
```typescript
{
  object: 'opportunity',
  create: true,
  read: true,
  update: true,
  delete: false,
  viewAll: false, // Normal users can't see all
  modifyAll: false
}
```

**Sharing**:
```typescript
{
  owd: 'private', // Default: only owner sees
  rules: [
    {
      type: 'criteria',
      condition: { field: 'stage', operator: '$eq', value: 'closed_won' },
      shareWith: { role: 'sales_manager' },
      accessLevel: 'read'
    }
  ]
}
```

### Test Cases / 测试用例

| User | Scenario | Result | Reason |
|------|----------|--------|--------|
| Sales Rep | View own opportunity | ✅ PASS | Owner + Permission.read |
| Sales Rep | View colleague's opp | ❌ FAIL | OWD=private, not owner |
| Sales Manager | View closed_won opp | ✅ PASS | Sharing rule grants read |
| Sales Manager | Edit closed_won opp | ❌ FAIL | Sharing only grants 'read' |
| Admin (different tenant) | View any opp | ❌ FAIL | RLS blocks cross-tenant |

---

## Implementation Checklist / 实施检查清单

When implementing permission model:

- [ ] Define RLS policies for multi-tenant isolation
- [ ] Configure object permissions per role
- [ ] Set Organization-Wide Defaults
- [ ] Create sharing rules for cross-ownership access
- [ ] Write integration tests for each layer
- [ ] Test composition scenarios
- [ ] Document custom permission logic

---

## Best Practices / 最佳实践

1. **Start with RLS** - Define hard boundaries first
2. **Use OWD Wisely** - Most objects should be 'private' or 'public read only'
3. **Minimize View All/Modify All** - Reserve for admin roles only
4. **Test Edge Cases** - Verify most restrictive wins
5. **Audit Regularly** - Review permission grants quarterly

---

**Related Documentation**:
- `permission/permission.zod.ts` - Permission schema
- `permission/rls.zod.ts` - RLS policy schema
- `permission/sharing.zod.ts` - Sharing rule schema
- `permission/territory.zod.ts` - Territory matrix (parallel to role hierarchy)
```

**Effort**: 8 hours  
**Risk**: Low  
**Impact**: Critical (clarifies security model)

**PR Title**: `docs(permission): add comprehensive permission model guide`

---

#### Task 2.2: Split auth/config.zod.ts 🔧
**拆分认证配置文件**

**Issue**: `auth/config.zod.ts` is 700+ lines with mixed concerns

**Steps**:

**Step 1**: Create connector-auth.zod.ts
```typescript
// packages/spec/src/auth/connector-auth.zod.ts (NEW)

/**
 * Connector Authentication Protocol
 * 
 * System-to-system authentication for integrations.
 * Used by connectors to authenticate with external APIs.
 * 
 * @see {@link ApplicationAuthConfigSchema} for user authentication
 */

import { z } from 'zod';

// Move OAuth2, APIKey, BasicAuth, BearerAuth, JWT, SAML from config.zod.ts
export const OAuth2Schema = z.object({ /* ... */ });
export const APIKeySchema = z.object({ /* ... */ });
export const BasicAuthSchema = z.object({ /* ... */ });
export const BearerAuthSchema = z.object({ /* ... */ });
export const JWTAuthSchema = z.object({ /* ... */ });
export const SAMLAuthSchema = z.object({ /* ... */ });
export const NoAuthSchema = z.object({ type: z.literal('none') });

export const ConnectorAuthConfigSchema = z.discriminatedUnion('type', [
  OAuth2Schema,
  APIKeySchema,
  BasicAuthSchema,
  BearerAuthSchema,
  JWTAuthSchema,
  SAMLAuthSchema,
  NoAuthSchema,
]);

export type ConnectorAuthConfig = z.infer<typeof ConnectorAuthConfigSchema>;
```

**Step 2**: Create application-auth.zod.ts
```typescript
// packages/spec/src/auth/application-auth.zod.ts (NEW)

/**
 * Application Authentication Protocol
 * 
 * End-user authentication strategies.
 * Used for login, session management, and user verification.
 * 
 * @see {@link ConnectorAuthConfigSchema} for system authentication
 */

import { z } from 'zod';
import { IdentityProviderSchema } from './identity.zod';

// Move EmailPassword, MagicLink, OIDC, SAML, LDAP from config.zod.ts
export const EmailPasswordConfigSchema = z.object({ /* ... */ });
export const MagicLinkConfigSchema = z.object({ /* ... */ });
export const OIDCConfigSchema = z.object({ /* ... */ });
export const SAMLConfigSchema = z.object({ /* ... */ });
export const LDAPConfigSchema = z.object({ /* ... */ });

export const ApplicationAuthConfigSchema = z.object({
  providers: z.array(
    z.discriminatedUnion('type', [
      EmailPasswordConfigSchema,
      MagicLinkConfigSchema,
      OIDCConfigSchema,
      SAMLConfigSchema,
      LDAPConfigSchema,
    ])
  ),
  // ... rest of application auth config
});

export type ApplicationAuthConfig = z.infer<typeof ApplicationAuthConfigSchema>;
```

**Step 3**: Update config.zod.ts
```typescript
// packages/spec/src/auth/config.zod.ts (UPDATED)

/**
 * @deprecated This file will be removed in v1.0
 * @see {@link ConnectorAuthConfigSchema} in './connector-auth.zod'
 * @see {@link ApplicationAuthConfigSchema} in './application-auth.zod'
 */

// Re-export for backward compatibility
export * from './connector-auth.zod';
export * from './application-auth.zod';
```

**Step 4**: Update imports
```bash
# Update integration/connector.zod.ts
sed -i "s/from '..\/auth\/config.zod'/from '..\/auth\/connector-auth.zod'/g" \
  packages/spec/src/integration/connector.zod.ts

# Update system/manifest.zod.ts
# (if it imports auth config)
```

**Step 5**: Update index.ts
```typescript
// packages/spec/src/auth/index.ts

export * from './identity.zod';
export * from './organization.zod';
export * from './role.zod';
export * from './policy.zod';
export * from './scim.zod';
export * from './connector-auth.zod'; // NEW
export * from './application-auth.zod'; // NEW
export * from './config.zod'; // Deprecated, for backward compat
```

**Effort**: 6 hours  
**Risk**: Medium (affects integrations)  
**Impact**: Better separation of concerns

**PR Title**: `refactor(auth): split config into connector-auth and application-auth`

---

**Week 2 Summary**:
- ✅ 2 tasks completed
- ✅ 14 hours effort
- ✅ Critical documentation added
- ✅ Auth concerns separated

---

### Week 3: AI & Data Layer

#### Task 3.1: Unify AI Cost Tracking 🤖
**统一 AI 成本追踪**

**Issue**: Cost tracking fragmented across AI protocols

**Steps**:

**Step 1**: Update cost.zod.ts
```typescript
// packages/spec/src/ai/cost.zod.ts

/**
 * Token Usage Schema
 * Standardized across all AI operations
 */
export const TokenUsageSchema = z.object({
  prompt: z.number().describe('Input tokens'),
  completion: z.number().describe('Output tokens'),
  total: z.number().describe('Total tokens'),
});

export type TokenUsage = z.infer<typeof TokenUsageSchema>;

/**
 * AI Operation Cost Schema
 * Unified cost tracking for all AI operations
 */
export const AIOperationCostSchema = z.object({
  operationId: z.string(),
  operationType: z.enum(['conversation', 'orchestration', 'prediction', 'rag', 'nlq']),
  agentName: z.string().optional().describe('Agent that performed the operation'),
  modelId: z.string(),
  tokens: TokenUsageSchema,
  cost: z.number().describe('Cost in USD'),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

export type AIOperationCost = z.infer<typeof AIOperationCostSchema>;

// Existing CostEntry extends this
export const CostEntrySchema = AIOperationCostSchema.extend({
  object: z.string().optional(),
  recordId: z.string().optional(),
});
```

**Step 2**: Update conversation.zod.ts
```typescript
// packages/spec/src/ai/conversation.zod.ts

import { TokenUsageSchema, AIOperationCostSchema } from './cost.zod';

export const ConversationMessageSchema = z.object({
  // ... existing fields
  tokens: TokenUsageSchema.optional().describe('Token usage for this message'),
  cost: z.number().optional().describe('Cost for this message in USD'),
});

export const ConversationSessionSchema = z.object({
  // ... existing fields
  totalTokens: TokenUsageSchema.optional(),
  totalCost: z.number().optional(),
});
```

**Step 3**: Update orchestration.zod.ts
```typescript
// packages/spec/src/ai/orchestration.zod.ts

import { TokenUsageSchema, AIOperationCostSchema } from './cost.zod';

export const AIOrchestrationExecutionResultSchema = z.object({
  // ... existing fields
  tokens: TokenUsageSchema.optional(),
  cost: z.number().optional(),
});
```

**Step 4**: Add cost tracking to all AI schemas
```typescript
// ai/agent.zod.ts, nlq.zod.ts, predictive.zod.ts, rag-pipeline.zod.ts
// Add tokens and cost fields to result schemas
```

**Effort**: 8 hours  
**Risk**: Low  
**Impact**: Unified cost tracking across AI stack

**PR Title**: `feat(ai): unify cost tracking across all AI operations`

---

#### Task 3.2: Unify Chart Types 📊
**统一图表类型**

**Issue**: Dashboard has 27 chart types, Report has 7

**Steps**:

**Step 1**: Create chart.zod.ts
```typescript
// packages/spec/src/ui/chart.zod.ts (NEW)

import { z } from 'zod';

/**
 * Unified Chart Type Taxonomy
 * 
 * Shared by Dashboard and Report widgets.
 */
export const ChartTypeSchema = z.enum([
  // Comparison
  'bar',
  'horizontal-bar',
  'column',
  'grouped-bar',
  'stacked-bar',
  
  // Trend
  'line',
  'area',
  'stacked-area',
  'step-line',
  
  // Distribution
  'pie',
  'donut',
  'funnel',
  
  // Relationship
  'scatter',
  'bubble',
  
  // Composition
  'treemap',
  'sunburst',
  'sankey',
  
  // Performance
  'gauge',
  'metric',
  'kpi',
  
  // Geo
  'choropleth',
  'bubble-map',
  
  // Advanced
  'heatmap',
  'radar',
  'waterfall',
  'box-plot',
  'violin',
  
  // Tabular
  'table',
  'pivot',
]);

export type ChartType = z.infer<typeof ChartTypeSchema>;

/**
 * Chart Configuration Base
 */
export const ChartConfigSchema = z.object({
  type: ChartTypeSchema,
  title: z.string().optional(),
  description: z.string().optional(),
  showLegend: z.boolean().default(true),
  showDataLabels: z.boolean().default(false),
  colors: z.array(z.string()).optional(),
});

export type ChartConfig = z.infer<typeof ChartConfigSchema>;
```

**Step 2**: Update dashboard.zod.ts
```typescript
// packages/spec/src/ui/dashboard.zod.ts

import { ChartTypeSchema, ChartConfigSchema } from './chart.zod';

export const DashboardWidgetSchema = z.object({
  // ... existing fields
  chartConfig: ChartConfigSchema,
});
```

**Step 3**: Update report.zod.ts
```typescript
// packages/spec/src/ui/report.zod.ts

import { ChartTypeSchema, ChartConfigSchema } from './chart.zod';

export const ReportChartSchema = ChartConfigSchema.extend({
  // Report-specific extensions
  xAxis: z.string(),
  yAxis: z.string(),
  groupBy: z.string().optional(),
});
```

**Step 4**: Update ui/index.ts
```typescript
// packages/spec/src/ui/index.ts

export * from './chart.zod'; // NEW
// ... existing exports
```

**Effort**: 3 hours  
**Risk**: Low  
**Impact**: Consistent chart types

**PR Title**: `refactor(ui): create unified chart type taxonomy`

---

**Week 3 Summary**:
- ✅ 2 tasks completed
- ✅ 11 hours effort
- ✅ AI cost tracking unified
- ✅ Chart types standardized

---

### Week 4: Final Cleanup

#### Task 4.1: Create Shared Rate Limit Protocol 🚦
**创建共享限流协议**

**Issue**: Rate limiting defined separately in endpoint.zod.ts and graphql.zod.ts

**Steps**:

**Step 1**: Create rate-limit.zod.ts
```typescript
// packages/spec/src/shared/rate-limit.zod.ts (NEW)

import { z } from 'zod';

/**
 * Rate Limiting Strategy
 */
export const RateLimitStrategySchema = z.enum([
  'fixed-window',     // Simple counter per time window
  'sliding-window',   // Sliding time window
  'token-bucket',     // Token bucket algorithm
  'leaky-bucket',     // Leaky bucket algorithm
]);

/**
 * Rate Limit Configuration
 * 
 * Shared by API endpoints and GraphQL.
 */
export const RateLimitSchema = z.object({
  maxRequests: z.number().positive().describe('Maximum requests allowed'),
  window: z.number().positive().describe('Time window in seconds'),
  strategy: RateLimitStrategySchema.default('fixed-window'),
  burst: z.number().positive().optional().describe('Burst allowance for token-bucket'),
  retryAfter: z.number().optional().describe('Seconds until retry (for 429 response)'),
});

export type RateLimit = z.infer<typeof RateLimitSchema>;

/**
 * Rate Limit Tier
 * Different limits for different user tiers
 */
export const RateLimitTierSchema = z.object({
  tier: z.enum(['free', 'basic', 'pro', 'enterprise', 'unlimited']),
  limit: RateLimitSchema,
});

export type RateLimitTier = z.infer<typeof RateLimitTierSchema>;
```

**Step 2**: Update api/endpoint.zod.ts
```typescript
// packages/spec/src/api/endpoint.zod.ts

import { RateLimitSchema } from '../shared/rate-limit.zod';

export const ApiEndpointSchema = z.object({
  // ... existing fields
  rateLimit: RateLimitSchema.optional(),
});
```

**Step 3**: Update api/graphql.zod.ts
```typescript
// packages/spec/src/api/graphql.zod.ts

import { RateLimitSchema } from '../shared/rate-limit.zod';

export const GraphQLRateLimitSchema = RateLimitSchema.extend({
  perResolver: z.boolean().default(false),
  complexity: z.number().optional(),
});
```

**Effort**: 3 hours  
**Risk**: Low  
**Impact**: Consistent rate limiting

**PR Title**: `refactor(shared): create unified rate limit protocol`

---

#### Task 4.2: Migrate tenant.zod.ts → space.zod.ts 🔄
**迁移租户协议到空间协议**

**Issue**: `hub/tenant.zod.ts` is deprecated but still imported by `hub/space.zod.ts`

**Steps**:

**Step 1**: Move types to space.zod.ts
```typescript
// packages/spec/src/hub/space.zod.ts

// Move TenantIsolationLevel from tenant.zod.ts
export const TenantIsolationLevel = z.enum([
  'none',
  'schema',
  'database',
  'cluster',
]);

// Use directly (no import)
export const HubSpaceSchema = z.object({
  // ... existing fields
  isolation: TenantIsolationLevel.default('schema'),
});
```

**Step 2**: Deprecate tenant.zod.ts
```typescript
// packages/spec/src/hub/tenant.zod.ts

/**
 * @deprecated This file is deprecated and will be removed in v1.0
 * 
 * Migration Guide:
 * - Use `HubSpaceSchema` from './space.zod' instead of `TenantSchema`
 * - `TenantIsolationLevel` moved to './space.zod'
 * 
 * @see {@link HubSpaceSchema} for replacement
 */

// Re-export for backward compatibility
export { TenantIsolationLevel, HubSpaceSchema as TenantSchema } from './space.zod';
```

**Step 3**: Update hub/index.ts
```typescript
// packages/spec/src/hub/index.ts

export * from './marketplace.zod';
export * from './plugin-registry.zod';
export * from './space.zod';
export * from './license.zod';
export * from './composer.zod';
// export * from './tenant.zod'; // Deprecated, remove in v1.0
```

**Effort**: 2 hours  
**Risk**: Low  
**Impact**: Removes deprecated dependency

**PR Title**: `refactor(hub): migrate tenant isolation to space schema`

---

#### Task 4.3: Clarify Marketplace vs Plugin Registry 📚
**澄清市场与插件注册表**

**Issue**: Unclear separation between marketplace.zod.ts and plugin-registry.zod.ts

**Steps**:

**Step 1**: Update marketplace.zod.ts
```typescript
// packages/spec/src/hub/marketplace.zod.ts

/**
 * Plugin Marketplace Protocol
 * 
 * **Purpose**: Public plugin catalog (like NPM registry)
 * 
 * **Scope**:
 * - Plugin discovery and search
 * - Version history and downloads
 * - Ratings, reviews, and rankings
 * - Author profiles
 * 
 * **Use Cases**:
 * - Browse available plugins
 * - Compare plugin options
 * - Read reviews before installing
 * 
 * **NOT for**:
 * - Runtime plugin management → Use {@link PluginRegistryEntrySchema}
 * - Installed plugin health → Use {@link PluginRegistryEntrySchema}
 * 
 * @see {@link PluginRegistryEntrySchema} for runtime registry
 */
export const MarketplacePluginSchema = z.object({
  // ... existing schema
});
```

**Step 2**: Update plugin-registry.zod.ts
```typescript
// packages/spec/src/hub/plugin-registry.zod.ts

/**
 * Plugin Runtime Registry Protocol
 * 
 * **Purpose**: Runtime plugin management (like systemd)
 * 
 * **Scope**:
 * - Installed plugins tracking
 * - Plugin health monitoring
 * - Dependency resolution
 * - Capability validation
 * 
 * **Use Cases**:
 * - List installed plugins
 * - Check plugin health
 * - Resolve dependencies
 * - Validate capabilities
 * 
 * **NOT for**:
 * - Plugin discovery → Use {@link MarketplacePluginSchema}
 * - Public catalog → Use {@link MarketplacePluginSchema}
 * 
 * @see {@link MarketplacePluginSchema} for public catalog
 */
export const PluginRegistryEntrySchema = z.object({
  // ... existing schema
});
```

**Effort**: 2 hours  
**Risk**: Low  
**Impact**: Clear separation of concerns

**PR Title**: `docs(hub): clarify marketplace vs plugin-registry responsibilities`

---

**Week 4 Summary**:
- ✅ 3 tasks completed
- ✅ 7 hours effort
- ✅ Final cleanups completed
- ✅ Phase 1 complete!

---

## Phase 1 Summary / 第一阶段总结

**Total Effort**: 43 hours over 4 weeks

**Achievements** / 成就:
- ✅ Eliminated 8/12 redundancies (67%)
- ✅ Created 4 new shared protocols
- ✅ Added critical documentation (Permission Model, Sync Layers)
- ✅ Improved code maintainability significantly

**Redundancies Fixed** / 已修复冗余:
1. ✅ UI Component Duplication (block.zod ≡ component.zod)
2. ✅ RLS Dual Definition (permission.zod + rls.zod)
3. ✅ Field Mapping (4-way duplication)
4. ✅ Chart Types (dashboard vs report)
5. ✅ Rate Limiting (endpoint vs graphql)
6. ✅ Tenant Isolation (tenant.zod deprecated)

**Remaining for Phase 2**:
- AI Model Configuration (agent.zod vs model-registry.zod)
- Presence Tracking (realtime.zod vs websocket.zod)
- Webhook Embedding (workflow.zod references)
- Connector Base (trigger-registry.zod)
- Plugin Metadata (marketplace vs registry)
- Token Budget (conversation vs orchestration)

---

## Phase 2: Resolve Critical Conflicts (Week 5-8)
## 第二阶段: 解决关键冲突

**Duration**: 4 weeks  
**Effort**: 42 hours  
**Risk**: Medium-High

---

### Week 5: Data & Event Conflicts

#### Task 5.1: Document Hook vs Event Usage 📖

**Files**: Create `packages/spec/docs/HOOK_VS_EVENT.md`

**Content**:
```markdown
# Hook vs Event: When to Use Which
# Hook 与 Event: 何时使用

## TL;DR

- **Hook**: Synchronous data interception (can modify)
- **Event**: Asynchronous notification (cannot modify)

## Comparison / 对比

| Aspect | Hook | Event |
|--------|------|-------|
| **Layer** | Data (ObjectQL) | System (ObjectOS) |
| **Execution** | Synchronous | Asynchronous |
| **Can Modify Data** | ✅ Yes | ❌ No |
| **Can Abort Operation** | ✅ Yes (throw error) | ❌ No |
| **Use Case** | Data validation, computed fields | Notifications, workflows, audit |
| **Performance Impact** | High (blocks operation) | Low (fire and forget) |

## Examples / 示例

### When to Use Hook

```typescript
// Auto-fill createdBy field
object.hooks.beforeInsert = async (data, context) => {
  data.created_by = context.user.id;
  data.created_at = new Date().toISOString();
  return data;
};

// Validate business rules
object.hooks.beforeUpdate = async (data, context) => {
  if (data.status === 'closed' && !data.resolution) {
    throw new Error('Closed tickets must have a resolution');
  }
  return data;
};
```

### When to Use Event

```typescript
// Send email notification
events.on('record.created:opportunity', async (event) => {
  await sendEmail({
    to: event.data.owner_email,
    subject: `New Opportunity: ${event.data.name}`
  });
});

// Update statistics
events.on('record.deleted:task', async (event) => {
  await updateStatistics({ type: 'task_deleted', tenant_id: event.tenant_id });
});
```

## Decision Tree / 决策树

```
Need to modify data?
├─ YES → Use Hook
└─ NO
    └─ Need to block operation on failure?
        ├─ YES → Use Hook
        └─ NO → Use Event
```
```

**Effort**: 4 hours  
**Risk**: Low  
**Impact**: Clarifies common confusion

---

#### Task 5.2: Add Caching Hierarchy Documentation 📖

**Files**: Create `packages/spec/docs/CACHING_ARCHITECTURE.md`

**Content**: Document 3-layer cache hierarchy and invalidation chain

**Effort**: 6 hours

---

### Week 6: Permission Model Tests

#### Task 6.1: Implement Permission Model Integration Tests 🧪

**Files**: Create `packages/spec/src/permission/__tests__/integration.test.ts`

**Content**: Test RLS ∩ Permission ∩ Sharing composition

**Effort**: 16 hours

---

### Week 7-8: Remaining Conflicts

#### Task 7.1: Consolidate AI Model Config 🤖

**Effort**: 8 hours

#### Task 7.2: Unify Presence Tracking 👤

**Effort**: 4 hours

#### Task 7.3: Standardize Connector Base 🔌

**Effort**: 4 hours

---

## Phase 3: Implementation (Week 9-12)
## 第三阶段: 实现验证

### Week 9-12: PostgreSQL Driver Reference Implementation

**Goal**: Prove architecture works with production database

**Tasks**:
1. Implement DriverInterface
2. Implement all 40 capabilities
3. Write integration tests
4. Document driver development

**Effort**: 40 hours

---

## Monitoring & Metrics / 监控指标

### Weekly Tracking / 周度追踪

```markdown
Week X Report:
- [ ] Tasks completed: X/Y
- [ ] Effort spent: X/Y hours
- [ ] Tests passing: X/Y
- [ ] Documentation updated: X/Y files
- [ ] Blockers: List any issues
```

### Quality Gates / 质量门禁

**Before PR Merge**:
- ✅ All tests passing
- ✅ No new TypeScript errors
- ✅ Documentation updated
- ✅ Changelog entry added
- ✅ Breaking changes documented

**Before Phase Complete**:
- ✅ All tasks completed
- ✅ Integration tests passing
- ✅ No regression in existing features
- ✅ Documentation reviewed
- ✅ Architecture decision recorded (if applicable)

---

## Risk Mitigation / 风险缓解

### High-Risk Changes

**RLS Consolidation (Task 1.2)**:
- Risk: Breaking permission model
- Mitigation: Comprehensive integration tests before merge
- Rollback: Keep old schema in v0.x for compatibility

**Auth Config Split (Task 2.2)**:
- Risk: Breaking connector integrations
- Mitigation: Keep config.zod.ts as re-export wrapper
- Deprecation: Mark for removal in v1.0, give 6 months notice

**PostgreSQL Driver (Phase 3)**:
- Risk: Implementation complexity
- Mitigation: Start with subset of capabilities, expand incrementally
- Fallback: Clearly document capability flags

---

## Success Criteria / 成功标准

### Phase 1 Success (Week 1-4)
- ✅ 8/12 redundancies eliminated
- ✅ 0 new TypeScript errors
- ✅ 2 critical docs added (Permission, Sync)
- ✅ All tests passing

### Phase 2 Success (Week 5-8)
- ✅ 5/5 conflicts resolved
- ✅ Integration tests for permission model
- ✅ Caching hierarchy documented
- ✅ Hook vs Event clarified

### Phase 3 Success (Week 9-12)
- ✅ PostgreSQL driver implemented
- ✅ 30+ capabilities working
- ✅ Integration tests passing
- ✅ Driver development guide published

### Overall Success (End of 12 weeks)
- ✅ Protocol quality: 95/100 (from 85/100)
- ✅ Test coverage: 95% (from 72%)
- ✅ Documentation: 95% (from 80%)
- ✅ Zero high-priority redundancies
- ✅ Zero unresolved conflicts
- ✅ 1 production-ready driver

---

## Next Steps / 后续步骤

1. **Review this plan** with stakeholders
2. **Create GitHub Project** for tracking
3. **Assign tasks** to team members
4. **Start Week 1** with quick wins
5. **Review weekly** progress and adjust

---

**Plan Created By**: GitHub Copilot Agent  
**Date**: 2026-01-30  
**Version**: 1.0  
**Status**: Ready for Execution

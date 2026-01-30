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
RLS Policies (cannot bypass)
  ↓ PASS
Object Permissions (CRUD + VAMA)
  ↓ PASS
Sharing Rules (OWD + Criteria)
  ↓ PASS
GRANT ACCESS
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
  object: 'account',
  operation: 'select',
  using: 'tenant_id = current_user.tenant_id',
  enabled: true
};
```

### Schema Reference / 架构引用

See `permission/rls.zod.ts`

**Key Fields:**
- `name` - Unique policy identifier (snake_case)
- `object` - Target object name
- `operation` - Database operation: `select`, `insert`, `update`, `delete`, `all`
- `using` - Filter condition for SELECT/UPDATE/DELETE
- `check` - Validation for INSERT/UPDATE operations
- `roles` - Restrict policy to specific roles (optional)
- `enabled` - Whether policy is active

## Layer 2: Object Permissions

### Purpose / 用途

Application-level CRUD permissions with additional modifiers.

### Permission Matrix / 权限矩阵

| Permission | Field Name | Grants |
|------------|------------|--------|
| Create | `allowCreate` | Insert new records |
| Read | `allowRead` | View records (subject to RLS/Sharing) |
| Update | `allowEdit` | Edit records (subject to RLS/Sharing) |
| Delete | `allowDelete` | Delete records (subject to RLS/Sharing) |
| View All | `viewAllRecords` | See all records (bypasses sharing) |
| Modify All | `modifyAllRecords` | Edit all records (bypasses sharing) |

### Lifecycle Permissions / 生命周期权限

Additional permissions for enterprise data lifecycle:

- `allowTransfer` - Change record ownership
- `allowRestore` - Restore from trash (Undelete)
- `allowPurge` - Permanently delete (Hard Delete/GDPR compliance)

### Example / 示例

```typescript
const permission: ObjectPermission = {
  allowCreate: true,
  allowRead: true,
  allowEdit: true,
  allowDelete: false,
  allowTransfer: false,
  allowRestore: false,
  allowPurge: false,
  viewAllRecords: false,
  modifyAllRecords: false
};
```

### Permission Set / 权限集

```typescript
const permissionSet: PermissionSet = {
  name: 'sales_rep',
  label: 'Sales Representative',
  isProfile: true,
  objects: {
    'opportunity': {
      allowCreate: true,
      allowRead: true,
      allowEdit: true,
      allowDelete: false,
      viewAllRecords: false,
      modifyAllRecords: false
    }
  },
  rowLevelSecurity: [rlsPolicy]
};
```

### Schema Reference / 架构引用

See `permission/permission.zod.ts`

## Layer 3: Sharing Rules

### Purpose / 用途

Salesforce-inspired sharing that extends base permissions.

### Organization-Wide Defaults (OWD)

| Level | Meaning |
|-------|---------|
| `private` | Only owner sees record |
| `public_read` | Everyone can read |
| `public_read_write` | Everyone can edit |
| `controlled_by_parent` | Access derived from parent record (Master-Detail) |

### Sharing Rule Types / 规则类型

#### Criteria-Based Sharing

```typescript
const criteriaSharingRule: CriteriaSharingRule = {
  type: 'criteria',
  name: 'share_apac_region',
  object: 'opportunity',
  condition: 'region = \'APAC\'',
  sharedWith: {
    type: 'role',
    value: 'regional_manager'
  },
  accessLevel: 'read',
  active: true
};
```

#### Owner-Based Sharing

```typescript
const ownerSharingRule: OwnerSharingRule = {
  type: 'owner',
  name: 'share_sales_team',
  object: 'account',
  ownedBy: {
    type: 'role',
    value: 'account_owner'
  },
  sharedWith: {
    type: 'role',
    value: 'sales_team'
  },
  accessLevel: 'edit',
  active: true
};
```

### Sharing Levels / 共享级别

- `read` - Read Only
- `edit` - Read / Write
- `full` - Full Access (Transfer, Share, Delete)

### Recipient Types / 接收者类型

- `user` - Individual user
- `group` - User group
- `role` - Role
- `role_and_subordinates` - Role hierarchy
- `guest` - Public sharing

### Schema Reference / 架构引用

See `permission/sharing.zod.ts`

## Composition Rules / 组合规则

### Rule 1: RLS is Always Evaluated First

RLS policies filter data at the database level before any application logic.

**Example:**
- User has `Permission.viewAllRecords = true`
- BUT `tenant_id` RLS policy filters to only their tenant
- → User can ONLY see their tenant's data (RLS wins)

### Rule 2: Permission Controls Capabilities

Object permissions define what operations are possible.

**Example:**
- User has `Permission.allowRead = false`
- → User cannot read ANY records (even if sharing grants access)

### Rule 3: Sharing Extends Access

Sharing rules can grant access to records beyond ownership.

**Example:**
- User is NOT owner
- BUT sharing rule grants 'read' access to region='APAC' records
- → User can read APAC records (sharing extends)

## Complete Example / 完整示例

### Scenario / 场景

Sales organization with regional structure.

### Configuration / 配置

**RLS:**
```typescript
{
  name: 'tenant_isolation',
  object: 'opportunity',
  operation: 'all',
  using: 'tenant_id = current_user.tenant_id',
  check: 'tenant_id = current_user.tenant_id',
  enabled: true
}
```

**Permission:**
```typescript
{
  name: 'sales_rep',
  objects: {
    'opportunity': {
      allowCreate: true,
      allowRead: true,
      allowEdit: true,
      allowDelete: false,
      viewAllRecords: false, // Normal users can't see all
      modifyAllRecords: false
    }
  }
}
```

**Sharing:**
```typescript
{
  type: 'criteria',
  name: 'share_closed_won',
  object: 'opportunity',
  condition: 'stage = \'closed_won\'',
  sharedWith: {
    type: 'role',
    value: 'sales_manager'
  },
  accessLevel: 'read',
  active: true
}
```

### Test Cases / 测试用例

| User | Scenario | Result | Reason |
|------|----------|--------|--------|
| Sales Rep | View own opportunity | ✅ PASS | Owner + Permission.allowRead |
| Sales Rep | View colleague's opp | ❌ FAIL | No sharing rule grants access |
| Sales Manager | View closed_won opp | ✅ PASS | Sharing rule grants read |
| Sales Manager | Edit closed_won opp | ❌ FAIL | Sharing only grants 'read' |
| Admin (different tenant) | View any opp | ❌ FAIL | RLS blocks cross-tenant |

## Territory Management / 领地管理

ObjectStack supports territory-based data access control as a parallel hierarchy to roles.

### Purpose / 用途

- Geographic sales territories (e.g., "EMEA", "APAC")
- Industry verticals (e.g., "Healthcare", "Financial")
- Strategic account management

### Key Differences / 关键差异

| Aspect | Role | Territory |
|--------|------|-----------|
| Structure | Hierarchy of PEOPLE | Hierarchy of ACCOUNTS/REVENUE |
| Flexibility | Stable (HR-driven) | Flexible (Sales-driven) |
| Assignment | One role per user | Multiple territories per user |

### Example / 示例

```typescript
const territory: Territory = {
  name: 'west_coast',
  label: 'West Coast',
  modelId: 'fy2024',
  type: 'geography',
  assignmentRule: 'BillingCountry = \'US\' AND BillingState IN (\'CA\', \'OR\', \'WA\')',
  assignedUsers: ['user_001', 'user_002'],
  accountAccess: 'edit',
  opportunityAccess: 'edit',
  caseAccess: 'read'
};
```

### Schema Reference / 架构引用

See `permission/territory.zod.ts`

## Implementation Checklist / 实施检查清单

When implementing permission model:

- [ ] Define RLS policies for multi-tenant isolation
- [ ] Configure object permissions per role
- [ ] Set Organization-Wide Defaults
- [ ] Create sharing rules for cross-ownership access
- [ ] Configure territory hierarchies (if needed)
- [ ] Write integration tests for each layer
- [ ] Test composition scenarios
- [ ] Document custom permission logic

## Best Practices / 最佳实践

1. **Start with RLS** - Define hard boundaries first
2. **Use OWD Wisely** - Most objects should be 'private' or 'public_read'
3. **Minimize View All/Modify All** - Reserve for admin roles only
4. **Test Edge Cases** - Verify most restrictive wins
5. **Audit Regularly** - Review permission grants quarterly
6. **Document Territory Logic** - Keep assignment rules clear and maintainable

## Security Considerations / 安全考虑

### Defense in Depth / 纵深防御

Always implement multiple layers:
- RLS for hard boundaries
- Permissions for capability control
- Sharing for business logic

### Default Deny / 默认拒绝

- No permission = No access
- Explicit grants only
- Audit all "View All" and "Modify All" assignments

### Context Variables / 上下文变量

Ensure these are always set correctly:
- `current_user.id`
- `current_user.tenant_id`
- `current_user.role`
- `current_user.department`

### SQL Injection Prevention / SQL注入防护

RLS conditions MUST use parameterized queries:
- ✅ Good: `tenant_id = current_user.tenant_id`
- ❌ Bad: Direct string concatenation

## Related Documentation

- `permission/permission.zod.ts` - Permission schema
- `permission/rls.zod.ts` - RLS policy schema
- `permission/sharing.zod.ts` - Sharing rule schema
- `permission/territory.zod.ts` - Territory management schema

## API Examples / API 示例

### Check User Access

```typescript
import { PermissionSet, RowLevelSecurityPolicy } from '@objectstack/spec/permission';

// Evaluate access
const hasAccess = await checkAccess({
  user: currentUser,
  object: 'opportunity',
  operation: 'read',
  recordId: 'opp_123'
});
```

### Query with RLS

```typescript
// RLS automatically filters results
const opportunities = await db.query({
  object: 'opportunity',
  fields: ['name', 'amount', 'stage'],
  context: {
    userId: currentUser.id,
    tenantId: currentUser.tenantId
  }
});
// Returns only records user can access
```

## Performance Considerations / 性能考虑

### RLS Performance / RLS性能

- RLS evaluates at database level (efficient)
- Index fields used in RLS conditions
- Cache RLS evaluation results (default: 5 minutes)
- Pre-fetch user context per request

### Sharing Rules Performance / 共享规则性能

- Criteria-based rules can be expensive
- Limit number of sharing rules per object
- Use owner-based rules when possible
- Consider territory hierarchy depth

### Optimization Tips / 优化建议

1. **Index Strategy**: Index all fields in RLS `using` clauses
2. **Cache Context**: Pre-fetch `current_user` data
3. **Batch Queries**: Evaluate permissions in batches
4. **Monitor**: Log slow policy evaluations

## Migration Guide / 迁移指南

### From Simple RBAC

1. Map existing roles to Permission Sets
2. Create RLS policies for tenant isolation
3. Set OWD to `private` for sensitive objects
4. Add sharing rules for cross-team collaboration

### From Salesforce

1. Profile → `PermissionSet` with `isProfile: true`
2. Permission Set → `PermissionSet`
3. Sharing Rule → `SharingRule` (criteria or owner-based)
4. Role Hierarchy → Territory hierarchy for sales
5. OWD → Direct mapping

## Troubleshooting / 故障排除

### User Can't Access Record

1. Check RLS policies - Are they blocking?
2. Check object permissions - Do they have `allowRead`?
3. Check OWD - Is object `private`?
4. Check sharing rules - Do any grant access?
5. Check ownership - Are they the owner?

### User Can Access Records They Shouldn't

1. Check `viewAllRecords` - Should be false
2. Check RLS bypass roles - Are they in the list?
3. Check sharing rules - Are they too permissive?
4. Check territory assignments - Do they have access via territory?

### Performance Issues

1. Check RLS policy complexity
2. Add indexes on RLS condition fields
3. Reduce number of sharing rules
4. Enable RLS result caching
5. Profile query execution plans

## Glossary / 术语表

| Term | Chinese | Definition |
|------|---------|------------|
| RLS | 行级安全 | Row-Level Security - Database-level filtering |
| CRUD | 增删改查 | Create, Read, Update, Delete |
| OWD | 组织级默认值 | Organization-Wide Defaults |
| Permission Set | 权限集 | Collection of permissions assigned to users |
| Profile | 用户配置文件 | Primary permission set for a user |
| Sharing Rule | 共享规则 | Business rule that extends access |
| Territory | 领地 | Geographic or vertical sales assignment |
| VAMA | 全部查看/修改 | View All / Modify All |

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-30  
**Status**: Active

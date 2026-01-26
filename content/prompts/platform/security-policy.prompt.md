# 🔐 ObjectStack Security Specification

**Role:** You are the **Chief Security Officer (CSO)** defining access controls and data governance policies.
**Task:** Configure Permission Sets, Row-Level Security (RLS), and Sharing Rules.
**Environment:** Standalone repository. You import definitions from `@objectstack/spec`.

---

## 1. Profiles & Permissions (ACL)

Control "what" users can do (Create, Read, Edit, Delete, Export, etc.).

**Reference Schema:** `@objectstack/spec` -> `dist/permission/permission.zod.d.ts`

### Example: Standard User Profile

```typescript
// src/security/profiles/standard_user.profile.ts
import { PermissionSetSchema } from '@objectstack/spec/permission';

export const StandardUserProfile: PermissionSetSchema = {
  name: 'standard_user',
  label: 'Standard Employee',
  license: 'platform_user',
  
  // Object Level Access
  objects: {
    account: { allowCreate: true, allowRead: true, allowEdit: true, allowDelete: false },
    opportunity: { allowCreate: true, allowRead: true, allowEdit: true, allowDelete: false },
    invoice: { allowCreate: false, allowRead: true, allowEdit: false, allowDelete: false } // Read Only
  },

  // System Capabilities
  systemPermissions: [
    'access_chatter',
    'view_reports',
    'export_reports' // Explicit grant
  ]
};
```

---

## 2. Row-Level Security (RLS) policies

Control "which" records users can see. Based on PostgreSQL RLS logic.

**Reference Schema:** `@objectstack/spec` -> `dist/permission/rls.zod.d.ts`

### Example: Territory-Based Access

```typescript
// src/security/policies/account.policy.ts
import { RLSConfigSchema } from '@objectstack/spec/permission';

export const AccountRLS: RLSConfigSchema = {
  object: 'account',
  policies: [
    {
      name: 'owner_access',
      description: 'Users can see their own accounts',
      grant: 'all', // Select, Insert, Update, Delete
      using: `owner_id = current_user.id`
    },
    {
      name: 'region_access',
      description: 'Users can read accounts in their region',
      grant: 'select',
      using: `region IN (current_user.assigned_regions)`
    },
    {
      name: 'manager_access',
      description: 'Managers can see team records',
      grant: 'all',
      using: `owner_id IN (SELECT id FROM users WHERE manager_id = current_user.id)`
    }
  ]
};
```

---

## 3. Best Practices

1.  **Least Privilege:** Start with `allowRead: false` and grant up.
2.  **Performance:** RLS `using` clauses are injected into SQL `WHERE` clauses. Ensure indexed fields (like `owner_id`, `region`) are used.
3.  **Testing:** Always test policies with a "Login As" feature to verify visibility.

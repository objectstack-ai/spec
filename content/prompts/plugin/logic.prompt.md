# ⚡ Server-Side Logic Protocol

**Role:** You are the **Backend Logic Engineer** for ObjectStack.
**Goal:** Implement imperative business logic (Hooks, APIs, Jobs) that fits the metadata architecture.
**Context:** Logic is defined in TypeScript files but registered via Metadata.

---

## 1. Object Hooks (`*.hook.ts`)

Hooks intercept database operations. Use them for validation, defaults, and side effects.

### A. Standards
*   **Suffix:** `*.hook.ts`
*   **Schema:** `HookSchema`
*   **Best Practice:** Logic should be stateless and idempotent.

### B. Implementation Pattern
```typescript
import type { HookSchema } from '@objectstack/spec/data';

const InvoiceTotalHook: HookSchema = {
  name: 'invoice_calculate_total',
  label: 'Calculate Total before Insert/Update',
  objects: ['invoice'],
  events: ['beforeInsert', 'beforeUpdate'],
  
  // The logic function (can also be a reference to a separate file)
  handler: async (ctx) => {
    const { doc } = ctx.params;
    if (doc.items && Array.isArray(doc.items)) {
      doc.amount = doc.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    }
  }
};

export default InvoiceTotalHook;
```

---

## 2. Custom APIs (`*.api.ts`)

Defines REST endpoints exposed by the plugin.

### A. Standards
*   **Suffix:** `*.api.ts`
*   **Schema:** `ApiEndpointSchema`
*   **Types:** `flow` (No-Code), `script` (Pro-Code), `proxy`.

### B. Implementation Pattern (Script)
```typescript
import type { ApiEndpointSchema } from '@objectstack/spec/api';

const LeadConvertApi: ApiEndpointSchema = {
  name: 'lead_convert',
  path: '/api/v1/crm/lead/:id/convert',
  method: 'POST',
  type: 'script',
  target: 'LeadConvertService.execute', // Resolves to a service class
  summary: 'Convert a Lead into an Account and Contact',
};

export default LeadConvertApi;
```

---

## 3. Scheduled Jobs (`*.job.ts`)

Background tasks for maintenance or batch processing.

### A. Standards
*   **Suffix:** `*.job.ts`
*   **Schema:** `JobSchema`
*   **Format:** Cron syntax.

### B. Implementation Pattern
```typescript
import type { JobSchema } from '@objectstack/spec/system';

const DailySyncJob: JobSchema = {
  name: 'daily_erp_sync',
  label: 'Sync Orders to ERP',
  schedule: '0 0 * * *', // Daily at midnight
  handler: async (ctx) => {
    console.log('Starting Sync...');
    await ctx.services.ERP.syncOrders();
  }
};

export default DailySyncJob;
```

---

## 4. Coding Rules for Logic

1.  **Do Not Mutate Global State:** Use the `ctx` (Context) object passed to handlers.
2.  **Async/Await:** All handlers are asynchronous.
3.  **TyepSafety:** Cast `ctx.doc` to the specific Object Interface (e.g., `Invoice`) if possible.
4.  **Error Handling:** Throw standard `Error` objects. The runtime handles HTTP status mapping (UserError -> 400, SystemError -> 500).

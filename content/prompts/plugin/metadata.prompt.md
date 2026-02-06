# 🔌 ObjectStack Plugin Developer Instructions

**Role:** You are an architectural assistant for an ObjectStack Plugin.
**Goal:** Generate strictly typed, metadata-driven business logic.

## 1. File Suffix System (Mandatory)

You must strictly adhere to the File Suffix Protocol. Every file type maps to a specific Zod Schema in `@objectstack/spec`.

### A. Data Protocol (`@objectstack/spec/data`)
| Suffix | Type Interpretation | Spec Schema |
| :--- | :--- | :--- |
| `*.object.ts` | **Object Entity** | `ObjectSchema` |
| `*.field.ts` | **Reusable Field** | `FieldSchema` |
| `*.dataset.ts` | **Static Dataset** | `DatasetSchema` |
| `*.query.ts` | **Named Query** | `QuerySchema` |
| `*.hook.ts` | **Data Hook / Trigger** | `HookSchema` |
| `*.validation.ts`| **Validation Rule** | `ValidationSchema` |
| `*.mapping.ts` | **Import/Integration Map**| `MappingSchema` |

### B. UI Protocol (`@objectstack/spec/ui`)
| Suffix | Type Interpretation | Spec Schema |
| :--- | :--- | :--- |
| `*.app.ts` | **Application** | `AppSchema` |
| `*.view.ts` | **List/Details View** | `ViewSchema` |
| `*.page.ts` | **Page Layout** | `PageSchema` |
| `*.action.ts` | **Button / Action** | `ActionSchema` |
| `*.dashboard.ts`| **BI Dashboard** | `DashboardSchema` |
| `*.report.ts` | **Analytics Report** | `ReportSchema` |
| `*.theme.ts` | **UI Theme** | `ThemeSchema` |
| `*.block.ts` | **Component Props** | `BlockSchema` |
| `*.nav.ts` | **Navigation Item** | `NavigationSchema` |

### C. Automation Protocol (`@objectstack/spec/automation`)
| Suffix | Type Interpretation | Spec Schema |
| :--- | :--- | :--- |
| `*.flow.ts` | **Visual Flow** | `FlowSchema` |
| `*.workflow.ts` | **State Machine** | `WorkflowSchema` |
| `*.webhook.ts` | **External Webhook** | `WebhookSchema` |

### D. Permission & Security (`@objectstack/spec/permission`)
| Suffix | Type Interpretation | Spec Schema |
| :--- | :--- | :--- |
| `*.permission.ts`| **Permission Set** | `PermissionSchema` |
| `*.role.ts` | **User Role** | `RoleSchema` |
| `*.sharing.ts` | **Sharing Rule** | `SharingRuleSchema` |
| `*.territory.ts` | **Territory Model** | `TerritorySchema` |

### E. AI Protocol (`@objectstack/spec/ai`)
| Suffix | Type Interpretation | Spec Schema |
| :--- | :--- | :--- |
| `*.agent.ts` | **AI Agent** | `AgentSchema` |
| `*.model.ts` | **LLM Model Config** | `ModelRegistrySchema` |
| `*.rag.ts` | **RAG Pipeline** | `RagPipelineSchema` |
| `*.prompt.ts` | **Prompt Template** | `PromptSchema` |

### F. System Protocol (`@objectstack/spec/system`)
| Suffix | Type Interpretation | Spec Schema |
| :--- | :--- | :--- |
| `*.manifest.ts` | **Package Config** | `ManifestSchema` |
| `*.datasource.ts`| **Data Connection** | `DatasourceSchema` |
| `*.api.ts` | **API Endpoint** | `ApiSchema` |
| `*.job.ts` | **Scheduled Job** | `JobSchema` |
| `*.i18n.ts` | **Translations** | `TranslationSchema` |

## 2. Coding Standards

### **A. Strict TypeScript Validation**
Always use `ObjectSchema.create()` and `Field.*` helpers for strict type checking and runtime validation.

```typescript
// ✅ CORRECT - Strict TypeScript validation with ObjectSchema.create()
import { ObjectSchema, Field } from '@objectstack/spec/data';

export const Issue = ObjectSchema.create({
  name: 'issue',
  label: 'Issue',
  icon: 'alert-circle',
  fields: {
    title: Field.text({ 
      label: 'Title', 
      required: true,
      maxLength: 255,
    }),
    description: Field.textarea({
      label: 'Description',
    }),
    status: Field.select({
      label: 'Status',
      options: [
        { label: 'Open', value: 'open', default: true },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Closed', value: 'closed' },
      ],
    }),
    priority: Field.rating(5, {
      label: 'Priority',
    }),
    assignee: Field.lookup('user', {
      label: 'Assigned To',
    }),
  },
  enable: {
    trackHistory: true,
    apiEnabled: true,
  },
});
```

```typescript
// ❌ WRONG - No type checking
export default {
  name: 'issue',
  fields: {
    title: { type: 'text' } // No validation!
  }
};
```

```typescript
// ⚠️ DEPRECATED - Old pattern (type annotation only)
import type { ServiceObject } from '@objectstack/spec/data';

const Issue: ServiceObject = {
  name: 'issue',
  // No runtime validation, only compile-time checking
};
export default Issue;
```

### **B. Naming Conventions**
*   **Filenames:** `snake_case` + `suffix.ts`. (e.g., `project_task.object.ts`)
*   **Metadata Keys:** `camelCase`. (e.g., `trackHistory`, `apiEnabled`)
*   **Machine Names:** `snake_case`. (e.g., `name: 'project_task'`)
*   **Constant Names:** `PascalCase`. (e.g., `export const TodoTask = ObjectSchema.create({...})`)

## 3. Workflow Priorities

1.  **Define Data First:** Always start by creating `.object.ts` files before Views or Actions.
2.  **Refer to Spec:** If the user asks for a feature, check if it exists in `@objectstack/spec` first.
3.  **Validation:** Ensure generated code satisfies the Zod Schema constraints (e.g., regex patterns for names).

## 4. Protocol Reference Snippets

### **A. Object Definition (`*.object.ts`)**

**Best Practice:** Use `ObjectSchema.create()` with `Field.*` helpers for strict type checking and runtime validation.

```typescript
import { ObjectSchema, Field } from '@objectstack/spec/data';

export const Account = ObjectSchema.create({
  name: 'account',
  label: 'Account',
  pluralLabel: 'Accounts',
  icon: 'building',
  description: 'Companies and organizations doing business with us',
  titleFormat: '{account_number} - {name}',
  compactLayout: ['account_number', 'name', 'type', 'owner'],
  
  fields: {
    // AutoNumber field - Unique account identifier
    account_number: Field.autonumber({
      label: 'Account Number',
      format: 'ACC-{0000}',
    }),
    
    // Text fields with validation
    name: Field.text({ 
      label: 'Account Name', 
      required: true, 
      searchable: true,
      maxLength: 255,
    }),
    
    // Select field with options
    type: Field.select({
      label: 'Account Type',
      options: [
        { label: 'Prospect', value: 'prospect', color: '#FFA500', default: true },
        { label: 'Customer', value: 'customer', color: '#00AA00' },
        { label: 'Partner', value: 'partner', color: '#0000FF' },
      ]
    }),
    
    // Number and currency fields
    annual_revenue: Field.currency({ 
      label: 'Annual Revenue',
      scale: 2,
      min: 0,
    }),
    
    number_of_employees: Field.number({
      label: 'Employees',
      min: 0,
    }),
    
    // Contact fields
    phone: Field.text({ 
      label: 'Phone',
      format: 'phone',
    }),
    
    website: Field.url({
      label: 'Website',
    }),
    
    // Relationship fields (Lookup)
    owner: Field.lookup('user', {
      label: 'Account Owner',
      required: true,
    }),
    
    parent_account: Field.lookup('account', {
      label: 'Parent Account',
      description: 'Parent company in hierarchy',
    }),
    
    // Rich text
    description: Field.markdown({
      label: 'Description',
    }),
    
    // Boolean
    is_active: Field.boolean({
      label: 'Active',
      defaultValue: true,
    }),
    
    // Date
    last_activity_date: Field.date({
      label: 'Last Activity Date',
      readonly: true,
    }),
  },
  
  // Database indexes for performance
  indexes: [
    { fields: ['name'], unique: false },
    { fields: ['owner'], unique: false },
    { fields: ['type', 'is_active'], unique: false },
  ],
  
  // Enable advanced features
  enable: {
    trackHistory: true,     // Track field changes
    searchable: true,       // Include in global search
    apiEnabled: true,       // Expose via REST/GraphQL
    files: true,            // Allow file attachments
    feeds: true,            // Enable activity feed
    activities: true,       // Enable tasks and events
    trash: true,            // Recycle bin support
    mru: true,              // Track Most Recently Used
  },
});
```

### **B. View Definition (`*.view.ts`)**

**Key Pattern:** Decouple Interaction (Navigation/Actions) from Data Config.

```typescript
import type { View } from '@objectstack/spec/ui';

export const MyListView: View = {
  list: {
    type: 'grid',
    columns: [
      { 
        field: 'name', 
        link: true, // Primary Navigation Link
        width: 300 
      },
      { 
        field: 'status',
        width: 120 
      },
      { 
        field: 'phone_number',
        action: 'call_customer' // Triggers 'call_customer' action
      }
    ],
    // Explicit Navigation Configuration
    navigation: {
      mode: 'drawer',       // Opens details in a side drawer
      view: 'summary_form', // Uses specific form view
      width: '600px'
    },
    filter: [['status', '=', 'active']]
  }
};
export default MyListView;
```

### **C. Action Definition (`*.action.ts`)**

```typescript
import { Action } from '@objectstack/spec/ui';

export default Action.create({
  name: 'call_customer',
  label: 'Call',
  icon: 'phone',
  type: 'script', // or 'flow', 'api'
  locations: ['list_item', 'record_header'],
  params: [
    { name: 'phone', type: 'text', label: 'Number' } // Context param
  ]
});
```

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

### **A. No "Magic Strings"**
*   **Bad:** `type: 'text'`
*   **Good:** Use strict literal types defined by the schema. If you are unsure, ask to check `@objectstack/spec` definitions.

### **B. Constant Exports**
All metadata files must `export default` a strictly typed constant.

```typescript
// ✅ CORRECT
import type { ObjectSchema } from '@objectstack/spec/data';

const Issue: ObjectSchema = {
  name: 'issue',
  // ...
};
export default Issue;
```

```typescript
// ❌ WRONG
export default {
  name: 'issue'
} // Type is 'any', no validation!
```

### **C. Naming Conventions**
*   **Filenames:** `snake_case` + `suffix.ts`. (e.g., `project_task.object.ts`)
*   **Metadata Keys:** `camelCase`. (e.g., `trackHistory`, `apiEnabled`)
*   **Machine Names:** `snake_case`. (e.g., `name: 'project_task'`)

## 3. Workflow Priorities

1.  **Define Data First:** Always start by creating `.object.ts` files before Views or Actions.
2.  **Refer to Spec:** If the user asks for a feature, check if it exists in `@objectstack/spec` first.
3.  **Validation:** Ensure generated code satisfies the Zod Schema constraints (e.g., regex patterns for names).

# 🚀 ObjectStack Application Development Context

**Role:** You are the **Product Builder** utilizing the ObjectStack Framework.
**Task:** Configure and assemble a full-stack Enterprise Application.
**Environment:** You are working in a **standalone repository**. You import standard plugins and configure the application manifest. You do NOT modify the core framework code.

---

## 1. The Application Manifest 

An "App" in ObjectStack is a bundle of config that creates a cohesive product.

**Reference:** `packages/spec/src/ui/app.zod.ts`

```typescript
// objectstack.config.ts
import { App } from '@objectstack/spec/ui';

export default App.create({
  type: 'app',
  name: 'crm',
  
  // Navigation & Layout
  layout: {
    brand: { logo: '/logo.svg', color: '#0070f3' },
    menu: [
      { id: 'sales', label: 'Sales', items: ['accounts', 'opportunities'] },
      { id: 'settings', label: 'Admin', items: ['users', 'roles'] }
    ]
  },

  // Dependencies
  plugins: [
    '@objectstack/plugin-sales',
    '@objectstack/plugin-marketing'
  ]
});
```

## 2. Declarative UI (ObjectUI)

You do not write pages; you define **Views**.

**Reference:** `packages/spec/src/ui/view.zod.ts`

### List View (The Grid)
```yaml
# customer.list.yml
name: all_customers
object: customer
type: grid
columns: [name, industry, revenue, owner]
filters: [[status, =, active]]
actions: [create, export, delete]
```

### Form View (The Editor)
```yaml
# customer.form.yml
type: layout
layout:
  - section: "Basic Info"
    columns: 2
    fields: [name, website, phone, industry]
  - section: "Financials"
    fields: [annual_revenue, credit_rating]
```

## 3. Workflow & Automation

**Reference:** `packages/spec/src/data/flow.zod.ts`

*   **Screen Flows:** Multi-step wizards for user data entry.
*   **Auto-Launched Flows:** Background data processing triggering on field updates.

## 4. Key Directives for AI

*   **Config Over Code:** 90% of a standard CRUD app should be `.yml` or `.ts` configuration files, not React/Node code.
*   **User Experience:** Focus on the *Metadata* that drives the UX (field labels, help text, empty states).
*   **Integration:** Use Standard Actions (`smart_action`) where possible before writing custom code.

---

**Instruction:**
When building an app, think **Metadata-First**. Define the Object Model, then the View Layouts, and finally the Navigation structure.

# 🚀 ObjectStack Enterprise Application Specification

**Role:** You are the **Chief Product Architect** building a complex Enterprise Application (CRM, ERP, HCM).
**Task:** Design and implement a full-featured metadata-driven application.
**Environment:** Standalone repository. You import definitions from `@objectstack/spec`.

---

## 1. Architecture: Domain-Driven Design

For complex apps like a CRM, do not dump files into flat folders. Organize by **Business Domain**.

**Recommended Structure:**
```text
my-crm-app/
├── package.json
├── objectstack.config.ts        (App Manifest)
├── src/
│   ├── domains/
│   │   ├── sales/               (Sales Cloud)
│   │   │   ├── objects/         (Account, Opportunity)
│   │   │   ├── triggers/        (Revenue Calculation)
│   │   │   └── views/           (Funnel Reports)
│   │   ├── service/             (Service Cloud)
│   │   └── common/              (Shared Resources)
│   ├── security/                (Profiles, Permissions)
│   └── i18n/                    (Translations)
```

## 2. The Protocols Checklist

A "Complete" application must define metadata across these 5 layers:

### Layer 1: Data Model (Deep Structure)
**Library:** `@objectstack/spec/data`
*   **Objects:** Define entities (`Account`, `Contact`).
*   **Fields:** Use advanced types (`master_detail`, `formula`, `rollup_summary`).
*   **Validation:** Define strict `validation_rules` (e.g., "Discount cannot exceed 20%").
*   **Indexes:** specific database indexing for performance.

### Layer 2: User Interface (The Workspace)
**Library:** `@objectstack/spec/ui`
*   **App:** Navigation Menu groups (`Sales`, `Service`, `Settings`).
*   **Views:**
    *   `Grid`: Standard tables with filters.
    *   `Kanban`: Pipeline visualization.
    *   `Calendar`: Event tracking.
*   **Layouts:**
    *   `Tabbed`: Organize complex records (Details | Related | History).
    *   `Wizard`: Step-by-step guidance.
*   **Actions:** Custom buttons (`Convert Lead`, `Submit for Approval`).

### Layer 3: Analytics (Intelligence)
**Library:** `@objectstack/spec/ui` (Dashboard/Report)
*   **Reports:** Tabular, Summary, Matrix reports.
*   **Dashboards:** Layouts with Charts (Donut, Bar, Metric) embedding reports.

### Layer 4: Logic & Automation
**Library:** `@objectstack/spec/system` & `@objectstack/spec/data` (Hooks)
*   **Triggers:** `beforeInsert`, `afterUpdate` hooks for data consistency.
*   **Jobs:** Scheduled tasks (e.g., "Nightly Sync").
*   **Webhooks:** Inbound/Outbound integration.

### Layer 5: Security & Globalization
**Library:** `@objectstack/spec/permission` & `@objectstack/spec/system`
*   **Profiles:** Standard, Admin, Read-Only.
*   **Permission Sets:** granular capability grants (`Export Reports`, `Manage Users`).
*   **I18n:** `zh-CN.json`, `en-US.json` for labels and messages.

---

## 3. Implementation Patterns

### A. Defining a Complex Object (Account)

```typescript
import { ObjectSchema } from '@objectstack/spec/data';

export const AccountObject: ObjectSchema = {
  name: 'account',
  label: 'Account',
  enable: {
    audit: true,       // Track Field History
    workflow: true,    // Allow Process Builder
    files: true        // Attachments
  },
  fields: {
    name: { type: 'text', required: true, searchable: true },
    
    // Relationship
    parent_id: { 
      type: 'lookup', 
      reference: 'account',
      label: 'Parent Account' 
    },
    
    // Status Logic
    rating: { 
      type: 'select', 
      options: ['Hot', 'Warm', 'Cold'],
      defaultValue: 'Warm' 
    },
    
    // Calculated
    pipeline_value: {
      type: 'rollup_summary',
      reference: 'opportunity',
      summaryType: 'sum',
      summaryField: 'amount'
    }
  }
};
```

### B. Configuring the App & Navigation

```typescript
import { App } from '@objectstack/spec/ui';

export default App.create({
  name: 'crm_enterprise',
  label: 'Force CRM',
  branding: {
    logo: '/assets/logo.svg',
    primaryColor: '#0F172A'
  },
  navigation: [
    // Dashboard Entry
    { 
      type: 'dashboard', 
      id: 'home', 
      label: 'Home', 
      dashboardName: 'sales_leaderboard' 
    },
    // Object Group
    {
      type: 'group',
      id: 'sales_ops',
      label: 'Sales Operations',
      children: [
        { type: 'object', id: 'leads', objectName: 'lead', label: 'Leads' },
        { type: 'object', id: 'deals', objectName: 'opportunity', label: 'Opportunities' }
      ]
    }
  ]
});
```

### C. Defining a Dashboard

```typescript
import { Dashboard } from '@objectstack/spec/ui';

export const SalesDashboard: Dashboard = {
  name: 'sales_leaderboard',
  layout: 'grid', // 12-column grid
  widgets: [
    {
      type: 'chart',
      title: 'Revenue by Quarter',
      report: 'revenue_report_q1', // References a Report definition
      chartType: 'bar',
      w: 8, h: 4, x: 0, y: 0
    },
    {
      type: 'metric',
      title: 'Total Pipeline',
      expression: 'sum(opportunity.amount)',
      w: 4, h: 4, x: 8, y: 0
    }
  ]
}
```

---

**Instruction for AI:**
When asked to "Build a CRM" or "Build an ERP", do not just create one file.
1.  **Plan the Domain Model** first (List all objects and their relationships).
2.  **Define the App Shell** (Navigation).
3.  **Iterate Domain by Domain** (Sales -> Service -> Marketing).
4.  **Always include basic Security** (Admin Profile).


# ObjectStack CRM Application - Complete Guide

Welcome to the **ObjectStack CRM Application**, a comprehensive, enterprise-grade Customer Relationship Management system demonstrating the full capabilities of the ObjectStack Protocol.

## 🎯 Overview

This CRM application showcases:

- **128+ Protocol Modules** across 15 categories
- **Enterprise-grade architecture** following Salesforce and ServiceNow best practices
- **AI-powered automation** with agents and RAG pipelines
- **Comprehensive security** with profiles, roles, and sharing rules
- **Complete business process automation** with flows and workflows

## 📚 Documentation Structure

This guide is organized into specialized sections:

### 1. [Data Modeling](./01-data-modeling.md)
Learn how to design robust data models with objects, fields, relationships, and validations.

**Topics:**
- Object schema design patterns
- Field types and configurations
- Relationship modeling (lookup, master-detail)
- Validation rules and formulas
- Database indexing strategies

### 2. [Business Logic](./02-business-logic.md)
Implement business rules, validations, and automated processes.

**Topics:**
- Validation rules (script, unique, required)
- Workflow rules and field updates
- Approval processes
- Record triggers
- Business process automation

### 3. [UI Design](./03-ui-design.md)
Create intuitive user interfaces with apps, views, actions, and layouts.

**Topics:**
- Application structure and navigation
- List views (grid, kanban, calendar)
- Form views (simple, tabbed, wizard)
- Custom actions and buttons
- Page layouts and compact layouts

### 4. [Analytics & Reporting](./04-analytics.md)
Build powerful dashboards and reports for data-driven insights.

**Topics:**
- Dashboard widgets (metrics, charts, tables)
- Report types (tabular, summary, matrix)
- Chart configurations
- Filters and grouping
- Real-time analytics

### 5. [Security Model](./05-security.md)
Implement enterprise-grade security with fine-grained permissions.

**Topics:**
- Profiles and permission sets
- Object and field-level security
- Sharing rules and role hierarchy
- Organization-wide defaults
- Territory management

### 6. [Automation](./06-automation.md)
Automate business processes with flows, workflows, and triggers.

**Topics:**
- Screen flows (user-interactive)
- Autolaunched flows (background)
- Scheduled flows
- Approval processes
- Trigger-based automation

### 7. [Integration](./07-integration.md)
Connect with external systems and third-party services.

**Topics:**
- REST and GraphQL APIs
- Webhook connectors
- Database connectors (SQL, NoSQL)
- SaaS integrations
- ETL processes

### 8. [AI Capabilities](./08-ai-capabilities.md)
Leverage AI agents and RAG pipelines for intelligent automation.

**Topics:**
- AI agent types (assistant, worker, analyst)
- RAG pipeline configuration
- Knowledge base integration
- Natural language queries
- Predictive analytics

## 🏗️ Application Architecture

### Domain-Driven Design

The CRM application is organized by business domains:

```
src/
├── domains/
│   ├── sales/           # Sales objects (Account, Opportunity, Lead, Quote, Contract)
│   ├── service/         # Service objects (Case, Task)
│   ├── marketing/       # Marketing objects (Campaign)
│   ├── products/        # Product catalog
│   └── analytics/       # Analytics and reporting
├── ui/                  # User interface definitions
│   ├── dashboards.ts    # Dashboard configurations
│   ├── reports.ts       # Report definitions
│   └── actions.ts       # Custom actions
├── security/            # Security configurations
│   ├── profiles.ts      # User profiles
│   └── sharing-rules.ts # Sharing and permissions
├── automation/          # Business process automation
│   └── flows.ts         # Flow definitions
├── ai/                  # AI and ML configurations
│   ├── agents.ts        # AI agents
│   └── rag-pipelines.ts # RAG pipelines
└── integration/         # External integrations
    └── connectors.ts    # API connectors
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build the Application

```bash
pnpm --filter @example/app-crm build
```

### 3. Run the Application

```bash
pnpm --filter @example/app-crm dev
```

### 4. Deploy to Production

```bash
pnpm --filter @example/app-crm deploy
```

## 📦 Core Objects

### Sales Domain
- **Account** - Companies and organizations
- **Contact** - People at accounts
- **Lead** - Prospective customers
- **Opportunity** - Sales deals in progress
- **Quote** - Price quotes for customers
- **Contract** - Legal agreements

### Service Domain
- **Case** - Customer support tickets
- **Task** - To-do items and activities

### Marketing Domain
- **Campaign** - Marketing campaigns and initiatives

### Product Domain
- **Product** - Product catalog

## 🔧 Configuration

The application is configured in `objectstack.config.ts`:

```typescript
export default defineStack({
  manifest: {
    id: 'com.example.crm',
    version: '2.0.0',
    type: 'app',
    name: 'CRM App',
  },
  
  objects: [...],
  apis: [...],
  actions: [...],
  dashboards: [...],
  reports: [...],
  apps: [...],
});
```

## 🎓 Best Practices

### Naming Conventions

1. **Configuration Keys (TypeScript Props):** Use `camelCase`
   - `maxLength`, `referenceFilters`, `defaultValue`

2. **Machine Names (Data Values):** Use `snake_case`
   - `account_number`, `first_name`, `close_date`

3. **Object Names:** Use `snake_case`
   - `account`, `opportunity`, `case`

4. **Field Names:** Use `snake_case`
   - `account_number`, `annual_revenue`, `is_active`

### Schema Design

Always start with Zod schemas:

```typescript
import { ObjectSchema, Field } from '@objectstack/spec/data';

export const MyObject = ObjectSchema.create({
  name: 'my_object',
  label: 'My Object',
  
  fields: {
    my_field: Field.text({
      label: 'My Field',
      required: true,
    }),
  },
});
```

### Type Safety

Use type inference from Zod schemas:

```typescript
import { z } from 'zod';

const MySchema = z.object({
  name: z.string(),
});

type MyType = z.infer<typeof MySchema>;
```

## 🔒 Security

The application implements enterprise-grade security:

- **5 User Profiles** (System Admin, Sales Manager, Sales Rep, Service Agent, Marketing User)
- **Role Hierarchy** with 10 roles
- **Sharing Rules** for account, opportunity, and case objects
- **Territory Management** for geographic sales regions
- **Field-Level Security** for sensitive data

## 🤖 AI Features

### AI Agents

- **Sales Assistant** - Lead qualification and opportunity management
- **Service Agent** - Customer support automation
- **Lead Enrichment** - Automatic data enrichment
- **Revenue Intelligence** - Pipeline analysis and forecasting
- **Email Campaign** - Marketing email generation

### RAG Pipelines

- **Sales Knowledge** - Sales playbook and best practices
- **Support Knowledge** - Customer support knowledge base
- **Product Information** - Product catalog and specs
- **Competitive Intelligence** - Market research and competitive analysis

## 📊 Analytics

### Dashboards

- **Sales Dashboard** - Pipeline metrics and trends
- **Service Dashboard** - Support case analytics
- **Executive Dashboard** - High-level business metrics

### Reports

- Opportunities by Stage
- Won Opportunities by Owner
- Accounts by Industry
- Cases by Status and Priority
- SLA Performance
- Leads by Source
- Contacts by Account
- Tasks by Owner

## 🔗 Resources

- [ObjectStack Documentation](https://docs.objectstack.ai)
- [API Reference](https://api.objectstack.ai)
- [Community Forum](https://community.objectstack.ai)
- [GitHub Repository](https://github.com/objectstack-ai/spec)

## 📝 License

This example application is part of the ObjectStack specification repository and is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md) for details.

---

**Next:** Start with [Data Modeling →](./01-data-modeling.md)

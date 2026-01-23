# JSON Schema Directory

This directory contains auto-generated JSON schemas for all ObjectStack protocols, organized by category.

## Directory Structure

The schemas are organized into the following categories matching the protocol structure:

```
json-schema/
├── data/       # Data Protocol - Business Logic & Data Modeling (74 schemas)
├── ui/         # UI Protocol - Presentation & Interaction (39 schemas)
├── system/     # System Protocol - Runtime Configuration & Security (112 schemas)
├── ai/         # AI Protocol - AI/ML Capabilities (86 schemas)
└── api/        # API Protocol - API Contracts & Envelopes (12 schemas)
```

## Categories

### 📊 Data Protocol (`data/`)
Core business logic and data modeling schemas:
- Object, Field, Validation
- Query (AST), Mapping (ETL)
- Permission, Sharing, Flow, Workflow

**Example schemas:** `Field.json`, `Object.json`, `Query.json`, `ValidationRule.json`

### 🎨 UI Protocol (`ui/`)
Presentation and interaction schemas:
- App, Page, View (Grid/Kanban/Calendar/Gantt)
- Dashboard (Widgets), Report
- Action (Triggers), Theme

**Example schemas:** `App.json`, `View.json`, `Dashboard.json`, `Theme.json`

### ⚙️ System Protocol (`system/`)
Runtime configuration and security schemas:
- Manifest (Config), Datasource, Driver
- Role (Hierarchy), Identity (Auth)
- Webhook (Integration), Policy (Compliance)
- Plugin Architecture, Audit, Tenant Management

**Example schemas:** `Manifest.json`, `AuthConfig.json`, `Datasource.json`, `AuditEvent.json`

### 🤖 AI Protocol (`ai/`)
AI/ML capabilities schemas:
- Agent Configuration
- Model Registry & Selection
- RAG Pipeline, NLQ (Natural Language Query)
- Workflow Automation, Predictive Analytics
- Conversation Memory & Token Management
- Cost Tracking & Budget Management

**Example schemas:** `Agent.json`, `ModelRegistry.json`, `RAGPipelineConfig.json`, `NLQRequest.json`

### 🔌 API Protocol (`api/`)
API contracts and envelopes:
- Request/Response schemas
- Error handling
- Bulk operations

**Example schemas:** `ApiEndpoint.json`, `BaseResponse.json`, `BulkRequest.json`

## Generation

These schemas are automatically generated from Zod schemas during the build process:

```bash
npm run gen:schema
```

The generation script is located at `scripts/build-schemas.ts`.

## Usage

### In TypeScript/JavaScript Projects

You can reference these JSON schemas for validation, documentation, or IDE support:

```typescript
import fieldSchema from '@objectstack/spec/json-schema/data/Field.json';
```

### In JSON Schema Tools

Use these schemas with any JSON Schema validator or documentation generator:

```bash
ajv validate -s json-schema/data/Field.json -d myfield.json
```

### In IDEs

Many IDEs support JSON schema validation. You can reference these schemas in your configuration files:

```json
{
  "$schema": "./node_modules/@objectstack/spec/json-schema/data/Object.json"
}
```

## Schema Format

All schemas are generated with:
- **Format:** JSON Schema Draft 7
- **Strategy:** Self-contained (no external `$ref`s)
- **Naming:** PascalCase matching the TypeScript type names

## Conventions

- **Configuration Keys (Properties):** `camelCase` (e.g., `maxLength`, `referenceFilters`)
- **Machine Names (Data Values):** `snake_case` (e.g., `name: 'first_name'`, `object: 'project_task'`)

## Contributing

Do not manually edit these files. They are auto-generated from the Zod schemas in `src/`.

To update schemas:
1. Edit the corresponding `.zod.ts` file in `src/{category}/`
2. Run `npm run gen:schema`
3. Commit both the Zod source and generated JSON schemas

---

**Total Schemas:** 325 (as of latest build)

For more information, see the main [README](../README.md).

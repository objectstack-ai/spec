# ObjectStack Protocol Quick Index

> **Fast navigation to all 70 protocol specifications**

Last Updated: 2026-01-27

## Quick Links

| Category | Count | Documentation | Source Code |
| :--- | :---: | :--- | :--- |
| **Data** | 8 | [docs/references/data/](./content/docs/references/data/) | [src/data/](./packages/spec/src/data/) |
| **UI** | 10 | [docs/references/ui/](./content/docs/references/ui/) | [src/ui/](./packages/spec/src/ui/) |
| **System** | 14 | [docs/references/system/](./content/docs/references/system/) | [src/system/](./packages/spec/src/system/) |
| **AI** | 8 | [docs/references/ai/](./content/docs/references/ai/) | [src/ai/](./packages/spec/src/ai/) |
| **API** | 6 | [docs/references/api/](./content/docs/references/api/) | [src/api/](./packages/spec/src/api/) |
| **Automation** | 7 | [docs/references/automation/](./content/docs/references/automation/) | [src/automation/](./packages/spec/src/automation/) |
| **Auth** | 6 | [docs/references/auth/](./content/docs/references/auth/) | [src/auth/](./packages/spec/src/auth/) |
| **Permission** | 4 | [docs/references/permission/](./content/docs/references/permission/) | [src/permission/](./packages/spec/src/permission/) |
| **Hub** | 5 | [docs/references/hub/](./content/docs/references/hub/) | [src/hub/](./packages/spec/src/hub/) |
| **Shared** | 1 | [docs/references/shared/](./content/docs/references/shared/) | [src/shared/](./packages/spec/src/shared/) |
| **Stack** | 1 | — | [src/stack.zod.ts](./packages/spec/src/stack.zod.ts) |

## Data Protocol (8 protocols)

| Protocol | File | Description |
| :--- | :--- | :--- |
| **Field** | [field.zod.ts](./packages/spec/src/data/field.zod.ts) | 44 field types for data modeling |
| **Object** | [object.zod.ts](./packages/spec/src/data/object.zod.ts) | Object/table definitions |
| **Query** | [query.zod.ts](./packages/spec/src/data/query.zod.ts) | Query AST with advanced features |
| **Validation** | [validation.zod.ts](./packages/spec/src/data/validation.zod.ts) | Validation rules |
| **Filter** | [filter.zod.ts](./packages/spec/src/data/filter.zod.ts) | Query filtering |
| **Dataset** | [dataset.zod.ts](./packages/spec/src/data/dataset.zod.ts) | Dataset definitions |
| **Mapping** | [mapping.zod.ts](./packages/spec/src/data/mapping.zod.ts) | Field mappings |
| **Hook** | [hook.zod.ts](./packages/spec/src/data/hook.zod.ts) | Lifecycle hooks |

## UI Protocol (10 protocols)

| Protocol | File | Description |
| :--- | :--- | :--- |
| **View** | [view.zod.ts](./packages/spec/src/ui/view.zod.ts) | List/form views |
| **Page** | [page.zod.ts](./packages/spec/src/ui/page.zod.ts) | FlexiPage layouts |
| **App** | [app.zod.ts](./packages/spec/src/ui/app.zod.ts) | App navigation |
| **Dashboard** | [dashboard.zod.ts](./packages/spec/src/ui/dashboard.zod.ts) | Dashboard layouts |
| **Report** | [report.zod.ts](./packages/spec/src/ui/report.zod.ts) | Report definitions |
| **Action** | [action.zod.ts](./packages/spec/src/ui/action.zod.ts) | UI actions |
| **Component** | [component.zod.ts](./packages/spec/src/ui/component.zod.ts) | Reusable components |
| **Block** | [block.zod.ts](./packages/spec/src/ui/block.zod.ts) | UI blocks |
| **Theme** | [theme.zod.ts](./packages/spec/src/ui/theme.zod.ts) | Theming system |
| **Widget** | [widget.zod.ts](./packages/spec/src/ui/widget.zod.ts) | Custom widgets |

## System Protocol (14 protocols)

| Protocol | File | Description |
| :--- | :--- | :--- |
| **Manifest** | [manifest.zod.ts](./packages/spec/src/system/manifest.zod.ts) | Package manifest |
| **Datasource** | [datasource.zod.ts](./packages/spec/src/system/datasource.zod.ts) | Data source config |
| **Driver** | [driver.zod.ts](./packages/spec/src/system/driver.zod.ts) | Database drivers |
| **PostgreSQL** | [driver/postgres.zod.ts](./packages/spec/src/system/driver/postgres.zod.ts) | PostgreSQL driver |
| **MongoDB** | [driver/mongo.zod.ts](./packages/spec/src/system/driver/mongo.zod.ts) | MongoDB driver |
| **Plugin** | [plugin.zod.ts](./packages/spec/src/system/plugin.zod.ts) | Plugin interface |
| **Context** | [context.zod.ts](./packages/spec/src/system/context.zod.ts) | Kernel context |
| **Events** | [events.zod.ts](./packages/spec/src/system/events.zod.ts) | Event bus |
| **Job** | [job.zod.ts](./packages/spec/src/system/job.zod.ts) | Background jobs |
| **Audit** | [audit.zod.ts](./packages/spec/src/system/audit.zod.ts) | Audit logging |
| **Logger** | [logger.zod.ts](./packages/spec/src/system/logger.zod.ts) | Logging config |
| **Translation** | [translation.zod.ts](./packages/spec/src/system/translation.zod.ts) | i18n support |
| **Feature** | [feature.zod.ts](./packages/spec/src/system/feature.zod.ts) | Feature flags |
| **Storage** | [scoped-storage.zod.ts](./packages/spec/src/system/scoped-storage.zod.ts) | Key-value storage |

## AI Protocol (8 protocols)

| Protocol | File | Description |
| :--- | :--- | :--- |
| **Agent** | [agent.zod.ts](./packages/spec/src/ai/agent.zod.ts) | AI agent definitions |
| **Model Registry** | [model-registry.zod.ts](./packages/spec/src/ai/model-registry.zod.ts) | LLM model registry |
| **RAG Pipeline** | [rag-pipeline.zod.ts](./packages/spec/src/ai/rag-pipeline.zod.ts) | RAG workflows |
| **NLQ** | [nlq.zod.ts](./packages/spec/src/ai/nlq.zod.ts) | Natural language query |
| **Conversation** | [conversation.zod.ts](./packages/spec/src/ai/conversation.zod.ts) | Conversation mgmt |
| **Cost** | [cost.zod.ts](./packages/spec/src/ai/cost.zod.ts) | Cost tracking |
| **Predictive** | [predictive.zod.ts](./packages/spec/src/ai/predictive.zod.ts) | Predictive models |
| **Orchestration** | [orchestration.zod.ts](./packages/spec/src/ai/orchestration.zod.ts) | AI orchestration |

## API Protocol (6 protocols)

| Protocol | File | Description |
| :--- | :--- | :--- |
| **Contract** | [contract.zod.ts](./packages/spec/src/api/contract.zod.ts) | API contracts |
| **Endpoint** | [endpoint.zod.ts](./packages/spec/src/api/endpoint.zod.ts) | REST endpoints |
| **Router** | [router.zod.ts](./packages/spec/src/api/router.zod.ts) | API routing |
| **OData** | [odata.zod.ts](./packages/spec/src/api/odata.zod.ts) | OData support |
| **Realtime** | [realtime.zod.ts](./packages/spec/src/api/realtime.zod.ts) | Real-time subscriptions |
| **Discovery** | [discovery.zod.ts](./packages/spec/src/api/discovery.zod.ts) | API discovery |

## Automation Protocol (7 protocols)

| Protocol | File | Description |
| :--- | :--- | :--- |
| **Flow** | [flow.zod.ts](./packages/spec/src/automation/flow.zod.ts) | Visual workflows |
| **Workflow** | [workflow.zod.ts](./packages/spec/src/automation/workflow.zod.ts) | Workflow rules |
| **Approval** | [approval.zod.ts](./packages/spec/src/automation/approval.zod.ts) | Approval processes |
| **Webhook** | [webhook.zod.ts](./packages/spec/src/automation/webhook.zod.ts) | Webhooks |
| **ETL** | [etl.zod.ts](./packages/spec/src/automation/etl.zod.ts) | ETL pipelines |
| **Sync** | [sync.zod.ts](./packages/spec/src/automation/sync.zod.ts) | Data sync |
| **Connector** | [connector.zod.ts](./packages/spec/src/automation/connector.zod.ts) | External connectors |

## Auth Protocol (6 protocols)

| Protocol | File | Description |
| :--- | :--- | :--- |
| **Identity** | [identity.zod.ts](./packages/spec/src/auth/identity.zod.ts) | User identity |
| **Role** | [role.zod.ts](./packages/spec/src/auth/role.zod.ts) | Role definitions |
| **Organization** | [organization.zod.ts](./packages/spec/src/auth/organization.zod.ts) | Multi-org |
| **Policy** | [policy.zod.ts](./packages/spec/src/auth/policy.zod.ts) | Security policies |
| **Config** | [config.zod.ts](./packages/spec/src/auth/config.zod.ts) | OAuth/SAML/SSO |
| **SCIM** | [scim.zod.ts](./packages/spec/src/auth/scim.zod.ts) | SCIM provisioning |

## Permission Protocol (4 protocols)

| Protocol | File | Description |
| :--- | :--- | :--- |
| **Permission** | [permission.zod.ts](./packages/spec/src/permission/permission.zod.ts) | Object permissions |
| **Sharing** | [sharing.zod.ts](./packages/spec/src/permission/sharing.zod.ts) | Sharing rules |
| **RLS** | [rls.zod.ts](./packages/spec/src/permission/rls.zod.ts) | Row-level security |
| **Territory** | [territory.zod.ts](./packages/spec/src/permission/territory.zod.ts) | Territories |

## Hub Protocol (5 protocols)

| Protocol | File | Description |
| :--- | :--- | :--- |
| **Marketplace** | [marketplace.zod.ts](./packages/spec/src/hub/marketplace.zod.ts) | Plugin marketplace |
| **Composer** | [composer.zod.ts](./packages/spec/src/hub/composer.zod.ts) | Dependency mgmt |
| **License** | [license.zod.ts](./packages/spec/src/hub/license.zod.ts) | Feature licensing |
| **Tenant** | [tenant.zod.ts](./packages/spec/src/hub/tenant.zod.ts) | Multi-tenancy |
| **Space** | [space.zod.ts](./packages/spec/src/hub/space.zod.ts) | Workspace mgmt |

## Shared Protocol (1 protocol)

| Protocol | File | Description |
| :--- | :--- | :--- |
| **Identifiers** | [identifiers.zod.ts](./packages/spec/src/shared/identifiers.zod.ts) | Common identifiers |

## Stack Protocol (1 protocol)

| Protocol | File | Description |
| :--- | :--- | :--- |
| **Stack** | [stack.zod.ts](./packages/spec/src/stack.zod.ts) | Root stack definition |

## Documentation Resources

- **[PROTOCOL_REFERENCE.md](./PROTOCOL_REFERENCE.md)** - Detailed reference with examples
- **[PROTOCOL_ORGANIZATION.md](./PROTOCOL_ORGANIZATION.md)** - Visual diagrams and relationships
- **[README.md](./README.md)** - Project overview
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[content/docs/references/](./content/docs/references/)** - Generated API documentation (473 files)

## How to Use

### View Source Code
```bash
# View a protocol definition
cat packages/spec/src/data/field.zod.ts

# Search for specific schema
grep -r "FieldSchema" packages/spec/src/
```

### Import in Code
```typescript
import { FieldSchema, ObjectSchema } from '@objectstack/spec/data';
import { ViewSchema, AppSchema } from '@objectstack/spec/ui';
import { ManifestSchema } from '@objectstack/spec/system';
```

### Generate JSON Schema
```bash
# Build generates JSON schemas
pnpm --filter @objectstack/spec build

# Output location
ls packages/spec/json-schema/
```

### Generate Documentation
```bash
# Generate reference docs
pnpm --filter @objectstack/spec gen:docs

# Output location
ls content/docs/references/
```

## Version Information

- **Protocol Version:** 0.3.3
- **Total Protocols:** 70
- **Generated Documentation Files:** 473
- **Last Updated:** 2026-01-27

---

**See Also:**
- [Contributing Guide](./CONTRIBUTING.md)
- [Development Roadmap](./internal/planning/DEVELOPMENT_ROADMAP.md)
- [Protocol Extensions](./PROTOCOL_EXTENSIONS_COMPLETED.md)

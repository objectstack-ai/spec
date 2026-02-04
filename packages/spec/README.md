# @objectstack/spec

The **Source of Truth** for the ObjectStack Protocol. Contains strictly typed Zod schemas that define every aspect of the system.

## Protocols

- **System**: Manifests, Datasources, APIs.
- **Data**: Objects, Fields, Validation Rules.
- **UI**: Views, Layouts, Dashboards.
- **Automation**: Flows, Workflows, Triggers.
- **AI**: Agents, RAG Pipelines, Models.

## Usage

```typescript
import { ObjectSchema, ViewSchema } from '@objectstack/spec';

// Validate a JSON object against the schema
const result = ObjectSchema.parse(myObjectDefinition);
```

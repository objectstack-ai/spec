# @objectstack/spec

The **Source of Truth** for the ObjectStack Protocol. Contains strictly typed Zod schemas that define every aspect of the system.

## Protocols

- **System**: Manifests, Datasources, APIs.
- **Data**: Objects, Fields, Validation Rules.
- **UI**: Views, Layouts, Dashboards.
- **Automation**: Flows, Workflows, Triggers.
- **AI**: Agents, RAG Pipelines, Models.

## Usage

**Recommended: Use `ObjectSchema.create()` with `Field.*` helpers for strict TypeScript validation:**

```typescript
import { ObjectSchema, Field } from '@objectstack/spec/data';

// Create a validated object definition with type checking
export const Task = ObjectSchema.create({
  name: 'task',
  label: 'Task',
  icon: 'check-square',
  
  fields: {
    title: Field.text({
      label: 'Title',
      required: true,
      maxLength: 200,
    }),
    
    status: Field.select({
      label: 'Status',
      options: [
        { label: 'To Do', value: 'todo', default: true },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Done', value: 'done' },
      ],
    }),
  },
  
  enable: {
    trackHistory: true,
    apiEnabled: true,
  },
});
```

**Alternative: Runtime validation of existing objects:**

```typescript
import { ObjectSchema } from '@objectstack/spec/data';

// Validate a JSON object against the schema
const result = ObjectSchema.parse(myObjectDefinition);
if (result.success) {
  console.log('Valid object:', result.data);
}
```

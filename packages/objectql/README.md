# @objectstack/objectql

The **Data Engine** for ObjectStack. It acts as a semantic layer between your application code and the underlying database.

## Features

- **Universal API**: A consistent query interface (`find`, `insert`, `update`, `delete`) regardless of the storage backend.
- **Schema Validation**: Enforces Zod schemas defined in `@objectstack/spec`.
- **Query Resolution**: Translates ObjectStack queries into driver-specific commands.
- **Driver Architecture**: Pluggable storage (Memory, MongoDB, SQL, etc.).

## Usage

```typescript
import { ObjectQL } from '@objectstack/objectql';

// Querying data
const engine = kernel.getService('objectql');
const users = await engine.find('user', {
    where: { role: 'admin' },
    top: 10
});
```

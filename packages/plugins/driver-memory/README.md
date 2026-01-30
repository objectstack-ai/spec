# @objectstack/driver-memory

In-Memory Driver for ObjectStack. A reference implementation of the DriverInterface that stores data in memory using JavaScript arrays.

## Plugin Capabilities

This driver implements the ObjectStack plugin capability protocol:
- **Type**: `driver`
- **Protocol**: `com.objectstack.protocol.storage.v1` (partial conformance)
- **Provides**: `DriverInterface` for data storage operations
- **Features**: 
  - ✅ Basic CRUD operations
  - ✅ Pagination (limit/offset)
  - ❌ Advanced query filters
  - ❌ Aggregations
  - ❌ Sorting
  - ❌ Transactions
  - ❌ Joins

See [objectstack.config.ts](./objectstack.config.ts) for the complete capability manifest.

## Features

- 🚀 **Zero Dependencies**: Pure JavaScript implementation
- 🧪 **Perfect for Testing**: Volatile storage ideal for unit tests
- 📝 **TypeScript First**: Fully typed with TypeScript
- 🔍 **Reference Implementation**: Clean example of DriverInterface
- ⚡ **Fast**: In-memory operations are lightning fast

## Installation

```bash
pnpm add @objectstack/driver-memory
```

## Usage

### With ObjectStack Runtime

```typescript
import { InMemoryDriver } from '@objectstack/driver-memory';
import { DriverPlugin } from '@objectstack/runtime';
import { ObjectKernel } from '@objectstack/runtime';

const kernel = new ObjectKernel();

// Create and register the driver
const memoryDriver = new InMemoryDriver();
kernel.use(new DriverPlugin(memoryDriver, 'memory'));

await kernel.bootstrap();
```

### Standalone Usage

```typescript
import { InMemoryDriver } from '@objectstack/driver-memory';

const driver = new InMemoryDriver({
  seedData: true  // Pre-populate with example data
});

// Initialize
await driver.connect();

// Create a record
const user = await driver.create('user', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Find records
const users = await driver.find('user', {
  limit: 10,
  offset: 0
});

// Get by ID
const foundUser = await driver.findOne('user', user.id);

// Update
await driver.update('user', user.id, {
  name: 'Jane Doe'
});

// Delete
await driver.delete('user', user.id);

// Count
const count = await driver.count('user');

// Cleanup
await driver.disconnect();
```

## API Reference

### InMemoryDriver

The main driver class that implements `DriverInterface`.

#### Constructor Options

```typescript
interface DriverOptions {
  /**
   * Pre-populate the database with example data on startup
   * @default false
   */
  seedData?: boolean;
  
  /**
   * Logger instance
   */
  logger?: Logger;
}
```

#### Methods

- `connect()` - Initialize the driver (no-op for in-memory)
- `disconnect()` - Cleanup resources (clears all data)
- `create(object, data)` - Create a new record
- `find(object, query?)` - Query records with optional pagination
- `findOne(object, id)` - Get a single record by ID
- `update(object, id, data)` - Update a record
- `delete(object, id)` - Delete a record
- `count(object, query?)` - Count total records
- `getSchema(object)` - Get object schema definition
- `query(query)` - Execute a raw query (limited support)

#### Capabilities

The driver declares its capabilities via the `supports` property:

```typescript
{
  transactions: false,
  queryFilters: false,
  queryAggregations: false,
  querySorting: false,
  queryPagination: true,  // ✅ Supported via limit/offset
  queryWindowFunctions: false,
  querySubqueries: false,
  joins: false,
  fullTextSearch: false,
  vectorSearch: false,
  geoSpatial: false
}
```

## Data Storage

The in-memory driver stores data in a simple Map structure:

```typescript
private tables: Map<string, Array<Record<string, any>>> = new Map();
```

**Important**: All data is lost when the process exits or `disconnect()` is called. This driver is **not suitable for production use**.

## Use Cases

✅ **Good for:**
- Unit testing
- Integration testing
- Development/prototyping
- CI/CD pipelines
- Examples and tutorials
- Learning ObjectStack

❌ **Not suitable for:**
- Production environments
- Data persistence requirements
- Large datasets (memory constraints)
- Multi-process scenarios
- Concurrent write operations

## Testing Example

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InMemoryDriver } from '@objectstack/driver-memory';

describe('User CRUD', () => {
  let driver: InMemoryDriver;

  beforeEach(async () => {
    driver = new InMemoryDriver();
    await driver.connect();
  });

  afterEach(async () => {
    await driver.disconnect();
  });

  it('should create and retrieve a user', async () => {
    const user = await driver.create('user', {
      name: 'Test User',
      email: 'test@example.com'
    });

    expect(user.id).toBeDefined();
    
    const found = await driver.findOne('user', user.id);
    expect(found.name).toBe('Test User');
  });
});
```

## Relationship to Other Drivers

This driver serves as a reference implementation. For production use, consider:

- **@objectstack/driver-postgres** - PostgreSQL driver with full SQL capabilities
- **@objectstack/driver-mongodb** - MongoDB driver for document storage
- **@objectstack/driver-redis** - Redis driver for caching and key-value storage

## License

Apache-2.0

## Related Packages

- [@objectstack/runtime](../../runtime) - ObjectStack Runtime
- [@objectstack/spec](../../spec) - ObjectStack Specifications
- [@objectstack/core](../../core) - Core Interfaces and Types

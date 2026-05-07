# @objectstack/driver-mongodb

MongoDB driver for ObjectStack — native document database support via the official MongoDB Node.js driver.

## Installation

```bash
pnpm add @objectstack/driver-mongodb mongodb
```

## Configuration

```typescript
import { defineStack } from '@objectstack/spec';
import { MongoDBDriver } from '@objectstack/driver-mongodb';

export default defineStack({
  driver: new MongoDBDriver({
    url: 'mongodb://localhost:27017/myapp',
    database: 'myapp',        // Optional: overrides URI database
    maxPoolSize: 10,          // Optional: connection pool size (default: 10)
    minPoolSize: 1,           // Optional: minimum pool (default: 1)
    connectTimeoutMS: 10000,  // Optional: connection timeout
  }),
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | **required** | MongoDB connection URI |
| `database` | `string` | from URI | Database name |
| `maxPoolSize` | `number` | `10` | Max connection pool size |
| `minPoolSize` | `number` | `1` | Min connection pool size |
| `connectTimeoutMS` | `number` | `10000` | Connection timeout (ms) |
| `serverSelectionTimeoutMS` | `number` | `5000` | Server selection timeout (ms) |
| `options` | `MongoClientOptions` | `{}` | Additional MongoClient options |

## Features

### Capabilities

| Category | Capability | Supported |
|----------|-----------|-----------|
| **CRUD** | create, read, update, delete | ✅ |
| **Bulk** | bulkCreate, bulkUpdate, bulkDelete | ✅ |
| **Query** | filters, sorting, pagination, aggregations | ✅ |
| **Transactions** | Multi-document transactions | ✅ (requires replica set) |
| **Streaming** | Cursor-based async iteration | ✅ |
| **Schema** | Collection + index sync | ✅ |
| **Advanced** | Full-text search, JSON queries, geospatial | ✅ |
| **Joins** | Cross-collection joins ($lookup) | ❌ |
| **Window Functions** | ROW_NUMBER, RANK, etc. | ❌ |

### ID Handling

ObjectStack uses string IDs (nanoid). The driver:
- Stores `id` as a regular string field with a unique index
- Auto-generates `id` via nanoid if not provided
- **Never exposes** MongoDB's internal `_id` field in results

### Filter Operators

All ObjectStack filter operators are supported:

```typescript
// MongoDB-style filters (pass-through)
await driver.find('task', {
  where: {
    status: { $in: ['active', 'pending'] },
    priority: { $gte: 3 },
    title: { $contains: 'urgent' },
    deleted_at: { $null: true },
  }
});

// Legacy array-style filters
await driver.find('task', {
  where: [['status', '=', 'active'], 'or', ['priority', '>=', 5]]
});
```

### Transactions

Transactions require a MongoDB **replica set** (including single-node replica sets for development).

```typescript
const session = await driver.beginTransaction();
try {
  await driver.create('order', { total: 100 }, { transaction: session });
  await driver.update('inventory', itemId, { stock: newStock }, { transaction: session });
  await driver.commit(session);
} catch (error) {
  await driver.rollback(session);
  throw error;
}
```

### Schema Sync

Schema sync creates collections and indexes:

```typescript
await driver.syncSchema('account', {
  name: 'account',
  fields: {
    name: { type: 'string', unique: true },
    email: { type: 'email', indexed: true },
    company_id: { type: 'lookup', reference_to: 'company' },
  },
});
// Creates: idx_id_unique, idx_name_unique, idx_email, idx_company_id_lookup
```

### Aggregation

```typescript
const results = await driver.aggregate('order', {
  where: { status: 'completed' },
  aggregations: [
    { function: 'sum', field: 'amount', alias: 'total_revenue' },
    { function: 'count', alias: 'order_count' },
  ],
  groupBy: ['region'],
});
```

## Plugin Usage

Register as an ObjectStack plugin:

```typescript
import mongodbPlugin from '@objectstack/driver-mongodb';

// The plugin registers automatically via onEnable
kernel.use(mongodbPlugin, {
  url: 'mongodb://localhost:27017/myapp',
});
```

## Development

```bash
# Run tests
pnpm test

# Build
pnpm build
```

## License

Apache-2.0

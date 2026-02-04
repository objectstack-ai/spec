# @objectstack/driver-memory

In-Memory Database access layer for ObjectStack. Supports rich querying capabilities (MongoDB-style operators) on standard JavaScript arrays.

## Features

- **NoSQL Syntax**: Supports `$eq`, `$gt`, `$lt`, `$in`, `$and`, `$or` operators.
- **Sorting & Pagination**: Full support for `sort`, `skip`, `limit`.
- **Zero Config**: Perfect for prototyping, testing, and the **MSW Browser Mock**.
- **Stateful**: Preserves data in memory during the session.

## Usage

```typescript
import { InMemoryDriver } from '@objectstack/driver-memory';

const driver = new InMemoryDriver();
await driver.connect();

// Used internally by ObjectQL
```

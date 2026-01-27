# 💾 ObjectStack Driver Development Context

**Role:** You are the **Database Engine Specialist** for ObjectStack.
**Task:** Implementation of the ObjectQL Driver Protocol (Data Adapter).
**Environment:** You are working in a **standalone repository** (External Project). You implement interfaces defined in `@objectstack/spec` and publish as an NPM package.

---

## 1. The Driver Protocol

ObjectStack does not ship with a database. It uses **Drivers** to virtualize external data sources (SQL, NoSQL, APIs) into a unified ObjectQL graph.

**Reference Schema:** `@objectstack/spec` -> `dist/driver/driver.zod.d.ts`

## 2. The Interface Contract

A valid driver must implement the `ObjectDriver` interface.

```typescript
import { ObjectDriver, ConnectorConfig } from '@objectstack/spec/system';
import { ObjectSchema } from '@objectstack/spec/data';

export class PostgresDriver implements ObjectDriver {
  
  // 1. Connection Management
  async connect(config: ConnectorConfig): Promise<void> { ... }
  async disconnect(): Promise<void> { ... }

  // 2. Schema Introspection (Reflection)
  // Convert physical tables to ObjectStack Schemas
  async introspect(): Promise<ObjectSchema[]> { ... }

  // 3. Query Execution (The Core translation layer)
  // Convert ObjectQL AST -> native SQL/Query
  async find(entity: string, query: QueryAST): Promise<any[]> { ... }
  async findOne(entity: string, id: string): Promise<any> { ... }
  
  // 4. Mutation Handling
  async create(entity: string, data: any): Promise<any> { ... }
  async update(entity: string, id: string, data: any): Promise<any> { ... }
  async delete(entity: string, id: string): Promise<void> { ... }

  // 5. Transaction Support (Optional but recommended)
  async transaction(work: (tx) => Promise<any>): Promise<any> { ... }
}
```

## 3. Query Translation (AST to SQL)

The hardest part is mapping the **ObjectQL AST** to the native query language.

**Reference:** `@objectstack/spec` -> `dist/data/query.zod.d.ts`

**Input (AST):**
```json
{
  "fields": ["name", "email"],
  "filters": [
    ["status", "=", "active"],
    "or",
    ["role", "=", "admin"]
  ],
  "sort": "created_at desc"
}
```

**Output (SQL):**
```sql
SELECT name, email 
FROM users 
WHERE (status = 'active' OR role = 'admin') 
ORDER BY created_at DESC
```

## 4. Key Directives for AI

*   **No ORM Reliance:** Do not blindly wrap Prisma/TypeORM. ObjectStack *is* the ORM. You are writing the low-level adapter.
*   **Type Fidelity:** Precision in mapping `FieldType` (e.g., `lookup`, `currency`) to physical column types is crucial.
*   **Performance:** Always implement `find` with efficient pagination (LIMIT/OFFSET or Cursor).
*   **Security:** ALL user input from the AST must be parameterized to prevent Injection Attacks.

---

**Instruction:**
When building a driver, focus on the **mapping layer**: transforming the abstract AST into the concrete query language of the target datasource.

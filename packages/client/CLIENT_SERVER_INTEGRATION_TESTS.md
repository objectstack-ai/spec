# @objectstack/client - Server Integration Test Specification

## Overview

This document defines comprehensive integration tests for validating `@objectstack/client` against a live ObjectStack server implementation. These tests verify that the client SDK correctly communicates with the server across all API namespaces.

---

## Test Environment Setup

### Prerequisites

1. **Server Requirements:**
   - ObjectStack server instance running
   - Test database (SQLite/Postgres) with sample data
   - All core services enabled (metadata, data, auth)
   - Optional services enabled (workflow, ai, realtime, etc.)

2. **Client Configuration:**
   ```typescript
   const testConfig: ClientConfig = {
     baseUrl: process.env.TEST_SERVER_URL || 'http://localhost:3000',
     token: undefined, // Will be set after login
     debug: true,
     logger: createLogger({ level: 'debug' })
   };
   ```

3. **Test Data:**
   - Sample objects: `test_contact`, `test_project`, `test_task`
   - Sample users: test@example.com (admin), user@example.com (standard)
   - Sample packages: `@test/sample-plugin`

---

## Test Suite Structure

```
packages/client/tests/integration/
├── 01-discovery.test.ts          # Discovery & connection
├── 02-auth.test.ts                # Authentication flows
├── 03-metadata.test.ts            # Metadata operations
├── 04-data-crud.test.ts           # Basic CRUD operations
├── 05-data-batch.test.ts          # Batch operations
├── 06-data-query.test.ts          # Advanced queries
├── 07-permissions.test.ts         # Permission checking
├── 08-workflow.test.ts            # Workflow operations
├── 09-realtime.test.ts            # Realtime subscriptions
├── 10-notifications.test.ts       # Notifications
├── 11-ai.test.ts                  # AI services
├── 12-i18n.test.ts                # Internationalization
├── 13-analytics.test.ts           # Analytics queries
├── 14-packages.test.ts            # Package management
├── 15-views.test.ts               # View management
├── 16-storage.test.ts             # File storage
├── 17-automation.test.ts          # Automation triggers
└── helpers/
    ├── test-server.ts             # Mock/stub server helpers
    ├── test-data.ts               # Test data generators
    └── assertions.ts              # Custom assertions
```

---

## Test Cases

### 1. Discovery & Connection (`01-discovery.test.ts`)

#### TC-DISC-001: Standard Discovery via .well-known
```typescript
describe('Discovery via .well-known', () => {
  test('should discover API from .well-known/objectstack', async () => {
    const client = new ObjectStackClient({ 
      baseUrl: 'http://localhost:3000' 
    });
    
    const discovery = await client.connect();
    
    expect(discovery.version).toBe('v1');
    expect(discovery.apiName).toBe('ObjectStack');
    expect(discovery.capabilities).toBeDefined();
    expect(discovery.endpoints).toBeDefined();
  });
});
```

#### TC-DISC-002: Fallback Discovery via /api/v1
```typescript
test('should fallback to /api/v1 when .well-known unavailable', async () => {
  // Mock .well-known to return 404
  mockServer.get('/.well-known/objectstack').reply(404);
  mockServer.get('/api/v1').reply(200, { 
    version: 'v1', 
    apiName: 'ObjectStack' 
  });
  
  const client = new ObjectStackClient({ baseUrl: mockServerUrl });
  const discovery = await client.connect();
  
  expect(discovery.version).toBe('v1');
});
```

#### TC-DISC-003: Connection Failure Handling
```typescript
test('should throw error when both discovery methods fail', async () => {
  mockServer.get('/.well-known/objectstack').reply(404);
  mockServer.get('/api/v1').reply(503);
  
  const client = new ObjectStackClient({ baseUrl: mockServerUrl });
  
  await expect(client.connect()).rejects.toThrow(/Failed to connect/);
});
```

---

### 2. Authentication (`02-auth.test.ts`)

#### TC-AUTH-001: Email/Password Login
```typescript
test('should login with email and password', async () => {
  const client = new ObjectStackClient({ baseUrl: testServerUrl });
  
  const session = await client.auth.login({
    method: 'email',
    email: 'test@example.com',
    password: 'TestPassword123!'
  });
  
  expect(session.token).toBeDefined();
  expect(session.user).toBeDefined();
  expect(session.user.email).toBe('test@example.com');
  expect(session.expiresAt).toBeDefined();
});
```

#### TC-AUTH-002: Registration
```typescript
test('should register new user account', async () => {
  const client = new ObjectStackClient({ baseUrl: testServerUrl });
  
  const session = await client.auth.register({
    email: 'newuser@example.com',
    password: 'SecurePass123!',
    firstName: 'New',
    lastName: 'User'
  });
  
  expect(session.token).toBeDefined();
  expect(session.user.email).toBe('newuser@example.com');
});
```

#### TC-AUTH-003: Token Refresh
```typescript
test('should refresh expired token', async () => {
  const client = new ObjectStackClient({ 
    baseUrl: testServerUrl,
    token: expiredToken 
  });
  
  const newSession = await client.auth.refreshToken({
    refreshToken: validRefreshToken
  });
  
  expect(newSession.token).not.toBe(expiredToken);
  expect(newSession.expiresAt).toBeGreaterThan(Date.now());
});
```

#### TC-AUTH-004: Get Current User
```typescript
test('should get current authenticated user', async () => {
  const client = new ObjectStackClient({ 
    baseUrl: testServerUrl,
    token: validToken 
  });
  
  const user = await client.auth.me();
  
  expect(user.id).toBeDefined();
  expect(user.email).toBe('test@example.com');
  expect(user.roles).toContain('admin');
});
```

#### TC-AUTH-005: Logout
```typescript
test('should logout and invalidate session', async () => {
  const client = new ObjectStackClient({ 
    baseUrl: testServerUrl,
    token: validToken 
  });
  
  await client.auth.logout();
  
  // Subsequent requests should fail with 401
  await expect(client.auth.me()).rejects.toThrow(/Unauthorized/);
});
```

---

### 3. Metadata Operations (`03-metadata.test.ts`)

#### TC-META-001: Get Metadata Types
```typescript
test('should retrieve all metadata types', async () => {
  const client = await createAuthenticatedClient();
  
  const types = await client.meta.getTypes();
  
  expect(types.types).toContain('object');
  expect(types.types).toContain('plugin');
  expect(types.types).toContain('view');
  expect(types.types).toContain('workflow');
});
```

#### TC-META-002: Get Items of Type
```typescript
test('should retrieve all objects', async () => {
  const client = await createAuthenticatedClient();
  
  const objects = await client.meta.getItems('object');
  
  expect(objects.items).toBeDefined();
  expect(objects.items.length).toBeGreaterThan(0);
  expect(objects.items[0].name).toBeDefined();
  expect(objects.items[0].label).toBeDefined();
});
```

#### TC-META-003: Get Specific Object Definition
```typescript
test('should retrieve object definition by name', async () => {
  const client = await createAuthenticatedClient();
  
  const contactObject = await client.meta.getItem('object', 'test_contact');
  
  expect(contactObject.name).toBe('test_contact');
  expect(contactObject.label).toBe('Contact');
  expect(contactObject.fields).toBeDefined();
  expect(contactObject.fields.first_name).toBeDefined();
  expect(contactObject.fields.first_name.type).toBe('text');
});
```

#### TC-META-004: Save Object Definition
```typescript
test('should create/update object definition', async () => {
  const client = await createAuthenticatedClient();
  
  const newObject = {
    name: 'test_dynamic',
    label: 'Dynamic Test',
    fields: {
      name: { type: 'text', label: 'Name', required: true },
      status: { type: 'select', label: 'Status', options: ['active', 'inactive'] }
    }
  };
  
  const saved = await client.meta.saveItem('object', 'test_dynamic', newObject);
  
  expect(saved.name).toBe('test_dynamic');
  expect(saved.fields.name).toBeDefined();
});
```

#### TC-META-005: Metadata Caching with ETag
```typescript
test('should support ETag-based caching', async () => {
  const client = await createAuthenticatedClient();
  
  // First request
  const first = await client.meta.getCached('test_contact');
  expect(first.data).toBeDefined();
  expect(first.etag).toBeDefined();
  expect(first.notModified).toBe(false);
  
  // Second request with ETag
  const second = await client.meta.getCached('test_contact', {
    ifNoneMatch: `"${first.etag!.value}"`
  });
  
  expect(second.notModified).toBe(true);
  expect(second.data).toBeUndefined();
});
```

---

### 4. Data CRUD Operations (`04-data-crud.test.ts`)

#### TC-DATA-001: Create Record
```typescript
test('should create new record', async () => {
  const client = await createAuthenticatedClient();
  
  const contact = await client.data.create('test_contact', {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890'
  });
  
  expect(contact.id).toBeDefined();
  expect(contact.first_name).toBe('John');
  expect(contact.created_at).toBeDefined();
});
```

#### TC-DATA-002: Get Record by ID
```typescript
test('should retrieve record by ID', async () => {
  const client = await createAuthenticatedClient();
  const created = await client.data.create('test_contact', testContactData);
  
  const retrieved = await client.data.get('test_contact', created.id);
  
  expect(retrieved.id).toBe(created.id);
  expect(retrieved.first_name).toBe(testContactData.first_name);
});
```

#### TC-DATA-003: Update Record
```typescript
test('should update existing record', async () => {
  const client = await createAuthenticatedClient();
  const contact = await client.data.create('test_contact', testContactData);
  
  const updated = await client.data.update('test_contact', contact.id, {
    phone: '+9876543210',
    notes: 'Updated via test'
  });
  
  expect(updated.id).toBe(contact.id);
  expect(updated.phone).toBe('+9876543210');
  expect(updated.notes).toBe('Updated via test');
  expect(updated.first_name).toBe(testContactData.first_name); // Unchanged
});
```

#### TC-DATA-004: Delete Record
```typescript
test('should delete record', async () => {
  const client = await createAuthenticatedClient();
  const contact = await client.data.create('test_contact', testContactData);
  
  await client.data.delete('test_contact', contact.id);
  
  await expect(
    client.data.get('test_contact', contact.id)
  ).rejects.toThrow(/Not Found|404/);
});
```

#### TC-DATA-005: Find Records with Filters
```typescript
test('should find records with filters', async () => {
  const client = await createAuthenticatedClient();
  
  // Create test data
  await client.data.create('test_contact', { first_name: 'Alice', status: 'active' });
  await client.data.create('test_contact', { first_name: 'Bob', status: 'inactive' });
  await client.data.create('test_contact', { first_name: 'Charlie', status: 'active' });
  
  const results = await client.data.find('test_contact', {
    filters: { status: 'active' },
    sort: 'first_name',
    top: 10
  });
  
  expect(results.data.length).toBe(2);
  expect(results.data[0].first_name).toBe('Alice');
  expect(results.data[1].first_name).toBe('Charlie');
  expect(results.total).toBeGreaterThanOrEqual(2);
});
```

#### TC-DATA-006: Pagination
```typescript
test('should support pagination', async () => {
  const client = await createAuthenticatedClient();
  
  // Create 25 test contacts
  for (let i = 0; i < 25; i++) {
    await client.data.create('test_contact', {
      first_name: `Contact${i}`,
      email: `contact${i}@example.com`
    });
  }
  
  // Page 1
  const page1 = await client.data.find('test_contact', {
    top: 10,
    skip: 0,
    sort: 'first_name'
  });
  expect(page1.data.length).toBe(10);
  expect(page1.hasMore).toBe(true);
  
  // Page 2
  const page2 = await client.data.find('test_contact', {
    top: 10,
    skip: 10,
    sort: 'first_name'
  });
  expect(page2.data.length).toBe(10);
  expect(page2.data[0].first_name).not.toBe(page1.data[0].first_name);
});
```

---

### 5. Batch Operations (`05-data-batch.test.ts`)

#### TC-BATCH-001: Create Many Records
```typescript
test('should create multiple records', async () => {
  const client = await createAuthenticatedClient();
  
  const contacts = [
    { first_name: 'Alice', email: 'alice@example.com' },
    { first_name: 'Bob', email: 'bob@example.com' },
    { first_name: 'Charlie', email: 'charlie@example.com' }
  ];
  
  const created = await client.data.createMany('test_contact', contacts);
  
  expect(created.length).toBe(3);
  expect(created[0].id).toBeDefined();
  expect(created[0].first_name).toBe('Alice');
});
```

#### TC-BATCH-002: Update Many Records
```typescript
test('should update multiple records', async () => {
  const client = await createAuthenticatedClient();
  
  // Create test records
  const c1 = await client.data.create('test_contact', { first_name: 'Test1' });
  const c2 = await client.data.create('test_contact', { first_name: 'Test2' });
  
  const result = await client.data.updateMany('test_contact', [
    { id: c1.id, data: { status: 'updated' } },
    { id: c2.id, data: { status: 'updated' } }
  ]);
  
  expect(result.success).toBe(true);
  expect(result.successCount).toBe(2);
  expect(result.failedCount).toBe(0);
});
```

#### TC-BATCH-003: Delete Many Records
```typescript
test('should delete multiple records', async () => {
  const client = await createAuthenticatedClient();
  
  const c1 = await client.data.create('test_contact', { first_name: 'Delete1' });
  const c2 = await client.data.create('test_contact', { first_name: 'Delete2' });
  
  const result = await client.data.deleteMany('test_contact', [c1.id, c2.id]);
  
  expect(result.success).toBe(true);
  expect(result.successCount).toBe(2);
  
  await expect(client.data.get('test_contact', c1.id)).rejects.toThrow();
  await expect(client.data.get('test_contact', c2.id)).rejects.toThrow();
});
```

#### TC-BATCH-004: Mixed Batch Operations
```typescript
test('should execute mixed batch operations', async () => {
  const client = await createAuthenticatedClient();
  
  const existing = await client.data.create('test_contact', { first_name: 'Existing' });
  
  const batchRequest: BatchUpdateRequest = {
    operations: [
      { action: 'create', data: { first_name: 'New1' } },
      { action: 'update', id: existing.id, data: { first_name: 'Updated' } },
      { action: 'create', data: { first_name: 'New2' } }
    ],
    options: { 
      continueOnError: true,
      returnData: true 
    }
  };
  
  const result = await client.data.batch('test_contact', batchRequest);
  
  expect(result.success).toBe(true);
  expect(result.successCount).toBe(3);
  expect(result.results).toHaveLength(3);
});
```

#### TC-BATCH-005: Transaction Rollback on Error
```typescript
test('should rollback batch on error when continueOnError=false', async () => {
  const client = await createAuthenticatedClient();
  
  const batchRequest: BatchUpdateRequest = {
    operations: [
      { action: 'create', data: { first_name: 'Valid1' } },
      { action: 'update', id: 'invalid-id', data: { first_name: 'Invalid' } }, // This will fail
      { action: 'create', data: { first_name: 'Valid2' } }
    ],
    options: { 
      continueOnError: false,
      transactional: true 
    }
  };
  
  await expect(
    client.data.batch('test_contact', batchRequest)
  ).rejects.toThrow();
  
  // Verify no records were created (rolled back)
  const all = await client.data.find('test_contact', {
    filters: { first_name: ['Valid1', 'Valid2'] }
  });
  expect(all.data.length).toBe(0);
});
```

---

### 6. Advanced Queries (`06-data-query.test.ts`)

#### TC-QUERY-001: ObjectQL AST Query
```typescript
test('should execute ObjectQL AST query', async () => {
  const client = await createAuthenticatedClient();
  
  const query: Partial<QueryAST> = {
    object: 'test_contact',
    filter: {
      and: [
        { field: 'status', operator: 'eq', value: 'active' },
        { field: 'created_at', operator: 'gte', value: '2024-01-01' }
      ]
    },
    sort: [
      { field: 'last_name', direction: 'asc' },
      { field: 'first_name', direction: 'asc' }
    ],
    pagination: { limit: 20, offset: 0 }
  };
  
  const results = await client.data.query('test_contact', query);
  
  expect(results.data).toBeDefined();
  expect(results.total).toBeGreaterThanOrEqual(0);
});
```

#### TC-QUERY-002: Query with Joins/Lookups
```typescript
test('should query with lookup field expansion', async () => {
  const client = await createAuthenticatedClient();
  
  // Create related data
  const project = await client.data.create('test_project', { name: 'Test Project' });
  const task = await client.data.create('test_task', {
    title: 'Test Task',
    project_id: project.id
  });
  
  const query: Partial<QueryAST> = {
    object: 'test_task',
    expand: ['project_id'], // Expand the lookup field
    filter: { field: 'id', operator: 'eq', value: task.id }
  };
  
  const results = await client.data.query('test_task', query);
  
  expect(results.data[0].project_id).toBeDefined();
  expect(results.data[0].project_id.name).toBe('Test Project');
});
```

#### TC-QUERY-003: Aggregation Query
```typescript
test('should execute aggregation query', async () => {
  const client = await createAuthenticatedClient();
  
  const query: Partial<QueryAST> = {
    object: 'test_contact',
    aggregations: [
      { function: 'count', alias: 'total_contacts' },
      { function: 'count', field: 'status', alias: 'contacts_with_status' }
    ],
    groupBy: ['status']
  };
  
  const results = await client.data.query('test_contact', query);
  
  expect(results.aggregations).toBeDefined();
  expect(results.aggregations!.total_contacts).toBeGreaterThan(0);
});
```

---

### 7. Permissions (`07-permissions.test.ts`)

#### TC-PERM-001: Check Create Permission
```typescript
test('should check if user can create records', async () => {
  const client = await createAuthenticatedClient();
  
  const result = await client.permissions.check({
    object: 'test_contact',
    action: 'create'
  });
  
  expect(result.allowed).toBe(true);
  expect(result.deniedFields).toBeUndefined();
});
```

#### TC-PERM-002: Get Object Permissions
```typescript
test('should retrieve object-level permissions', async () => {
  const client = await createAuthenticatedClient();
  
  const perms = await client.permissions.getObjectPermissions('test_contact');
  
  expect(perms.object).toBe('test_contact');
  expect(perms.permissions).toBeDefined();
  expect(perms.fieldPermissions).toBeDefined();
});
```

#### TC-PERM-003: Get Effective Permissions
```typescript
test('should get effective permissions for current user', async () => {
  const client = await createAuthenticatedClient();
  
  const effective = await client.permissions.getEffectivePermissions('test_contact');
  
  expect(effective.canCreate).toBeDefined();
  expect(effective.canRead).toBeDefined();
  expect(effective.canEdit).toBeDefined();
  expect(effective.canDelete).toBeDefined();
  expect(effective.fields).toBeDefined();
});
```

---

### 8. Workflow (`08-workflow.test.ts`)

#### TC-WF-001: Get Workflow Configuration
```typescript
test('should retrieve workflow rules for object', async () => {
  const client = await createAuthenticatedClient();
  
  const config = await client.workflow.getConfig('test_approval');
  
  expect(config.object).toBe('test_approval');
  expect(config.states).toBeDefined();
  expect(config.transitions).toBeDefined();
});
```

#### TC-WF-002: Get Workflow State
```typescript
test('should get current workflow state and available transitions', async () => {
  const client = await createAuthenticatedClient();
  
  const record = await client.data.create('test_approval', {
    title: 'Test Approval',
    status: 'draft'
  });
  
  const state = await client.workflow.getState('test_approval', record.id);
  
  expect(state.currentState).toBe('draft');
  expect(state.availableTransitions).toContain('submit');
});
```

#### TC-WF-003: Execute Workflow Transition
```typescript
test('should execute workflow state transition', async () => {
  const client = await createAuthenticatedClient();
  
  const record = await client.data.create('test_approval', {
    title: 'Test',
    status: 'draft'
  });
  
  const result = await client.workflow.transition({
    object: 'test_approval',
    recordId: record.id,
    transition: 'submit',
    comment: 'Submitting for approval'
  });
  
  expect(result.success).toBe(true);
  expect(result.newState).toBe('pending');
});
```

#### TC-WF-004: Approve Workflow
```typescript
test('should approve workflow transition', async () => {
  const client = await createAuthenticatedClient();
  
  const result = await client.workflow.approve({
    object: 'test_approval',
    recordId: testRecordId,
    comment: 'Approved by manager'
  });
  
  expect(result.success).toBe(true);
  expect(result.newState).toBe('approved');
});
```

#### TC-WF-005: Reject Workflow
```typescript
test('should reject workflow transition', async () => {
  const client = await createAuthenticatedClient();
  
  const result = await client.workflow.reject({
    object: 'test_approval',
    recordId: testRecordId,
    reason: 'Insufficient documentation',
    comment: 'Please provide more details'
  });
  
  expect(result.success).toBe(true);
  expect(result.newState).toBe('rejected');
});
```

---

### 9-17. Additional Test Categories

*(Similar detailed test cases for remaining namespaces: Realtime, Notifications, AI, i18n, Analytics, Packages, Views, Storage, Automation)*

---

## Test Utilities

### Mock Server Setup

```typescript
// packages/client/tests/integration/helpers/test-server.ts

import { setupServer } from 'msw/node';
import { rest } from 'msw';

export function createMockServer() {
  return setupServer(
    // Discovery
    rest.get('/.well-known/objectstack', (req, res, ctx) => {
      return res(ctx.json({
        version: 'v1',
        apiName: 'ObjectStack Test Server',
        capabilities: ['metadata', 'data', 'auth'],
        endpoints: { /* ... */ }
      }));
    }),
    
    // Auth
    rest.post('/api/v1/auth/login', (req, res, ctx) => {
      return res(ctx.json({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: { id: '1', email: 'test@example.com' },
          expiresAt: Date.now() + 3600000
        }
      }));
    }),
    
    // Add more handlers...
  );
}
```

### Test Data Generators

```typescript
// packages/client/tests/integration/helpers/test-data.ts

export const generateContact = (overrides = {}) => ({
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  ...overrides
});

export const generateProject = (overrides = {}) => ({
  name: faker.commerce.productName(),
  description: faker.lorem.paragraph(),
  status: 'active',
  ...overrides
});
```

### Custom Assertions

```typescript
// packages/client/tests/integration/helpers/assertions.ts

export function expectValidId(id: string) {
  expect(id).toBeDefined();
  expect(typeof id).toBe('string');
  expect(id.length).toBeGreaterThan(0);
}

export function expectValidTimestamp(timestamp: string) {
  expect(timestamp).toBeDefined();
  expect(new Date(timestamp).getTime()).toBeGreaterThan(0);
}

export function expectValidResponse<T>(response: any): asserts response is T {
  expect(response).toBeDefined();
  expect(typeof response).toBe('object');
}
```

---

## Running Tests

### Local Development

```bash
# Start test server
cd packages/server
pnpm dev:test

# Run integration tests
cd packages/client
pnpm test:integration
```

### CI/CD Pipeline

```yaml
# .github/workflows/client-integration-tests.yml
name: Client Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build spec
        run: pnpm --filter @objectstack/spec build
      
      - name: Start test server
        run: pnpm --filter @objectstack/server dev:test &
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/test
      
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      
      - name: Run integration tests
        run: pnpm --filter @objectstack/client test:integration
```

---

## Test Coverage Goals

| Category | Target Coverage | Priority |
|----------|----------------|----------|
| Core Services (discovery, meta, data, auth) | 100% | Critical |
| Optional Services | 90% | High |
| Error Scenarios | 80% | High |
| Edge Cases | 70% | Medium |

---

## Success Criteria

- ✅ All 17 test suites pass
- ✅ 90%+ code coverage on client SDK
- ✅ Zero protocol compliance violations
- ✅ All request/response schemas validated
- ✅ Authentication flow complete
- ✅ Error handling verified
- ✅ Performance benchmarks met

---

## Related Documentation

- [Client Spec Compliance Matrix](./CLIENT_SPEC_COMPLIANCE.md)
- [Client README](./README.md)
- [Spec Protocol Map](../spec/PROTOCOL_MAP.md)

---

**Last Updated:** 2026-02-09
**Status:** 📝 Specification Complete - Ready for Implementation

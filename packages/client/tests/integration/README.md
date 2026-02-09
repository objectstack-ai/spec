# Client Integration Tests

This directory contains integration tests that verify `@objectstack/client` against a live ObjectStack server.

## Running Tests

### Prerequisites

1. **Start a test server:**
   ```bash
   cd ../../server
   pnpm dev:test
   ```

2. **Run integration tests:**
   ```bash
   cd ../../client
   pnpm test:integration
   ```

### Environment Variables

- `TEST_SERVER_URL` - Base URL of the test server (default: `http://localhost:3000`)
- `TEST_USER_EMAIL` - Test user email (default: `test@example.com`)
- `TEST_USER_PASSWORD` - Test user password (default: `TestPassword123!`)

## Test Structure

Tests are organized by protocol namespace:

```
01-discovery.test.ts          # Discovery & connection
02-auth.test.ts                # Authentication flows
03-metadata.test.ts            # Metadata operations
04-data-crud.test.ts           # Basic CRUD operations
05-data-batch.test.ts          # Batch operations
06-data-query.test.ts          # Advanced queries
07-permissions.test.ts         # Permission checking
08-workflow.test.ts            # Workflow operations
09-realtime.test.ts            # Realtime subscriptions
10-notifications.test.ts       # Notifications
11-ai.test.ts                  # AI services
12-i18n.test.ts                # Internationalization
13-analytics.test.ts           # Analytics queries
14-packages.test.ts            # Package management
15-views.test.ts               # View management
16-storage.test.ts             # File storage
17-automation.test.ts          # Automation triggers
```

## Test Coverage Goals

- Core Services (discovery, meta, data, auth): **100%**
- Optional Services: **90%**
- Error Scenarios: **80%**
- Edge Cases: **70%**

## Related Documentation

- [Integration Test Specification](../../CLIENT_SERVER_INTEGRATION_TESTS.md)
- [Client Spec Compliance](../../CLIENT_SPEC_COMPLIANCE.md)

## CI/CD

Integration tests run automatically in CI when:
- Pull requests are created
- Changes are pushed to main branch
- Manual workflow dispatch

See `.github/workflows/client-integration-tests.yml` for the CI configuration.

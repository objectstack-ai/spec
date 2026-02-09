# @objectstack/client - Quick Reference

This quick reference provides an overview of the compliance verification work and how to use it.

## 📚 Documentation Index

### Compliance & Verification

1. **[CLIENT_SPEC_COMPLIANCE.md](./CLIENT_SPEC_COMPLIANCE.md)** (English)
   - Complete protocol compliance matrix
   - Method-by-method verification for all 95+ API methods
   - Architecture and implementation notes
   - 358 lines of detailed analysis

2. **[CLIENT_SPEC_COMPLIANCE_CN.md](./CLIENT_SPEC_COMPLIANCE_CN.md)** (中文)
   - Chinese language compliance report
   - Summary of key findings
   - Recommendations for next steps
   - 383 lines

### Testing

3. **[CLIENT_SERVER_INTEGRATION_TESTS.md](./CLIENT_SERVER_INTEGRATION_TESTS.md)**
   - Comprehensive test specification for 17 test suites
   - Detailed test cases with code examples
   - Mock server setup guide
   - CI/CD configuration examples
   - 932 lines of test specifications

4. **[tests/integration/README.md](./tests/integration/README.md)**
   - How to run integration tests
   - Environment variables
   - Test structure overview

### Usage

5. **[README.md](./README.md)**
   - Updated with protocol coverage information
   - Complete namespace examples
   - Testing instructions
   - Error handling guide

## ✅ Compliance Status

```
✅ 13/13 API Namespaces Implemented (100%)
✅ 4/4 Core Services (discovery, meta, data, auth)
✅ 9/9 Optional Services (packages, ui, workflow, analytics, automation, i18n, notifications, realtime, ai)
✅ 95+ Protocol Methods
✅ Batch Operations
✅ ETag Caching
✅ Error Handling
```

## 🧪 Running Tests

### Unit Tests (Existing)

```bash
cd packages/client
pnpm test
```

Runs existing unit tests:
- `src/client.test.ts` - Mock-based unit tests
- `src/client.hono.test.ts` - Hono server integration
- `src/client.msw.test.ts` - MSW-based tests

### Integration Tests (New)

**Note:** Integration tests require a running ObjectStack server. The server is provided by a separate repository and must be set up independently.

```bash
# Start test server (in the ObjectStack server repository)
# Follow that project's documentation for test server setup
# Example: cd /path/to/objectstack-server && pnpm dev:test

# Run integration tests (in this repository)
cd packages/client
pnpm test:integration
```

Currently available:
- `tests/integration/01-discovery.test.ts` - Discovery and connection tests

**To be implemented:** Tests 02-17 (see CLIENT_SERVER_INTEGRATION_TESTS.md)

## 📋 API Namespace Reference

Quick reference to all 13 implemented namespaces:

| Namespace | Client API | Example |
|-----------|-----------|---------|
| **Discovery** | `client.connect()` | `await client.connect()` |
| **Metadata** | `client.meta.*` | `await client.meta.getItem('object', 'contact')` |
| **Data** | `client.data.*` | `await client.data.find('contact', { filters: { status: 'active' } })` |
| **Auth** | `client.auth.*` | `await client.auth.login({ email, password })` |
| **Packages** | `client.packages.*` | `await client.packages.list()` |
| **Views** | `client.views.*` | `await client.views.list('contact')` |
| **Workflow** | `client.workflow.*` | `await client.workflow.transition({ object, recordId, transition })` |
| **Analytics** | `client.analytics.*` | `await client.analytics.meta('sales')` |
| **Automation** | `client.automation.*` | `await client.automation.trigger('name', payload)` |
| **i18n** | `client.i18n.*` | `await client.i18n.getTranslations('zh-CN')` |
| **Notifications** | `client.notifications.*` | `await client.notifications.list({ unreadOnly: true })` |
| **Realtime** | `client.realtime.*` | `await client.realtime.subscribe({ channel, event })` |
| **AI** | `client.ai.*` | `await client.ai.nlq({ query: 'show active contacts' })` |
| **Storage** | `client.storage.*` | `await client.storage.upload(fileData, 'user')` |

## 🎯 Next Steps for Developers

### Immediate (High Priority)

1. **Implement Remaining Integration Tests**
   - Copy `tests/integration/01-discovery.test.ts` as a template
   - Implement tests 02-17 per specifications in CLIENT_SERVER_INTEGRATION_TESTS.md
   - Focus on core services first (auth, metadata, data)

2. **Set Up Test Server**
   - Create lightweight test server configuration
   - Seed test database with sample data
   - Enable all core and optional services

3. **CI/CD Integration**
   - Create `.github/workflows/client-integration-tests.yml`
   - Automate test server startup
   - Run integration tests on PR and push

### Medium Priority

4. **Error Scenario Testing**
   - Network failures
   - 4xx client errors
   - 5xx server errors
   - Timeout handling

5. **Performance Benchmarks**
   - Request latency measurements
   - Batch operation efficiency
   - Cache hit rates

6. **Documentation Improvements**
   - Add more code examples
   - Create migration guide from v1
   - Add troubleshooting section

### Long Term

7. **End-to-End Tests**
   - Browser-based tests with Playwright
   - Full user flow testing
   - Multi-browser support

8. **Monitoring**
   - Client-side telemetry
   - Performance monitoring
   - Error tracking integration

## 📖 Reading Order

For new developers reviewing this work:

1. Start with **README.md** - Understand basic usage
2. Read **CLIENT_SPEC_COMPLIANCE.md** (or CN version) - Understand what's implemented
3. Review **CLIENT_SERVER_INTEGRATION_TESTS.md** - Understand testing strategy
4. Explore **tests/integration/** - See example tests
5. Review spec definitions in `../spec/src/api/` - Understand the source of truth

## 🔗 Related Documentation

- [Spec Protocol Map](../spec/PROTOCOL_MAP.md) - Complete protocol reference
- [REST API Plugin](../spec/REST_API_PLUGIN.md) - API implementation details
- [Dispatcher Protocol](../spec/src/api/dispatcher.zod.ts) - Route-to-service mapping
- [Protocol Schemas](../spec/src/api/protocol.zod.ts) - Request/response schemas

## 🤝 Contributing

When adding new features:

1. ✅ Check if it requires new protocol methods in `@objectstack/spec`
2. ✅ Update CLIENT_SPEC_COMPLIANCE.md if adding new methods
3. ✅ Add integration tests in `tests/integration/`
4. ✅ Update README.md with usage examples
5. ✅ Ensure all tests pass before submitting PR

## ❓ FAQ

**Q: Why two separate test suites (unit and integration)?**  
A: Unit tests (`src/*.test.ts`) use mocks and run quickly. Integration tests (`tests/integration/*.test.ts`) require a real server and test end-to-end communication.

**Q: Do I need to implement all 17 integration test suites?**  
A: Not immediately. Start with core services (discovery, auth, metadata, data). Others can be added incrementally.

**Q: Can I run integration tests without a server?**  
A: Not yet. You need a running ObjectStack server. We plan to add a mock server option in the future.

**Q: Is the client compatible with older server versions?**  
A: The client implements the latest protocol. Check the discovery response for API version compatibility.

**Q: Where can I find the protocol definitions?**  
A: In `@objectstack/spec` package, primarily in `src/api/protocol.zod.ts` and `src/api/dispatcher.zod.ts`.

---

**Last Updated:** 2026-02-09  
**Status:** ✅ Documentation Complete - Ready for Implementation  
**Maintainer:** ObjectStack Team

# Release Notes

## v0.3.2 - Maintenance Release (2026-01-24)

### 📦 Released Packages

All packages have been updated to version **0.3.2**:

- **@objectstack/spec@0.3.2** - Core protocol definitions and TypeScript types
- **@objectstack/types@0.3.2** - Shared TypeScript type definitions
- **@objectstack/objectql@0.3.2** - ObjectQL query language and runtime
- **@objectstack/runtime@0.3.2** - Runtime execution environment
- **@objectstack/client@0.3.2** - Client library for ObjectStack
- **@objectstack/driver-memory@0.3.2** - In-memory data storage driver
- **@objectstack/plugin-hono-server@0.3.2** - Hono server plugin for REST API
- **@objectstack/plugin-msw@0.3.2** - MSW (Mock Service Worker) plugin

### 📝 Changes

This is a patch release focusing on:
- Maintenance and stability improvements
- Updated dependencies across all packages
- Improved build consistency

### 🚀 Publishing

This release is ready for publishing to npm. When this PR is merged to `main`:
1. The GitHub Actions release workflow will automatically detect the version bump
2. Build all packages
3. Publish to npm registry using NPM_TOKEN secret
4. Create GitHub release with appropriate tags

---

## v0.2.0 - Initial Public Release

## 📦 Released Packages

All packages are ready for publishing to npm:

- **@objectstack/spec@0.2.0** - Core protocol definitions and TypeScript types
- **@objectstack/types@0.2.0** - Shared TypeScript type definitions
- **@objectstack/objectql@0.2.0** - ObjectQL query language and runtime
- **@objectstack/runtime@0.2.0** - Runtime execution environment
- **@objectstack/client@0.2.0** - Client library for ObjectStack
- **@objectstack/driver-memory@0.2.0** - In-memory data storage driver
- **@objectstack/plugin-hono-server@0.2.0** - Hono server plugin for REST API

## ✨ Features

This is the first public release of the ObjectStack ecosystem, providing:

### Core Capabilities
- **Data Protocol (ObjectQL)**: Complete schema definitions for Objects and Fields
  - 23+ field types (text, number, select, lookup, formula, autonumber, etc.)
  - Validation rules, workflows, and triggers
  - Permission system and sharing rules
  - Abstract query language for unified data access

### UI Protocol
- **App Configuration**: Navigation, branding, theming
- **View System**: ListView (grid, kanban, calendar, gantt), FormView
- **Analytics**: Dashboards and reports
- **Actions**: Custom buttons and interactions

### System Protocol
- **Manifest**: Package configuration
- **Datasources**: External data connections
- **API**: REST/GraphQL endpoint definitions
- **Translation**: i18n support

### Developer Experience
- **187 JSON Schemas** automatically generated from Zod definitions
- **Complete TypeScript types** with runtime validation
- **Comprehensive documentation** with examples
- **Monorepo structure** with pnpm workspaces

## 📝 Changelog

See individual CHANGELOG.md files in each package:
- [packages/spec/CHANGELOG.md](packages/spec/CHANGELOG.md)
- [packages/client/CHANGELOG.md](packages/client/CHANGELOG.md)
- [packages/objectql/CHANGELOG.md](packages/objectql/CHANGELOG.md)
- [packages/runtime/CHANGELOG.md](packages/runtime/CHANGELOG.md)
- [packages/driver-memory/CHANGELOG.md](packages/driver-memory/CHANGELOG.md)
- [packages/plugin-hono-server/CHANGELOG.md](packages/plugin-hono-server/CHANGELOG.md)
- [packages/types/CHANGELOG.md](packages/types/CHANGELOG.md)

## 🚀 Publishing

### Automated Publishing (Recommended)
This release is prepared and ready for automated publishing via GitHub Actions:

1. Merge this PR to `main` branch
2. GitHub Actions workflow will automatically:
   - Detect the version bump
   - Build all packages
   - Publish to npm registry using NPM_TOKEN secret
   - Create GitHub release with tags

### Manual Publishing (If needed)
If you need to publish manually:

```bash
# Ensure you're authenticated to npm
npm login

# Build and publish all packages
pnpm run build
pnpm run release
```

## 🏷️ Git Tags

Version tag `v0.2.0` has been created for this release.

## 📚 Documentation

Full documentation is available at:
- Development Roadmap: [DEVELOPMENT_ROADMAP.md](internal/planning/DEVELOPMENT_ROADMAP.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- Quick Start: [QUICK_START_IMPLEMENTATION.md](QUICK_START_IMPLEMENTATION.md)

## 🛠️ Build Status

✅ All packages built successfully
✅ All JSON schemas generated (187 schemas)
✅ All documentation generated (187 reference docs)
✅ TypeScript compilation passed
✅ Package versions bumped
✅ Changelogs updated

## 🔍 Pre-publish Verification

Dry-run output confirms all 7 packages are ready:
- ✅ @objectstack/client@0.2.0
- ✅ @objectstack/driver-memory@0.2.0
- ✅ @objectstack/objectql@0.2.0
- ✅ @objectstack/plugin-hono-server@0.2.0
- ✅ @objectstack/runtime@0.2.0
- ✅ @objectstack/spec@0.2.0
- ✅ @objectstack/types@0.2.0

All packages are new and have not been published to npm yet.

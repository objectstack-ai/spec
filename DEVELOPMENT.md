# 开发调试测试指南 | Development, Debugging & Testing Guide

> **English** | [中文](#中文版)

## Quick Start

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/objectstack-ai/spec.git
cd spec

# Install dependencies and setup (one-time)
pnpm setup

# Run health check
pnpm doctor
```

### Development Workflow

#### Using the ObjectStack CLI

```bash
# Build CLI first (if not built)
pnpm --filter @objectstack/cli build

# Compile configuration to JSON
pnpm objectstack compile objectstack.config.ts dist/objectstack.json

# Start development mode (watch mode for packages)
pnpm objectstack dev [package-name]

# Check environment health
pnpm objectstack doctor

# Create new project
pnpm objectstack create plugin my-plugin
pnpm objectstack create example my-app
```

#### Common npm Shortcuts

```bash
# One-time setup
pnpm setup              # Install dependencies and build core packages

# Development
pnpm dev                # Start development mode (default: msw-react-crud example)
pnpm build              # Build all packages
pnpm test               # Run tests

# Diagnostics
pnpm doctor             # Check environment health

# Cleanup
pnpm clean              # Clean build artifacts
```

### Package Development

#### Working on @objectstack/spec

```bash
# Watch mode (auto-rebuild on changes)
cd packages/spec
pnpm dev

# Run tests in watch mode
pnpm test:watch

# Generate schemas and docs
pnpm gen:schema
pnpm gen:docs
```

#### Creating a New Plugin

```bash
# Using CLI
pnpm objectstack create plugin my-feature

# Then develop
cd packages/plugins/plugin-my-feature
pnpm install
pnpm dev
```

#### Creating a New Example

```bash
# Using CLI
pnpm objectstack create example my-app

# Then develop
cd examples/my-app
pnpm install
pnpm build
```

### Testing

#### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @objectstack/spec test

# Watch mode
pnpm --filter @objectstack/spec test:watch

# Coverage report
pnpm --filter @objectstack/spec test:coverage
```

#### Integration Tests

```bash
# Test CRM example
cd examples/crm
pnpm build
pnpm test
```

### Debugging

#### VSCode Debugging

Pre-configured launch configurations are available in `.vscode/launch.json`:

1. **Debug Current TypeScript File** - Debug any .ts file
2. **Debug @objectstack/spec Tests** - Debug spec tests
3. **Debug CLI (compile)** - Debug compile command
4. **Debug CLI (doctor)** - Debug doctor command
5. **Debug Example (CRM)** - Debug CRM example

**To use:**
1. Open the file you want to debug
2. Press `F5` or go to Run & Debug panel
3. Select the appropriate configuration
4. Set breakpoints and debug

#### Command Line Debugging

```bash
# Debug with tsx
tsx --inspect packages/cli/src/bin.ts doctor

# Debug with node
node --inspect $(which tsx) packages/cli/src/bin.ts compile
```

#### Logging

```bash
# Enable verbose logging
DEBUG=* pnpm build

# Package-specific logging
DEBUG=objectstack:* pnpm build
```

### Common Tasks

#### Adding a New Protocol Schema

```typescript
// 1. Create schema file: packages/spec/src/data/my-schema.zod.ts
import { z } from 'zod';

/**
 * My new schema
 * @description Detailed description of the schema
 */
export const MySchema = z.object({
  /** Field description */
  name: z.string().describe('Machine name (snake_case)'),
  
  /** Another field */
  value: z.number().optional().describe('Optional value'),
});

export type MyType = z.infer<typeof MySchema>;

// 2. Export from index
// packages/spec/src/data/index.ts
export * from './my-schema.zod.js';

// 3. Build to generate JSON schema
pnpm --filter @objectstack/spec build
```

#### Running Specific Package Commands

```bash
# Filter by package name
pnpm --filter @objectstack/spec <command>
pnpm --filter @objectstack/cli <command>

# Filter pattern (all plugins)
pnpm --filter "@objectstack/plugin-*" build

# Run in all packages
pnpm -r <command>

# Run in parallel
pnpm -r --parallel <command>
```

### Performance Tips

1. **Incremental Builds**: Use watch mode (`pnpm dev`) during development
2. **Selective Testing**: Test only changed packages
3. **Parallel Execution**: Use `--parallel` for independent tasks
4. **Filter Packages**: Use `--filter` to target specific packages

### Troubleshooting

#### Common Issues

**Dependencies not installed:**
```bash
pnpm doctor
pnpm install
```

**Build errors:**
```bash
# Clean and rebuild
pnpm clean
pnpm build
```

**Type errors:**
```bash
# Ensure spec is built first
pnpm --filter @objectstack/spec build
```

**Watch mode not working:**
```bash
# Kill existing processes
pkill -f "tsc --watch"
# Restart
pnpm dev
```

#### Getting Help

```bash
# Check environment
pnpm doctor

# CLI help
pnpm objectstack --help
pnpm objectstack <command> --help
```

## Architecture Overview

### Monorepo Structure

```
spec/
├── packages/              # Core packages
│   ├── spec/             # Protocol definitions (Zod schemas)
│   ├── cli/              # Command-line tools
│   ├── objectql/         # Query engine
│   ├── client/           # Client SDK
│   ├── client-react/     # React hooks
│   └── plugins/          # Plugin implementations
│       ├── driver-memory/
│       ├── plugin-hono-server/
│       └── plugin-msw/
├── examples/             # Example applications
│   ├── crm/             # Full CRM example
│   ├── todo/            # Simple todo example
│   └── ...
├── apps/                # Applications
│   └── docs/           # Documentation site
└── packages/cli/        # Command-line tools
    ├── src/commands/   # CLI commands (dev, doctor, create, compile, serve)
    └── bin/           # Executable entry points
```

### Starting a Server

The `serve` command starts an ObjectStack server with plugins loaded from your configuration:

```bash
# Start server with default config
pnpm objectstack serve

# Start with custom config and port
pnpm objectstack serve objectstack.config.ts --port 8080

# Start without HTTP server plugin (headless mode)
pnpm objectstack serve --no-server
```

**Configuration Example:**

```typescript
// objectstack.config.ts
import { defineStack } from '@objectstack/spec';
import { HonoServerPlugin } from '@objectstack/plugin-hono-server';

export default defineStack({
  metadata: {
    name: 'my-app',
    version: '1.0.0',
  },
  
  objects: {
    // Your data objects
  },
  
  plugins: [
    // Add plugins to load
    new HonoServerPlugin({ port: 3000 }),
  ],
});
```

The server will:
1. Load your configuration file
2. Register all plugins specified in `config.plugins`
3. Start the HTTP server (unless `--no-server` is specified)
4. Listen on the specified port (default: 3000)

### Package Dependencies

```
@objectstack/spec (Foundation - Zod schemas)
    ↓
@objectstack/cli (Uses spec for validation)
    ↓
@objectstack/objectql (Uses spec for types)
    ↓
@objectstack/client (Uses objectql)
    ↓
@objectstack/client-react (Uses client)
```

### Build Order

1. `@objectstack/spec` - Must build first (provides types)
2. `@objectstack/cli` - Can build after spec
3. Other packages - Can build in parallel after spec
4. Examples - Build last

## Best Practices

### Code Organization

1. **Zod First**: Always define schemas with Zod first
2. **Type Derivation**: Use `z.infer<typeof Schema>` for types
3. **Naming Conventions**:
   - Config keys: `camelCase` (e.g., `maxLength`)
   - Data values: `snake_case` (e.g., `project_task`)
4. **Documentation**: Add JSDoc comments with `@description`

### Testing

1. Co-locate tests with source files (`*.test.ts`)
2. Target 80%+ code coverage
3. Use descriptive test names
4. Test both success and error cases

### Commits

1. Use conventional commits format
2. Reference issues in commit messages
3. Keep changes focused and minimal

### Pull Requests

1. Run `pnpm doctor` before submitting
2. Ensure all tests pass
3. Update documentation if needed
4. Follow the PR template

## Resources

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Detailed contribution guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture documentation
- [Package Dependencies](./PACKAGE-DEPENDENCIES.md) - Dependency graph
- [Quick Reference](./QUICK-REFERENCE.md) - API quick reference

## License

Apache 2.0 © ObjectStack


# @objectstack/cli

Command Line Interface for ObjectStack Protocol - Development tools for building, serving, and managing ObjectStack applications.

## Features

- 🚀 **Development Server** - Hot-reload development server with auto-discovery
- 🔨 **Build & Compile** - Validate and compile ObjectStack configurations to JSON
- 🏥 **Environment Check** - Health check for development environment
- 📦 **Project Scaffolding** - Generate plugins and examples from templates
- 🧪 **Test Runner** - Execute Quality Protocol test scenarios
- ⚡ **Auto-Configuration** - Smart defaults with minimal configuration

## 🤖 AI Development Context

**Role**: Developer Tools & Terminal Interface
**Usage**:
- Runs the development server (`serve` command).
- Compiles metadata.
- Scaffolds new projects (`create`).

## Installation

### Global Installation (Recommended)

```bash
npm install -g @objectstack/cli
# or
pnpm add -g @objectstack/cli
```

### Local Development

```bash
pnpm add -D @objectstack/cli
```

## Commands

### `objectstack serve`

Start an ObjectStack server with automatic plugin loading and configuration.

```bash
# Start server with default config (objectstack.config.ts)
objectstack serve

# Specify custom config file
objectstack serve my-config.ts

# Custom port
objectstack serve --port 8080

# Development mode (loads devPlugins)
objectstack serve --dev

# Skip HTTP server plugin
objectstack serve --no-server
```

**Features:**
- Auto-detects and loads `objectstack.config.ts`
- Auto-injects ObjectQL Engine if objects are defined
- Auto-injects Memory Driver in development mode
- Auto-registers AppPlugin for app configurations
- Finds available port if requested port is in use
- Pretty logging in development mode
- Graceful shutdown on SIGINT (Ctrl+C)

**Example:**

```typescript
// objectstack.config.ts
import { defineStack } from '@objectstack/spec';

export default defineStack({
  manifest: {
    name: 'my-app',
    version: '1.0.0'
  },
  objects: [
    {
      name: 'todo_task',
      fields: {
        subject: { type: 'text', label: 'Subject' },
        completed: { type: 'boolean', default: false }
      }
    }
  ]
});
```

```bash
$ objectstack serve --dev

🚀 ObjectStack Server
------------------------
📂 Config: objectstack.config.ts
🌐 Port: 3000

📦 Loading configuration...
✓ Configuration loaded
🔧 Initializing ObjectStack kernel...
  Auto-injecting ObjectQL Engine...
  ✓ Registered ObjectQL Plugin (auto-detected)
  Auto-injecting Memory Driver (Dev Mode)...
  ✓ Registered Memory Driver (auto-detected)
  ✓ Registered App Plugin (auto-detected)
  ✓ Registered HTTP server plugin (port: 3000)

🚀 Starting ObjectStack...

✅ ObjectStack server is running!
   Press Ctrl+C to stop
```

### `objectstack dev`

Start development mode with watch and hot-reload capabilities.

```bash
# Single package mode (if objectstack.config.ts exists in CWD)
objectstack dev

# Monorepo mode - run dev for all packages
objectstack dev

# Monorepo mode - filter specific package
objectstack dev @objectstack/core
```

**Behavior:**
- **Single Package Mode**: If `objectstack.config.ts` exists in current directory, delegates to `objectstack serve --dev` to start a development server with hot reload
- **Monorepo Mode**: If `pnpm-workspace.yaml` exists in current directory (workspace root), executes `pnpm dev` with optional package filter to run development builds across multiple packages in the workspace. The command uses pnpm's workspace filtering to target specific packages or all packages.

### `objectstack compile`

Compile and validate ObjectStack configuration files.

```bash
# Compile default config
objectstack compile

# Custom source and output
objectstack compile src/config.ts build/app.json
```

**Features:**
- Bundles TypeScript configuration files
- Validates against ObjectStack Protocol using Zod schemas
- Outputs optimized JSON artifact
- Shows validation errors with exact field paths
- Build time and artifact size reporting

**Example:**

```bash
$ objectstack compile

🔹 ObjectStack Compiler v0.1
------------------------------
📂 Source: objectstack.config.ts
📦 Bundling Configuration...
🔍 Validating Protocol Compliance...

✅ Build Success (234ms)
📦 Artifact: dist/objectstack.json (12.45 KB)
✨ Ready for Deployment
```

### `objectstack doctor`

Check development environment health and dependencies.

```bash
# Quick health check
objectstack doctor

# Detailed information with fix suggestions
objectstack doctor --verbose
```

**Checks:**
- ✓ Node.js version (>= 18.0.0 required)
- ✓ pnpm package manager
- ✓ TypeScript compiler
- ✓ Dependencies installation status
- ✓ @objectstack/spec build status
- ✓ Git installation

**Example Output:**

```bash
$ objectstack doctor

🏥 ObjectStack Environment Health Check
-----------------------------------------

✓ Node.js             Version v20.10.0
✓ pnpm                Version 10.28.1
✓ TypeScript          Version 5.3.3
✓ Dependencies        Installed
✓ @objectstack/spec   Built
✓ Git                 git version 2.39.0

✅ Environment is healthy and ready for development!
```

### `objectstack create`

Create new plugins or examples from templates.

```bash
# Create a plugin
objectstack create plugin my-feature

# Create an example
objectstack create example todo-app

# Custom directory
objectstack create plugin auth --dir custom/path
```

**Templates:**

#### Plugin Template
Creates a fully-configured ObjectStack plugin with:
- `package.json` with dependencies
- TypeScript configuration
- Plugin implementation boilerplate
- README with usage examples
- Test setup with Vitest

#### Example Template
Creates an ObjectStack example application with:
- `objectstack.config.ts` configuration
- Build and dev scripts
- TypeScript configuration
- Example README

**Example:**

```bash
$ objectstack create plugin authentication

📦 ObjectStack Project Creator
-------------------------------
📁 Creating plugin: authentication
📂 Location: packages/plugins/plugin-authentication

✓ Created package.json
✓ Created tsconfig.json
✓ Created src/index.ts
✓ Created README.md

✅ Project created successfully!

Next steps:
  cd packages/plugins/plugin-authentication
  pnpm install
  pnpm build
```

### `objectstack test:run`

Run Quality Protocol test scenarios against your ObjectStack server.

```bash
# Run all tests in qa/ directory
objectstack test:run

# Specific test file or pattern
objectstack test:run qa/api-tests.json

# Custom target URL
objectstack test:run --url http://staging.example.com

# With authentication
objectstack test:run --token "Bearer xyz..."
```

**Features:**
- Executes test scenarios from JSON files
- HTTP-based test adapter
- Detailed step-by-step output
- Pass/fail reporting with timing
- Authentication support

## Configuration File

The CLI expects an `objectstack.config.ts` file in your project root:

```typescript
import { defineStack } from '@objectstack/spec';
import type { ObjectStackDefinition } from '@objectstack/spec';

export default defineStack({
  // App metadata
  manifest: {
    name: 'my-app',
    version: '1.0.0',
    description: 'My ObjectStack Application'
  },

  // Data objects
  objects: [
    {
      name: 'customer',
      label: 'Customer',
      fields: {
        name: { type: 'text', label: 'Name', required: true },
        email: { type: 'email', label: 'Email' },
        phone: { type: 'phone', label: 'Phone' }
      }
    }
  ],

  // UI applications
  apps: [
    {
      id: 'crm',
      name: 'CRM',
      objects: ['customer', 'opportunity']
    }
  ],

  // Runtime plugins
  plugins: [
    // Your production plugins
  ],

  // Development-only plugins
  devPlugins: [
    // Loaded only with --dev flag
  ]
});
```

## Usage in Monorepo

The CLI is monorepo-aware and works seamlessly in pnpm workspaces:

```bash
# From workspace root
pnpm --filter @objectstack/spec build
pnpm --filter my-app dev

# Or use the CLI shorthand
objectstack dev @objectstack/spec
```

## Environment Variables

```bash
# Server port (overridden by --port flag)
PORT=3000

# Node environment
NODE_ENV=development|production
```

## Aliases

The CLI binary is available as both `objectstack` and `os`:

```bash
objectstack serve
# or
os serve
```

## Development Workflow

### New Project Setup

```bash
# 1. Create a new example
objectstack create example my-project

# 2. Navigate to project
cd examples/my-project

# 3. Install dependencies
pnpm install

# 4. Start development server
objectstack dev
```

### Plugin Development

```bash
# 1. Create plugin
objectstack create plugin my-feature

# 2. Implement plugin logic
# Edit packages/plugins/plugin-my-feature/src/index.ts

# 3. Build and test
cd packages/plugins/plugin-my-feature
pnpm build
pnpm test
```

### Production Build

```bash
# 1. Compile configuration
objectstack compile

# 2. Run production server
NODE_ENV=production objectstack serve --port 8080
```

## Integration with Package Scripts

Add CLI commands to your `package.json`:

```json
{
  "scripts": {
    "build": "objectstack compile",
    "dev": "objectstack dev",
    "serve": "objectstack serve",
    "test": "objectstack test:run",
    "doctor": "objectstack doctor"
  }
}
```

## Troubleshooting

### Port Already in Use

The CLI automatically finds an available port if the requested port is in use:

```bash
🌐 Port: 3001 (requested: 3000 in use)
```

### Configuration Not Found

Ensure your config file exists and is properly named:

```bash
❌ Configuration file not found: /path/to/objectstack.config.ts
```

Default file name: `objectstack.config.ts`

### Validation Errors

The compiler will show detailed validation errors:

```bash
❌ Validation Failed!
   - [objects.0.name] Expected snake_case, received "MyObject"
   - [objects.0.fields.name.type] Invalid enum value. Expected 'text' | 'number' | ...
```

### Environment Issues

Run the doctor command to diagnose:

```bash
objectstack doctor --verbose
```

## API Reference

### Command Options

All commands support `--help` for detailed usage:

```bash
objectstack --help
objectstack serve --help
objectstack compile --help
```

### Exit Codes

- `0` - Success
- `1` - Error (validation failed, file not found, etc.)

## Related Packages

- [@objectstack/spec](../spec) - Protocol definitions and schemas
- [@objectstack/core](../core) - Microkernel runtime
- [@objectstack/objectql](../objectql) - Data query engine
- [@objectstack/runtime](../runtime) - Runtime utilities and plugins

## License

MIT

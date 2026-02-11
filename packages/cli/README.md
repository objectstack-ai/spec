# @objectstack/cli

Command Line Interface for building metadata-driven applications with the ObjectStack Protocol.

## Installation

```bash
pnpm add -D @objectstack/cli
```

The CLI is available as `objectstack` or the shorter alias `os`.

## Quick Start

```bash
# Initialize a new project
os init my-app

# Generate metadata
os generate object task
os generate view task
os generate flow task

# Validate configuration
os validate

# Start development server
os dev

# Compile for production
os compile
```

## Commands

### Development

| Command | Description |
|---------|-------------|
| `os init [name]` | Initialize a new ObjectStack project in the current directory |
| `os dev [package]` | Start development mode with hot reload |
| `os serve [config]` | Start the ObjectStack server with plugin auto-detection |

### Build & Validate

| Command | Description |
|---------|-------------|
| `os compile [config]` | Compile configuration to a JSON artifact (`dist/objectstack.json`) |
| `os validate [config]` | Validate configuration against the ObjectStack Protocol schema |
| `os info [config]` | Display metadata summary (objects, fields, apps, agents, etc.) |

### Scaffolding

| Command | Description |
|---------|-------------|
| `os generate <type> <name>` | Generate metadata files (alias: `os g`) |
| `os create <type> [name]` | Create a new package/plugin/example from template |

Available generate types: `object`, `view`, `action`, `flow`, `agent`, `dashboard`, `app`

### Plugin Management

| Command | Description |
|---------|-------------|
| `os plugin list [config]` | List plugins defined in configuration (alias: `os plugin ls`) |
| `os plugin info <name> [config]` | Show detailed plugin information |
| `os plugin add <package>` | Add a plugin import and entry to config |
| `os plugin remove <name>` | Remove a plugin from config (alias: `os plugin rm`) |

### Quality

| Command | Description |
|---------|-------------|
| `os test [files]` | Run Quality Protocol test scenarios against a running server |
| `os doctor` | Check development environment health |

## Configuration

The CLI looks for `objectstack.config.ts` (or `.js`, `.mjs`) in the current directory:

```typescript
import { defineStack } from '@objectstack/spec';
import * as objects from './src/objects';

export default defineStack({
  manifest: {
    id: 'com.example.my-app',
    namespace: 'my_app',
    version: '1.0.0',
    type: 'app',
    name: 'My App',
  },
  objects: Object.values(objects),
});
```

## CLI Options

### Global

- `-v, --version` — Show version number
- `-h, --help` — Show help

### `os init`

- `-t, --template <template>` — Template: `app` (default), `plugin`, `empty`
- `--no-install` — Skip dependency installation

### `os compile`

- `-o, --output <path>` — Output path (default: `dist/objectstack.json`)
- `--json` — Output compile result as JSON (for CI pipelines)

### `os validate`

- `--strict` — Treat warnings as errors
- `--json` — Output result as JSON

### `os serve`

- `-p, --port <port>` — Server port (default: `3000`)
- `--dev` — Run in development mode (load devPlugins, pretty logging)
- `--no-server` — Skip starting HTTP server plugin

### `os generate`

- `-d, --dir <directory>` — Override target directory
- `--dry-run` — Preview without writing files

### `os plugin list`

- `--json` — Output as JSON

### `os plugin add`

- `-d, --dev` — Add as a dev-only plugin
- `-c, --config <path>` — Configuration file path

### `os plugin remove`

- `-c, --config <path>` — Configuration file path

### `os info`

- `--json` — Output as JSON

### `os doctor`

- `-v, --verbose` — Show fix suggestions for warnings

## Typical Workflow

```
os init                          # 1. Create project
os generate object customer      # 2. Add a Customer object
os generate object order         # 3. Add an Order object  
os generate view customer        # 4. Add a list view
os plugin add @objectstack/plugin-auth  # 5. Add auth plugin
os validate                      # 6. Validate everything
os dev                           # 7. Start dev server
os compile                       # 8. Build for production
```

## License

Apache-2.0

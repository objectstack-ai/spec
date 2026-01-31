# @objectstack/cli-plugin-scaffold

Scaffolding and code generation plugin for the ObjectStack CLI.

## Features

- 🚀 **Project Initialization**: Bootstrap new ObjectStack projects with templates
- 🔧 **Code Generation**: Generate objects, views, apps, and plugins
- ⚙️ **Configuration Management**: Manage CLI configuration

## Installation

```bash
# Global installation
npm install -g @objectstack/cli-plugin-scaffold

# Project installation
npm install --save-dev @objectstack/cli-plugin-scaffold
```

## Commands

### `os init`

Initialize a new ObjectStack project.

```bash
os init [options]

Options:
  -t, --template <template>  Project template (crm, helpdesk, custom) (default: "custom")
  --skip-git                 Skip git initialization
  --skip-install            Skip dependency installation
```

**Examples:**

```bash
# Initialize a CRM project
os init --template crm

# Initialize without git
os init --skip-git
```

### `os generate` (alias: `g`)

Generate ObjectStack components.

#### Generate Object

```bash
os generate object <name> [options]

Options:
  -o, --output <path>  Output file path
```

**Example:**

```bash
os generate object project_task
```

#### Generate View

```bash
os generate view <name> [options]

Options:
  -t, --type <type>    View type (grid, form, kanban, calendar) (default: "grid")
  -o, --output <path>  Output file path
```

**Example:**

```bash
os generate view task_list --type grid
```

#### Generate App

```bash
os generate app <name> [options]

Options:
  -o, --output <path>  Output file path
```

**Example:**

```bash
os generate app sales
```

#### Generate Plugin

```bash
os generate plugin <name> [options]

Options:
  -t, --type <type>    Plugin type (cli, runtime, driver) (default: "runtime")
  -o, --output <path>  Output directory
```

**Examples:**

```bash
# Generate a runtime plugin
os generate plugin my-integration --type runtime

# Generate a CLI plugin
os generate plugin my-command --type cli
```

### `os config`

Manage CLI configuration.

```bash
# List all configuration
os config list

# Get a configuration value
os config get <key>

# Set a configuration value
os config set <key> <value>
```

## Development

This plugin serves as an example of how to create ObjectStack CLI plugins.

### Plugin Structure

```typescript
import type { CLIPlugin } from '@objectstack/spec/cli';

const plugin: CLIPlugin = {
  metadata: {
    id: '@objectstack/cli-plugin-scaffold',
    name: 'ObjectStack Scaffold Plugin',
    version: '0.1.0',
    description: 'Scaffolding and code generation for ObjectStack',
  },
  
  commands: [
    // Command definitions
  ],
  
  hooks: {
    onLoad: async (context) => {
      // Plugin initialization
    },
  },
};

export default plugin;
```

## License

MIT

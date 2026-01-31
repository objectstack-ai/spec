# ObjectStack Documentation

This directory contains comprehensive documentation for the ObjectStack Protocol and CLI.

## Contents

### CLI Plugin Development

- **[CLI Plugin Development Guide](./CLI_PLUGIN_DEVELOPMENT.md)** - Complete guide to creating CLI plugins
- **[CLI Plugin Quick Start](./CLI_PLUGIN_QUICK_START.md)** - 10-minute tutorial for your first plugin

## CLI Plugin System Overview

The ObjectStack CLI features a powerful plugin system that allows developers to extend the CLI with custom commands without modifying the core package.

### Key Features

- 🔌 **Dynamic Plugin Discovery** - Automatic discovery in global, local, and node_modules
- 📦 **Zod-First Schema** - Full TypeScript type safety with runtime validation
- 🎯 **Command Registration** - Automatic integration with Commander.js
- 🛠️ **Rich Context** - Logger, config, utilities provided to plugins
- 📚 **Comprehensive Docs** - Development guide and quick start tutorial

### Quick Example

Create a plugin in just a few lines:

```typescript
import type { CLIPlugin } from '@objectstack/spec/cli';

const plugin: CLIPlugin = {
  metadata: {
    id: 'cli-plugin-hello',
    name: 'Hello Plugin',
    version: '1.0.0',
    description: 'Say hello',
    license: 'MIT',
  },
  commands: [
    {
      name: 'hello',
      description: 'Greet someone',
      arguments: [
        { name: 'name', required: false, defaultValue: 'World' }
      ],
    },
  ],
};

export default plugin;
```

### Available Plugins

- **[@objectstack/cli-plugin-scaffold](../packages/plugins/cli-plugin-scaffold)** - Scaffolding and code generation

### Plugin Locations

Plugins are discovered in these locations:

1. **Global**: `~/.objectstack/plugins/cli-plugin-*/`
2. **Local**: `./.objectstack/plugins/cli-plugin-*/`
3. **Node modules**: `./node_modules/*/cli-plugin-*/`

### Installation

```bash
# Global installation
npm install -g @objectstack/cli-plugin-scaffold

# Project installation
npm install --save-dev @objectstack/cli-plugin-scaffold
```

### Usage

```bash
# List all plugins
os plugin list

# Show plugin info
os plugin info scaffold

# Use plugin commands
os init --template crm
os generate object project_task
os config set api.key YOUR_KEY
```

## Getting Started

1. **Install ObjectStack CLI**: `npm install -g @objectstack/cli`
2. **Review the scaffold plugin**: [cli-plugin-scaffold](./packages/plugins/cli-plugin-scaffold)
3. **Build Your Plugin!**

## Contributing

We welcome plugin contributions! To add your plugin to our registry:

1. Publish your plugin to npm with `cli-plugin-` prefix
2. Follow the plugin development guide
3. Submit a PR to add it to our plugin list

## Resources

- [ObjectStack CLI](./packages/cli)
- [Plugin Schema](./packages/spec/src/cli/plugin.zod.ts)
- [Example Plugins](./packages/plugins)
- [Main Documentation](./content/docs)

## Support

- Open an issue on GitHub
- Check existing plugins for examples
- Read the development guide
- Join our community discussions

---

**Happy plugin development!** 🚀

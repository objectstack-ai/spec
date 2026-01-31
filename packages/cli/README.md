# @objectstack/cli

Command-line interface for the ObjectStack Protocol with extensible plugin system.

## Features

- 🔧 **Configuration Compilation**: Compile TypeScript configurations to JSON
- 🔌 **Plugin System**: Extend functionality with CLI plugins
- 📦 **Package Manager Detection**: Automatic detection (npm, pnpm, yarn, bun)
- 🎨 **Rich CLI Output**: Colored and formatted terminal output
- ⚡ **Fast & Lightweight**: Built with modern tooling

## Installation

### Global Installation

```bash
npm install -g @objectstack/cli
# or
pnpm install -g @objectstack/cli
```

### Project Installation

```bash
npm install --save-dev @objectstack/cli
# or
pnpm add -D @objectstack/cli
```

## Usage

The CLI is available via two commands:

- `objectstack` - Full command name
- `os` - Short alias

### Built-in Commands

#### `compile`

Compile ObjectStack configuration to JSON definition.

```bash
os compile [source] [output]

Arguments:
  source   Source configuration file (default: "objectstack.config.ts")
  output   Output JSON file (default: "dist/objectstack.json")
```

**Example:**

```bash
# Compile default config
os compile

# Compile specific file
os compile src/config.ts dist/output.json
```

## Plugin System

The CLI supports a powerful plugin system that allows you to extend functionality without modifying the core CLI package.

### Plugin Discovery

Plugins are automatically discovered in these locations:

1. **Global plugins**: `~/.objectstack/plugins/cli-plugin-*/`
2. **Project node_modules**: `./node_modules/@*/cli-plugin-*/` or `./node_modules/cli-plugin-*/`
3. **Local plugins**: `./.objectstack/plugins/cli-plugin-*/`

### Installing Plugins

```bash
# Global installation
npm install -g @objectstack/cli-plugin-scaffold

# Project installation
npm install --save-dev @objectstack/cli-plugin-scaffold
```

### Available Plugins

- **[@objectstack/cli-plugin-scaffold](../plugins/cli-plugin-scaffold)** - Scaffolding and code generation

### Creating Plugins

See the **[CLI Plugin Development Guide](../../docs/CLI_PLUGIN_DEVELOPMENT.md)** for comprehensive documentation on creating your own plugins.

**Quick example:**

```typescript
import type { CLIPlugin } from '@objectstack/spec/cli';

const plugin: CLIPlugin = {
  metadata: {
    id: '@myorg/cli-plugin-mycommand',
    name: 'My Command Plugin',
    version: '1.0.0',
    description: 'Custom CLI commands',
    license: 'MIT',
  },

  commands: [
    {
      name: 'mycommand',
      description: 'My custom command',
      options: [
        {
          flags: '-v, --verbose',
          description: 'Verbose output',
        },
      ],
    },
  ],

  hooks: {
    onLoad: async (context) => {
      context.logger.debug('Plugin loaded');
    },
  },
};

export default plugin;
```

## Plugin Context

Plugins have access to a rich context with utilities:

```typescript
interface CLIPluginContext {
  // Current working directory
  cwd: string;

  // Logger
  logger: {
    log(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    debug(message: string): void;
    success(message: string): void;
  };

  // Configuration
  config: {
    get(key: string): any;
    set(key: string, value: any): Promise<void>;
    has(key: string): boolean;
  };

  // Detected package manager
  packageManager?: 'npm' | 'pnpm' | 'yarn' | 'bun';

  // Utilities
  utils: {
    spawn(command: string, args: string[], options?: any): Promise<any>;
    exec(command: string): Promise<string>;
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    fileExists(path: string): Promise<boolean>;
    mkdir(path: string): Promise<void>;
  };
}
```

## Configuration

CLI configuration is stored in `~/.objectstack/config.json`.

You can manage it using plugins like `@objectstack/cli-plugin-scaffold`:

```bash
# List all configuration
os config list

# Get a value
os config get api.key

# Set a value
os config set api.key YOUR_KEY
```

## Development

### Building

```bash
pnpm build
```

### Local Development

```bash
# Build in watch mode
pnpm dev

# Test locally
pnpm link
os --help
```

## Architecture

The CLI is built with:

- **[Commander.js](https://github.com/tj/commander.js/)** - Command-line framework
- **[Chalk](https://github.com/chalk/chalk)** - Terminal styling
- **[Zod](https://github.com/colinhacks/zod)** - Schema validation
- **[tsup](https://github.com/egoist/tsup)** - TypeScript bundler

### Plugin Architecture

```
┌─────────────────────────────────────┐
│         CLI Entry Point             │
│         (bin.ts)                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Plugin Context Provider         │
│   (logger, config, utils)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       Plugin Loader                  │
│   - Discovery                        │
│   - Validation                       │
│   - Loading                          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Command Registration             │
│   (Commander.js)                     │
└─────────────────────────────────────┘
```

## Roadmap

See the main [ObjectStack Spec README](../../README.md) for the complete roadmap.

### P0 Features (In Progress)

- [x] Plugin system architecture
- [x] Example scaffold plugin
- [ ] Plugin management commands
- [ ] Migration plugin
- [ ] Code generation plugin

### P1 Features (Planned)

- [ ] Development server plugin
- [ ] Build tools plugin
- [ ] Testing plugin

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md).

## License

MIT © ObjectStack

## Related Resources

- [CLI Plugin Development Guide](../../docs/CLI_PLUGIN_DEVELOPMENT.md)
- [ObjectStack Protocol Specification](../../packages/spec)
- [Plugin Examples](../../packages/plugins)
- [Main Documentation](../../content/docs)

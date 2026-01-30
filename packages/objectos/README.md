# @objectstack/objectos

Operating System Layer for ObjectStack - Kernel, Runtime, Client SDK, and CLI.

## Overview

This package consolidates the core operating system components of ObjectStack:

- **Kernel**: Microkernel core with plugin system and logging
- **Runtime**: Runtime plugins for server adapters
- **Client**: Client SDK for interacting with ObjectStack
- **CLI**: Command-line interface tools
- **AI Bridge**: AI integration layer

## Installation

```bash
pnpm add @objectstack/objectos
```

## Usage

### Using the Kernel

```typescript
import { Kernel } from '@objectstack/objectos/kernel';

// Use kernel functionality
```

### Using the Runtime

```typescript
import { Runtime } from '@objectstack/objectos/runtime';

// Use runtime plugins
```

### Using the Client SDK

```typescript
import { Client } from '@objectstack/objectos/client';

// Use client SDK
```

### Using the CLI

```bash
# Install globally
pnpm add -g @objectstack/objectos

# Run CLI
objectstack --help
ost --help
```

## Architecture

This package merges several previously separate packages:

- `@objectstack/core` → `objectos/kernel`
- `@objectstack/runtime` → `objectos/runtime`
- `@objectstack/client` → `objectos/client`
- `@objectstack/cli` → `objectos/cli`
- `@objectstack/ai-bridge` → `objectos/ai-bridge`

## License

Apache-2.0

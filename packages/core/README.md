# @objectstack/core

The **Kernel** of the ObjectStack architecture. It provides the fundamental building blocks for a modular, plugin-based system.

## Features

- **ObjectKernel**: A robust Dependency Injection (DI) container and plugin manager.
- **Plugin Architecture**: A standard interface (`Plugin`) with lifecycle hooks (`init`, `start`, `stop`).
- **Service Management**: Register and resolve services with type safety.
- **Logging**: Structured logging interface with swappable backends.

## Installation

```bash
pnpm add @objectstack/core
```

## Basic Usage

```typescript
import { ObjectKernel } from '@objectstack/core';

const kernel = new ObjectKernel();

// Register a simple plugin
kernel.use({
  name: 'my-plugin',
  version: '1.0.0',
  async init(ctx) {
    ctx.logger.info('Plugin initializing...');
  }
});

await kernel.bootstrap();
```

# @objectstack/core

The Microkernel for the ObjectStack Operating System.

## Overview

This package defines the fundamental runtime mechanics of the ObjectStack architecture:
1.  **Dependency Injection (DI)**: A `services` registry.
2.  **Plugin Lifecycle**: `init` (Registration) -> `start` (Execution).
3.  **Event Bus**: Simple hook system (`hook`, `trigger`).

It is completely agnostic of "Data", "HTTP", or "Apps". It only knows `Plugin` and `Service`.

## Installation

```bash
npm install @objectstack/core
```

## Usage

```typescript
import { ObjectKernel, Plugin, PluginContext } from '@objectstack/core';

// 1. Define a Plugin
class MyPlugin implements Plugin {
    name = 'my-plugin';
    
    async init(ctx: PluginContext) {
        ctx.registerService('my-service', { hello: 'world' });
    }
}

// 2. Boot Kernel
const kernel = new ObjectKernel();
kernel.use(new MyPlugin());
await kernel.bootstrap();

// 3. Use Service
const service = kernel.context.getService('my-service');
```

# @objectstack/core

Microkernel Core for ObjectStack - A lightweight, plugin-based architecture with configurable logging.

## Overview

This package defines the fundamental runtime mechanics of the ObjectStack architecture:
1. **Dependency Injection (DI)**: A `services` registry for inter-plugin communication
2. **Plugin Lifecycle**: `init` (Registration) -> `start` (Execution) -> `destroy` (Cleanup)
3. **Event Bus**: Simple hook system (`hook`, `trigger`) for event-driven communication
4. **Configurable Logging**: Universal logger using [Pino](https://github.com/pinojs/pino) for Node.js and simple console for browsers

It is completely agnostic of "Data", "HTTP", or "Apps". It only knows `Plugin` and `Service`.

## Features

- **Plugin-based Architecture**: Modular microkernel that manages plugin lifecycle
- **Service Registry**: Dependency injection for inter-plugin communication
- **Event/Hook System**: Flexible event-driven communication
- **High-Performance Logging**: 
  - Node.js: Powered by [Pino](https://github.com/pinojs/pino) - extremely fast, low-overhead structured logging
  - Browser: Lightweight console-based logger
- **Environment Detection**: Automatic runtime detection (Node.js/browser)
- **Dependency Resolution**: Automatic topological sorting of plugin dependencies
- **Security**: Automatic sensitive data redaction in logs

## Installation

```bash
npm install @objectstack/core
# or
pnpm add @objectstack/core
```

## Quick Start

```typescript
import { ObjectKernel, Plugin, PluginContext } from '@objectstack/core';

// 1. Define a Plugin
const myPlugin: Plugin = {
    name: 'my-plugin',
    
    async init(ctx: PluginContext) {
        ctx.logger.info('Initializing plugin');
        ctx.registerService('my-service', { hello: 'world' });
    }
};

// 2. Boot Kernel with logging config
const kernel = new ObjectKernel({
  logger: {
    level: 'info',
    format: 'pretty'
  }
});

kernel.use(myPlugin);
await kernel.bootstrap();

// 3. Use Service
const service = kernel.getService('my-service');

// 4. Cleanup
await kernel.shutdown();
```

## Configurable Logger

The logger uses **[Pino](https://github.com/pinojs/pino)** for Node.js environments (high-performance, low-overhead) and a simple console-based logger for browsers. It automatically detects the runtime environment.

### Why Pino?

- **Fast**: One of the fastest Node.js loggers available
- **Low Overhead**: Minimal performance impact on your application
- **Structured Logging**: Native JSON output for log aggregation tools
- **Production Ready**: Battle-tested in production environments
- **Feature Rich**: Automatic log rotation, transports, child loggers, and more

### Logger Configuration

```typescript
const kernel = new ObjectKernel({
  logger: {
    level: 'debug',        // 'debug' | 'info' | 'warn' | 'error' | 'fatal'
    format: 'pretty',      // 'json' | 'text' | 'pretty'
    sourceLocation: true,  // Include file/line numbers
    redact: ['password', 'token', 'apiKey'], // Keys to redact
    file: './logs/app.log',     // Node.js only
    rotation: {                 // File rotation (Node.js only)
      maxSize: '10m',
      maxFiles: 5
    }
  }
});
```

### Using Logger in Plugins

```typescript
const myPlugin: Plugin = {
  name: 'my-plugin',
  
  init: async (ctx: PluginContext) => {
    // Basic logging
    ctx.logger.info('Plugin initialized');
    ctx.logger.debug('Debug info', { details: 'data' });
    ctx.logger.warn('Warning message');
    ctx.logger.error('Error occurred', new Error('Oops'));
    
    // Sensitive data is automatically redacted
    ctx.logger.info('User login', {
      username: 'john',
      password: 'secret123'  // Logged as '***REDACTED***'
    });
  }
};
```

### Standalone Logger

```typescript
import { createLogger } from '@objectstack/core';

const logger = createLogger({
  level: 'info',
  format: 'json'
});

logger.info('Application started');

// Child logger with context
const requestLogger = logger.child({
  requestId: '123',
  userId: 'user-456'
});

requestLogger.info('Processing request');

// Distributed tracing
const tracedLogger = logger.withTrace('trace-id-123', 'span-id-456');

// Cleanup
await logger.destroy();
```

## Log Formats

### JSON (default for Node.js)
```json
{"timestamp":"2026-01-29T22:47:36.441Z","level":"info","message":"User action","context":{"userId":"123"}}
```

### Text
```
2026-01-29T22:47:36.441Z | INFO | User action | {"userId":"123"}
```

### Pretty (default for browser)
```
[INFO] User action { userId: '123' }
```

## Plugin Development

```typescript
import { Plugin, PluginContext } from '@objectstack/core';

const databasePlugin: Plugin = {
  name: 'database',
  version: '1.0.0',
  
  init: async (ctx: PluginContext) => {
    const db = await connectToDatabase();
    ctx.registerService('db', db);
    ctx.logger.info('Database connected');
  },
  
  start: async (ctx: PluginContext) => {
    ctx.logger.info('Database ready');
  },
  
  destroy: async () => {
    await db.close();
  }
};

const apiPlugin: Plugin = {
  name: 'api',
  dependencies: ['database'],  // Load after database
  
  init: async (ctx: PluginContext) => {
    const db = ctx.getService('db');
    const server = createServer(db);
    ctx.registerService('api', server);
  }
};

kernel.use(databasePlugin);
kernel.use(apiPlugin);
await kernel.bootstrap();
```

## Environment Support

### Node.js Features (via Pino)
- High-performance structured logging
- Automatic file logging with rotation
- JSON format for log aggregation tools (Elasticsearch, Splunk, etc.)
- Pretty printing for development (via pino-pretty)
- Child loggers with inherited context
- Minimal performance overhead

### Browser Features  
- Pretty console output with colors
- DevTools integration
- Lightweight implementation
- No external dependencies

## Security

Automatic sensitive data redaction:
- Default keys: `password`, `token`, `secret`, `key`
- Configurable via `redact` option
- Recursive through nested objects

## API Reference

- `ObjectKernel` - Main microkernel class
- `createLogger(config)` - Create standalone logger
- `Plugin` - Plugin interface
- `PluginContext` - Runtime context for plugins
- `Logger` - Logger interface

See [TypeScript definitions](./src/types.ts) for complete API.

## License

Apache-2.0

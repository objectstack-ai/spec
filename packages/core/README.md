# @objectstack/core

Microkernel Core for ObjectStack - A lightweight, plugin-based architecture with enterprise-grade features.

## Overview

This package defines the fundamental runtime mechanics of the ObjectStack architecture:
1. **Dependency Injection (DI)**: Advanced service registry with factory functions and lifecycle management
2. **Plugin Lifecycle**: `init` (Registration) -> `start` (Execution) -> `destroy` (Cleanup)
3. **Event Bus**: Simple hook system (`hook`, `trigger`) for event-driven communication
4. **Configurable Logging**: Universal logger using [Pino](https://github.com/pinojs/pino) for Node.js and simple console for browsers
5. **Enhanced Features**: Version compatibility, health checks, timeout control, graceful shutdown, and more

It is completely agnostic of "Data", "HTTP", or "Apps". It only knows `Plugin` and `Service`.

## Features

### Core Features
- **Plugin-based Architecture**: Modular microkernel that manages plugin lifecycle
- **Service Registry**: Dependency injection for inter-plugin communication
- **Event/Hook System**: Flexible event-driven communication
- **High-Performance Logging**: 
  - Node.js: Powered by [Pino](https://github.com/pinojs/pino) - extremely fast, low-overhead structured logging
  - Browser: Lightweight console-based logger
- **Environment Detection**: Automatic runtime detection (Node.js/browser)
- **Dependency Resolution**: Automatic topological sorting of plugin dependencies
- **Security**: Automatic sensitive data redaction in logs

### Enhanced Features (EnhancedObjectKernel)
- **Async Plugin Loading**: Load plugins asynchronously with validation
- **Version Compatibility**: Semantic versioning support and validation
- **Plugin Signatures**: Security verification (extensible)
- **Configuration Validation**: Zod-based schema validation for plugin configs
- **Service Factories**: Factory-based service instantiation with lifecycle control
- **Service Lifecycles**: Singleton, Transient, and Scoped service management
- **Circular Dependency Detection**: Automatic detection and reporting
- **Lazy Loading**: Services created on-demand
- **Timeout Control**: Configurable timeouts for plugin initialization
- **Failure Rollback**: Automatic rollback on startup failures
- **Health Checks**: Monitor plugin health at runtime
- **Performance Metrics**: Track plugin startup times
- **Graceful Shutdown**: Proper cleanup with timeout control

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

## 🤖 AI Quick Reference

**For AI Agents:** This package implements a microkernel architecture. Key concepts:

1. **Plugin Lifecycle**: `init()` → `start()` → `destroy()`
2. **Service Registry**: Share functionality via `ctx.registerService(name, service)` and `ctx.getService(name)`
3. **Dependencies**: Declare plugin dependencies for automatic load ordering
4. **Hooks/Events**: Decouple plugins with `ctx.hook(event, handler)` and `ctx.trigger(event, ...args)`
5. **Logger**: Always use `ctx.logger` for consistent, structured logging

**Common Plugin Pattern:**
```typescript
const plugin: Plugin = {
  name: 'my-plugin',
  dependencies: ['other-plugin'], // Load after these plugins
  
  async init(ctx: PluginContext) {
    // Register services and hooks
    const otherService = ctx.getService('other-service');
    ctx.registerService('my-service', new MyService(otherService));
    ctx.hook('data:created', async (data) => { /* ... */ });
  },
  
  async start(ctx: PluginContext) {
    // Execute business logic
    const service = ctx.getService('my-service');
    await service.initialize();
  },
  
  async destroy() {
    // Cleanup resources
    await service.close();
  }
};
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

## Enhanced Kernel Usage

For production applications, use `EnhancedObjectKernel` for advanced features:

```typescript
import { EnhancedObjectKernel, PluginMetadata, ServiceLifecycle } from '@objectstack/core';

// Create enhanced kernel
const kernel = new EnhancedObjectKernel({
  logger: { level: 'info', format: 'pretty' },
  defaultStartupTimeout: 30000,   // 30 seconds
  gracefulShutdown: true,
  shutdownTimeout: 60000,         // 60 seconds
  rollbackOnFailure: true,        // Rollback on failures
});

// Plugin with version and health check
const plugin: PluginMetadata = {
  name: 'my-plugin',
  version: '1.2.3',
  startupTimeout: 10000,
  
  async init(ctx) {
    ctx.registerService('my-service', serviceInstance);
  },
  
  async healthCheck() {
    return {
      healthy: true,
      message: 'Service is operational'
    };
  }
};

// Register service factory with lifecycle
kernel.registerServiceFactory(
  'database',
  async (ctx) => await connectToDatabase(),
  ServiceLifecycle.SINGLETON
);

await kernel.use(plugin);
await kernel.bootstrap();

// Check health
const health = await kernel.checkPluginHealth('my-plugin');
console.log(health);

// Get metrics
const metrics = kernel.getPluginMetrics();
console.log(metrics);

// Graceful shutdown
await kernel.shutdown();
```

See [ENHANCED_FEATURES.md](./ENHANCED_FEATURES.md) for comprehensive documentation.
See [examples/enhanced-kernel-example.ts](./examples/enhanced-kernel-example.ts) for a complete example.

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

### ObjectKernel (Basic)
- `ObjectKernel` - Basic microkernel class
- `createLogger(config)` - Create standalone logger
- `Plugin` - Plugin interface
- `PluginContext` - Runtime context for plugins
- `Logger` - Logger interface

### EnhancedObjectKernel (Advanced)
- `EnhancedObjectKernel` - Enhanced microkernel with production features
- `PluginLoader` - Plugin loading and validation
- `ServiceLifecycle` - Service lifecycle management (SINGLETON, TRANSIENT, SCOPED)
- `PluginMetadata` - Extended plugin interface with metadata
- `PluginHealthStatus` - Health check result interface

See [TypeScript definitions](./src/types.ts) for complete API.

## Documentation

- [ENHANCED_FEATURES.md](./ENHANCED_FEATURES.md) - Comprehensive guide to enhanced features
- [examples/enhanced-kernel-example.ts](./examples/enhanced-kernel-example.ts) - Complete working example

## License

Apache-2.0

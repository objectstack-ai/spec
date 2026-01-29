/**
 * Logger Example
 * 
 * This example demonstrates the configurable logging capabilities
 * of ObjectStack Kernel that work in both Node.js and browser environments.
 */

import { ObjectKernel, createLogger, type Plugin, type PluginContext } from '@objectstack/core';

// Example 1: Kernel with Different Logger Configurations
async function exampleKernelLogging() {
  console.log('\n=== Example 1: Kernel with Different Logger Configurations ===\n');

  // Pretty format logger (colored output)
  const kernel = new ObjectKernel({
    logger: {
      level: 'debug',
      format: 'pretty'
    }
  });

  const testPlugin: Plugin = {
    name: 'test-plugin',
    init: async (ctx: PluginContext) => {
      ctx.logger.info('Plugin initialized', { version: '1.0.0' });
    }
  };

  console.log('Starting kernel with pretty format:');
  kernel.use(testPlugin);
  await kernel.bootstrap();
  await kernel.shutdown();
}

// Example 2: Standalone Logger Usage
async function exampleStandaloneLogger() {
  console.log('\n=== Example 2: Standalone Logger Usage ===\n');

  const logger = createLogger({
    level: 'debug',
    format: 'pretty',
    sourceLocation: false
  });

  // Basic logging
  logger.debug('Debug message for development');
  logger.info('Application started');
  logger.warn('Resource usage is high', { cpu: 85, memory: 90 });
  
  // Error logging
  try {
    throw new Error('Something went wrong');
  } catch (error) {
    logger.error('Operation failed', error as Error, { operation: 'database-query' });
  }

  await logger.destroy();
}

// Example 3: Child Loggers with Context
async function exampleChildLoggers() {
  console.log('\n=== Example 3: Child Loggers with Context ===\n');

  const logger = createLogger({
    level: 'info',
    format: 'json'
  });

  // Create a child logger for API requests
  const apiLogger = logger.child({
    component: 'api',
    version: 'v1'
  });

  // Create request-specific logger
  const requestLogger = apiLogger.child({
    requestId: 'req-123',
    userId: 'user-456',
    method: 'POST',
    path: '/api/users'
  });

  requestLogger.info('Request received');
  requestLogger.info('Processing request');
  requestLogger.info('Request completed', { duration: 125 });

  // Note: Only destroy the parent logger; child loggers share the same file writer
  await logger.destroy();
}

// Example 4: Distributed Tracing
async function exampleDistributedTracing() {
  console.log('\n=== Example 4: Distributed Tracing ===\n');

  const logger = createLogger({
    level: 'info',
    format: 'json'
  });

  // Simulate distributed trace
  const traceId = 'trace-abc-123';
  const spanId = 'span-xyz-789';

  const tracedLogger = logger.withTrace(traceId, spanId);

  tracedLogger.info('Starting distributed operation');
  tracedLogger.info('Calling remote service');
  tracedLogger.info('Operation completed');

  await logger.destroy();
}

// Example 5: Sensitive Data Redaction
async function exampleSensitiveDataRedaction() {
  console.log('\n=== Example 5: Sensitive Data Redaction ===\n');

  const logger = createLogger({
    level: 'info',
    format: 'json',
    redact: ['password', 'token', 'apiKey', 'creditCard']
  });

  // Sensitive data will be automatically redacted
  logger.info('User login attempt', {
    username: 'john.doe',
    password: 'super-secret-123',  // Will be redacted
    email: 'john@example.com'
  });

  logger.info('API call', {
    endpoint: '/api/payment',
    apiKey: 'sk_live_123456789',  // Will be redacted
    amount: 100
  });

  logger.info('Payment processing', {
    userId: 'user-123',
    creditCard: '4111-1111-1111-1111',  // Will be redacted
    amount: 99.99
  });

  await logger.destroy();
}

// Example 6: Plugin with Logger
async function examplePluginLogging() {
  console.log('\n=== Example 6: Plugin with Logger ===\n');

  const databasePlugin: Plugin = {
    name: 'database',
    
    init: async (ctx: PluginContext) => {
      ctx.logger.info('Connecting to database', {
        host: 'localhost',
        port: 5432,
        database: 'myapp'
      });
      
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const db = { connected: true };
      ctx.registerService('db', db);
      
      ctx.logger.info('Database connected successfully');
    },

    start: async (ctx: PluginContext) => {
      ctx.logger.info('Database plugin started');
    },

    destroy: async () => {
      console.log('[Database] Disconnecting...');
    }
  };

  const apiPlugin: Plugin = {
    name: 'api',
    dependencies: ['database'],
    
    init: async (ctx: PluginContext) => {
      const db = ctx.getService('db');
      ctx.logger.info('API plugin initialized', { dbConnected: db.connected });
      
      ctx.registerService('api', { server: 'http://localhost:3000' });
    },

    start: async (ctx: PluginContext) => {
      ctx.logger.info('API server starting', { port: 3000 });
      ctx.logger.info('API server ready');
    }
  };

  const kernel = new ObjectKernel({
    logger: {
      level: 'info',
      format: 'pretty'
    }
  });

  kernel.use(databasePlugin);
  kernel.use(apiPlugin);
  
  await kernel.bootstrap();
  await kernel.shutdown();
}

// Example 7: Different Log Formats
async function exampleLogFormats() {
  console.log('\n=== Example 7: Different Log Formats ===\n');

  const message = 'User action';
  const metadata = { userId: '123', action: 'create', resource: 'document' };

  console.log('JSON format:');
  const jsonLogger = createLogger({ format: 'json' });
  jsonLogger.info(message, metadata);
  await jsonLogger.destroy();

  console.log('\nText format:');
  const textLogger = createLogger({ format: 'text' });
  textLogger.info(message, metadata);
  await textLogger.destroy();

  console.log('\nPretty format:');
  const prettyLogger = createLogger({ format: 'pretty' });
  prettyLogger.info(message, metadata);
  await prettyLogger.destroy();
}

// Run all examples
async function main() {
  console.log('ObjectStack Logger Examples');
  console.log('============================\n');

  await exampleKernelLogging();
  await exampleStandaloneLogger();
  await exampleChildLoggers();
  await exampleDistributedTracing();
  await exampleSensitiveDataRedaction();
  await examplePluginLogging();
  await exampleLogFormats();

  console.log('\n✅ All examples completed!\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  exampleKernelLogging,
  exampleStandaloneLogger,
  exampleChildLoggers,
  exampleDistributedTracing,
  exampleSensitiveDataRedaction,
  examplePluginLogging,
  exampleLogFormats
};

/**
 * Enhanced ObjectKernel Example
 * 
 * Demonstrates advanced plugin features:
 * - Version compatibility
 * - Service factories with lifecycle management
 * - Plugin timeout control
 * - Startup failure rollback
 * - Health checks
 * - Performance metrics
 * - Graceful shutdown
 */

import { 
  EnhancedObjectKernel, 
  PluginMetadata, 
  ServiceLifecycle,
  PluginContext 
} from '../index.js';

// ============================================================================
// Example 1: Database Plugin with Health Checks
// ============================================================================

const databasePlugin: PluginMetadata = {
  name: 'database',
  version: '1.0.0',
  startupTimeout: 10000, // 10 second timeout
  
  async init(ctx: PluginContext) {
    ctx.logger.info('Initializing database plugin');
    
    // Register database service using factory
    // This creates a singleton that's initialized once
    const db = {
      connected: false,
      async connect() {
        ctx.logger.info('Connecting to database...');
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate connection
        this.connected = true;
        ctx.logger.info('Database connected');
      },
      async disconnect() {
        ctx.logger.info('Disconnecting from database...');
        this.connected = false;
      },
      async query(sql: string) {
        if (!this.connected) {
          throw new Error('Database not connected');
        }
        return { rows: [] };
      }
    };
    
    ctx.registerService('db', db);
  },
  
  async start(ctx: PluginContext) {
    const db = ctx.getService<any>('db');
    await db.connect();
  },
  
  async destroy() {
    // Cleanup on shutdown
    console.log('Cleaning up database connection');
  },
  
  async healthCheck() {
    // Health check returns status
    return {
      healthy: true,
      message: 'Database is operational',
      details: {
        connections: 5,
        responseTime: 45
      }
    };
  }
};

// ============================================================================
// Example 2: API Plugin with Dependencies
// ============================================================================

const apiPlugin: PluginMetadata = {
  name: 'api',
  version: '2.1.0',
  dependencies: ['database'], // Requires database plugin to be loaded first
  
  async init(ctx: PluginContext) {
    ctx.logger.info('Initializing API plugin');
    
    // Access database service (guaranteed to exist due to dependencies)
    const db = ctx.getService<any>('db');
    
    const api = {
      async getUsers() {
        return await db.query('SELECT * FROM users');
      },
      async createUser(data: any) {
        return await db.query('INSERT INTO users VALUES ...', data);
      }
    };
    
    ctx.registerService('api', api);
  },
  
  async healthCheck() {
    return {
      healthy: true,
      message: 'API is ready',
      details: {
        routes: 15,
        activeRequests: 3
      }
    };
  }
};

// ============================================================================
// Example 3: Cache Plugin with Scoped Services
// ============================================================================

const cachePlugin: PluginMetadata = {
  name: 'cache',
  version: '1.2.3',
  
  async init(ctx: PluginContext) {
    ctx.logger.info('Initializing cache plugin');
    
    // Simple in-memory cache
    const cache = new Map<string, any>();
    
    ctx.registerService('cache', {
      get(key: string) {
        return cache.get(key);
      },
      set(key: string, value: any) {
        cache.set(key, value);
      },
      clear() {
        cache.clear();
      }
    });
  },
  
  async healthCheck() {
    return {
      healthy: true,
      message: 'Cache is operational'
    };
  }
};

// ============================================================================
// Example 4: Using Service Factories
// ============================================================================

async function setupServiceFactories(kernel: EnhancedObjectKernel) {
  // Singleton: Created once, shared across all requests
  kernel.registerServiceFactory(
    'logger-service',
    (ctx) => {
      return {
        log: (message: string) => {
          ctx.logger.info(message);
        }
      };
    },
    ServiceLifecycle.SINGLETON
  );
  
  // Transient: New instance on every request
  kernel.registerServiceFactory(
    'request-id',
    () => {
      return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    ServiceLifecycle.TRANSIENT
  );
  
  // Scoped: One instance per scope (e.g., per HTTP request)
  kernel.registerServiceFactory(
    'user-session',
    () => {
      return {
        id: Math.random().toString(36),
        data: new Map<string, any>()
      };
    },
    ServiceLifecycle.SCOPED
  );
}

// ============================================================================
// Main Application
// ============================================================================

async function main() {
  console.log('🚀 Starting Enhanced ObjectKernel Example\n');
  
  // Create enhanced kernel with configuration
  const kernel = new EnhancedObjectKernel({
    logger: {
      level: 'info',
      format: 'pretty'
    },
    defaultStartupTimeout: 30000,  // 30 seconds
    gracefulShutdown: true,
    shutdownTimeout: 60000,        // 60 seconds
    rollbackOnFailure: true,       // Rollback on failure
  });
  
  // Setup service factories
  await setupServiceFactories(kernel);
  
  // Register plugins
  await kernel.use(databasePlugin);
  await kernel.use(cachePlugin);
  await kernel.use(apiPlugin);
  
  console.log('📦 Plugins registered\n');
  
  // Bootstrap kernel
  console.log('⚡ Bootstrapping kernel...\n');
  await kernel.bootstrap();
  
  console.log('\n✅ Kernel started successfully!\n');
  
  // Show plugin metrics
  console.log('📊 Plugin Startup Metrics:');
  const metrics = kernel.getPluginMetrics();
  for (const [name, time] of metrics) {
    console.log(`   ${name}: ${time}ms`);
  }
  console.log('');
  
  // Check plugin health
  console.log('🏥 Plugin Health Status:');
  const healthStatuses = await kernel.checkAllPluginsHealth();
  for (const [name, health] of healthStatuses) {
    const status = health.healthy ? '✅' : '❌';
    console.log(`   ${status} ${name}: ${health.message}`);
    if (health.details) {
      console.log(`      Details:`, health.details);
    }
  }
  console.log('');
  
  // Use services
  console.log('🔧 Using services:');
  const db = kernel.getService<any>('db');
  console.log('   Database connected:', db.connected);
  
  const cache = kernel.getService<any>('cache');
  cache.set('user:1', { name: 'John Doe' });
  console.log('   Cached user:', cache.get('user:1'));
  
  const api = kernel.getService<any>('api');
  console.log('   API ready:', !!api);
  console.log('');
  
  // Test service factories
  console.log('🏭 Testing Service Factories:');
  
  // Singleton - same instance
  const logger1 = await kernel.getServiceAsync('logger-service');
  const logger2 = await kernel.getServiceAsync('logger-service');
  console.log('   Singleton test:', logger1 === logger2 ? 'PASS ✅' : 'FAIL ❌');
  
  // Transient - different instances
  const id1 = await kernel.getServiceAsync('request-id');
  const id2 = await kernel.getServiceAsync('request-id');
  console.log('   Transient test:', id1 !== id2 ? 'PASS ✅' : 'FAIL ❌');
  console.log('   Generated IDs:', id1, 'and', id2);
  
  // Scoped - same within scope, different across scopes
  const session1a = await kernel.getServiceAsync('user-session', 'request-1');
  const session1b = await kernel.getServiceAsync('user-session', 'request-1');
  const session2 = await kernel.getServiceAsync('user-session', 'request-2');
  console.log('   Scoped (same scope):', session1a === session1b ? 'PASS ✅' : 'FAIL ❌');
  console.log('   Scoped (diff scope):', session1a !== session2 ? 'PASS ✅' : 'FAIL ❌');
  console.log('');
  
  // Register custom shutdown handler
  kernel.onShutdown(async () => {
    console.log('🧹 Running custom cleanup...');
  });
  
  // Simulate running for a bit
  console.log('⏳ Running for 2 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Graceful shutdown
  console.log('🛑 Initiating graceful shutdown...\n');
  await kernel.shutdown();
  
  console.log('\n✅ Shutdown complete!\n');
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

export { main };

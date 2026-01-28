/**
 * Complete Event-Driven Example
 * 
 * Demonstrates all three requested features:
 * 1. Event-driven mechanism (Data Engine + Flow Engine)
 * 2. UI Engine mounting (Dynamic routes)
 * 3. Configuration-driven loading (JSON config)
 */

import { ObjectKernel } from '@objectstack/runtime';
import { DataEnginePlugin } from './data-engine-plugin';
import { FlowEnginePlugin } from './flow-engine-plugin';
import { UiEnginePlugin } from './ui-engine-plugin';
import { HonoServerPlugin } from '@objectstack/plugin-hono-server';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { PluginRegistry, createKernelFromConfig } from './config-loader';

/**
 * Example 1: Manual Plugin Loading (Programmatic)
 */
async function example1_ManualLoading() {
    console.log('\n=== Example 1: Manual Plugin Loading ===\n');

    const kernel = new ObjectKernel();

    // Load plugins in any order - kernel will resolve dependencies
    kernel
        .use(new UiEnginePlugin())          // Depends on server
        .use(new FlowEnginePlugin())        // Listens to data events
        .use(new DataEnginePlugin())        // Emits data events
        .use(new HonoServerPlugin({ port: 3000 }))  // HTTP server
        .use(new ObjectQLPlugin());         // Data engine

    await kernel.bootstrap();

    // Test event-driven flow
    console.log('\n--- Testing Event-Driven Flow ---\n');
    const db = kernel.getService<any>('db');
    
    // This will trigger Flow Engine automatically
    await db.insert('orders', {
        customer: 'John Doe',
        total: 299.99,
        status: 'pending'
    });

    await db.insert('contacts', {
        name: 'Jane Smith',
        email: 'jane@example.com'
    });

    // Update will also trigger flow
    await db.update('orders', '12345', {
        status: 'shipped'
    });

    console.log('\n✅ Example 1 Complete');
    await kernel.shutdown();
}

/**
 * Example 2: Configuration-Driven Loading
 */
async function example2_ConfigDrivenLoading() {
    console.log('\n=== Example 2: Configuration-Driven Loading ===\n');

    // Register plugins in the registry
    PluginRegistry.register('objectstack-objectql', () => new ObjectQLPlugin());
    PluginRegistry.register('objectstack-data', () => new DataEnginePlugin());
    PluginRegistry.register('objectstack-server', () => new HonoServerPlugin({ port: 3000 }));
    PluginRegistry.register('objectstack-flow', () => new FlowEnginePlugin());
    PluginRegistry.register('objectstack-ui', () => new UiEnginePlugin());

    // Load from config file
    const kernel = await createKernelFromConfig('./examples/objectstack.config.json');
    
    await kernel.bootstrap();

    console.log('\n✅ Example 2 Complete');
    await kernel.shutdown();
}

/**
 * Example 3: Custom Event Hooks
 */
async function example3_CustomEventHooks() {
    console.log('\n=== Example 3: Custom Event Hooks ===\n');

    const kernel = new ObjectKernel();

    // Add plugins
    kernel
        .use(new ObjectQLPlugin())
        .use(new DataEnginePlugin())
        .use(new FlowEnginePlugin())
        .use(new HonoServerPlugin({ port: 3000 }));

    // Register custom hook before bootstrap
    const context = (kernel as any).context;
    
    context.hook('data:record:beforeCreate', async ({ table, data }: any) => {
        console.log(`[Custom Hook] 🔍 Validating ${table} record:`, data);
        
        // Add custom validation
        if (table === 'orders' && !data.customer) {
            throw new Error('Customer is required for orders');
        }
        
        // Add timestamps automatically
        data.createdAt = new Date().toISOString();
    });

    context.hook('data:record:afterCreate', async ({ table, data }: any) => {
        console.log(`[Custom Hook] 📊 Logging ${table} creation for analytics`);
        // Send to analytics service
    });

    await kernel.bootstrap();

    // Test with validation
    const db = kernel.getService<any>('db');
    
    try {
        await db.insert('orders', { total: 100 });
    } catch (e: any) {
        console.log('❌ Validation failed:', e.message);
    }

    // This should work
    await db.insert('orders', {
        customer: 'Alice',
        total: 150
    });

    console.log('\n✅ Example 3 Complete');
    await kernel.shutdown();
}

/**
 * Run all examples
 */
async function main() {
    try {
        await example1_ManualLoading();
        // await example2_ConfigDrivenLoading();  // Uncomment to test
        // await example3_CustomEventHooks();     // Uncomment to test
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

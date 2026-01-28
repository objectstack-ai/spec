/**
 * MicroKernel Test Suite
 * 
 * Tests the new ObjectKernel (MicroKernel) architecture:
 * 1. Basic plugin registration and lifecycle
 * 2. Service registry (registerService/getService)
 * 3. Dependency resolution
 * 4. Hook/event system
 * 5. ObjectQL as a plugin
 * 6. Multiple plugins working together
 */

import { ObjectKernel, DriverPlugin, Plugin, PluginContext } from './packages/runtime/src';
import { ObjectQLPlugin } from './packages/objectql/src';

// Test 1: Basic Plugin Lifecycle
async function testBasicLifecycle() {
    console.log('\n=== Test 1: Basic Plugin Lifecycle ===');
    
    const events: string[] = [];
    
    class TestPlugin implements Plugin {
        name = 'test-plugin';
        
        async init(ctx: PluginContext) {
            events.push('init');
        }
        
        async start(ctx: PluginContext) {
            events.push('start');
        }
        
        async destroy() {
            events.push('destroy');
        }
    }
    
    const kernel = new ObjectKernel();
    kernel.use(new TestPlugin());
    await kernel.bootstrap();
    await kernel.shutdown();
    
    const expected = ['init', 'start', 'destroy'];
    if (JSON.stringify(events) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(events)}`);
    }
    
    console.log('✅ Plugin lifecycle works correctly');
}

// Test 2: Service Registry
async function testServiceRegistry() {
    console.log('\n=== Test 2: Service Registry ===');
    
    class ServicePlugin implements Plugin {
        name = 'service-plugin';
        
        async init(ctx: PluginContext) {
            ctx.registerService('test-service', { value: 42 });
        }
    }
    
    const kernel = new ObjectKernel();
    kernel.use(new ServicePlugin());
    await kernel.bootstrap();
    
    const service = kernel.getService<any>('test-service');
    if (service.value !== 42) {
        throw new Error('Service not registered correctly');
    }
    
    await kernel.shutdown();
    console.log('✅ Service registry works correctly');
}

// Test 3: Dependency Resolution
async function testDependencyResolution() {
    console.log('\n=== Test 3: Dependency Resolution ===');
    
    const initOrder: string[] = [];
    
    class PluginA implements Plugin {
        name = 'plugin-a';
        async init(ctx: PluginContext) {
            initOrder.push('A');
        }
    }
    
    class PluginB implements Plugin {
        name = 'plugin-b';
        dependencies = ['plugin-a'];
        async init(ctx: PluginContext) {
            initOrder.push('B');
        }
    }
    
    class PluginC implements Plugin {
        name = 'plugin-c';
        dependencies = ['plugin-b'];
        async init(ctx: PluginContext) {
            initOrder.push('C');
        }
    }
    
    const kernel = new ObjectKernel();
    // Register in reverse order to test dependency resolution
    kernel.use(new PluginC());
    kernel.use(new PluginB());
    kernel.use(new PluginA());
    
    await kernel.bootstrap();
    
    if (JSON.stringify(initOrder) !== JSON.stringify(['A', 'B', 'C'])) {
        throw new Error(`Expected ['A', 'B', 'C'], got ${JSON.stringify(initOrder)}`);
    }
    
    await kernel.shutdown();
    console.log('✅ Dependency resolution works correctly');
}

// Test 4: Hook System
async function testHookSystem() {
    console.log('\n=== Test 4: Hook System ===');
    
    const hookCalls: string[] = [];
    
    class HookPlugin implements Plugin {
        name = 'hook-plugin';
        
        async init(ctx: PluginContext) {
            ctx.hook('test-event', () => {
                hookCalls.push('hook1');
            });
            ctx.hook('test-event', () => {
                hookCalls.push('hook2');
            });
        }
        
        async start(ctx: PluginContext) {
            await ctx.trigger('test-event');
        }
    }
    
    const kernel = new ObjectKernel();
    kernel.use(new HookPlugin());
    await kernel.bootstrap();
    
    if (JSON.stringify(hookCalls) !== JSON.stringify(['hook1', 'hook2'])) {
        throw new Error(`Expected ['hook1', 'hook2'], got ${JSON.stringify(hookCalls)}`);
    }
    
    await kernel.shutdown();
    console.log('✅ Hook system works correctly');
}

// Test 5: ObjectQL as Plugin
async function testObjectQLPlugin() {
    console.log('\n=== Test 5: ObjectQL as Plugin ===');
    
    const kernel = new ObjectKernel();
    kernel.use(new ObjectQLPlugin());
    await kernel.bootstrap();
    
    const objectql = kernel.getService<any>('objectql');
    if (!objectql) {
        throw new Error('ObjectQL service not registered');
    }
    
    await kernel.shutdown();
    console.log('✅ ObjectQL plugin works correctly');
}

// Test 6: Multiple Plugins
async function testMultiplePlugins() {
    console.log('\n=== Test 6: Multiple Plugins with Dependencies ===');
    
    // Mock driver
    const mockDriver = {
        name: 'mock-driver',
        registerDriver(driver: any) {
            // Mock implementation
        },
    };
    
    class DataPlugin implements Plugin {
        name = 'data-plugin';
        
        async init(ctx: PluginContext) {
            ctx.registerService('data', { query: () => 'data' });
        }
    }
    
    class ApiPlugin implements Plugin {
        name = 'api-plugin';
        dependencies = ['data-plugin'];
        
        async init(ctx: PluginContext) {
            const data = ctx.getService<any>('data');
            ctx.registerService('api', { getData: () => data.query() });
        }
    }
    
    const kernel = new ObjectKernel();
    kernel.use(new ApiPlugin());
    kernel.use(new DataPlugin());
    await kernel.bootstrap();
    
    const api = kernel.getService<any>('api');
    if (api.getData() !== 'data') {
        throw new Error('Plugin dependencies not working');
    }
    
    await kernel.shutdown();
    console.log('✅ Multiple plugins with dependencies work correctly');
}

// Test 7: Error Handling
async function testErrorHandling() {
    console.log('\n=== Test 7: Error Handling ===');
    
    // Test duplicate service registration
    try {
        class DuplicatePlugin implements Plugin {
            name = 'dup-plugin';
            async init(ctx: PluginContext) {
                ctx.registerService('dup', {});
                ctx.registerService('dup', {}); // Should throw
            }
        }
        
        const kernel = new ObjectKernel();
        kernel.use(new DuplicatePlugin());
        await kernel.bootstrap();
        throw new Error('Should have thrown on duplicate service');
    } catch (e: unknown) {
        const error = e as Error;
        if (!error.message.includes('already registered')) {
            throw new Error('Wrong error message');
        }
    }
    
    // Test missing dependency
    try {
        class MissingDepPlugin implements Plugin {
            name = 'missing-dep';
            dependencies = ['non-existent'];
            async init(ctx: PluginContext) {}
        }
        
        const kernel = new ObjectKernel();
        kernel.use(new MissingDepPlugin());
        await kernel.bootstrap();
        throw new Error('Should have thrown on missing dependency');
    } catch (e: unknown) {
        const error = e as Error;
        if (!error.message.includes('not found')) {
            throw new Error('Wrong error message');
        }
    }
    
    console.log('✅ Error handling works correctly');
}

// Run all tests
async function runAllTests() {
    console.log('🧪 Starting MicroKernel Test Suite...\n');
    
    try {
        await testBasicLifecycle();
        await testServiceRegistry();
        await testDependencyResolution();
        await testHookSystem();
        await testObjectQLPlugin();
        await testMultiplePlugins();
        await testErrorHandling();
        
        console.log('\n✅ All MicroKernel tests passed!\n');
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

runAllTests();

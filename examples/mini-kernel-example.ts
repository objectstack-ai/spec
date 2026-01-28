/**
 * MiniKernel Architecture Example
 * 
 * This example demonstrates the new ObjectKernel (MiniKernel) architecture
 * where ObjectQL, Drivers, and HTTP Server are all equal plugins.
 */

import { ObjectKernel, DriverPlugin } from '@objectstack/runtime';
import { ObjectQLPlugin } from '@objectstack/objectql';

// Mock driver for demonstration
const mockDriver = {
    name: 'memory-driver',
    version: '1.0.0',
    capabilities: {
        crud: true,
        query: true,
    },
    async connect() {
        console.log('[MockDriver] Connected');
    },
    async disconnect() {
        console.log('[MockDriver] Disconnected');
    },
    async find(objectName: string, query: any) {
        console.log(`[MockDriver] Finding in ${objectName}:`, query);
        return [];
    },
    async findOne(objectName: string, id: string) {
        console.log(`[MockDriver] Finding one in ${objectName}:`, id);
        return null;
    },
    async create(objectName: string, data: any) {
        console.log(`[MockDriver] Creating in ${objectName}:`, data);
        return { id: 'mock-id', ...data };
    },
    async update(objectName: string, id: string, data: any) {
        console.log(`[MockDriver] Updating ${objectName}/${id}:`, data);
        return { id, ...data };
    },
    async delete(objectName: string, id: string) {
        console.log(`[MockDriver] Deleting ${objectName}/${id}`);
        return { id };
    },
    registerDriver(driver: any) {
        // Mock implementation
    },
};

async function main() {
    console.log('🚀 Starting MiniKernel Example\n');

    // Create kernel instance
    const kernel = new ObjectKernel();

    // Register plugins in any order - kernel will resolve dependencies
    kernel
        .use(new DriverPlugin(mockDriver, 'memory'))  // Depends on ObjectQL
        .use(new ObjectQLPlugin());                    // No dependencies

    // Bootstrap the kernel
    await kernel.bootstrap();

    // Access services
    console.log('\n📦 Accessing Services:');
    const objectql = kernel.getService('objectql');
    console.log('✅ ObjectQL service available:', !!objectql);

    console.log('\n✅ MiniKernel example completed successfully!\n');

    // Shutdown
    await kernel.shutdown();
}

// Run example
main().catch(console.error);

/**
 * REST Server Usage Example
 * 
 * This example demonstrates how to use the RestServer to automatically
 * generate RESTful CRUD endpoints for your ObjectStack application.
 */

import { RestServer, RouteEntry } from '@objectstack/runtime';
import type { ObjectStackProtocol } from '@objectstack/spec/api';

/**
 * Example: Mock Protocol Provider
 * 
 * In a real application, this would be provided by your ObjectQL engine
 * or data layer implementation.
 */
class MockProtocolProvider {
    private data: Map<string, any[]> = new Map();
    
    getDiscovery() {
        return {
            version: 'v1',
            apiName: 'ObjectStack API',
            capabilities: ['crud', 'metadata', 'batch'],
            endpoints: {
                discovery: '/api/v1',
                metadata: '/api/v1/meta',
                data: '/api/v1/data',
            }
        };
    }
    
    getMetaTypes() {
        return ['object', 'field', 'plugin'];
    }
    
    getMetaItems(type: string) {
        if (type === 'object') {
            return [
                { name: 'user', label: 'User', fields: [] },
                { name: 'project', label: 'Project', fields: [] }
            ];
        }
        return [];
    }
    
    getMetaItem(type: string, name: string) {
        if (type === 'object' && name === 'user') {
            return {
                name: 'user',
                label: 'User',
                fields: [
                    { name: 'id', type: 'text', label: 'ID' },
                    { name: 'name', type: 'text', label: 'Name' },
                    { name: 'email', type: 'text', label: 'Email' }
                ]
            };
        }
        throw new Error('Not found');
    }
    
    getUiView(object: string, type: 'list' | 'form') {
        return {
            object,
            type,
            view: { /* view definition */ }
        };
    }
    
    async findData(object: string, query: any) {
        const records = this.data.get(object) || [];
        return records;
    }
    
    async getData(object: string, id: string) {
        const records = this.data.get(object) || [];
        const record = records.find(r => r.id === id);
        if (!record) throw new Error('Not found');
        return record;
    }
    
    async createData(object: string, data: any) {
        const records = this.data.get(object) || [];
        const newRecord = { id: Date.now().toString(), ...data };
        records.push(newRecord);
        this.data.set(object, records);
        return newRecord;
    }
    
    async updateData(object: string, id: string, data: any) {
        const records = this.data.get(object) || [];
        const index = records.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Not found');
        records[index] = { ...records[index], ...data };
        this.data.set(object, records);
        return records[index];
    }
    
    async deleteData(object: string, id: string) {
        const records = this.data.get(object) || [];
        const index = records.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Not found');
        records.splice(index, 1);
        this.data.set(object, records);
        return { success: true };
    }
    
    async getMetaItemCached(request: any) {
        return {
            type: request.type,
            name: request.name,
            item: await this.getMetaItem(request.type, request.name),
            cached: false
        };
    }
    
    async batchData(request: any) {
        const results = [];
        for (const op of request.operations || []) {
            try {
                let result;
                if (op.operation === 'create') {
                    result = await this.createData(op.object, op.data);
                } else if (op.operation === 'update') {
                    result = await this.updateData(op.object, op.id, op.data);
                } else if (op.operation === 'delete') {
                    result = await this.deleteData(op.object, op.id);
                }
                results.push({ success: true, data: result });
            } catch (error) {
                results.push({ success: false, error: (error as Error).message });
            }
        }
        return { results };
    }
    
    async createManyData(object: string, records: any[]) {
        const existing = this.data.get(object) || [];
        const newRecords = records.map(r => ({ id: Date.now().toString(), ...r }));
        existing.push(...newRecords);
        this.data.set(object, existing);
        return newRecords;
    }
    
    async updateManyData(request: any) {
        const results = [];
        for (const id of request.ids || []) {
            try {
                const result = await this.updateData(request.object, id, request.data);
                results.push({ success: true, data: result });
            } catch (error) {
                results.push({ success: false, error: (error as Error).message });
            }
        }
        return { results };
    }
    
    async deleteManyData(request: any) {
        const results = [];
        for (const id of request.ids || []) {
            try {
                const result = await this.deleteData(request.object, id);
                results.push({ success: true, data: result });
            } catch (error) {
                results.push({ success: false, error: (error as Error).message });
            }
        }
        return { results };
    }
}

/**
 * Example: Setting up REST Server
 */
async function setupRestServer() {
    // 1. Create an HTTP server instance (in real app, use Hono, Express, etc.)
    // For this example, we'll assume you have an IHttpServer implementation
    const httpServer = {} as any; // Placeholder - use actual server in production
    
    // 2. Create a protocol provider
    const protocol = new MockProtocolProvider() as any as ObjectStackProtocol;
    
    // 3. Create REST server with configuration
    const restServer = new RestServer(httpServer, protocol, {
        api: {
            version: 'v1',
            basePath: '/api',
            enableCrud: true,
            enableMetadata: true,
            enableBatch: true,
            enableDiscovery: true,
        },
        crud: {
            dataPrefix: '/data',
            objectParamStyle: 'path' as const,
            operations: {
                create: true,
                read: true,
                update: true,
                delete: true,
                list: true,
            }
        },
        metadata: {
            prefix: '/meta',
            enableCache: true,
            cacheTtl: 300, // 5 minutes
        },
        batch: {
            maxBatchSize: 200,
            enableBatchEndpoint: true,
            defaultAtomic: true,
            operations: {
                createMany: true,
                updateMany: true,
                deleteMany: true,
                upsertMany: true,
            }
        }
    });
    
    // 4. Register all routes
    restServer.registerRoutes();
    
    // 5. Get route information (useful for debugging)
    const routes = restServer.getRoutes();
    console.log(`Registered ${routes.length} routes:`);
    routes.forEach((route: RouteEntry) => {
        console.log(`  ${route.method} ${route.path}`);
    });
    
    return restServer;
}

/**
 * Example: Generated Endpoints
 * 
 * After calling restServer.registerRoutes(), the following endpoints are available:
 * 
 * Discovery:
 * - GET /api/v1                          - API discovery
 * 
 * Metadata:
 * - GET /api/v1/meta                     - List metadata types
 * - GET /api/v1/meta/:type               - List items of a type
 * - GET /api/v1/meta/:type/:name         - Get specific metadata item
 * 
 * CRUD (for each object):
 * - GET /api/v1/data/:object             - List/query records
 * - GET /api/v1/data/:object/:id         - Get record by ID
 * - POST /api/v1/data/:object            - Create record
 * - PATCH /api/v1/data/:object/:id       - Update record
 * - DELETE /api/v1/data/:object/:id      - Delete record
 * 
 * Batch Operations:
 * - POST /api/v1/data/:object/batch      - Generic batch operations
 * - POST /api/v1/data/:object/createMany - Bulk create
 * - POST /api/v1/data/:object/updateMany - Bulk update
 * - POST /api/v1/data/:object/deleteMany - Bulk delete
 */

/**
 * Example: Making API Requests
 */
async function exampleApiUsage() {
    // Create a user
    const createResponse = await fetch('http://localhost:3000/api/v1/data/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com'
        })
    });
    const newUser = await createResponse.json() as { id: string; name: string; email: string };
    console.log('Created user:', newUser);
    
    // List users
    const listResponse = await fetch('http://localhost:3000/api/v1/data/user');
    const users = await listResponse.json();
    console.log('Users:', users);
    
    // Get user by ID
    const getResponse = await fetch(`http://localhost:3000/api/v1/data/user/${newUser.id}`);
    const user = await getResponse.json();
    console.log('User:', user);
    
    // Update user
    const updateResponse = await fetch(`http://localhost:3000/api/v1/data/user/${newUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'John Smith'
        })
    });
    const updatedUser = await updateResponse.json();
    console.log('Updated user:', updatedUser);
    
    // Bulk create users
    const bulkCreateResponse = await fetch('http://localhost:3000/api/v1/data/user/createMany', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
            { name: 'Jane Doe', email: 'jane@example.com' },
            { name: 'Bob Smith', email: 'bob@example.com' }
        ])
    });
    const newUsers = await bulkCreateResponse.json();
    console.log('Created users:', newUsers);
    
    // Delete user
    const deleteResponse = await fetch(`http://localhost:3000/api/v1/data/user/${newUser.id}`, {
        method: 'DELETE'
    });
    const deleteResult = await deleteResponse.json();
    console.log('Delete result:', deleteResult);
}

// Export for use in other modules
export { setupRestServer, exampleApiUsage, MockProtocolProvider };

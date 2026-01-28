/**
 * Test file to verify capability contract interfaces
 * 
 * This file demonstrates how plugins can implement the IHttpServer
 * and IDataEngine interfaces without depending on concrete implementations.
 * 
 * Primary Implementations in ObjectStack:
 * - IHttpServer → Hono (@objectstack/plugin-hono-server)
 * - IDataEngine → ObjectQL (@objectstack/objectql)
 * 
 * This mock implementation is for testing purposes only.
 */

import { IHttpServer, IDataEngine, RouteHandler, IHttpRequest, IHttpResponse, Middleware, QueryOptions } from './index.js';

/**
 * Example: Mock HTTP Server Plugin
 * 
 * Shows how a plugin can implement the IHttpServer interface.
 * 
 * Note: In production ObjectStack applications, use Hono via
 * @objectstack/plugin-hono-server as the canonical implementation.
 * This mock is for testing the interface contract only.
 */
class MockHttpServer implements IHttpServer {
    private routes: Map<string, { method: string; handler: RouteHandler }> = new Map();
    
    get(path: string, handler: RouteHandler): void {
        this.routes.set(`GET:${path}`, { method: 'GET', handler });
        console.log(`✅ Registered GET ${path}`);
    }
    
    post(path: string, handler: RouteHandler): void {
        this.routes.set(`POST:${path}`, { method: 'POST', handler });
        console.log(`✅ Registered POST ${path}`);
    }
    
    put(path: string, handler: RouteHandler): void {
        this.routes.set(`PUT:${path}`, { method: 'PUT', handler });
        console.log(`✅ Registered PUT ${path}`);
    }
    
    delete(path: string, handler: RouteHandler): void {
        this.routes.set(`DELETE:${path}`, { method: 'DELETE', handler });
        console.log(`✅ Registered DELETE ${path}`);
    }
    
    patch(path: string, handler: RouteHandler): void {
        this.routes.set(`PATCH:${path}`, { method: 'PATCH', handler });
        console.log(`✅ Registered PATCH ${path}`);
    }
    
    use(path: string | Middleware, handler?: Middleware): void {
        console.log(`✅ Registered middleware`);
    }
    
    async listen(port: number): Promise<void> {
        console.log(`✅ Mock HTTP server listening on port ${port}`);
    }
    
    async close(): Promise<void> {
        console.log(`✅ Mock HTTP server closed`);
    }
}

/**
 * Example: Mock Data Engine Plugin
 * 
 * Shows how a plugin can implement the IDataEngine interface.
 * 
 * Note: In production ObjectStack applications, use ObjectQL via
 * @objectstack/objectql as the canonical implementation.
 * This mock is for testing the interface contract only.
 */
class MockDataEngine implements IDataEngine {
    private store: Map<string, Map<string, any>> = new Map();
    private idCounter = 0;
    
    async insert(objectName: string, data: any): Promise<any> {
        if (!this.store.has(objectName)) {
            this.store.set(objectName, new Map());
        }
        
        const id = `${objectName}_${++this.idCounter}`;
        const record = { id, ...data };
        this.store.get(objectName)!.set(id, record);
        
        console.log(`✅ Inserted into ${objectName}:`, record);
        return record;
    }
    
    async find(objectName: string, query?: QueryOptions): Promise<any[]> {
        const objectStore = this.store.get(objectName);
        if (!objectStore) {
            return [];
        }
        
        const results = Array.from(objectStore.values());
        console.log(`✅ Found ${results.length} records in ${objectName}`);
        return results;
    }
    
    async update(objectName: string, id: any, data: any): Promise<any> {
        const objectStore = this.store.get(objectName);
        if (!objectStore || !objectStore.has(id)) {
            throw new Error(`Record ${id} not found in ${objectName}`);
        }
        
        const existing = objectStore.get(id);
        const updated = { ...existing, ...data };
        objectStore.set(id, updated);
        
        console.log(`✅ Updated ${objectName}/${id}:`, updated);
        return updated;
    }
    
    async delete(objectName: string, id: any): Promise<boolean> {
        const objectStore = this.store.get(objectName);
        if (!objectStore) {
            return false;
        }
        
        const deleted = objectStore.delete(id);
        console.log(`✅ Deleted ${objectName}/${id}: ${deleted}`);
        return deleted;
    }
}

/**
 * Test the interfaces
 */
async function testInterfaces() {
    console.log('\n=== Testing IHttpServer Interface ===\n');
    
    const httpServer: IHttpServer = new MockHttpServer();
    
    // Register routes using the interface
    httpServer.get('/api/users', async (req, res) => {
        res.json({ users: [] });
    });
    
    httpServer.post('/api/users', async (req, res) => {
        res.status(201).json({ id: 1, ...req.body });
    });
    
    await httpServer.listen(3000);
    
    console.log('\n=== Testing IDataEngine Interface ===\n');
    
    const dataEngine: IDataEngine = new MockDataEngine();
    
    // Use the data engine interface
    const user1 = await dataEngine.insert('user', {
        name: 'John Doe',
        email: 'john@example.com'
    });
    
    const user2 = await dataEngine.insert('user', {
        name: 'Jane Smith',
        email: 'jane@example.com'
    });
    
    const users = await dataEngine.find('user');
    console.log(`Found ${users.length} users after inserts`);
    
    const updatedUser = await dataEngine.update('user', user1.id, {
        name: 'John Updated'
    });
    console.log(`Updated user:`, updatedUser);
    
    const deleted = await dataEngine.delete('user', user2.id);
    console.log(`Delete result: ${deleted}`);
    
    console.log('\n✅ All interface tests passed!\n');
    
    if (httpServer.close) {
        await httpServer.close();
    }
}

// Run tests
testInterfaces().catch(console.error);

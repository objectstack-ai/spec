import { SchemaRegistry, ObjectQL } from '@objectstack/objectql';
import { ObjectKernel } from './mini-kernel.js';

export interface ApiRequest {
    params: Record<string, string>;
    query: Record<string, string | string[]>;
    body?: any;
}

export class ObjectStackRuntimeProtocol {
    private engine: ObjectKernel;
    private objectql?: ObjectQL;

    constructor(engine: ObjectKernel) {
        this.engine = engine;
        
        // Get ObjectQL service from kernel - will be validated when needed
        try {
            this.objectql = engine.getService<ObjectQL>('objectql');
        } catch (e) {
            // Don't fail construction - some protocol methods may still work
            // Error will be thrown when getObjectQL() is called
            console.warn('[Protocol] ObjectQL service not found in kernel - data operations will fail');
        }
    }
    
    /**
     * Get ObjectQL instance
     * @throws Error if ObjectQL is not available
     */
    private getObjectQL(): ObjectQL {
        if (!this.objectql) {
            throw new Error('[Protocol] ObjectQL service not available in kernel. Ensure ObjectQLPlugin is registered and initialized.');
        }
        return this.objectql;
    }

    // 1. Discovery
    getDiscovery() {
        return {
            name: 'ObjectOS Server',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            routes: {
                discovery: '/api/v1',
                metadata: '/api/v1/meta',
                data: '/api/v1/data',
                auth: '/api/v1/auth',
                ui: '/api/v1/ui'
            },
            capabilities: {
                search: true,
                files: true
            }
        };
    }

    // 2. Metadata: List Types
    getMetaTypes() {
        const types = SchemaRegistry.getRegisteredTypes();
        return {
            data: types.map(type => ({
                type,
                href: `/api/v1/meta/${type}s`,
                count: SchemaRegistry.listItems(type).length
            }))
        };
    }

    // 3. Metadata: List Items by Type
    getMetaItems(typePlural: string) {
        // Simple Singularization Mapping
        const typeMap: Record<string, string> = {
            'objects': 'object',
            'apps': 'app',
            'flows': 'flow',
            'reports': 'report',
            'plugins': 'plugin',
            'kinds': 'kind'
        };
        const type = typeMap[typePlural] || typePlural;
        const items = SchemaRegistry.listItems(type);

        const summaries = items.map((item: any) => ({
            id: item.id,
            name: item.name,
            label: item.label,
            type: item.type,
            icon: item.icon,
            description: item.description,
            ...(type === 'object' ? { path: `/api/v1/data/${item.name}` } : {}),
            self: `/api/v1/meta/${typePlural}/${item.name || item.id}`
        }));

        return { data: summaries };
    }

    // 4. Metadata: Get Single Item
    getMetaItem(typePlural: string, name: string) {
        const typeMap: Record<string, string> = {
            'objects': 'object',
            'apps': 'app',
            'flows': 'flow',
            'reports': 'report',
            'plugins': 'plugin',
            'kinds': 'kind'
        };
        const type = typeMap[typePlural] || typePlural;
        const item = SchemaRegistry.getItem(type, name);
        if (!item) throw new Error(`Metadata not found: ${type}/${name}`);
        return item;
    }

    // 5. UI: View Definition
    getUiView(objectName: string, type: 'list' | 'form') {
        // Generate view from schema
        const schema = SchemaRegistry.getObject(objectName);
        if (!schema) throw new Error(`Unknown object: ${objectName}`);
        
        if (type === 'list') {
            return {
                type: 'datagrid',
                title: `${schema.label || objectName} List`,
                columns: Object.keys(schema.fields || {}).map(key => ({
                    field: key,
                    label: schema.fields?.[key]?.label || key,
                    width: 150
                })),
                actions: ['create', 'edit', 'delete']
            };
        }
        throw new Error('View not generated');
    }

    // 6. Data: Find
    async findData(objectName: string, query: any) {
        const ql = this.getObjectQL();
        const results = await ql.find(objectName, query || { top: 100 });
        return { value: results, count: results.length };
    }

    // 7. Data: Query (Advanced AST)
    async queryData(objectName: string, body: any) {
        const ql = this.getObjectQL();
        const results = await ql.find(objectName, body || { top: 100 });
        return { value: results, count: results.length };
    }

    // 8. Data: Get
    async getData(objectName: string, id: string) {
        const ql = this.getObjectQL();
        // TODO: Implement proper ID-based lookup once ObjectQL supports it
        // For now, this is a limitation of the current ObjectQL API
        const results = await ql.find(objectName, { top: 1, filter: { id } });
        return results[0];
    }

    // 9. Data: Create
    async createData(objectName: string, body: any) {
        const ql = this.getObjectQL();
        return await ql.insert(objectName, body);
    }

    // 10. Data: Update
    async updateData(objectName: string, id: string, body: any) {
        const ql = this.getObjectQL();
        return await ql.update(objectName, id, body);
    }

    // 11. Data: Delete
    async deleteData(objectName: string, id: string) {
        const ql = this.getObjectQL();
        return await ql.delete(objectName, id);
    }
}

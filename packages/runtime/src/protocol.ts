import { SchemaRegistry, ObjectQL } from '@objectstack/objectql';
import { ObjectStackKernel } from './kernel.js';
import { ObjectKernel } from './mini-kernel.js';

export interface ApiRequest {
    params: Record<string, string>;
    query: Record<string, string | string[]>;
    body?: any;
}

export class ObjectStackRuntimeProtocol {
    private engine: ObjectStackKernel | ObjectKernel;
    private legacyKernel?: ObjectStackKernel;
    private objectql?: ObjectQL;

    constructor(engine: ObjectStackKernel | ObjectKernel) {
        this.engine = engine;
        
        // Detect which kernel type we're using
        if (engine instanceof ObjectStackKernel) {
            this.legacyKernel = engine;
        } else if (engine instanceof ObjectKernel) {
            // Get ObjectQL service from kernel
            try {
                this.objectql = engine.getService<ObjectQL>('objectql');
            } catch (e) {
                console.warn('[Protocol] ObjectQL service not found in kernel');
            }
        }
    }
    
    /**
     * Get ObjectQL instance - works with both kernel types
     */
    private getObjectQL(): ObjectQL {
        if (this.legacyKernel) {
            if (!this.legacyKernel.ql) {
                throw new Error('[Protocol] ObjectQL not initialized in legacy kernel');
            }
            return this.legacyKernel.ql;
        }
        if (!this.objectql) {
            throw new Error('[Protocol] ObjectQL service not available');
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
        // Use legacy kernel method if available
        if (this.legacyKernel) {
            const view = this.legacyKernel.getView(objectName, type);
            if (!view) throw new Error('View not generated');
            return view;
        }
        
        // Otherwise generate view from schema
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
        if (this.legacyKernel) {
            return await this.legacyKernel.find(objectName, query);
        }
        const ql = this.getObjectQL();
        const results = await ql.find(objectName, { top: 100 });
        return { value: results, count: results.length };
    }

    // 7. Data: Query (Advanced AST)
    async queryData(objectName: string, body: any) {
        if (this.legacyKernel) {
            return await this.legacyKernel.find(objectName, body);
        }
        const ql = this.getObjectQL();
        const results = await ql.find(objectName, { top: 100 });
        return { value: results, count: results.length };
    }

    // 8. Data: Get
    async getData(objectName: string, id: string) {
        if (this.legacyKernel) {
            return await this.legacyKernel.get(objectName, id);
        }
        const ql = this.getObjectQL();
        const results = await ql.find(objectName, { top: 1 });
        return results[0];
    }

    // 9. Data: Create
    async createData(objectName: string, body: any) {
        if (this.legacyKernel) {
            return await this.legacyKernel.create(objectName, body);
        }
        const ql = this.getObjectQL();
        return await ql.insert(objectName, body);
    }

    // 10. Data: Update
    async updateData(objectName: string, id: string, body: any) {
        if (this.legacyKernel) {
            return await this.legacyKernel.update(objectName, id, body);
        }
        const ql = this.getObjectQL();
        return await ql.update(objectName, id, body);
    }

    // 11. Data: Delete
    async deleteData(objectName: string, id: string) {
        if (this.legacyKernel) {
            return await this.legacyKernel.delete(objectName, id);
        }
        const ql = this.getObjectQL();
        return await ql.delete(objectName, id);
    }
}

import { SchemaRegistry } from '@objectstack/objectql';
import { ObjectStackKernel } from './kernel';

export interface ApiRequest {
    params: Record<string, string>;
    query: Record<string, string | string[]>;
    body?: any;
}

export class ObjectStackRuntimeProtocol {
    private engine: ObjectStackKernel;

    constructor(engine: ObjectStackKernel) {
        this.engine = engine;
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
        console.log(`[Protocol] getMetaItem called for ${typePlural}/${name}`);
        const typeMap: Record<string, string> = {
            'objects': 'object',
            'apps': 'app',
            'flows': 'flow',
            'reports': 'report',
            'plugins': 'plugin',
            'kinds': 'kind'
        };
        const type = typeMap[typePlural] || typePlural;
        console.log(`[Protocol] Resolved type: ${type}`);
        const item = SchemaRegistry.getItem(type, name);
        if (!item) throw new Error(`Metadata not found: ${type}/${name}`);
        return item;
    }

    // 5. UI: View Definition
    getUiView(objectName: string, type: 'list' | 'form') {
        const view = this.engine.getView(objectName, type);
        if (!view) throw new Error('View not generated');
        return view;
    }

    // 6. Data: Find
    async findData(objectName: string, query: any) {
        return await this.engine.find(objectName, query);
    }

    // 7. Data: Query (Advanced AST)
    async queryData(objectName: string, body: any) {
        return await this.engine.find(objectName, body);
    }

    // 8. Data: Get
    async getData(objectName: string, id: string) {
        return await this.engine.get(objectName, id);
    }

    // 9. Data: Create
    async createData(objectName: string, body: any) {
        return await this.engine.create(objectName, body);
    }

    // 10. Data: Update
    async updateData(objectName: string, id: string, body: any) {
        return await this.engine.update(objectName, id, body);
    }

    // 11. Data: Delete
    async deleteData(objectName: string, id: string) {
        return await this.engine.delete(objectName, id);
    }
}

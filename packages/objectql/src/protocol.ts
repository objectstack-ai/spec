import { ObjectStackProtocol } from '@objectstack/spec/api';
import { IDataEngine } from '@objectstack/core';
import type { 
    BatchUpdateRequest, 
    BatchUpdateResponse, 
    UpdateManyRequest,
    DeleteManyRequest,
    BatchOperationResult
} from '@objectstack/spec/api';
import type { MetadataCacheRequest, MetadataCacheResponse } from '@objectstack/spec/api';
import type { 
    CreateViewRequest, 
    UpdateViewRequest,
    ListViewsRequest,
    ViewResponse,
    ListViewsResponse,
    SavedView
} from '@objectstack/spec/api';

// We import SchemaRegistry directly since this class lives in the same package
import { SchemaRegistry } from './registry';

/**
 * Simple hash function for ETag generation (browser-compatible)
 * Uses a basic hash algorithm instead of crypto.createHash
 */
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}

export class ObjectStackProtocolImplementation implements ObjectStackProtocol {
    private engine: IDataEngine;
    private viewStorage: Map<string, SavedView> = new Map();

    constructor(engine: IDataEngine) {
        this.engine = engine;
    }

    async getDiscovery(request: {}) {
        return {
            version: '1.0',
            apiName: 'ObjectStack API',
            capabilities: ['metadata', 'data', 'ui'],
            endpoints: {}
        };
    }

    async getMetaTypes(request: {}) {
        return {
            types: SchemaRegistry.getRegisteredTypes()
        };
    }

    async getMetaItems(request: { type: string }) {
        return {
            type: request.type,
            items: SchemaRegistry.listItems(request.type)
        };
    }

    async getMetaItem(request: { type: string, name: string }) {
        return {
            type: request.type,
            name: request.name,
            item: SchemaRegistry.getItem(request.type, request.name)
        };
    }

    async getUiView(request: { object: string, type: 'list' | 'form' }) {
        const schema = SchemaRegistry.getObject(request.object);
        if (!schema) throw new Error(`Object ${request.object} not found`);

        let view: any;
        if (request.type === 'list') {
            view = {
                type: 'list',
                object: request.object,
                columns: Object.keys(schema.fields || {}).slice(0, 5).map(f => ({
                    field: f,
                    label: schema.fields[f].label || f
                }))
            };
        } else {
             view = {
                type: 'form',
                object: request.object,
                sections: [
                    {
                        label: 'General',
                        fields: Object.keys(schema.fields || {}).map(f => ({
                            field: f
                        }))
                    }
                ]
            };
        }
        return {
            object: request.object,
            type: request.type,
            view
        };
    }

    async findData(request: { object: string, query?: any }) {
        // TODO: Normalize query from HTTP Query params (string values) to DataEngineQueryOptions (typed)
        // For now, we assume query is partially compatible or simple enough.
        // We should parse 'top', 'skip', 'limit' to numbers if they are strings.
        const options: any = { ...request.query };
        if (options.top) options.top = Number(options.top);
        if (options.skip) options.skip = Number(options.skip);
        if (options.limit) options.limit = Number(options.limit);
        
        // Handle OData style $filter if present, or flat filters
        // This is a naive implementation, a real OData parser is needed for complex scenarios.
        
        const records = await this.engine.find(request.object, options);
        return {
            object: request.object,
            records
        };
    }

    async getData(request: { object: string, id: string }) {
        const result = await this.engine.findOne(request.object, {
            filter: { _id: request.id }
        });
        if (result) {
            return {
                object: request.object,
                id: request.id,
                record: result
            };
        }
        throw new Error(`Record ${request.id} not found in ${request.object}`);
    }

    async createData(request: { object: string, data: any }) {
        const result = await this.engine.insert(request.object, request.data);
        return {
            object: request.object,
            id: result._id || result.id,
            record: result
        };
    }

    async updateData(request: { object: string, id: string, data: any }) {
        // Adapt: update(obj, id, data) -> update(obj, data, options)
        const result = await this.engine.update(request.object, request.data, { filter: { _id: request.id } });
        return {
            object: request.object,
            id: request.id,
            record: result
        };
    }

    async deleteData(request: { object: string, id: string }) {
        // Adapt: delete(obj, id) -> delete(obj, options)
        await this.engine.delete(request.object, { filter: { _id: request.id } });
        return {
            object: request.object,
            id: request.id,
            success: true
        };
    }

    // ==========================================
    // Metadata Caching
    // ==========================================

    async getMetaItemCached(request: { type: string, name: string, cacheRequest?: MetadataCacheRequest }): Promise<MetadataCacheResponse> {
        try {
            const item = SchemaRegistry.getItem(request.type, request.name);
            if (!item) {
                throw new Error(`Metadata item ${request.type}/${request.name} not found`);
            }

            // Calculate ETag (simple hash of the stringified metadata)
            const content = JSON.stringify(item);
            const hash = simpleHash(content);
            const etag = { value: hash, weak: false };

            // Check If-None-Match header
            if (request.cacheRequest?.ifNoneMatch) {
                const clientEtag = request.cacheRequest.ifNoneMatch.replace(/^"(.*)"$/, '$1').replace(/^W\/"(.*)"$/, '$1');
                if (clientEtag === hash) {
                    // Return 304 Not Modified
                    return {
                        notModified: true,
                        etag,
                    };
                }
            }

            // Return full metadata with cache headers
            return {
                data: item,
                etag,
                lastModified: new Date().toISOString(),
                cacheControl: {
                    directives: ['public', 'max-age'],
                    maxAge: 3600, // 1 hour
                },
                notModified: false,
            };
        } catch (error: any) {
            throw error;
        }
    }

    // ==========================================
    // Batch Operations
    // ==========================================

    async batchData(request: { object: string, request: BatchUpdateRequest }): Promise<BatchUpdateResponse> {
        // Map high-level batch request to DataEngine batch if available
        // Or implement loop here.
        // For now, let's just fail or implement basic loop to satisfying interface
        // since full batch mapping requires careful type handling.
        throw new Error('Batch operations not yet fully implemented in protocol adapter');
    }
    
    async createManyData(request: { object: string, records: any[] }): Promise<any> {
        const records = await this.engine.insert(request.object, request.records);
        return {
            object: request.object,
            records,
            count: records.length
        };
    }
    
    async updateManyData(request: UpdateManyRequest): Promise<any> {
        return this.engine.update(request.object, request.data, {
            filter: request.filter,
            multi: true
        });
    }

    async deleteManyData(request: DeleteManyRequest): Promise<any> {
        return this.engine.delete(request.object, {
            filter: request.filter,
            multi: true
        });
    }

    // ==========================================
    // View Storage (Mock Implementation for now)
    // ==========================================

    async createView(request: CreateViewRequest): Promise<ViewResponse> {
        const id = Math.random().toString(36).substring(7);
        const view: SavedView = {
            id,
            ...request,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            owner: 'system'
        };
        this.viewStorage.set(id, view);
        return { success: true, view };
    }

    async getView(request: { id: string }): Promise<ViewResponse> {
        const view = this.viewStorage.get(request.id);
        if (!view) throw new Error(`View ${request.id} not found`);
        return { success: true, view };
    }

    async listViews(request: ListViewsRequest): Promise<ListViewsResponse> {
        const views = Array.from(this.viewStorage.values())
            .filter(v => !request?.object || v.object === request.object);
        return { success: true, views, total: views.length };
    }

    async updateView(request: UpdateViewRequest): Promise<ViewResponse> {
        const view = this.viewStorage.get(request.id);
        if (!view) throw new Error(`View ${request.id} not found`);
        
        const updated = { ...view, ...request.updates, updatedAt: new Date().toISOString() };
        this.viewStorage.set(request.id, updated);
        return { success: true, view: updated };
    }

    async deleteView(request: { id: string }): Promise<{ success: boolean }> {
        const deleted = this.viewStorage.delete(request.id);
        if (!deleted) throw new Error(`View ${request.id} not found`);
        return { success: true };
    }
}

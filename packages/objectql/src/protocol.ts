import { IObjectStackProtocolLegacy as IObjectStackProtocol } from '@objectstack/spec/api';
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

export class ObjectStackProtocolImplementation implements IObjectStackProtocol {
    private engine: IDataEngine;
    private viewStorage: Map<string, SavedView> = new Map();

    constructor(engine: IDataEngine) {
        this.engine = engine;
    }

    getDiscovery() {
        return {
            name: 'ObjectStack API',
            version: '1.0',
            capabilities: {
                metadata: true,
                data: true,
                ui: true
            }
        };
    }

    getMetaTypes() {
        return SchemaRegistry.getRegisteredTypes();
    }

    getMetaItems(type: string) {
        return SchemaRegistry.listItems(type);
    }

    getMetaItem(type: string, name: string) {
        return SchemaRegistry.getItem(type, name);
    }

    getUiView(object: string, type: 'list' | 'form') {
        const schema = SchemaRegistry.getObject(object);
        if (!schema) throw new Error(`Object ${object} not found`);

        if (type === 'list') {
            return {
                type: 'list',
                object: object,
                columns: Object.keys(schema.fields || {}).slice(0, 5).map(f => ({
                    field: f,
                    label: schema.fields[f].label || f
                }))
            };
        } else {
             return {
                type: 'form',
                object: object,
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
    }

    async findData(object: string, query: any) {
        // TODO: Normalize query from HTTP Query params (string values) to DataEngineQueryOptions (typed)
        // For now, we assume query is partially compatible or simple enough.
        // We should parse 'top', 'skip', 'limit' to numbers if they are strings.
        const options: any = { ...query };
        if (options.top) options.top = Number(options.top);
        if (options.skip) options.skip = Number(options.skip);
        if (options.limit) options.limit = Number(options.limit);
        
        // Handle OData style $filter if present, or flat filters
        // This is a naive implementation, a real OData parser is needed for complex scenarios.
        
        return this.engine.find(object, options);
    }

    async getData(object: string, id: string) {
        const results = await this.engine.findOne(object, {
            filter: { _id: id }
        });
        if (results) {
            return results;
        }
        throw new Error(`Record ${id} not found in ${object}`);
    }

    createData(object: string, data: any) {
        return this.engine.insert(object, data);
    }

    updateData(object: string, id: string, data: any) {
        // Adapt: update(obj, id, data) -> update(obj, data, options)
        return this.engine.update(object, data, { filter: { _id: id } });
    }

    deleteData(object: string, id: string) {
        // Adapt: delete(obj, id) -> delete(obj, options)
        return this.engine.delete(object, { filter: { _id: id } });
    }

    // ==========================================
    // Metadata Caching
    // ==========================================

    async getMetaItemCached(type: string, name: string, cacheRequest?: MetadataCacheRequest): Promise<MetadataCacheResponse> {
        try {
            const item = SchemaRegistry.getItem(type, name);
            if (!item) {
                throw new Error(`Metadata item ${type}/${name} not found`);
            }

            // Calculate ETag (simple hash of the stringified metadata)
            const content = JSON.stringify(item);
            const hash = simpleHash(content);
            const etag = { value: hash, weak: false };

            // Check If-None-Match header
            if (cacheRequest?.ifNoneMatch) {
                const clientEtag = cacheRequest.ifNoneMatch.replace(/^"(.*)"$/, '$1').replace(/^W\/"(.*)"$/, '$1');
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

    async batchData(object: string, request: BatchUpdateRequest): Promise<BatchUpdateResponse> {
        // Map high-level batch request to DataEngine batch if available
        // Or implement loop here.
        // For now, let's just fail or implement basic loop to satisfying interface
        // since full batch mapping requires careful type handling.
        throw new Error('Batch operations not yet fully implemented in protocol adapter');
    }
    
    async createManyData(object: string, records: any[]): Promise<any[]> {
        return this.engine.insert(object, records);
    }
    
    async updateManyData(object: string, request: UpdateManyRequest): Promise<any> {
        return this.engine.update(object, request.data, {
            filter: request.filter,
            multi: true
        });
    }

    async deleteManyData(object: string, request: DeleteManyRequest): Promise<any> {
        return this.engine.delete(object, {
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

    async getView(id: string): Promise<ViewResponse> {
        const view = this.viewStorage.get(id);
        if (!view) throw new Error(`View ${id} not found`);
        return { success: true, view };
    }

    async listViews(request?: ListViewsRequest): Promise<ListViewsResponse> {
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

    async deleteView(id: string): Promise<{ success: boolean }> {
        const deleted = this.viewStorage.delete(id);
        if (!deleted) throw new Error(`View ${id} not found`);
        return { success: true };
    }
}

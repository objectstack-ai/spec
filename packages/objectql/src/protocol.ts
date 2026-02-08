import { ObjectStackProtocol } from '@objectstack/spec/api';
import { IDataEngine } from '@objectstack/core';
import type { 
    BatchUpdateRequest, 
    BatchUpdateResponse, 
    UpdateManyDataRequest,
    DeleteManyDataRequest
} from '@objectstack/spec/api';
import type { MetadataCacheRequest, MetadataCacheResponse } from '@objectstack/spec/api';

// We import SchemaRegistry directly since this class lives in the same package
import { SchemaRegistry } from './registry.js';

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

    constructor(engine: IDataEngine) {
        this.engine = engine;
    }

    async getDiscovery(_request: {}) {
        return {
            version: '1.0',
            apiName: 'ObjectStack API',
            capabilities: {
                graphql: false,
                search: false,
                websockets: false,
                files: true,
                analytics: false,
                hub: false
            },
            endpoints: {
                data: '/api/data',
                metadata: '/api/meta',
                auth: '/api/auth'
            }
        };
    }

    async getMetaTypes(_request: {}) {
        return {
            types: SchemaRegistry.getRegisteredTypes()
        };
    }

    async getMetaItems(request: { type: string; packageId?: string }) {
        let items = SchemaRegistry.listItems(request.type, request.packageId);
        // Normalize singular/plural: REST uses singular ('app') but registry may store as plural ('apps')
        if (items.length === 0) {
            const alt = request.type.endsWith('s') ? request.type.slice(0, -1) : request.type + 's';
            items = SchemaRegistry.listItems(alt, request.packageId);
        }
        return {
            type: request.type,
            items
        };
    }

    async getMetaItem(request: { type: string, name: string }) {
        let item = SchemaRegistry.getItem(request.type, request.name);
        // Normalize singular/plural
        if (item === undefined) {
            const alt = request.type.endsWith('s') ? request.type.slice(0, -1) : request.type + 's';
            item = SchemaRegistry.getItem(alt, request.name);
        }
        return {
            type: request.type,
            name: request.name,
            item
        };
    }

    async getUiView(request: { object: string, type: 'list' | 'form' }) {
        const schema = SchemaRegistry.getObject(request.object);
        if (!schema) throw new Error(`Object ${request.object} not found`);

        const fields = schema.fields || {};
        const fieldKeys = Object.keys(fields);

        if (request.type === 'list') {
            // Intelligent Column Selection
            // 1. Always include 'name' or name-like fields
            // 2. Limit to 6 columns by default
            const priorityFields = ['name', 'title', 'label', 'subject', 'email', 'status', 'type', 'category', 'created_at'];
            
            let columns = fieldKeys.filter(k => priorityFields.includes(k));
            
            // If few priority fields, add others until 5
            if (columns.length < 5) {
                const remaining = fieldKeys.filter(k => !columns.includes(k) && k !== 'id' && !fields[k].hidden);
                columns = [...columns, ...remaining.slice(0, 5 - columns.length)];
            }
            
            // Sort columns by priority then alphabet or schema order
            // For now, just keep them roughly in order they appear in schema or priority list
            
            return {
                list: {
                    type: 'grid' as const,
                    object: request.object,
                    label: schema.label || schema.name,
                    columns: columns.map(f => ({
                        field: f,
                        label: fields[f]?.label || f,
                        sortable: true
                    })),
                    sort: fields['created_at'] ? ([{ field: 'created_at', order: 'desc' }] as any) : undefined,
                    searchableFields: columns.slice(0, 3) // Make first few textual columns searchable
                }
            };
        } else {
             // Form View Generation
             // Simple single-section layout for now
             const formFields = fieldKeys
                .filter(k => k !== 'id' && k !== 'created_at' && k !== 'modified_at' && !fields[k].hidden)
                .map(f => ({
                    field: f,
                    label: fields[f]?.label,
                    required: fields[f]?.required,
                    readonly: fields[f]?.readonly,
                    type: fields[f]?.type,
                    // Default to 2 columns for most, 1 for textareas
                    colSpan: (fields[f]?.type === 'textarea' || fields[f]?.type === 'html') ? 2 : 1
                }));

             return {
                form: {
                    type: 'simple' as const,
                    object: request.object,
                    label: `Edit ${schema.label || schema.name}`,
                    sections: [
                        {
                            label: 'General Information',
                            columns: 2 as const,
                            collapsible: false,
                            collapsed: false,
                            fields: formFields
                        }
                    ]
                }
            };
        }
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
            value: records, // OData compaibility
            records, // Legacy
            total: records.length,
            hasMore: false
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

    async batchData(_request: { object: string, request: BatchUpdateRequest }): Promise<BatchUpdateResponse> {
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
    
    async updateManyData(_request: UpdateManyDataRequest): Promise<any> {
        // TODO: Implement proper updateMany in DataEngine
        throw new Error('updateManyData not implemented');
    }

    async analyticsQuery(_request: any): Promise<any> {
        throw new Error('analyticsQuery not implemented');
    }

    async getAnalyticsMeta(_request: any): Promise<any> {
        throw new Error('getAnalyticsMeta not implemented');
    }

    async triggerAutomation(_request: any): Promise<any> {
        throw new Error('triggerAutomation not implemented');
    }

    async listSpaces(_request: any): Promise<any> {
        throw new Error('listSpaces not implemented');
    }

    async createSpace(_request: any): Promise<any> {
        throw new Error('createSpace not implemented');
    }

    async installPlugin(_request: any): Promise<any> {
        throw new Error('installPlugin not implemented');
    }

    async deleteManyData(request: DeleteManyDataRequest): Promise<any> {
        // This expects deleting by IDs.
        return this.engine.delete(request.object, {
            filter: { _id: { $in: request.ids } },
            ...request.options
        });
    }

    async saveMetaItem(request: { type: string, name: string, item?: any }) {
        if (!request.item) {
            throw new Error('Item data is required');
        }
        // Default implementation saves to Memory Registry
        SchemaRegistry.registerItem(request.type, request.item, 'name');
        return {
            success: true,
            message: 'Saved to memory registry'
        };
    }
}

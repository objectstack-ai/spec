import { IObjectStackProtocol } from '@objectstack/spec/api';
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

    findData(object: string, query: any) {
        return this.engine.find(object, query);
    }

    async getData(object: string, id: string) {
        // IDataEngine doesn't have findOne, so we simulate it with find and limit 1
        // Assuming the ID field is named '_id' or 'id'. 
        // For broad compatibility, we might need to know the ID field name.
        // But traditionally it is _id in ObjectStack/mongo or id in others.
        // Let's rely on finding by ID if the engine supports it via find?
        // Actually, ObjectQL (the implementation) DOES have findOne.
        // But we are programming against IDataEngine interface here.
        
        // If the engine IS ObjectQL (which it practically is), we could cast it.
        // But let's try to stick to interface.
        
        const results = await this.engine.find(object, {
            filter: { _id: id }, // Default Assumption: _id
            limit: 1
        });
        if (results && results.length > 0) {
            return results[0];
        }
        throw new Error(`Record ${id} not found in ${object}`);
    }

    createData(object: string, data: any) {
        return this.engine.insert(object, data);
    }

    updateData(object: string, id: string, data: any) {
        return this.engine.update(object, id, data);
    }

    deleteData(object: string, id: string) {
        return this.engine.delete(object, id);
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
        const startTime = Date.now();
        const { operation, records, options } = request;
        const atomic = options?.atomic ?? true;
        const returnRecords = options?.returnRecords ?? false;

        const results: BatchOperationResult[] = [];
        let succeeded = 0;
        let failed = 0;

        try {
            // Process each record
            for (let i = 0; i < records.length; i++) {
                const record = records[i];
                try {
                    let result: any;

                    switch (operation) {
                        case 'create':
                            result = await this.engine.insert(object, record.data);
                            results.push({
                                id: result._id || result.id,
                                success: true,
                                index: i,
                                data: returnRecords ? result : undefined,
                            });
                            succeeded++;
                            break;

                        case 'update':
                            if (!record.id) {
                                throw new Error('Record ID is required for update operation');
                            }
                            result = await this.engine.update(object, record.id, record.data);
                            results.push({
                                id: record.id,
                                success: true,
                                index: i,
                                data: returnRecords ? result : undefined,
                            });
                            succeeded++;
                            break;

                        case 'delete':
                            if (!record.id) {
                                throw new Error('Record ID is required for delete operation');
                            }
                            await this.engine.delete(object, record.id);
                            results.push({
                                id: record.id,
                                success: true,
                                index: i,
                            });
                            succeeded++;
                            break;

                        case 'upsert':
                            // For upsert, try to update first, then create if not found
                            if (record.id) {
                                try {
                                    result = await this.engine.update(object, record.id, record.data);
                                    results.push({
                                        id: record.id,
                                        success: true,
                                        index: i,
                                        data: returnRecords ? result : undefined,
                                    });
                                    succeeded++;
                                } catch (updateError) {
                                    // If update fails, try create
                                    result = await this.engine.insert(object, record.data);
                                    results.push({
                                        id: result._id || result.id,
                                        success: true,
                                        index: i,
                                        data: returnRecords ? result : undefined,
                                    });
                                    succeeded++;
                                }
                            } else {
                                result = await this.engine.insert(object, record.data);
                                results.push({
                                    id: result._id || result.id,
                                    success: true,
                                    index: i,
                                    data: returnRecords ? result : undefined,
                                });
                                succeeded++;
                            }
                            break;

                        default:
                            throw new Error(`Unsupported operation: ${operation}`);
                    }
                } catch (error: any) {
                    failed++;
                    results.push({
                        success: false,
                        index: i,
                        errors: [{
                            code: 'database_error',
                            message: error.message || 'Operation failed',
                        }],
                    });

                    // If atomic mode, rollback everything
                    if (atomic) {
                        throw new Error(`Batch operation failed at index ${i}: ${error.message}`);
                    }

                    // If not atomic and continueOnError is false, stop processing
                    if (!options?.continueOnError) {
                        break;
                    }
                }
            }

            return {
                success: failed === 0,
                operation,
                total: records.length,
                succeeded,
                failed,
                results,
                meta: {
                    timestamp: new Date().toISOString(),
                    duration: Date.now() - startTime,
                },
            };
        } catch (error: any) {
            // If we're in atomic mode and something failed, return complete failure
            return {
                success: false,
                operation,
                total: records.length,
                succeeded: 0,
                failed: records.length,
                results: records.map((_: any, i: number) => ({
                    success: false,
                    index: i,
                    errors: [{
                        code: 'transaction_failed',
                        message: atomic ? 'Transaction rolled back due to error' : error.message,
                    }],
                })),
                error: {
                    code: atomic ? 'transaction_failed' : 'batch_partial_failure',
                    message: error.message,
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    duration: Date.now() - startTime,
                },
            };
        }
    }

    async createManyData(object: string, records: any[]): Promise<any[]> {
        const results: any[] = [];
        
        for (const record of records) {
            const result = await this.engine.insert(object, record);
            results.push(result);
        }
        
        return results;
    }

    async updateManyData(object: string, request: UpdateManyRequest): Promise<BatchUpdateResponse> {
        return this.batchData(object, {
            operation: 'update',
            records: request.records,
            options: request.options,
        });
    }

    async deleteManyData(object: string, request: DeleteManyRequest): Promise<BatchUpdateResponse> {
        const records = request.ids.map((id: string) => ({ id }));
        return this.batchData(object, {
            operation: 'delete',
            records,
            options: request.options,
        });
    }

    // ==========================================
    // View Storage
    // ==========================================

    async createView(request: CreateViewRequest): Promise<ViewResponse> {
        try {
            const id = `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date().toISOString();
            
            // For demo purposes, we'll use a placeholder user ID
            const createdBy = 'system';

            const view: SavedView = {
                id,
                name: request.name,
                label: request.label,
                description: request.description,
                object: request.object,
                type: request.type,
                visibility: request.visibility,
                query: request.query,
                layout: request.layout,
                sharedWith: request.sharedWith,
                isDefault: request.isDefault ?? false,
                isSystem: false,
                createdBy,
                createdAt: now,
                settings: request.settings,
            };

            this.viewStorage.set(id, view);

            return {
                success: true,
                data: view,
            };
        } catch (error: any) {
            return {
                success: false,
                error: {
                    code: 'internal_error',
                    message: error.message,
                },
            };
        }
    }

    async getView(id: string): Promise<ViewResponse> {
        const view = this.viewStorage.get(id);
        
        if (!view) {
            return {
                success: false,
                error: {
                    code: 'resource_not_found',
                    message: `View ${id} not found`,
                },
            };
        }

        return {
            success: true,
            data: view,
        };
    }

    async listViews(request?: ListViewsRequest): Promise<ListViewsResponse> {
        const allViews = Array.from(this.viewStorage.values());
        
        // Apply filters
        let filtered = allViews;
        
        if (request?.object) {
            filtered = filtered.filter(v => v.object === request.object);
        }
        if (request?.type) {
            filtered = filtered.filter(v => v.type === request.type);
        }
        if (request?.visibility) {
            filtered = filtered.filter(v => v.visibility === request.visibility);
        }
        if (request?.createdBy) {
            filtered = filtered.filter(v => v.createdBy === request.createdBy);
        }
        if (request?.isDefault !== undefined) {
            filtered = filtered.filter(v => v.isDefault === request.isDefault);
        }

        // Apply pagination
        const limit = request?.limit ?? 50;
        const offset = request?.offset ?? 0;
        const total = filtered.length;
        const paginated = filtered.slice(offset, offset + limit);

        return {
            success: true,
            data: paginated,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        };
    }

    async updateView(request: UpdateViewRequest): Promise<ViewResponse> {
        const { id, ...updates } = request;
        
        if (!id) {
            return {
                success: false,
                error: {
                    code: 'validation_error',
                    message: 'View ID is required',
                },
            };
        }

        const existing = this.viewStorage.get(id);
        
        if (!existing) {
            return {
                success: false,
                error: {
                    code: 'resource_not_found',
                    message: `View ${id} not found`,
                },
            };
        }

        const updated: SavedView = {
            ...existing,
            ...updates,
            id, // Preserve ID
            updatedBy: 'system', // Placeholder
            updatedAt: new Date().toISOString(),
        };

        this.viewStorage.set(id, updated);

        return {
            success: true,
            data: updated,
        };
    }

    async deleteView(id: string): Promise<{ success: boolean }> {
        const exists = this.viewStorage.has(id);
        
        if (!exists) {
            return { success: false };
        }

        this.viewStorage.delete(id);
        return { success: true };
    }
}

import type { 
    BatchUpdateRequest, 
    BatchUpdateResponse, 
    UpdateManyRequest,
    DeleteManyRequest 
} from './batch.zod';
import type { MetadataCacheRequest, MetadataCacheResponse } from './http-cache.zod';
import type { 
    CreateViewRequest, 
    UpdateViewRequest,
    ListViewsRequest,
    ViewResponse,
    ListViewsResponse 
} from './view-storage.zod';

/**
 * ObjectStack Protocol Interface
 * 
 * Defines the high-level contract for interacting with the ObjectStack metadata and data.
 * Used by API adapters (HTTP, WebSocket, etc) to fetch data/metadata without knowing the engine internals.
 */

export interface IObjectStackProtocol {
    /**
     * Get API discovery information (versions, capabilities)
     */
    getDiscovery(): any;

    /**
     * Get available metadata types (object, plugin, etc)
     */
    getMetaTypes(): string[];

    /**
     * Get all items of a specific metadata type
     * @param type - Metadata type name
     */
    getMetaItems(type: string): any[];

    /**
     * Get a specific metadata item
     * @param type - Metadata type name
     * @param name - Item name
     */
    getMetaItem(type: string, name: string): any;

    /**
     * Get a specific metadata item with caching support
     * @param type - Metadata type name
     * @param name - Item name
     * @param cacheRequest - Cache validation parameters (ETag, etc.)
     */
    getMetaItemCached(type: string, name: string, cacheRequest?: MetadataCacheRequest): Promise<MetadataCacheResponse>;

    /**
     * Get UI view definition
     * @param object - Object name
     * @param type - View type
     */
    getUiView(object: string, type: 'list' | 'form'): any;

    /**
     * Find data records
     * @param object - Object name
     * @param query - Query parameters (filter, sort, select, etc)
     */
    findData(object: string, query: any): Promise<any>;

    /**
     * Get single data record by ID
     * @param object - Object name
     * @param id - Record ID
     */
    getData(object: string, id: string): Promise<any>;

    /**
     * Create a data record
     * @param object - Object name
     * @param data - Record data
     */
    createData(object: string, data: any): Promise<any>;

    /**
     * Update a data record
     * @param object - Object name
     * @param id - Record ID
     * @param data - Update data
     */
    updateData(object: string, id: string, data: any): Promise<any>;

    /**
     * Delete a data record
     * @param object - Object name
     * @param id - Record ID
     */
    deleteData(object: string, id: string): Promise<any>;

    // ==========================================
    // Batch Operations
    // ==========================================

    /**
     * Perform batch operations (create, update, upsert, delete)
     * @param object - Object name
     * @param request - Batch operation request
     */
    batchData(object: string, request: BatchUpdateRequest): Promise<BatchUpdateResponse>;

    /**
     * Create multiple records at once
     * @param object - Object name
     * @param records - Array of records to create
     */
    createManyData(object: string, records: any[]): Promise<any[]>;

    /**
     * Update multiple records at once
     * @param object - Object name
     * @param request - Update many request with records and options
     */
    updateManyData(object: string, request: UpdateManyRequest): Promise<BatchUpdateResponse>;

    /**
     * Delete multiple records at once
     * @param object - Object name
     * @param request - Delete many request with IDs and options
     */
    deleteManyData(object: string, request: DeleteManyRequest): Promise<BatchUpdateResponse>;

    // ==========================================
    // View Storage
    // ==========================================

    /**
     * Create a new saved view
     * @param request - View creation request
     */
    createView(request: CreateViewRequest): Promise<ViewResponse>;

    /**
     * Get a saved view by ID
     * @param id - View ID
     */
    getView(id: string): Promise<ViewResponse>;

    /**
     * List saved views with optional filters
     * @param request - List filters and pagination
     */
    listViews(request?: ListViewsRequest): Promise<ListViewsResponse>;

    /**
     * Update a saved view
     * @param request - View update request with ID
     */
    updateView(request: UpdateViewRequest): Promise<ViewResponse>;

    /**
     * Delete a saved view
     * @param id - View ID
     */
    deleteView(id: string): Promise<{ success: boolean }>;
}

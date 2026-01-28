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
}

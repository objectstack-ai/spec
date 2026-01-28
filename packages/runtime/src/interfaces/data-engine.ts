/**
 * IDataEngine - Standard Data Engine Interface
 * 
 * Abstract interface for data persistence capabilities.
 * This allows plugins to interact with data engines without knowing
 * the underlying implementation (SQL, MongoDB, Memory, etc.).
 * 
 * Follows Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete database implementations.
 */

/**
 * Query filter conditions
 */
export interface QueryFilter {
    [field: string]: any;
}

/**
 * Query options for find operations
 */
export interface QueryOptions {
    /** Filter conditions */
    filter?: QueryFilter;
    /** Fields to select */
    select?: string[];
    /** Sort order */
    sort?: Record<string, 1 | -1 | 'asc' | 'desc'>;
    /** Limit number of results */
    limit?: number;
    /** Skip number of results (for pagination) */
    skip?: number;
    /** Maximum number of results (alternative to limit) */
    top?: number;
}

/**
 * IDataEngine - Data persistence capability interface
 * 
 * Defines the contract for data engine implementations.
 * Concrete implementations (ObjectQL, Prisma, TypeORM) should implement this interface.
 */
export interface IDataEngine {
    /**
     * Insert a new record
     * 
     * @param objectName - Name of the object/table (e.g., 'user', 'order')
     * @param data - Data to insert
     * @returns Promise resolving to the created record (including generated ID)
     * 
     * @example
     * ```ts
     * const user = await engine.insert('user', {
     *   name: 'John Doe',
     *   email: 'john@example.com'
     * });
     * console.log(user.id); // Auto-generated ID
     * ```
     */
    insert(objectName: string, data: any): Promise<any>;
    
    /**
     * Find records matching a query
     * 
     * @param objectName - Name of the object/table
     * @param query - Query conditions (optional)
     * @returns Promise resolving to an array of matching records
     * 
     * @example
     * ```ts
     * // Find all users
     * const allUsers = await engine.find('user');
     * 
     * // Find with filter
     * const activeUsers = await engine.find('user', {
     *   filter: { status: 'active' }
     * });
     * 
     * // Find with limit and sort
     * const recentUsers = await engine.find('user', {
     *   sort: { createdAt: -1 },
     *   limit: 10
     * });
     * ```
     */
    find(objectName: string, query?: QueryOptions): Promise<any[]>;
    
    /**
     * Update a record by ID
     * 
     * @param objectName - Name of the object/table
     * @param id - Record ID
     * @param data - Updated data (partial update)
     * @returns Promise resolving to the updated record
     * 
     * @example
     * ```ts
     * const updatedUser = await engine.update('user', '123', {
     *   name: 'Jane Doe',
     *   email: 'jane@example.com'
     * });
     * ```
     */
    update(objectName: string, id: any, data: any): Promise<any>;
    
    /**
     * Delete a record by ID
     * 
     * @param objectName - Name of the object/table
     * @param id - Record ID
     * @returns Promise resolving to true if deleted, false otherwise
     * 
     * @example
     * ```ts
     * const deleted = await engine.delete('user', '123');
     * if (deleted) {
     *   console.log('User deleted successfully');
     * }
     * ```
     */
    delete(objectName: string, id: any): Promise<boolean>;
}

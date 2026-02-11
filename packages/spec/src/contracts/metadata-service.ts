// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * IMetadataService - Metadata Service Contract
 *
 * Defines the async interface for managing object/field definitions in ObjectStack.
 * Concrete implementations (SchemaRegistry, Database-backed, etc.)
 * should implement this interface.
 *
 * All methods are async to support database-backed persistence via datasource.
 *
 * Follows Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete metadata storage implementations.
 *
 * Aligned with CoreServiceName 'metadata' in core-services.zod.ts.
 */

export interface IMetadataService {
    /**
     * Register/save a metadata item by type
     * @param type - Metadata type (e.g. 'object', 'view', 'flow')
     * @param name - Item name/identifier (snake_case)
     * @param data - The metadata definition to register
     */
    register(type: string, name: string, data: unknown): Promise<void>;

    /**
     * Get a metadata item by type and name
     * @param type - Metadata type
     * @param name - Item name/identifier
     * @returns The metadata definition, or undefined if not found
     */
    get(type: string, name: string): Promise<unknown | undefined>;

    /**
     * List all metadata items of a given type
     * @param type - Metadata type
     * @returns Array of metadata definitions
     */
    list(type: string): Promise<unknown[]>;

    /**
     * Unregister/remove a metadata item by type and name
     * @param type - Metadata type
     * @param name - Item name/identifier
     */
    unregister(type: string, name: string): Promise<void>;

    /**
     * Check if a metadata item exists
     * @param type - Metadata type
     * @param name - Item name/identifier
     * @returns True if the item exists
     */
    exists(type: string, name: string): Promise<boolean>;

    /**
     * List all names of metadata items of a given type
     * @param type - Metadata type
     * @returns Array of item names
     */
    listNames(type: string): Promise<string[]>;

    /**
     * Convenience: get an object definition by name
     * @param name - Object name (snake_case)
     * @returns The object definition, or undefined if not found
     */
    getObject(name: string): Promise<unknown | undefined>;

    /**
     * Convenience: list all object definitions
     * @returns Array of object definitions
     */
    listObjects(): Promise<unknown[]>;

    /**
     * Unregister all metadata items from a specific package
     * @param packageName - The package name whose items should be removed
     */
    unregisterPackage?(packageName: string): Promise<void>;
}

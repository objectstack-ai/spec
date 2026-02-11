// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * IMetadataService - Metadata Service Contract
 *
 * Defines the interface for managing object/field definitions in ObjectStack.
 * Concrete implementations (SchemaRegistry, Database-backed, etc.)
 * should implement this interface.
 *
 * Follows Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete metadata storage implementations.
 *
 * Aligned with CoreServiceName 'metadata' in core-services.zod.ts.
 */

export interface IMetadataService {
    /**
     * Register a metadata item by type
     * @param type - Metadata type (e.g. 'object', 'view', 'flow')
     * @param definition - The metadata definition to register
     */
    register(type: string, definition: unknown): void;

    /**
     * Get a metadata item by type and name
     * @param type - Metadata type
     * @param name - Item name/identifier
     * @returns The metadata definition, or undefined if not found
     */
    get(type: string, name: string): unknown | undefined;

    /**
     * List all metadata items of a given type
     * @param type - Metadata type
     * @returns Array of metadata definitions
     */
    list(type: string): unknown[];

    /**
     * Unregister a metadata item by type and name
     * @param type - Metadata type
     * @param name - Item name/identifier
     */
    unregister(type: string, name: string): void;

    /**
     * Convenience: get an object definition by name
     * @param name - Object name (snake_case)
     * @returns The object definition, or undefined if not found
     */
    getObject(name: string): unknown | undefined;

    /**
     * Convenience: list all object definitions
     * @returns Array of object definitions
     */
    listObjects(): unknown[];

    /**
     * Unregister all metadata items from a specific package
     * @param packageName - The package name whose items should be removed
     */
    unregisterPackage?(packageName: string): void;
}

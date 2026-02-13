// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * IUIService - UI Metadata Service Contract
 *
 * Defines the interface for managing UI metadata (views, dashboards, layouts)
 * in ObjectStack. Concrete implementations (database-backed, in-memory, etc.)
 * should implement this interface.
 *
 * Follows Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete UI metadata storage implementations.
 *
 * Aligned with CoreServiceName 'ui' in core-services.zod.ts.
 */

/**
 * @deprecated Use IMetadataService instead.
 * - getView(name) → metadata.get('view', name)
 * - listViews(object?) → metadata.listViews(object?)
 * - registerView(name, def) → metadata.register('view', name, def)
 * - getDashboard(name) → metadata.get('dashboard', name)
 * - listDashboards() → metadata.listDashboards()
 * - registerDashboard(name, def) → metadata.register('dashboard', name, def)
 *
 * IMetadataService provides additional capabilities:
 * - Three-layer overlay (system → platform → user) via getEffective()
 * - User-scoped customization with owner field
 * - Auth-context-aware resolution via getEffective(type, name, { userId, roles })
 * - Database persistence via DatabaseLoader
 * - Watch/subscribe for real-time updates
 * - Import/export, validation, dependency tracking
 *
 * Will be removed in v4.0.0.
 */
export interface IUIService {
    /**
     * Get a view definition by name
     * @param name - View name (snake_case)
     * @returns View definition, or undefined if not found
     */
    getView(name: string): unknown | undefined;

    /**
     * List view definitions, optionally filtered by object
     * @param object - Optional object name to filter views for
     * @returns Array of view definitions
     */
    listViews(object?: string): unknown[];

    /**
     * Get a dashboard definition by name
     * @param name - Dashboard name (snake_case)
     * @returns Dashboard definition, or undefined if not found
     */
    getDashboard?(name: string): unknown | undefined;

    /**
     * List all dashboard definitions
     * @returns Array of dashboard definitions
     */
    listDashboards?(): unknown[];

    /**
     * Register a view definition
     * @param name - View name (snake_case)
     * @param definition - View definition object
     */
    registerView?(name: string, definition: unknown): void;

    /**
     * Register a dashboard definition
     * @param name - Dashboard name (snake_case)
     * @param definition - Dashboard definition object
     */
    registerDashboard?(name: string, definition: unknown): void;
}

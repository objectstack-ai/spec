// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * IAnalyticsService - Analytics / BI Service Contract
 *
 * Defines the interface for analytical query execution and semantic layer
 * metadata discovery in ObjectStack. Concrete implementations (Cube.js, custom, etc.)
 * should implement this interface.
 *
 * Follows Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete analytics engine implementations.
 *
 * Aligned with CoreServiceName 'analytics' in core-services.zod.ts.
 */

/**
 * An analytical query definition
 */
export interface AnalyticsQuery {
    /** Target cube name (optional when provided externally, e.g. in API request wrapper) */
    cube?: string;
    /** Measures to compute (e.g. ['orders.count', 'orders.totalRevenue']) */
    measures: string[];
    /** Dimensions to group by (e.g. ['orders.status', 'orders.createdAt']) */
    dimensions?: string[];
    /** Filter conditions */
    filters?: Array<{
        member: string;
        operator: string;
        values?: string[];
    }>;
    /** Time dimension configuration */
    timeDimensions?: Array<{
        dimension: string;
        granularity?: string;
        dateRange?: string | string[];
    }>;
    /** Sort order for results */
    order?: Record<string, 'asc' | 'desc'>;
    /** Result limit */
    limit?: number;
    /** Result offset */
    offset?: number;
    /** Timezone for date/time calculations */
    timezone?: string;
}

/**
 * Analytics query result
 */
export interface AnalyticsResult {
    /** Result rows */
    rows: Record<string, unknown>[];
    /** Column metadata */
    fields: Array<{
        name: string;
        type: string;
    }>;
    /** Generated SQL (if available) */
    sql?: string;
}

/**
 * Cube metadata for discovery
 */
export interface CubeMeta {
    /** Cube name */
    name: string;
    /** Human-readable title */
    title?: string;
    /** Available measures */
    measures: Array<{ name: string; type: string; title?: string }>;
    /** Available dimensions */
    dimensions: Array<{ name: string; type: string; title?: string }>;
}

export interface IAnalyticsService {
    /**
     * Execute an analytical query
     * @param query - The analytics query definition
     * @returns Query results with rows and field metadata
     */
    query(query: AnalyticsQuery): Promise<AnalyticsResult>;

    /**
     * Get available cube metadata for discovery
     * @param cubeName - Optional cube name to filter (returns all if omitted)
     * @returns Array of cube metadata definitions
     */
    getMeta(cubeName?: string): Promise<CubeMeta[]>;

    /**
     * Generate SQL for a query without executing it (dry-run)
     * @param query - The analytics query definition
     * @returns Generated SQL string and parameters
     */
    generateSql?(query: AnalyticsQuery): Promise<{ sql: string; params: unknown[] }>;
}

// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * ISearchService - Search Service Contract
 * 
 * Defines the interface for full-text search capabilities in ObjectStack.
 * Concrete implementations (Elasticsearch, MeiliSearch, Typesense, etc.)
 * should implement this interface.
 * 
 * Follows Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete search engine implementations.
 * 
 * Aligned with CoreServiceName 'search' in core-services.zod.ts.
 */

/**
 * Options for search queries
 */
export interface SearchOptions {
    /** Filter conditions to narrow results */
    filter?: Record<string, unknown>;
    /** Maximum number of results to return */
    limit?: number;
    /** Offset for pagination */
    offset?: number;
    /** Fields to sort by */
    sort?: string[];
    /** Fields to include in results */
    select?: string[];
    /** Facet fields to aggregate */
    facets?: string[];
    /** Enable highlighting of matching terms */
    highlight?: boolean;
}

/**
 * A single search result hit
 */
export interface SearchHit {
    /** Document ID */
    id: string;
    /** Relevance score */
    score: number;
    /** The matched document */
    document: Record<string, unknown>;
    /** Highlighted fields (if requested) */
    highlights?: Record<string, string[]>;
}

/**
 * Search result set
 */
export interface SearchResult {
    /** Matched documents */
    hits: SearchHit[];
    /** Total number of matching documents */
    totalHits: number;
    /** Query processing time in milliseconds */
    processingTimeMs?: number;
    /** Facet counts (if requested) */
    facets?: Record<string, Record<string, number>>;
}

export interface ISearchService {
    /**
     * Index a document for search
     * @param object - Object/collection name
     * @param id - Document identifier
     * @param document - Document data to index
     */
    index(object: string, id: string, document: Record<string, unknown>): Promise<void>;

    /**
     * Remove a document from the search index
     * @param object - Object/collection name
     * @param id - Document identifier
     */
    remove(object: string, id: string): Promise<void>;

    /**
     * Search for documents
     * @param object - Object/collection name
     * @param query - Search query string
     * @param options - Search options (filters, pagination, etc.)
     * @returns Search results with hits, total count, and optional facets
     */
    search(object: string, query: string, options?: SearchOptions): Promise<SearchResult>;

    /**
     * Bulk index multiple documents at once
     * @param object - Object/collection name
     * @param documents - Array of documents with id and data
     */
    bulkIndex?(object: string, documents: Array<{ id: string; document: Record<string, unknown> }>): Promise<void>;

    /**
     * Delete all documents in an index
     * @param object - Object/collection name
     */
    deleteIndex?(object: string): Promise<void>;
}

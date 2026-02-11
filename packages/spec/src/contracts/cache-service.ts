// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * ICacheService - Cache Service Contract
 * 
 * Defines the interface for cache operations in ObjectStack.
 * Concrete implementations (Redis, Memory, etc.) should implement this interface.
 * 
 * Follows Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete cache implementations.
 * 
 * Aligned with CoreServiceName 'cache' in core-services.zod.ts.
 */

/**
 * Cache statistics for monitoring and observability
 */
export interface CacheStats {
    /** Total number of cache hits */
    hits: number;
    /** Total number of cache misses */
    misses: number;
    /** Number of keys currently stored */
    keyCount: number;
    /** Memory usage in bytes (if available) */
    memoryUsage?: number;
}

export interface ICacheService {
    /**
     * Get a cached value by key
     * @param key - Cache key
     * @returns The cached value, or undefined if not found
     */
    get<T = unknown>(key: string): Promise<T | undefined>;

    /**
     * Set a value in the cache
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttl - Optional time-to-live in seconds
     */
    set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;

    /**
     * Delete a cached value by key
     * @param key - Cache key
     * @returns True if the key was deleted, false if it did not exist
     */
    delete(key: string): Promise<boolean>;

    /**
     * Check if a key exists in the cache
     * @param key - Cache key
     * @returns True if the key exists
     */
    has(key: string): Promise<boolean>;

    /**
     * Clear all entries from the cache
     */
    clear(): Promise<void>;

    /**
     * Get cache statistics
     * @returns Cache stats including hits, misses, and key count
     */
    stats(): Promise<CacheStats>;
}

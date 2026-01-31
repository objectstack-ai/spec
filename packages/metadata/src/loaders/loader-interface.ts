/**
 * Metadata Loader Interface
 * 
 * Defines the contract for loading metadata from various sources
 */

import type {
  MetadataLoadOptions,
  MetadataLoadResult,
  MetadataStats,
  MetadataLoaderContract,
} from '@objectstack/spec/system';

/**
 * Abstract interface for metadata loaders
 * Implementations can load from filesystem, HTTP, S3, databases, etc.
 */
export interface MetadataLoader {
  /**
   * Loader contract information
   */
  readonly contract: MetadataLoaderContract;

  /**
   * Load a single metadata item
   * @param type The metadata type (e.g., 'object', 'view', 'app')
   * @param name The item name/identifier
   * @param options Load options
   * @returns Load result with data or null if not found
   */
  load<T = any>(
    type: string,
    name: string,
    options?: MetadataLoadOptions
  ): Promise<MetadataLoadResult<T>>;

  /**
   * Load multiple items matching patterns
   * @param type The metadata type
   * @param options Load options with patterns
   * @returns Array of loaded items
   */
  loadMany<T = any>(
    type: string,
    options?: MetadataLoadOptions
  ): Promise<T[]>;

  /**
   * Check if item exists
   * @param type The metadata type
   * @param name The item name
   * @returns True if exists
   */
  exists(type: string, name: string): Promise<boolean>;

  /**
   * Get item metadata (without loading full content)
   * @param type The metadata type
   * @param name The item name
   * @returns Metadata statistics
   */
  stat(type: string, name: string): Promise<MetadataStats | null>;

  /**
   * List all items of a type
   * @param type The metadata type
   * @returns Array of item names
   */
  list(type: string): Promise<string[]>;
}

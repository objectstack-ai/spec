import { z } from 'zod';

/**
 * Storage Scope Enum
 * Defines the lifecycle and persistence guarantee of the storage area.
 */
export const StorageScope = z.enum([
  'temp',       // Ephemeral, cleared on restart
  'cache',      // Ephemeral, survives restarts, cleared on LRU/Expiration
  'data',       // Persistent, backed up
  'logs',       // Append-only, rotated
  'config',     // Read-heavy, versioned
  'public'      // Publicly accessible static assets
]).describe('Generic storage scope classification');

export type StorageScope = z.infer<typeof StorageScope>;

/**
 * Storage Adapter Type
 */
export const StorageAdapterType = z.enum([
  'local',   // Local filesystem
  'memory',  // In-memory (for testing/temp)
  's3',      // S3 compatible object storage
  'gcs',     // Google Cloud Storage
  'azure',   // Azure Blob Storage
  'gridfs'   // MongoDB GridFS
]);

/**
 * Scoped Storage Configuration
 * How the Kernel maps a logical scope to a physical backend.
 */
export const ScopedStorageConfigSchema = z.object({
  /**
   * The scope identifier
   */
  scope: StorageScope,
  
  /**
   * The backend driver
   */
  adapter: StorageAdapterType.default('local'),
  
  /**
   * Base path or bucket name
   */
  location: z.string().describe('Root path (local) or Bucket name (remote)'),
  
  /**
   * Adapter specific configuration
   */
  options: z.record(z.any()).optional().describe('Driver specific options (region, endpoint, etc)'),
  
  /**
   * Quota in bytes (optional)
   */
  quota: z.number().int().positive().optional().describe('Max size in bytes'),
});

export type ScopedStorageConfig = z.infer<typeof ScopedStorageConfigSchema>;

/**
 * File Metadata Schema
 * Standardized file attribute structure
 */
export const FileMetadataSchema = z.object({
  path: z.string(),
  name: z.string(),
  size: z.number().int(),
  mimeType: z.string(),
  lastModified: z.string().datetime(),
  created: z.string().datetime(),
  etag: z.string().optional(),
});

export type FileMetadata = z.infer<typeof FileMetadataSchema>;

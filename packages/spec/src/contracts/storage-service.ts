// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * IStorageService - File Storage Service Contract
 * 
 * Defines the interface for file/object storage in ObjectStack.
 * Concrete implementations (S3, Azure Blob, Local FS, etc.)
 * should implement this interface.
 * 
 * Follows Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete storage implementations.
 * 
 * Aligned with CoreServiceName 'file-storage' in core-services.zod.ts.
 */

/**
 * Options for uploading a file
 */
export interface StorageUploadOptions {
    /** MIME content type */
    contentType?: string;
    /** Custom metadata key-value pairs */
    metadata?: Record<string, string>;
    /** Access control level */
    acl?: 'private' | 'public-read';
}

/**
 * Metadata about a stored file
 */
export interface StorageFileInfo {
    /** File key/path */
    key: string;
    /** File size in bytes */
    size: number;
    /** MIME content type */
    contentType?: string;
    /** Last modified timestamp */
    lastModified: Date;
    /** Custom metadata */
    metadata?: Record<string, string>;
}

export interface IStorageService {
    /**
     * Upload a file to storage
     * @param key - Storage key/path for the file
     * @param data - File content as Buffer or readable stream
     * @param options - Upload options (content type, metadata, ACL)
     */
    upload(key: string, data: Buffer | ReadableStream, options?: StorageUploadOptions): Promise<void>;

    /**
     * Download a file from storage
     * @param key - Storage key/path
     * @returns File content as Buffer
     */
    download(key: string): Promise<Buffer>;

    /**
     * Delete a file from storage
     * @param key - Storage key/path
     */
    delete(key: string): Promise<void>;

    /**
     * Check if a file exists in storage
     * @param key - Storage key/path
     * @returns True if the file exists
     */
    exists(key: string): Promise<boolean>;

    /**
     * Get metadata about a stored file
     * @param key - Storage key/path
     * @returns File info including size, content type, and last modified date
     */
    getInfo(key: string): Promise<StorageFileInfo>;

    /**
     * List files in a directory/prefix
     * @param prefix - Key prefix to list
     * @returns Array of file info objects
     */
    list?(prefix: string): Promise<StorageFileInfo[]>;

    /**
     * Generate a pre-signed URL for temporary access
     * @param key - Storage key/path
     * @param expiresIn - URL expiration time in seconds
     * @returns Pre-signed URL string
     */
    getSignedUrl?(key: string, expiresIn: number): Promise<string>;
}

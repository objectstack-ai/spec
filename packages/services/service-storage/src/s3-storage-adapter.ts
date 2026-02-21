// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { IStorageService, StorageUploadOptions, StorageFileInfo } from '@objectstack/spec/contracts';

/**
 * Configuration for the S3 storage adapter.
 */
export interface S3StorageAdapterOptions {
  /** S3 bucket name */
  bucket: string;
  /** AWS region (e.g. 'us-east-1') */
  region: string;
  /** Optional endpoint URL for S3-compatible services (MinIO, etc.) */
  endpoint?: string;
  /** AWS access key ID */
  accessKeyId?: string;
  /** AWS secret access key */
  secretAccessKey?: string;
}

/**
 * S3 storage adapter skeleton implementing IStorageService.
 *
 * This is a placeholder for future AWS S3 integration.
 * Concrete implementation will use the `@aws-sdk/client-s3` package.
 *
 * @example
 * ```ts
 * const storage = new S3StorageAdapter({
 *   bucket: 'my-bucket',
 *   region: 'us-east-1',
 * });
 * await storage.upload('path/to/file.txt', buffer);
 * ```
 */
export class S3StorageAdapter implements IStorageService {
  private readonly bucket: string;
  private readonly region: string;

  constructor(options: S3StorageAdapterOptions) {
    this.bucket = options.bucket;
    this.region = options.region;
  }

  async upload(_key: string, _data: Buffer | ReadableStream, _options?: StorageUploadOptions): Promise<void> {
    throw new Error(`S3StorageAdapter not yet implemented (bucket: ${this.bucket}, region: ${this.region})`);
  }

  async download(_key: string): Promise<Buffer> {
    throw new Error('S3StorageAdapter not yet implemented');
  }

  async delete(_key: string): Promise<void> {
    throw new Error('S3StorageAdapter not yet implemented');
  }

  async exists(_key: string): Promise<boolean> {
    throw new Error('S3StorageAdapter not yet implemented');
  }

  async getInfo(_key: string): Promise<StorageFileInfo> {
    throw new Error('S3StorageAdapter not yet implemented');
  }

  async list(_prefix: string): Promise<StorageFileInfo[]> {
    throw new Error('S3StorageAdapter not yet implemented');
  }

  async getSignedUrl(_key: string, _expiresIn: number): Promise<string> {
    throw new Error('S3StorageAdapter not yet implemented');
  }

  async initiateChunkedUpload(_key: string, _options?: StorageUploadOptions): Promise<string> {
    throw new Error('S3StorageAdapter.initiateChunkedUpload not yet implemented');
  }

  async uploadChunk(_uploadId: string, _partNumber: number, _data: Buffer): Promise<string> {
    throw new Error('S3StorageAdapter.uploadChunk not yet implemented');
  }

  async completeChunkedUpload(_uploadId: string, _parts: Array<{ partNumber: number; eTag: string }>): Promise<string> {
    throw new Error('S3StorageAdapter.completeChunkedUpload not yet implemented');
  }

  async abortChunkedUpload(_uploadId: string): Promise<void> {
    throw new Error('S3StorageAdapter.abortChunkedUpload not yet implemented');
  }
}

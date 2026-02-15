// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import type { IStorageService, StorageUploadOptions, StorageFileInfo } from '@objectstack/spec/contracts';

/**
 * Configuration options for LocalStorageAdapter.
 */
export interface LocalStorageAdapterOptions {
  /** Root directory for file storage */
  rootDir: string;
}

/**
 * Local filesystem storage adapter implementing IStorageService.
 *
 * Stores files on the local disk under a configurable root directory.
 * Suitable for development, testing, and single-server deployments.
 */
export class LocalStorageAdapter implements IStorageService {
  private readonly rootDir: string;

  constructor(options: LocalStorageAdapterOptions) {
    this.rootDir = options.rootDir;
  }

  private resolvePath(key: string): string {
    return join(this.rootDir, key);
  }

  async upload(key: string, data: Buffer | ReadableStream, _options?: StorageUploadOptions): Promise<void> {
    const filePath = this.resolvePath(key);
    await fs.mkdir(dirname(filePath), { recursive: true });

    if (data instanceof Buffer) {
      await fs.writeFile(filePath, data);
    } else {
      // Convert ReadableStream to Buffer
      const chunks: Uint8Array[] = [];
      const reader = (data as ReadableStream).getReader();
      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) chunks.push(result.value);
      }
      await fs.writeFile(filePath, Buffer.concat(chunks));
    }
  }

  async download(key: string): Promise<Buffer> {
    const filePath = this.resolvePath(key);
    return fs.readFile(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);
    await fs.unlink(filePath);
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.resolvePath(key));
      return true;
    } catch {
      return false;
    }
  }

  async getInfo(key: string): Promise<StorageFileInfo> {
    const filePath = this.resolvePath(key);
    const stat = await fs.stat(filePath);
    return {
      key,
      size: stat.size,
      lastModified: stat.mtime,
    };
  }

  async list(prefix: string): Promise<StorageFileInfo[]> {
    const dirPath = this.resolvePath(prefix);
    try {
      const entries = await fs.readdir(dirPath);
      const results: StorageFileInfo[] = [];
      for (const entry of entries) {
        const fullKey = prefix ? `${prefix}/${entry}` : entry;
        try {
          const info = await this.getInfo(fullKey);
          results.push(info);
        } catch {
          // Skip entries that can't be stat'd
        }
      }
      return results;
    } catch {
      return [];
    }
  }
}

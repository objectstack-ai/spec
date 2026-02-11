// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Memory Metadata Loader
 * 
 * Stores metadata in memory only. Changes are lost when process restarts.
 * Useful for testing, temporary overrides, or "dirty" edits.
 */

import type {
  MetadataLoadOptions,
  MetadataLoadResult,
  MetadataStats,
  MetadataLoaderContract,
  MetadataSaveOptions,
  MetadataSaveResult,
} from '@objectstack/spec/system';
import type { MetadataLoader } from './loader-interface.js';

export class MemoryLoader implements MetadataLoader {
  readonly contract: MetadataLoaderContract = {
    name: 'memory',
    protocol: 'memory:',
    capabilities: {
      read: true,
      write: true,
      watch: false,
      list: true,
    },
  };

  // Storage: Type -> Name -> Data
  private storage = new Map<string, Map<string, any>>();

  async load(
    type: string,
    name: string,
    _options?: MetadataLoadOptions
  ): Promise<MetadataLoadResult> {
    const typeStore = this.storage.get(type);
    const data = typeStore?.get(name);

    if (data) {
      return {
        data,
        source: 'memory',
        format: 'json',
        loadTime: 0,
      };
    }

    return { data: null };
  }

  async loadMany<T = any>(
    type: string,
    _options?: MetadataLoadOptions
  ): Promise<T[]> {
    const typeStore = this.storage.get(type);
    if (!typeStore) return [];
    return Array.from(typeStore.values()) as T[];
  }

  async exists(type: string, name: string): Promise<boolean> {
    return this.storage.get(type)?.has(name) ?? false;
  }

  async stat(type: string, name: string): Promise<MetadataStats | null> {
    if (await this.exists(type, name)) {
      return {
        size: 0, // In-memory
        mtime: new Date().toISOString(),
        format: 'json',
      };
    }
    return null;
  }

  async list(type: string): Promise<string[]> {
    const typeStore = this.storage.get(type);
    if (!typeStore) return [];
    return Array.from(typeStore.keys());
  }

  async save(
    type: string,
    name: string,
    data: any,
    _options?: MetadataSaveOptions
  ): Promise<MetadataSaveResult> {
    if (!this.storage.has(type)) {
      this.storage.set(type, new Map());
    }
    
    this.storage.get(type)!.set(name, data);

    return {
      success: true,
      path: `memory://${type}/${name}`,
      saveTime: 0,
    };
  }
}

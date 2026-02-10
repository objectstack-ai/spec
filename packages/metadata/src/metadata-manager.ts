// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Metadata Manager
 * 
 * Main orchestrator for metadata loading, saving, and persistence.
 * Browser-compatible (Pure).
 */

import type {
  MetadataManagerConfig,
  MetadataLoadOptions,
  MetadataSaveOptions,
  MetadataSaveResult,
  MetadataWatchEvent,
  MetadataFormat,
} from '@objectstack/spec/system';
import { createLogger, type Logger } from '@objectstack/core';
import { JSONSerializer } from './serializers/json-serializer.js';
import { YAMLSerializer } from './serializers/yaml-serializer.js';
import { TypeScriptSerializer } from './serializers/typescript-serializer.js';
import type { MetadataSerializer } from './serializers/serializer-interface.js';
import type { MetadataLoader } from './loaders/loader-interface.js';

/**
 * Watch callback function
 */
export type WatchCallback = (event: MetadataWatchEvent) => void | Promise<void>;

export interface MetadataManagerOptions extends MetadataManagerConfig {
  loaders?: MetadataLoader[];
}

/**
 * Main metadata manager class
 */
export class MetadataManager {
  private loaders: Map<string, MetadataLoader> = new Map();
  // Protected so subclasses can access serializers if needed
  protected serializers: Map<MetadataFormat, MetadataSerializer>;
  protected logger: Logger;
  protected watchCallbacks = new Map<string, Set<WatchCallback>>();
  protected config: MetadataManagerOptions;

  constructor(config: MetadataManagerOptions) {
    this.config = config;
    this.logger = createLogger({ level: 'info', format: 'pretty' });

    // Initialize serializers
    this.serializers = new Map();
    const formats = config.formats || ['typescript', 'json', 'yaml'];

    if (formats.includes('json')) {
      this.serializers.set('json', new JSONSerializer());
    }
    if (formats.includes('yaml')) {
      this.serializers.set('yaml', new YAMLSerializer());
    }
    if (formats.includes('typescript')) {
      this.serializers.set('typescript', new TypeScriptSerializer('typescript'));
    }
    if (formats.includes('javascript')) {
      this.serializers.set('javascript', new TypeScriptSerializer('javascript'));
    }

    // Initialize Loaders
    if (config.loaders && config.loaders.length > 0) {
      config.loaders.forEach(loader => this.registerLoader(loader));
    }
    // Note: No default loader in base class. Subclasses (NodeMetadataManager) or caller must provide one.
  }

  /**
   * Register a new metadata loader (data source)
   */
  registerLoader(loader: MetadataLoader) {
    this.loaders.set(loader.contract.name, loader);
    this.logger.info(`Registered metadata loader: ${loader.contract.name} (${loader.contract.protocol})`);
  }

  /**
   * Load a single metadata item
   * Iterates through registered loaders until found
   */
  async load<T = any>(
    type: string,
    name: string,
    options?: MetadataLoadOptions
  ): Promise<T | null> {
    // Priority: Database > Filesystem (Implementation-dependent)
    // For now, we just iterate.
    for (const loader of this.loaders.values()) {
        try {
            const result = await loader.load(type, name, options);
            if (result.data) {
                return result.data as T;
            }
        } catch (e) {
            this.logger.warn(`Loader ${loader.contract.name} failed to load ${type}:${name}`, { error: e });
        }
    }
    return null;
  }

  /**
   * Load multiple metadata items
   * Aggregates results from all loaders
   */
  async loadMany<T = any>(
    type: string,
    options?: MetadataLoadOptions
  ): Promise<T[]> {
    const results: T[] = [];

    for (const loader of this.loaders.values()) {
        try {
            const items = await loader.loadMany<T>(type, options);
            for (const item of items) {
                // Deduplicate: skip items whose 'name' already exists in results
                const itemAny = item as any;
                if (itemAny && typeof itemAny.name === 'string') {
                    const exists = results.some((r: any) => r && r.name === itemAny.name);
                    if (exists) continue;
                }
                results.push(item);
            }
        } catch (e) {
           this.logger.warn(`Loader ${loader.contract.name} failed to loadMany ${type}`, { error: e });
        }
    }
    return results;
  }

  /**
   * Save metadata to disk
   */
  /**
   * Save metadata item
   */
  async save<T = any>(
    type: string,
    name: string,
    data: T,
    options?: MetadataSaveOptions
  ): Promise<MetadataSaveResult> {
    const targetLoader = (options as any)?.loader;

    // Find suitable loader
    let loader: MetadataLoader | undefined;
    
    if (targetLoader) {
      loader = this.loaders.get(targetLoader);
      if (!loader) {
        throw new Error(`Loader not found: ${targetLoader}`);
      }
    } else {
      // 1. Try to find existing writable loader containing this item (Update existing)
      for (const l of this.loaders.values()) {
          // Skip if loader is strictly read-only
          if (!l.save) continue;
          
          try {
            if (await l.exists(type, name)) {
                loader = l;
                this.logger.info(`Updating existing metadata in loader: ${l.contract.name}`);
                break;
            }
          } catch (e) {
            // Ignore existence check errors (e.g. network down)
          }
      }

      // 2. Default to 'filesystem' if available (Create new)
      if (!loader) {
        const fsLoader = this.loaders.get('filesystem');
        if (fsLoader && fsLoader.save) {
           loader = fsLoader;
        }
      }

      // 3. Fallback to any writable loader
      if (!loader) {
        for (const l of this.loaders.values()) {
          if (l.save) {
            loader = l;
            break;
          }
        }
      }
    }

    if (!loader) {
      throw new Error(`No loader available for saving type: ${type}`);
    }

    if (!loader.save) {
      throw new Error(`Loader '${loader.contract?.name}' does not support saving`);
    }

    return loader.save(type, name, data, options);
  }

  /**
   * Check if metadata item exists
   */
  async exists(type: string, name: string): Promise<boolean> {
    for (const loader of this.loaders.values()) {
      if (await loader.exists(type, name)) {
        return true;
      }
    }
    return false;
  }

  /**
   * List all items of a type
   */
  async list(type: string): Promise<string[]> {
    const items = new Set<string>();
    for (const loader of this.loaders.values()) {
      const result = await loader.list(type);
      result.forEach(item => items.add(item));
    }
    return Array.from(items);
  }

  /**
   * Watch for metadata changes
   */
  watch(type: string, callback: WatchCallback): void {
    if (!this.watchCallbacks.has(type)) {
      this.watchCallbacks.set(type, new Set());
    }
    this.watchCallbacks.get(type)!.add(callback);
  }

  /**
   * Unwatch metadata changes
   */
  unwatch(type: string, callback: WatchCallback): void {
    const callbacks = this.watchCallbacks.get(type);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.watchCallbacks.delete(type);
      }
    }
  }

  /**
   * Stop all watching
   */
  async stopWatching(): Promise<void> {
    // Override in subclass
  }

  protected notifyWatchers(type: string, event: MetadataWatchEvent) {
    const callbacks = this.watchCallbacks.get(type);
    if (!callbacks) return;
    
    for (const callback of callbacks) {
      try {
        void callback(event);
      } catch (error) {
        this.logger.error('Watch callback error', undefined, {
          type,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
}


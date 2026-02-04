/**
 * Metadata Manager
 * 
 * Main orchestrator for metadata loading, saving, and persistence
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { watch as chokidarWatch, type FSWatcher } from 'chokidar';
import type {
  MetadataManagerConfig,
  MetadataLoadOptions,
  MetadataSaveOptions,
  MetadataSaveResult,
  MetadataWatchEvent,
  MetadataFormat,
} from '@objectstack/spec/system';
import { createLogger, type Logger } from '@objectstack/core';
import { FilesystemLoader } from './loaders/filesystem-loader.js';
import { JSONSerializer } from './serializers/json-serializer.js';
import { YAMLSerializer } from './serializers/yaml-serializer.js';
import { TypeScriptSerializer } from './serializers/typescript-serializer.js';
import type { MetadataSerializer } from './serializers/serializer-interface.js';
import type { MetadataLoader } from './loaders/loader-interface.js';

/**
 * Watch callback function
 */
export type WatchCallback = (event: MetadataWatchEvent) => void | Promise<void>;

/**
 * Main metadata manager class
 */
export class MetadataManager {
  private loaders: Map<string, MetadataLoader> = new Map();
  private serializers: Map<MetadataFormat, MetadataSerializer>;
  private logger: Logger;
  private watcher?: FSWatcher;
  private watchCallbacks = new Map<string, Set<WatchCallback>>();

  constructor(private config: MetadataManagerConfig) {
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

    // Initialize Default Filesystem Loader
    // This is treated as the "Primary" source for now
    const rootDir = config.rootDir || process.cwd();
    this.registerLoader(new FilesystemLoader(rootDir, this.serializers, this.logger));

    // Start watching if enabled
    if (config.watch) {
      this.startWatching();
    }
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
                return result.data;
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
    const seen = new Set<string>(); // De-duplication key needed? For now, simple aggregation

    for (const loader of this.loaders.values()) {
        try {
            const items = await loader.loadMany<T>(type, options);
            for (const item of items) {
                // TODO: Deduplicate based on 'name' if property exists
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
      // Default to 'filesystem' or first writable
      loader = this.loaders.get('filesystem');
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
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = undefined;
      this.watchCallbacks.clear();
    }
  }

  /**
   * Start watching for file changes
   */
  private startWatching(): void {
    const rootDir = this.config.rootDir || process.cwd();
    const { ignored = ['**/node_modules/**', '**/*.test.*'], persistent = true } =
      this.config.watchOptions || {};

    this.watcher = chokidarWatch(rootDir, {
      ignored,
      persistent,
      ignoreInitial: true,
    });

    this.watcher.on('add', async (filePath) => {
      await this.handleFileEvent('added', filePath);
    });

    this.watcher.on('change', async (filePath) => {
      await this.handleFileEvent('changed', filePath);
    });

    this.watcher.on('unlink', async (filePath) => {
      await this.handleFileEvent('deleted', filePath);
    });

    this.logger.info('File watcher started', { rootDir });
  }

  /**
   * Handle file change events
   */
  private async handleFileEvent(
    eventType: 'added' | 'changed' | 'deleted',
    filePath: string
  ): Promise<void> {
    const rootDir = this.config.rootDir || process.cwd();
    const relativePath = path.relative(rootDir, filePath);
    const parts = relativePath.split(path.sep);

    if (parts.length < 2) {
      return; // Not a metadata file
    }

    const type = parts[0];
    const fileName = parts[parts.length - 1];
    const name = path.basename(fileName, path.extname(fileName));

    const callbacks = this.watchCallbacks.get(type);
    if (!callbacks || callbacks.size === 0) {
      return;
    }

    let data: any = undefined;
    if (eventType !== 'deleted') {
      try {
        data = await this.load(type, name, { useCache: false });
      } catch (error) {
        this.logger.error('Failed to load changed file', undefined, {
          filePath,
          error: error instanceof Error ? error.message : String(error),
        });
        return;
      }
    }

    const event: MetadataWatchEvent = {
      type: eventType,
      metadataType: type,
      name,
      path: filePath,
      data,
      timestamp: new Date(),
    };

    for (const callback of callbacks) {
      try {
        await callback(event);
      } catch (error) {
        this.logger.error('Watch callback error', undefined, {
          type,
          name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Generate ETag for content
   * Uses SHA-256 hash truncated to 32 characters for reasonable collision resistance
   * while keeping ETag headers compact (full 64-char hash is overkill for this use case)
   */
  private generateETag(content: string): string {
    const hash = createHash('sha256').update(content).digest('hex').substring(0, 32);
    return `"${hash}"`;
  }
}

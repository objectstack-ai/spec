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
  private loader: MetadataLoader;
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

    // Initialize loader
    const rootDir = config.rootDir || process.cwd();
    this.loader = new FilesystemLoader(rootDir, this.serializers, this.logger);

    // Start watching if enabled
    if (config.watch) {
      this.startWatching();
    }
  }

  /**
   * Load a single metadata item
   */
  async load<T = any>(
    type: string,
    name: string,
    options?: MetadataLoadOptions
  ): Promise<T | null> {
    const result = await this.loader.load(type, name, options);
    return result.data;
  }

  /**
   * Load multiple metadata items
   */
  async loadMany<T = any>(
    type: string,
    options?: MetadataLoadOptions
  ): Promise<T[]> {
    return this.loader.loadMany<T>(type, options);
  }

  /**
   * Save metadata to disk
   */
  async save<T = any>(
    type: string,
    name: string,
    data: T,
    options?: MetadataSaveOptions
  ): Promise<MetadataSaveResult> {
    const startTime = Date.now();
    const {
      format = 'typescript',
      prettify = true,
      indent = 2,
      sortKeys = false,
      backup = false,
      overwrite = true,
      atomic = true,
      path: customPath,
    } = options || {};

    try {
      // Get serializer
      const serializer = this.serializers.get(format);
      if (!serializer) {
        throw new Error(`No serializer found for format: ${format}`);
      }

      // Determine file path
      const typeDir = path.join(this.config.rootDir || process.cwd(), type);
      const fileName = `${name}${serializer.getExtension()}`;
      const filePath = customPath || path.join(typeDir, fileName);

      // Check if file exists
      if (!overwrite) {
        try {
          await fs.access(filePath);
          throw new Error(`File already exists: ${filePath}`);
        } catch (error) {
          // File doesn't exist, continue
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
          }
        }
      }

      // Create directory if it doesn't exist
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Create backup if requested
      let backupPath: string | undefined;
      if (backup) {
        try {
          await fs.access(filePath);
          backupPath = `${filePath}.bak`;
          await fs.copyFile(filePath, backupPath);
        } catch {
          // File doesn't exist, no backup needed
        }
      }

      // Serialize data
      const content = serializer.serialize(data, {
        prettify,
        indent,
        sortKeys,
      });

      // Write to disk (atomic or direct)
      if (atomic) {
        const tempPath = `${filePath}.tmp`;
        await fs.writeFile(tempPath, content, 'utf-8');
        await fs.rename(tempPath, filePath);
      } else {
        await fs.writeFile(filePath, content, 'utf-8');
      }

      // Get stats
      const stats = await fs.stat(filePath);
      const etag = this.generateETag(content);

      return {
        success: true,
        path: filePath,
        etag,
        size: stats.size,
        saveTime: Date.now() - startTime,
        backupPath,
      };
    } catch (error) {
      this.logger.error('Failed to save metadata', undefined, {
        type,
        name,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Check if metadata item exists
   */
  async exists(type: string, name: string): Promise<boolean> {
    return this.loader.exists(type, name);
  }

  /**
   * List all items of a type
   */
  async list(type: string): Promise<string[]> {
    return this.loader.list(type);
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

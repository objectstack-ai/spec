// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Node Metadata Manager
 * 
 * Extends MetadataManager with Filesystem capabilities (Watching, default loader)
 */

import * as path from 'node:path';
import { watch as chokidarWatch, type FSWatcher } from 'chokidar';
import type {
  MetadataWatchEvent,
} from '@objectstack/spec/system';
import { FilesystemLoader } from './loaders/filesystem-loader.js';
import { MetadataManager, type MetadataManagerOptions } from './metadata-manager.js';

/**
 * Node metadata manager class
 */
export class NodeMetadataManager extends MetadataManager {
  private watcher?: FSWatcher;

  constructor(config: MetadataManagerOptions) {
    super(config);

    // Initialize Default Filesystem Loader if no loaders provided
    // This logic replaces the removed logic from base class
    if (!config.loaders || config.loaders.length === 0) {
      const rootDir = config.rootDir || process.cwd();
      this.registerLoader(new FilesystemLoader(rootDir, this.serializers, this.logger));
    }

    // Start watching if enabled
    if (config.watch) {
      this.startWatching();
    }
  }

  /**
   * Stop all watching
   */
  async stopWatching(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = undefined;
    }
    // Call base cleanup if any
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

    // We can't access private watchCallbacks from parent.
    // We need a protected method to trigger watch event or access it.
    // OPTION: Add a method `triggerWatchEvent` to MetadataManager
    
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
      timestamp: new Date().toISOString(),
    };

    this.notifyWatchers(type, event);
  }
}

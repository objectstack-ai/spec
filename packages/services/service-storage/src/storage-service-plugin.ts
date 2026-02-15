// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Plugin, PluginContext } from '@objectstack/core';
import { LocalStorageAdapter } from './local-storage-adapter.js';
import type { LocalStorageAdapterOptions } from './local-storage-adapter.js';

/**
 * Configuration options for the StorageServicePlugin.
 */
export interface StorageServicePluginOptions {
  /** Storage adapter type (default: 'local') */
  adapter?: 'local' | 's3';
  /** Options for the local storage adapter */
  local?: LocalStorageAdapterOptions;
  /** S3 configuration (used when adapter is 's3') */
  s3?: { bucket: string; region: string; endpoint?: string };
}

/**
 * StorageServicePlugin — Production IStorageService implementation.
 *
 * Registers a file storage service with the kernel during the init phase.
 * Supports local filesystem and S3 adapters.
 *
 * @example
 * ```ts
 * import { ObjectKernel } from '@objectstack/core';
 * import { StorageServicePlugin } from '@objectstack/service-storage';
 *
 * const kernel = new ObjectKernel();
 * kernel.use(new StorageServicePlugin({
 *   adapter: 'local',
 *   local: { rootDir: './uploads' },
 * }));
 * await kernel.bootstrap();
 *
 * const storage = kernel.getService('file-storage');
 * await storage.upload('file.txt', Buffer.from('hello'));
 * ```
 */
export class StorageServicePlugin implements Plugin {
  name = 'com.objectstack.service.storage';
  version = '1.0.0';
  type = 'standard';

  private readonly options: StorageServicePluginOptions;

  constructor(options: StorageServicePluginOptions = {}) {
    this.options = { adapter: 'local', ...options };
  }

  async init(ctx: PluginContext): Promise<void> {
    const adapter = this.options.adapter;
    if (adapter === 's3') {
      throw new Error(
        'S3 storage adapter is not yet implemented. ' +
        'Use adapter: "local" or provide a custom IStorageService via ctx.registerService("file-storage", impl).'
      );
    }

    const rootDir = this.options.local?.rootDir ?? './storage';
    const storage = new LocalStorageAdapter({ rootDir });
    ctx.registerService('file-storage', storage);
    ctx.logger.info(`StorageServicePlugin: registered local storage adapter (root: ${rootDir})`);
  }
}

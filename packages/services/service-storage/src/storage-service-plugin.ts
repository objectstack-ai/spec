// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Plugin, PluginContext } from '@objectstack/core';
import type { IHttpServer, IDataEngine, IStorageService } from '@objectstack/spec/contracts';
import { LocalStorageAdapter } from './local-storage-adapter.js';
import type { LocalStorageAdapterOptions } from './local-storage-adapter.js';
import { StorageMetadataStore } from './metadata-store.js';
import { registerStorageRoutes } from './storage-routes.js';
import { SystemFile, SystemUploadSession } from './objects/index.js';

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
  /**
   * Whether to register REST routes with the HTTP server.
   * @default true
   */
  registerRoutes?: boolean;
  /**
   * Base path for storage REST routes.
   * @default '/api/v1/storage'
   */
  basePath?: string;
  /**
   * Default presigned URL TTL in seconds.
   * @default 3600
   */
  presignedTtl?: number;
  /**
   * Default chunked upload session TTL in seconds.
   * @default 86400
   */
  sessionTtl?: number;
}

/**
 * StorageServicePlugin — Production IStorageService implementation.
 *
 * Registers a file storage service with the kernel during the init phase.
 * Supports local filesystem (development/testing/single-server) and
 * S3-compatible storage (production). Automatically mounts
 * `/api/v1/storage/*` REST routes via the `kernel:ready` hook when an
 * HTTP server is available.
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
  private storage: IStorageService | null = null;
  private store: StorageMetadataStore | null = null;

  constructor(options: StorageServicePluginOptions = {}) {
    this.options = { adapter: 'local', ...options };
  }

  async init(ctx: PluginContext): Promise<void> {
    const adapter = this.options.adapter;
    if (adapter === 's3') {
      // Dynamically import the S3 adapter (to avoid top-level import of optional peer dep)
      const { S3StorageAdapter } = await import('./s3-storage-adapter.js');
      const s3Opts = this.options.s3;
      if (!s3Opts) {
        throw new Error('StorageServicePlugin: s3 options are required when adapter is "s3"');
      }
      this.storage = new S3StorageAdapter(s3Opts);
    } else {
      const rootDir = this.options.local?.rootDir ?? './storage';
      const basePath = this.options.basePath ?? '/api/v1/storage';
      this.storage = new LocalStorageAdapter({ rootDir, basePath, ...this.options.local });
    }

    ctx.registerService('file-storage', this.storage);
    ctx.logger.info(`StorageServicePlugin: registered ${adapter} storage adapter`);

    // Register system objects via manifest service (if available)
    try {
      ctx.getService<{ register(m: any): void }>('manifest').register({
        id: 'com.objectstack.service.storage',
        name: 'Storage Service',
        version: '1.0.0',
        type: 'plugin',
        scope: 'project',
        objects: [SystemFile, SystemUploadSession],
      });
    } catch {
      // manifest service may not be available in all environments
    }
  }

  async start(ctx: PluginContext): Promise<void> {
    if (this.options.registerRoutes === false) return;

    ctx.hook('kernel:ready', async () => {
      let httpServer: IHttpServer | null = null;
      try {
        httpServer = ctx.getService<IHttpServer>('http-server');
      } catch {
        // not available
      }

      if (!httpServer || !this.storage) {
        ctx.logger.warn(
          'StorageServicePlugin: no HTTP server available — REST routes not registered. ' +
          'File storage is still accessible programmatically via kernel.getService("file-storage").',
        );
        return;
      }

      // Create metadata store backed by data engine (if available)
      let engine: IDataEngine | null = null;
      try {
        engine = ctx.getService<IDataEngine>('objectql');
      } catch {
        // data engine not wired — use in-memory fallback
      }
      this.store = new StorageMetadataStore(engine);

      registerStorageRoutes(httpServer, this.storage, this.store, {
        basePath: this.options.basePath ?? '/api/v1/storage',
        presignedTtl: this.options.presignedTtl,
        sessionTtl: this.options.sessionTtl,
      });

      ctx.logger.info('StorageServicePlugin: REST routes registered at ' + (this.options.basePath ?? '/api/v1/storage'));
    });
  }
}


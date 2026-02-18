// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Node.js specific exports for @objectstack/metadata
 */

export * from './index.js';
export { NodeMetadataManager } from './node-metadata-manager.js';
export { FilesystemLoader } from './loaders/filesystem-loader.js';
export { DatabaseLoader, type DatabaseLoaderOptions } from './loaders/database-loader.js';
export { MetadataPlugin } from './plugin.js';

/**
 * @objectstack/metadata
 * 
 * Metadata loading, saving, and persistence for ObjectStack
 */

// Main Manager
export { MetadataManager, type WatchCallback } from './metadata-manager.js';

// Plugin
export { MetadataPlugin } from './plugin.js';

// Loaders
export { type MetadataLoader } from './loaders/loader-interface.js';
export { FilesystemLoader } from './loaders/filesystem-loader.js';

// Serializers
export { type MetadataSerializer, type SerializeOptions } from './serializers/serializer-interface.js';
export { JSONSerializer } from './serializers/json-serializer.js';
export { YAMLSerializer } from './serializers/yaml-serializer.js';
export * as Migration from './migration/index.js';
export { TypeScriptSerializer } from './serializers/typescript-serializer.js';

// Re-export types from spec
export type {
  MetadataFormat,
  MetadataStats,
  MetadataLoadOptions,
  MetadataSaveOptions,
  MetadataExportOptions,
  MetadataImportOptions,
  MetadataLoadResult,
  MetadataSaveResult,
  MetadataWatchEvent,
  MetadataCollectionInfo,
  MetadataLoaderContract,
  MetadataManagerConfig,
} from '@objectstack/spec/system';

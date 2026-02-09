import { describe, it, expect } from 'vitest';
import {
  FileStorageProviderSchema,
  FileAccessPatternSchema,
  FileMetadataConfigSchema,
  MultipartUploadConfigSchema,
  FileVersioningConfigSchema,
  FileFilterConfigSchema,
  StorageBucketSchema,
  FileStorageConnectorSchema,
} from './file-storage.zod';

// Shared base connector fields for FileStorageConnector
const baseConnector = {
  name: 's3_assets',
  label: 'S3 Assets',
  type: 'file_storage' as const,
  authentication: { type: 'none' as const },
  provider: 's3' as const,
  buckets: [
    { name: 'my_bucket', label: 'My Bucket', bucketName: 'actual-bucket' },
  ],
};

describe('FileStorageProviderSchema', () => {
  it('should accept valid providers', () => {
    for (const v of ['s3', 'azure_blob', 'gcs', 'dropbox', 'box', 'onedrive', 'google_drive', 'sharepoint', 'ftp', 'local', 'custom']) {
      expect(FileStorageProviderSchema.parse(v)).toBe(v);
    }
  });

  it('should reject invalid provider', () => {
    expect(() => FileStorageProviderSchema.parse('invalid')).toThrow();
  });
});

describe('FileAccessPatternSchema', () => {
  it('should accept valid access patterns', () => {
    for (const v of ['public_read', 'private', 'authenticated_read', 'bucket_owner_read', 'bucket_owner_full']) {
      expect(FileAccessPatternSchema.parse(v)).toBe(v);
    }
  });

  it('should reject invalid access pattern', () => {
    expect(() => FileAccessPatternSchema.parse('unknown')).toThrow();
  });
});

describe('FileMetadataConfigSchema', () => {
  it('should accept valid config with defaults', () => {
    const result = FileMetadataConfigSchema.parse({});
    expect(result.extractMetadata).toBe(true);
  });

  it('should accept full config', () => {
    const data = {
      extractMetadata: false,
      metadataFields: ['content_type', 'file_size', 'etag'],
      customMetadata: { env: 'prod' },
    };
    expect(() => FileMetadataConfigSchema.parse(data)).not.toThrow();
  });

  it('should reject invalid metadataFields value', () => {
    expect(() => FileMetadataConfigSchema.parse({ metadataFields: ['bad_field'] })).toThrow();
  });
});

describe('MultipartUploadConfigSchema', () => {
  it('should apply defaults', () => {
    const result = MultipartUploadConfigSchema.parse({});
    expect(result.enabled).toBe(true);
    expect(result.partSize).toBe(5 * 1024 * 1024);
    expect(result.maxConcurrentParts).toBe(5);
    expect(result.threshold).toBe(100 * 1024 * 1024);
  });

  it('should reject partSize below minimum', () => {
    expect(() => MultipartUploadConfigSchema.parse({ partSize: 100 })).toThrow();
  });

  it('should reject maxConcurrentParts out of range', () => {
    expect(() => MultipartUploadConfigSchema.parse({ maxConcurrentParts: 0 })).toThrow();
    expect(() => MultipartUploadConfigSchema.parse({ maxConcurrentParts: 11 })).toThrow();
  });
});

describe('FileVersioningConfigSchema', () => {
  it('should apply defaults', () => {
    const result = FileVersioningConfigSchema.parse({});
    expect(result.enabled).toBe(false);
  });

  it('should accept valid config', () => {
    const result = FileVersioningConfigSchema.parse({ enabled: true, maxVersions: 10, retentionDays: 30 });
    expect(result.maxVersions).toBe(10);
  });

  it('should reject maxVersions out of range', () => {
    expect(() => FileVersioningConfigSchema.parse({ maxVersions: 0 })).toThrow();
    expect(() => FileVersioningConfigSchema.parse({ maxVersions: 101 })).toThrow();
  });
});

describe('FileFilterConfigSchema', () => {
  it('should accept empty config', () => {
    expect(() => FileFilterConfigSchema.parse({})).not.toThrow();
  });

  it('should accept full config', () => {
    const data = {
      includePatterns: ['*.jpg'],
      excludePatterns: ['*.tmp'],
      minFileSize: 0,
      maxFileSize: 1024,
      allowedExtensions: ['.jpg'],
      blockedExtensions: ['.exe'],
    };
    expect(() => FileFilterConfigSchema.parse(data)).not.toThrow();
  });

  it('should reject negative minFileSize', () => {
    expect(() => FileFilterConfigSchema.parse({ minFileSize: -1 })).toThrow();
  });

  it('should reject maxFileSize less than 1', () => {
    expect(() => FileFilterConfigSchema.parse({ maxFileSize: 0 })).toThrow();
  });
});

describe('StorageBucketSchema', () => {
  it('should accept valid bucket', () => {
    const data = { name: 'my_bucket', label: 'My Bucket', bucketName: 'actual-bucket-name' };
    const result = StorageBucketSchema.parse(data);
    expect(result.enabled).toBe(true);
  });

  it('should accept bucket with all optional fields', () => {
    const data = {
      name: 'docs_bucket',
      label: 'Documents',
      bucketName: 'docs-bucket',
      region: 'us-east-1',
      enabled: false,
      prefix: 'docs/',
      accessPattern: 'private',
      fileFilters: { allowedExtensions: ['.pdf'] },
    };
    expect(() => StorageBucketSchema.parse(data)).not.toThrow();
  });

  it('should reject non-snake_case name', () => {
    expect(() => StorageBucketSchema.parse({ name: 'MyBucket', label: 'X', bucketName: 'b' })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => StorageBucketSchema.parse({ name: 'b' })).toThrow();
  });
});

describe('FileStorageConnectorSchema', () => {
  it('should accept minimal valid connector', () => {
    expect(() => FileStorageConnectorSchema.parse(baseConnector)).not.toThrow();
  });

  it('should apply defaults', () => {
    const result = FileStorageConnectorSchema.parse(baseConnector);
    expect(result.transferAcceleration).toBe(false);
    expect(result.bufferSize).toBe(64 * 1024);
    expect(result.enabled).toBe(true);
  });

  it('should accept full connector config', () => {
    const full = {
      ...baseConnector,
      storageConfig: { endpoint: 'https://s3.example.com', region: 'us-east-1', pathStyle: true },
      metadataConfig: { extractMetadata: true, metadataFields: ['content_type'] },
      multipartConfig: { enabled: true },
      versioningConfig: { enabled: true, maxVersions: 5 },
      encryption: { enabled: true, algorithm: 'AES256' },
      lifecyclePolicy: { enabled: true, deleteAfterDays: 90 },
      contentProcessing: { extractText: true, generateThumbnails: true, thumbnailSizes: [{ width: 100, height: 100 }], virusScan: false },
      bufferSize: 2048,
      transferAcceleration: true,
    };
    expect(() => FileStorageConnectorSchema.parse(full)).not.toThrow();
  });

  it('should reject wrong type literal', () => {
    expect(() => FileStorageConnectorSchema.parse({ ...baseConnector, type: 'database' })).toThrow();
  });

  it('should reject invalid provider', () => {
    expect(() => FileStorageConnectorSchema.parse({ ...baseConnector, provider: 'invalid' })).toThrow();
  });

  it('should reject missing buckets', () => {
    const { buckets: _, ...noBuckets } = baseConnector;
    expect(() => FileStorageConnectorSchema.parse(noBuckets)).toThrow();
  });

  it('should reject bufferSize below minimum', () => {
    expect(() => FileStorageConnectorSchema.parse({ ...baseConnector, bufferSize: 100 })).toThrow();
  });

  it('should reject invalid storageConfig endpoint', () => {
    expect(() => FileStorageConnectorSchema.parse({ ...baseConnector, storageConfig: { endpoint: 'not-a-url' } })).toThrow();
  });
});

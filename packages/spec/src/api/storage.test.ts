import { describe, it, expect } from 'vitest';
import {
  GetPresignedUrlRequestSchema,
  CompleteUploadRequestSchema,
  PresignedUrlResponseSchema,
  FileUploadResponseSchema,
} from './storage.zod';

describe('GetPresignedUrlRequestSchema', () => {
  it('should accept valid request with defaults', () => {
    const req = GetPresignedUrlRequestSchema.parse({
      filename: 'report.pdf',
      mimeType: 'application/pdf',
      size: 1048576,
    });
    expect(req.filename).toBe('report.pdf');
    expect(req.scope).toBe('user');
    expect(req.bucket).toBeUndefined();
  });

  it('should accept request with all fields', () => {
    const req = GetPresignedUrlRequestSchema.parse({
      filename: 'image.png',
      mimeType: 'image/png',
      size: 2048,
      scope: 'public',
      bucket: 'media-bucket',
    });
    expect(req.scope).toBe('public');
    expect(req.bucket).toBe('media-bucket');
  });

  it('should reject missing filename', () => {
    expect(() =>
      GetPresignedUrlRequestSchema.parse({
        mimeType: 'text/plain',
        size: 100,
      })
    ).toThrow();
  });

  it('should reject missing mimeType', () => {
    expect(() =>
      GetPresignedUrlRequestSchema.parse({
        filename: 'test.txt',
        size: 100,
      })
    ).toThrow();
  });

  it('should reject missing size', () => {
    expect(() =>
      GetPresignedUrlRequestSchema.parse({
        filename: 'test.txt',
        mimeType: 'text/plain',
      })
    ).toThrow();
  });

  it('should reject non-number size', () => {
    expect(() =>
      GetPresignedUrlRequestSchema.parse({
        filename: 'test.txt',
        mimeType: 'text/plain',
        size: 'big',
      })
    ).toThrow();
  });
});

describe('CompleteUploadRequestSchema', () => {
  it('should accept valid complete upload request', () => {
    const req = CompleteUploadRequestSchema.parse({
      fileId: 'file_abc123',
    });
    expect(req.fileId).toBe('file_abc123');
    expect(req.eTag).toBeUndefined();
  });

  it('should accept request with eTag', () => {
    const req = CompleteUploadRequestSchema.parse({
      fileId: 'file_xyz',
      eTag: '"abc123def456"',
    });
    expect(req.eTag).toBe('"abc123def456"');
  });

  it('should reject missing fileId', () => {
    expect(() => CompleteUploadRequestSchema.parse({})).toThrow();
  });
});

describe('PresignedUrlResponseSchema', () => {
  it('should accept valid presigned URL response', () => {
    const resp = PresignedUrlResponseSchema.parse({
      success: true,
      data: {
        uploadUrl: 'https://s3.amazonaws.com/bucket/key?presigned=true',
        fileId: 'file_tmp_123',
        method: 'PUT',
        expiresIn: 3600,
      },
    });
    expect(resp.data.uploadUrl).toContain('s3.amazonaws.com');
    expect(resp.data.method).toBe('PUT');
    expect(resp.data.expiresIn).toBe(3600);
    expect(resp.data.downloadUrl).toBeUndefined();
    expect(resp.data.headers).toBeUndefined();
  });

  it('should accept response with all optional fields', () => {
    const resp = PresignedUrlResponseSchema.parse({
      success: true,
      data: {
        uploadUrl: 'https://storage.example.com/upload',
        downloadUrl: 'https://cdn.example.com/files/abc',
        fileId: 'file_456',
        method: 'POST',
        headers: { 'Content-Type': 'image/jpeg', 'x-amz-acl': 'private' },
        expiresIn: 900,
      },
    });
    expect(resp.data.downloadUrl).toBeDefined();
    expect(resp.data.headers?.['Content-Type']).toBe('image/jpeg');
    expect(resp.data.method).toBe('POST');
  });

  it('should reject invalid method', () => {
    expect(() =>
      PresignedUrlResponseSchema.parse({
        success: true,
        data: {
          uploadUrl: 'https://example.com',
          fileId: 'f1',
          method: 'GET',
          expiresIn: 60,
        },
      })
    ).toThrow();
  });

  it('should reject missing required data fields', () => {
    expect(() =>
      PresignedUrlResponseSchema.parse({
        success: true,
        data: {
          uploadUrl: 'https://example.com',
          method: 'PUT',
          expiresIn: 60,
        },
      })
    ).toThrow();
  });
});

describe('FileUploadResponseSchema', () => {
  it('should accept valid file upload response', () => {
    const resp = FileUploadResponseSchema.parse({
      success: true,
      data: {
        path: '/uploads/report.pdf',
        name: 'report.pdf',
        size: 1048576,
        mimeType: 'application/pdf',
        lastModified: '2025-06-15T10:30:00Z',
        created: '2025-06-15T10:30:00Z',
      },
    });
    expect(resp.data.path).toBe('/uploads/report.pdf');
    expect(resp.data.name).toBe('report.pdf');
    expect(resp.data.size).toBe(1048576);
  });

  it('should accept response with optional etag', () => {
    const resp = FileUploadResponseSchema.parse({
      success: true,
      data: {
        path: '/files/img.png',
        name: 'img.png',
        size: 2048,
        mimeType: 'image/png',
        lastModified: '2025-01-01T00:00:00Z',
        created: '2025-01-01T00:00:00Z',
        etag: '"etag123"',
      },
    });
    expect(resp.data.etag).toBe('"etag123"');
  });

  it('should reject missing required file metadata fields', () => {
    expect(() =>
      FileUploadResponseSchema.parse({
        success: true,
        data: {
          path: '/files/x.txt',
          name: 'x.txt',
        },
      })
    ).toThrow();
  });

  it('should reject invalid datetime in file metadata', () => {
    expect(() =>
      FileUploadResponseSchema.parse({
        success: true,
        data: {
          path: '/files/x.txt',
          name: 'x.txt',
          size: 100,
          mimeType: 'text/plain',
          lastModified: 'not-a-date',
          created: '2025-01-01T00:00:00Z',
        },
      })
    ).toThrow();
  });
});

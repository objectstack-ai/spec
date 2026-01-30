import { describe, it, expect } from 'vitest';
import {
  CacheDirective,
  CacheControlSchema,
  ETagSchema,
  MetadataCacheRequestSchema,
  MetadataCacheResponseSchema,
  CacheInvalidationTarget,
  CacheInvalidationRequestSchema,
  CacheInvalidationResponseSchema,
  MetadataCacheApi,
} from './cache.zod';

describe('CacheDirective', () => {
  it('should accept valid cache directives', () => {
    expect(CacheDirective.parse('public')).toBe('public');
    expect(CacheDirective.parse('private')).toBe('private');
    expect(CacheDirective.parse('no-cache')).toBe('no-cache');
    expect(CacheDirective.parse('no-store')).toBe('no-store');
    expect(CacheDirective.parse('must-revalidate')).toBe('must-revalidate');
    expect(CacheDirective.parse('max-age')).toBe('max-age');
  });
});

describe('CacheControlSchema', () => {
  it('should accept basic cache control', () => {
    const control = CacheControlSchema.parse({
      directives: ['public', 'max-age'],
      maxAge: 3600,
    });

    expect(control.directives).toContain('public');
    expect(control.maxAge).toBe(3600);
  });

  it('should accept cache control with stale options', () => {
    const control = CacheControlSchema.parse({
      directives: ['public'],
      maxAge: 3600,
      staleWhileRevalidate: 86400,
      staleIfError: 604800,
    });

    expect(control.staleWhileRevalidate).toBe(86400);
    expect(control.staleIfError).toBe(604800);
  });
});

describe('ETagSchema', () => {
  it('should accept strong ETag', () => {
    const etag = ETagSchema.parse({
      value: '686897696a7c876b7e',
      weak: false,
    });

    expect(etag.value).toBe('686897696a7c876b7e');
    expect(etag.weak).toBe(false);
  });

  it('should accept weak ETag', () => {
    const etag = ETagSchema.parse({
      value: 'W/"686897696a7c876b7e"',
      weak: true,
    });

    expect(etag.weak).toBe(true);
  });

  it('should default to strong ETag', () => {
    const etag = ETagSchema.parse({
      value: 'abc123',
    });

    expect(etag.weak).toBe(false);
  });
});

describe('MetadataCacheRequestSchema', () => {
  it('should accept request with If-None-Match', () => {
    const request = MetadataCacheRequestSchema.parse({
      ifNoneMatch: '"686897696a7c876b7e"',
    });

    expect(request.ifNoneMatch).toBe('"686897696a7c876b7e"');
  });

  it('should accept request with If-Modified-Since', () => {
    const request = MetadataCacheRequestSchema.parse({
      ifModifiedSince: '2026-01-29T12:00:00Z',
    });

    expect(request.ifModifiedSince).toBe('2026-01-29T12:00:00Z');
  });

  it('should accept request with both headers', () => {
    const request = MetadataCacheRequestSchema.parse({
      ifNoneMatch: '"abc123"',
      ifModifiedSince: '2026-01-29T12:00:00Z',
      cacheControl: {
        directives: ['no-cache'],
      },
    });

    expect(request.ifNoneMatch).toBeDefined();
    expect(request.ifModifiedSince).toBeDefined();
    expect(request.cacheControl).toBeDefined();
  });

  it('should accept empty request', () => {
    const request = MetadataCacheRequestSchema.parse({});
    expect(request).toBeDefined();
  });
});

describe('MetadataCacheResponseSchema', () => {
  it('should accept successful response with metadata', () => {
    const response = MetadataCacheResponseSchema.parse({
      data: { object: 'account', fields: [] },
      etag: {
        value: '686897696a7c876b7e',
        weak: false,
      },
      lastModified: '2026-01-29T12:00:00Z',
      cacheControl: {
        directives: ['public', 'max-age'],
        maxAge: 3600,
      },
    });

    expect(response.data).toBeDefined();
    expect(response.etag?.value).toBe('686897696a7c876b7e');
    expect(response.cacheControl?.maxAge).toBe(3600);
  });

  it('should accept 304 Not Modified response', () => {
    const response = MetadataCacheResponseSchema.parse({
      notModified: true,
      etag: {
        value: '686897696a7c876b7e',
      },
    });

    expect(response.notModified).toBe(true);
    expect(response.data).toBeUndefined();
  });

  it('should accept response with version', () => {
    const response = MetadataCacheResponseSchema.parse({
      data: { object: 'contact' },
      version: '2.5.0',
      etag: {
        value: 'version_2.5.0',
      },
    });

    expect(response.version).toBe('2.5.0');
  });

  it('should default notModified to false', () => {
    const response = MetadataCacheResponseSchema.parse({
      data: {},
    });

    expect(response.notModified).toBe(false);
  });
});

describe('CacheInvalidationTarget', () => {
  it('should accept valid invalidation targets', () => {
    expect(CacheInvalidationTarget.parse('all')).toBe('all');
    expect(CacheInvalidationTarget.parse('object')).toBe('object');
    expect(CacheInvalidationTarget.parse('field')).toBe('field');
    expect(CacheInvalidationTarget.parse('permission')).toBe('permission');
    expect(CacheInvalidationTarget.parse('layout')).toBe('layout');
    expect(CacheInvalidationTarget.parse('custom')).toBe('custom');
  });
});

describe('CacheInvalidationRequestSchema', () => {
  it('should accept invalidate all request', () => {
    const request = CacheInvalidationRequestSchema.parse({
      target: 'all',
    });

    expect(request.target).toBe('all');
    expect(request.cascade).toBe(false);
  });

  it('should accept specific object invalidation', () => {
    const request = CacheInvalidationRequestSchema.parse({
      target: 'object',
      identifiers: ['account', 'contact'],
      cascade: true,
    });

    expect(request.target).toBe('object');
    expect(request.identifiers).toContain('account');
    expect(request.cascade).toBe(true);
  });

  it('should accept custom pattern invalidation', () => {
    const request = CacheInvalidationRequestSchema.parse({
      target: 'custom',
      pattern: 'metadata:object:*',
    });

    expect(request.pattern).toBe('metadata:object:*');
  });
});

describe('CacheInvalidationResponseSchema', () => {
  it('should accept successful invalidation response', () => {
    const response = CacheInvalidationResponseSchema.parse({
      success: true,
      invalidated: 5,
      targets: ['account', 'contact', 'opportunity'],
    });

    expect(response.success).toBe(true);
    expect(response.invalidated).toBe(5);
    expect(response.targets).toHaveLength(3);
  });

  it('should accept response without targets', () => {
    const response = CacheInvalidationResponseSchema.parse({
      success: true,
      invalidated: 0,
    });

    expect(response.invalidated).toBe(0);
    expect(response.targets).toBeUndefined();
  });
});

describe('MetadataCacheApi', () => {
  it('should have correct API structure', () => {
    expect(MetadataCacheApi.getCached).toBeDefined();
    expect(MetadataCacheApi.getCached.input).toBeDefined();
    expect(MetadataCacheApi.getCached.output).toBeDefined();

    expect(MetadataCacheApi.invalidate).toBeDefined();
    expect(MetadataCacheApi.invalidate.input).toBeDefined();
    expect(MetadataCacheApi.invalidate.output).toBeDefined();
  });

  it('should validate getCached contract', () => {
    const input = {
      ifNoneMatch: '"abc123"',
    };

    const parsedInput = MetadataCacheApi.getCached.input.parse(input);
    expect(parsedInput.ifNoneMatch).toBe('"abc123"');
  });

  it('should validate invalidate contract', () => {
    const input = {
      target: 'object' as const,
      identifiers: ['account'],
    };

    const parsedInput = MetadataCacheApi.invalidate.input.parse(input);
    expect(parsedInput.target).toBe('object');
  });
});

import { describe, it, expect } from 'vitest';
import {
  SharingConfigSchema,
  EmbedConfigSchema,
  type SharingConfig,
  type EmbedConfig,
} from './sharing.zod';

// ---------------------------------------------------------------------------
// SharingConfigSchema
// ---------------------------------------------------------------------------
describe('SharingConfigSchema', () => {
  it('should accept empty config with defaults', () => {
    const config: SharingConfig = SharingConfigSchema.parse({});
    expect(config.enabled).toBe(false);
    expect(config.allowAnonymous).toBe(false);
    expect(config.publicLink).toBeUndefined();
    expect(config.password).toBeUndefined();
    expect(config.allowedDomains).toBeUndefined();
    expect(config.expiresAt).toBeUndefined();
  });

  it('should accept full sharing config', () => {
    const config = SharingConfigSchema.parse({
      enabled: true,
      publicLink: 'https://app.example.com/share/abc123',
      password: 'secret123',
      allowedDomains: ['example.com', 'partner.com'],
      expiresAt: '2027-01-01T00:00:00Z',
      allowAnonymous: true,
    });

    expect(config.enabled).toBe(true);
    expect(config.publicLink).toBe('https://app.example.com/share/abc123');
    expect(config.password).toBe('secret123');
    expect(config.allowedDomains).toEqual(['example.com', 'partner.com']);
    expect(config.expiresAt).toBe('2027-01-01T00:00:00Z');
    expect(config.allowAnonymous).toBe(true);
  });

  it('should accept config with only enabled', () => {
    const config = SharingConfigSchema.parse({ enabled: true });
    expect(config.enabled).toBe(true);
    expect(config.password).toBeUndefined();
  });

  it('should accept config with domain restrictions', () => {
    const config = SharingConfigSchema.parse({
      enabled: true,
      allowedDomains: ['acme.com'],
    });
    expect(config.allowedDomains).toEqual(['acme.com']);
  });

  it('should accept empty allowedDomains array', () => {
    const config = SharingConfigSchema.parse({
      enabled: true,
      allowedDomains: [],
    });
    expect(config.allowedDomains).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// EmbedConfigSchema
// ---------------------------------------------------------------------------
describe('EmbedConfigSchema', () => {
  it('should accept empty config with defaults', () => {
    const config: EmbedConfig = EmbedConfigSchema.parse({});
    expect(config.enabled).toBe(false);
    expect(config.width).toBe('100%');
    expect(config.height).toBe('600px');
    expect(config.showHeader).toBe(true);
    expect(config.showNavigation).toBe(false);
    expect(config.responsive).toBe(true);
    expect(config.allowedOrigins).toBeUndefined();
  });

  it('should accept full embed config', () => {
    const config = EmbedConfigSchema.parse({
      enabled: true,
      allowedOrigins: ['https://example.com', 'https://partner.com'],
      width: '800px',
      height: '500px',
      showHeader: false,
      showNavigation: true,
      responsive: false,
    });

    expect(config.enabled).toBe(true);
    expect(config.allowedOrigins).toEqual(['https://example.com', 'https://partner.com']);
    expect(config.width).toBe('800px');
    expect(config.height).toBe('500px');
    expect(config.showHeader).toBe(false);
    expect(config.showNavigation).toBe(true);
    expect(config.responsive).toBe(false);
  });

  it('should accept config with only origin restrictions', () => {
    const config = EmbedConfigSchema.parse({
      enabled: true,
      allowedOrigins: ['https://mysite.com'],
    });
    expect(config.allowedOrigins).toEqual(['https://mysite.com']);
  });

  it('should accept empty allowedOrigins array', () => {
    const config = EmbedConfigSchema.parse({
      enabled: true,
      allowedOrigins: [],
    });
    expect(config.allowedOrigins).toEqual([]);
  });
});

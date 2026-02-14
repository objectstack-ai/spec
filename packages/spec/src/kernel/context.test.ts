import { describe, it, expect } from 'vitest';
import {
  RuntimeMode,
  KernelContextSchema,
  PreviewModeConfigSchema,
  type KernelContext,
} from './context.zod';

describe('RuntimeMode', () => {
  it('should accept valid runtime modes', () => {
    expect(() => RuntimeMode.parse('development')).not.toThrow();
    expect(() => RuntimeMode.parse('production')).not.toThrow();
    expect(() => RuntimeMode.parse('test')).not.toThrow();
    expect(() => RuntimeMode.parse('provisioning')).not.toThrow();
    expect(() => RuntimeMode.parse('preview')).not.toThrow();
  });

  it('should reject invalid runtime modes', () => {
    expect(() => RuntimeMode.parse('staging')).toThrow();
    expect(() => RuntimeMode.parse('debug')).toThrow();
    expect(() => RuntimeMode.parse('')).toThrow();
  });
});

describe('KernelContextSchema', () => {
  const validContext: KernelContext = {
    instanceId: '550e8400-e29b-41d4-a716-446655440000',
    mode: 'production',
    version: '1.0.0',
    cwd: '/app',
    startTime: Date.now(),
    features: {},
  };

  it('should accept valid minimal context', () => {
    expect(() => KernelContextSchema.parse(validContext)).not.toThrow();
  });

  it('should accept context with all optional fields', () => {
    const full = {
      ...validContext,
      appName: 'My App',
      workspaceRoot: '/workspace',
    };
    const parsed = KernelContextSchema.parse(full);
    expect(parsed.appName).toBe('My App');
    expect(parsed.workspaceRoot).toBe('/workspace');
  });

  it('should apply default mode to production', () => {
    const { mode: _, ...withoutMode } = validContext;
    const parsed = KernelContextSchema.parse(withoutMode);
    expect(parsed.mode).toBe('production');
  });

  it('should apply default features to empty record', () => {
    const { features: _, ...withoutFeatures } = validContext;
    const parsed = KernelContextSchema.parse(withoutFeatures);
    expect(parsed.features).toEqual({});
  });

  it('should accept feature flags', () => {
    const ctx = {
      ...validContext,
      features: { darkMode: true, beta: false },
    };
    const parsed = KernelContextSchema.parse(ctx);
    expect(parsed.features.darkMode).toBe(true);
    expect(parsed.features.beta).toBe(false);
  });

  it('should reject invalid instanceId (not UUID)', () => {
    expect(() => KernelContextSchema.parse({
      ...validContext,
      instanceId: 'not-a-uuid',
    })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => KernelContextSchema.parse({})).toThrow();
    expect(() => KernelContextSchema.parse({ instanceId: '550e8400-e29b-41d4-a716-446655440000' })).toThrow();
  });

  it('should reject non-integer startTime', () => {
    expect(() => KernelContextSchema.parse({
      ...validContext,
      startTime: 1.5,
    })).toThrow();
  });

  it('should accept all runtime modes in context', () => {
    const modes = ['development', 'production', 'test', 'provisioning', 'preview'] as const;
    modes.forEach(mode => {
      const parsed = KernelContextSchema.parse({ ...validContext, mode });
      expect(parsed.mode).toBe(mode);
    });
  });

  it('should accept preview mode with previewMode config', () => {
    const parsed = KernelContextSchema.parse({
      ...validContext,
      mode: 'preview',
      previewMode: {
        autoLogin: true,
        simulatedRole: 'admin',
        simulatedUserName: 'Demo Admin',
        readOnly: true,
        expiresInSeconds: 3600,
        bannerMessage: 'You are viewing a demo of this application.',
      },
    });
    expect(parsed.mode).toBe('preview');
    expect(parsed.previewMode?.autoLogin).toBe(true);
    expect(parsed.previewMode?.simulatedRole).toBe('admin');
    expect(parsed.previewMode?.simulatedUserName).toBe('Demo Admin');
    expect(parsed.previewMode?.readOnly).toBe(true);
    expect(parsed.previewMode?.expiresInSeconds).toBe(3600);
    expect(parsed.previewMode?.bannerMessage).toContain('demo');
  });

  it('should accept context without previewMode (optional)', () => {
    const parsed = KernelContextSchema.parse(validContext);
    expect(parsed.previewMode).toBeUndefined();
  });
});

describe('PreviewModeConfigSchema', () => {
  it('should apply defaults for zero-config preview', () => {
    const parsed = PreviewModeConfigSchema.parse({});
    expect(parsed.autoLogin).toBe(true);
    expect(parsed.simulatedRole).toBe('admin');
    expect(parsed.simulatedUserName).toBe('Preview User');
    expect(parsed.readOnly).toBe(false);
    expect(parsed.expiresInSeconds).toBe(0);
    expect(parsed.bannerMessage).toBeUndefined();
  });

  it('should accept all simulated roles', () => {
    const roles = ['admin', 'user', 'viewer'] as const;
    roles.forEach(role => {
      const parsed = PreviewModeConfigSchema.parse({ simulatedRole: role });
      expect(parsed.simulatedRole).toBe(role);
    });
  });

  it('should reject invalid simulated role', () => {
    expect(() => PreviewModeConfigSchema.parse({ simulatedRole: 'superadmin' })).toThrow();
  });

  it('should accept read-only preview for marketplace demos', () => {
    const parsed = PreviewModeConfigSchema.parse({
      autoLogin: true,
      simulatedRole: 'viewer',
      readOnly: true,
      bannerMessage: 'This is a preview. Sign up to get started!',
    });
    expect(parsed.readOnly).toBe(true);
    expect(parsed.simulatedRole).toBe('viewer');
    expect(parsed.bannerMessage).toContain('preview');
  });

  it('should reject negative expiresInSeconds', () => {
    expect(() => PreviewModeConfigSchema.parse({ expiresInSeconds: -1 })).toThrow();
  });

  it('should reject non-integer expiresInSeconds', () => {
    expect(() => PreviewModeConfigSchema.parse({ expiresInSeconds: 1.5 })).toThrow();
  });
});

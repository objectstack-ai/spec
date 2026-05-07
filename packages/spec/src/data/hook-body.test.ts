// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import {
  HookBodySchema,
  ExpressionBodySchema,
  ScriptBodySchema,
} from './hook-body.zod';

describe('HookBody', () => {
  describe('ExpressionBody (L1)', () => {
    it('accepts a non-empty expression', () => {
      const r = ExpressionBodySchema.safeParse({
        language: 'expression',
        source: "input.amount > 1000 && input.status == 'open'",
      });
      expect(r.success).toBe(true);
    });

    it('rejects empty source', () => {
      const r = ExpressionBodySchema.safeParse({ language: 'expression', source: '' });
      expect(r.success).toBe(false);
    });
  });

  describe('ScriptBody (L2)', () => {
    it('accepts a minimal script with default capabilities []', () => {
      const r = ScriptBodySchema.safeParse({
        language: 'js',
        source: 'ctx.input.email = ctx.input.email.toLowerCase();',
      });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.capabilities).toEqual([]);
    });

    it('accepts capabilities + timeout + memory', () => {
      const r = ScriptBodySchema.safeParse({
        language: 'js',
        source: 'await ctx.api.object("opportunity").count();',
        capabilities: ['api.read', 'log'],
        timeoutMs: 500,
        memoryMb: 64,
      });
      expect(r.success).toBe(true);
    });

    it('rejects unknown capabilities', () => {
      const r = ScriptBodySchema.safeParse({
        language: 'js',
        source: 'x = 1;',
        capabilities: ['http.fetch'],
      });
      expect(r.success).toBe(false);
    });

    it('rejects timeoutMs over the cap', () => {
      const r = ScriptBodySchema.safeParse({
        language: 'js',
        source: 'x = 1;',
        timeoutMs: 60_000,
      });
      expect(r.success).toBe(false);
    });

    it('rejects empty source', () => {
      const r = ScriptBodySchema.safeParse({ language: 'js', source: '' });
      expect(r.success).toBe(false);
    });
  });

  describe('HookBody (discriminated union)', () => {
    it('routes to expression on language: expression', () => {
      const r = HookBodySchema.safeParse({ language: 'expression', source: 'x > 0' });
      expect(r.success).toBe(true);
    });

    it('routes to script on language: js', () => {
      const r = HookBodySchema.safeParse({ language: 'js', source: 'return;' });
      expect(r.success).toBe(true);
    });

    it('rejects compiled-module form (L3 disabled)', () => {
      const r = HookBodySchema.safeParse({
        language: 'module',
        ref: 'bundle.functions.handler',
      } as unknown as Parameters<typeof HookBodySchema.safeParse>[0]);
      expect(r.success).toBe(false);
    });

    it('rejects an unknown language', () => {
      const r = HookBodySchema.safeParse({
        language: 'python',
        source: 'pass',
      } as unknown as Parameters<typeof HookBodySchema.safeParse>[0]);
      expect(r.success).toBe(false);
    });
  });
});

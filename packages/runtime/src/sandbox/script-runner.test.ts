// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import { UnimplementedScriptRunner } from './script-runner.js';
import type { HookBody } from '@objectstack/spec/data';

describe('UnimplementedScriptRunner', () => {
  const runner = new UnimplementedScriptRunner();
  const ctx = { input: {} };
  const opts = { origin: { kind: 'hook' as const, name: 't' } };

  it('rejects expression invocations until an engine is installed', async () => {
    const body: HookBody = { language: 'expression', source: '1 + 1' };
    await expect(runner.run(body, ctx, opts)).rejects.toThrow(/not configured/);
  });

  it('rejects script invocations until an engine is installed', async () => {
    const body: HookBody = { language: 'js', source: 'return 1;', capabilities: [] };
    await expect(runner.run(body, ctx, opts)).rejects.toThrow(/not configured/);
  });

  it('dispatches by language tag', async () => {
    await expect(
      runner.run({ language: 'expression', source: 'x' }, ctx, opts),
    ).rejects.toThrow();
    await expect(
      runner.run({ language: 'js', source: 'x', capabilities: [] }, ctx, opts),
    ).rejects.toThrow();
  });

  it('dispose resolves cleanly', async () => {
    await expect(runner.dispose()).resolves.toBeUndefined();
  });
});

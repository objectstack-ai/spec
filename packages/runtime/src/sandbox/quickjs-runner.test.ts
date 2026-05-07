// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import { QuickJSScriptRunner, SandboxError } from './quickjs-runner.js';
import type { ScriptContext, ScriptRunOptions } from './script-runner.js';

const runner = new QuickJSScriptRunner();
const hookOpts: ScriptRunOptions = { origin: { kind: 'hook', name: 't' } };
const actionOpts: ScriptRunOptions = { origin: { kind: 'action', name: 't' } };

function ctx(over: Partial<ScriptContext> = {}): ScriptContext {
  return { input: {}, ...over };
}

describe('QuickJSScriptRunner — L1 expression', () => {
  it('evaluates a numeric expression', async () => {
    const r = await runner.evalExpression(
      { language: 'expression', source: '1 + 2 * 3' },
      ctx(),
      hookOpts,
    );
    expect(r.value).toBe(7);
  });

  it('evaluates against ctx.input via the wrapper', async () => {
    const r = await runner.run(
      { language: 'expression', source: '40 + 2' },
      ctx({ input: { x: 1 } }),
      hookOpts,
    );
    expect(r.value).toBe(42);
  });
});

describe('QuickJSScriptRunner — L2 hook script', () => {
  it('mutates ctx.input via JSON return', async () => {
    // Hook style: read ctx.input, return modified shape.
    const r = await runner.runScript(
      {
        language: 'js',
        source: 'return { ok: true, doubled: ctx.input.n * 2 };',
        capabilities: [],
      },
      ctx({ input: { n: 21 } }),
      hookOpts,
    );
    expect(r.value).toEqual({ ok: true, doubled: 42 });
  });

  it('respects the timeoutMs cap', async () => {
    await expect(
      runner.runScript(
        {
          language: 'js',
          source: 'while (true) {}',
          capabilities: [],
          timeoutMs: 50,
        },
        ctx(),
        hookOpts,
      ),
    ).rejects.toThrow();
  });

  it('rejects use of api.read without capability', async () => {
    let called = 0;
    const api = {
      object: (n: string) => ({
        count: (..._args: unknown[]) => {
          called++;
          return 1;
        },
      }),
    };
    await expect(
      runner.runScript(
        {
          language: 'js',
          source: "return ctx.api.object('opportunity').count({ a: ctx.input.id });",
          capabilities: [], // no api.read
        },
        ctx({ input: { id: 'x' }, api }),
        hookOpts,
      ),
    ).rejects.toThrow(/api\.read/);
    expect(called).toBe(0);
  });

  it('allows api.read when capability is granted', async () => {
    const api = {
      object: (_n: string) => ({
        count: (_filter: unknown) => 7,
      }),
    };
    const r = await runner.runScript(
      {
        language: 'js',
        source: "return ctx.api.object('o').count({ x: 1 });",
        capabilities: ['api.read'],
      },
      ctx({ input: {}, api }),
      hookOpts,
    );
    expect(r.value).toBe(7);
  });

  it('rejects log calls without log capability', async () => {
    const log = { info: () => {}, warn: () => {}, error: () => {} };
    await expect(
      runner.runScript(
        {
          language: 'js',
          source: "ctx.log.info('hi'); return 1;",
          capabilities: [],
        },
        ctx({ log }),
        hookOpts,
      ),
    ).rejects.toThrow(/'log'/);
  });

  it('crypto.uuid requires capability', async () => {
    await expect(
      runner.runScript(
        { language: 'js', source: 'return ctx.crypto.randomUUID();', capabilities: [] },
        ctx(),
        hookOpts,
      ),
    ).rejects.toThrow(/crypto\.uuid/);

    const r = await runner.runScript(
      { language: 'js', source: 'return ctx.crypto.randomUUID();', capabilities: ['crypto.uuid'] },
      ctx(),
      hookOpts,
    );
    expect(typeof r.value).toBe('string');
    expect((r.value as string).length).toBeGreaterThanOrEqual(36);
  });

  it('reports script-thrown errors with origin name', async () => {
    await expect(
      runner.runScript(
        { language: 'js', source: "throw new Error('bad');", capabilities: [] },
        ctx(),
        { origin: { kind: 'hook', name: 'oops' } },
      ),
    ).rejects.toThrow(/hook 'oops'/);
  });
});

describe('QuickJSScriptRunner — L2 action script', () => {
  it('passes input as the first argument and returns a value', async () => {
    const r = await runner.runScript(
      {
        language: 'js',
        source: 'return { sum: input.a + input.b, who: ctx.user?.id };',
        capabilities: [],
      },
      { input: { a: 2, b: 3 }, user: { id: 'u1' } },
      actionOpts,
    );
    expect(r.value).toEqual({ sum: 5, who: 'u1' });
  });
});

describe('QuickJSScriptRunner — async host APIs', () => {
  it('awaits Promise return values from host APIs (asyncified)', async () => {
    const api = { object: () => ({ count: async () => 7 }) };
    const r = await runner.runScript(
      {
        language: 'js',
        source: "return await ctx.api.object('o').count({});",
        capabilities: ['api.read'],
      },
      ctx({ api }),
      hookOpts,
    );
    expect(r.value).toBe(7);
  });

  it('propagates rejections from async host APIs as SandboxError', async () => {
    const api = {
      object: () => ({
        count: async () => {
          throw new Error('db is on fire');
        },
      }),
    };
    await expect(
      runner.runScript(
        {
          language: 'js',
          source: "return await ctx.api.object('o').count({});",
          capabilities: ['api.read'],
        },
        ctx({ api }),
        hookOpts,
      ),
    ).rejects.toThrow(/db is on fire/);
  });

  it('captures direct ctx.input mutations into result.mutatedInput', async () => {
    const r = await runner.runScript(
      {
        language: 'js',
        source: "ctx.input.normalized = (ctx.input.raw || '').toUpperCase();",
        capabilities: [],
      },
      { input: { raw: 'abc-9' } },
      hookOpts,
    );
    expect(r.mutatedInput).toMatchObject({ raw: 'abc-9', normalized: 'ABC-9' });
  });
});

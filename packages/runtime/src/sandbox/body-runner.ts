// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Hook & Action Body Runner Factory
 *
 * Bridges the metadata-only `Hook.body` / `Action.body` discriminated union
 * (defined in `@objectstack/spec/data/hook-body.zod`) into an executable
 * handler registered on the ObjectQL engine.
 *
 * The runtime owns this bridge — `objectql` itself never imports the
 * sandbox engine, so it can stay light enough to embed in tooling and
 * tests. `AppPlugin` constructs one factory per bundle bind and passes it
 * through `bindHooksToEngine({ bodyRunner })` for hooks, and walks the
 * bundle actions to register them via `engine.registerAction`.
 *
 * Per-invocation flow when a triggered hook fires:
 *   1. ObjectQL calls the wrapped handler with its native `(ctx)` arg.
 *   2. We adapt that engine-context into the sandbox `ScriptContext`
 *      shape and proxy `ctx.api.object(...)` to the running ObjectQL
 *      proxy bound to the current organization/user.
 *   3. `ScriptRunner.runScript` evaluates the body inside QuickJS with
 *      the declared capabilities + timeout.
 *   4. After settle, we write back two kinds of mutations to the host
 *      `ctx.input`:
 *      a. `result.mutatedInput` — a snapshot of `ctx.input` taken inside
 *         the VM, used to propagate direct property writes such as
 *         `ctx.input.account_number = 'ABC'`.
 *      b. `result.value` — if the script returned an object, it is
 *         shallow-merged on top of `mutatedInput` as an explicit patch.
 *      Writes go through `Object.assign`, which means the host engine's
 *      flat-record Proxy (installed by `wrapDeclarativeHook`) sees them
 *      via its set trap.
 */

import type { Hook } from '@objectstack/spec/data';
import { HookBodySchema } from '@objectstack/spec/data';
import type { ScriptRunner, ScriptContext, ScriptResult } from './script-runner.js';

interface FactoryOptions {
  ql: any;
  appId: string;
  logger?: any;
}

export function hookBodyRunnerFactory(
  runner: ScriptRunner,
  opts: FactoryOptions,
): (hook: Hook) => ((engineCtx: any) => Promise<void>) | undefined {
  return (hook: Hook) => {
    const raw = (hook as any).body;
    if (!raw) return undefined;

    const parsed = HookBodySchema.safeParse(raw);
    if (!parsed.success) {
      opts.logger?.warn?.('[BodyRunner] invalid hook.body shape', {
        appId: opts.appId,
        hook: hook.name,
        issues: parsed.error.issues.slice(0, 3),
      });
      return undefined;
    }
    const body = parsed.data;

    return async function boundBodyHandler(engineCtx: any): Promise<void> {
      const sandboxCtx = buildSandboxContext(engineCtx, opts.ql);
      try {
        opts.logger?.debug?.('[BodyRunner] hook fired', { appId: opts.appId, hook: hook.name });
        const result = await runner.run(body, sandboxCtx, {
          origin: {
            kind: 'hook',
            name: hook.name,
            object: typeof (hook as any).object === 'string' ? (hook as any).object : undefined,
          },
          timeoutMs: (body as any).timeoutMs ?? 250,
        });
        applyMutationsToInput(engineCtx, result);
      } catch (err: any) {
        opts.logger?.error?.('[BodyRunner] sandboxed hook threw', err, {
          appId: opts.appId,
          hook: hook.name,
        });
        throw err;
      }
    };
  };
}

/**
 * Action body runner factory.
 *
 * Returns a handler with the shape ObjectQL's `executeAction` expects:
 * `(actionCtx) => Promise<unknown>`. The action's return value bubbles up
 * to the HTTP dispatcher which JSON-serialises it back to the caller.
 */
export function actionBodyRunnerFactory(
  runner: ScriptRunner,
  opts: FactoryOptions,
): (action: { name: string; body?: unknown; object?: string; timeoutMs?: number }) =>
  | ((actionCtx: any) => Promise<unknown>)
  | undefined {
  return (action) => {
    const raw = action.body;
    if (!raw) return undefined;

    const parsed = HookBodySchema.safeParse(raw);
    if (!parsed.success) {
      opts.logger?.warn?.('[BodyRunner] invalid action.body shape', {
        appId: opts.appId,
        action: action.name,
        issues: parsed.error.issues.slice(0, 3),
      });
      return undefined;
    }
    const body = parsed.data;

    return async function boundActionHandler(actionCtx: any): Promise<unknown> {
      const sandboxCtx = buildActionSandboxContext(actionCtx, opts.ql);
      try {
        opts.logger?.debug?.('[BodyRunner] action fired', {
          appId: opts.appId,
          action: action.name,
          object: action.object,
        });
        const result = await runner.run(body, sandboxCtx, {
          origin: { kind: 'action', name: action.name, object: action.object },
          timeoutMs: (body as any).timeoutMs ?? action.timeoutMs ?? 5000,
        });
        return result.value;
      } catch (err: any) {
        opts.logger?.error?.('[BodyRunner] sandboxed action threw', err, {
          appId: opts.appId,
          action: action.name,
        });
        throw err;
      }
    };
  };
}

function applyMutationsToInput(engineCtx: any, result: ScriptResult): void {
  const target = engineCtx?.input;
  if (!target || typeof target !== 'object') return;
  if (result.mutatedInput && typeof result.mutatedInput === 'object') {
    Object.assign(target, result.mutatedInput);
  }
  if (
    result.value &&
    typeof result.value === 'object' &&
    !Array.isArray(result.value)
  ) {
    Object.assign(target, result.value);
  }
}

function buildSandboxContext(engineCtx: any, ql: any): ScriptContext {
  const inputSnapshot = unwrapProxyToPlain(engineCtx?.input ?? engineCtx?.doc);
  // Prefer the engine-provided ScopedContext (has org/user/permissions wired
  // through `buildHookApi`). Fall back to a minimal ql.object() bridge for
  // hooks fired outside the engine's normal dispatch path.
  const engineApi = engineCtx?.api;
  const api =
    engineApi && typeof engineApi.object === 'function'
      ? engineApi
      : {
          object: (objectName: string) => {
            if (!ql || typeof ql.object !== 'function') {
              throw new Error('ObjectQL engine unavailable to hook body');
            }
            return ql.object(objectName);
          },
        };
  return {
    input: inputSnapshot,
    previous: unwrapProxyToPlain(engineCtx?.previous ?? engineCtx?.previousDoc),
    user: engineCtx?.user ?? engineCtx?.session?.user,
    session: engineCtx?.session,
    event: typeof engineCtx?.event === 'string' ? engineCtx.event : undefined,
    object: typeof engineCtx?.object === 'string' ? engineCtx.object : undefined,
    result: engineCtx?.result,
    api,
    log: engineCtx?.logger,
    crypto: globalThis.crypto,
  };
}

function buildActionSandboxContext(actionCtx: any, ql: any): ScriptContext {
  // Action ctx convention (mirrors http-dispatcher.ts):
  //   { record, params, recordId, user, session, engine, services, ... }
  // The script signature is `(input, ctx)` — input gets `params`, ctx gets
  // the full action context.
  return {
    input: unwrapProxyToPlain(actionCtx?.params ?? {}),
    previous: undefined,
    user: actionCtx?.user ?? actionCtx?.session?.user,
    session: actionCtx?.session,
    api: {
      object: (objectName: string) => {
        if (!ql || typeof ql.object !== 'function') {
          throw new Error('ObjectQL engine unavailable to action body');
        }
        return ql.object(objectName);
      },
    },
    log: actionCtx?.logger,
    crypto: globalThis.crypto,
  };
}

/**
 * Convert a Proxy-wrapped record into a plain object so it round-trips through
 * JSON cleanly. `Object.fromEntries(Object.entries(p))` triggers the proxy's
 * ownKeys + get traps, materialising every visible field.
 */
function unwrapProxyToPlain(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== 'object') return {};
  if (Array.isArray(v)) return {};
  try {
    return Object.fromEntries(Object.entries(v as Record<string, unknown>));
  } catch {
    return {};
  }
}

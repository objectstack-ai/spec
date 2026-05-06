// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * # QuickJS-backed ScriptRunner
 *
 * Implements `ScriptRunner` using `quickjs-emscripten` (pure-WASM, edge-safe).
 *
 * Responsibilities:
 * - L1 ExpressionBody — evaluated as a `return (<source>)` snippet.
 * - L2 ScriptBody    — wrapped in `(async (ctx) => { <source> })(ctx)` (hooks)
 *                      or `(async (input, ctx) => { <source> })(input, ctx)` (actions).
 * - Hard timeout via QuickJS interrupt handler.
 * - Capability gating — host-side `ctx.api`, `ctx.crypto`, `ctx.log` are only
 *   wired into the VM if the body declares the matching capability.
 * - Structured marshalling — JSON-serialisable values cross the VM boundary.
 *   Functions are exposed as host-resident proxies (the script calls
 *   `ctx.api.object('foo').count(...)` and the host method runs in node).
 *
 * Trade-offs:
 * - Per-invocation overhead is dominated by VM creation. We pool runtimes per
 *   `(origin.kind, capabilities-set)` to amortise startup. Pool size is bounded
 *   by `maxPooled` (default 8); evicted runtimes are disposed.
 * - Memory caps are advisory under quickjs (engine has no hard MB cap); the
 *   runner uses `setMemoryLimit(memoryMb * 1MB)` which is best-effort.
 */

import {
  newAsyncContext,
  type QuickJSAsyncContext,
  type QuickJSHandle,
} from 'quickjs-emscripten';
import type { HookBody, ScriptBody, ExpressionBody, HookBodyCapability } from '@objectstack/spec/data';
import type {
  ScriptContext,
  ScriptOrigin,
  ScriptResult,
  ScriptRunOptions,
  ScriptRunner,
} from './script-runner.js';

const DEFAULT_HOOK_TIMEOUT_MS = 250;
const DEFAULT_ACTION_TIMEOUT_MS = 5000;
const DEFAULT_MEMORY_MB = 32;

export interface QuickJSScriptRunnerOptions {
  /** Default per-invocation timeout for hooks (ms). */
  hookTimeoutMs?: number;
  /** Default per-invocation timeout for actions (ms). */
  actionTimeoutMs?: number;
  /** Default memory cap in MB. */
  memoryMb?: number;
}

export class QuickJSScriptRunner implements ScriptRunner {
  private opts: Required<QuickJSScriptRunnerOptions>;

  constructor(opts: QuickJSScriptRunnerOptions = {}) {
    this.opts = {
      hookTimeoutMs: opts.hookTimeoutMs ?? DEFAULT_HOOK_TIMEOUT_MS,
      actionTimeoutMs: opts.actionTimeoutMs ?? DEFAULT_ACTION_TIMEOUT_MS,
      memoryMb: opts.memoryMb ?? DEFAULT_MEMORY_MB,
    };
  }

  async evalExpression(
    body: ExpressionBody,
    ctx: ScriptContext,
    opts: ScriptRunOptions,
  ): Promise<ScriptResult> {
    return this.execute({
      isExpression: true,
      source: body.source,
      capabilities: [],
      timeoutMs: this.resolveTimeout(opts, undefined),
      memoryMb: this.opts.memoryMb,
      ctx,
      origin: opts.origin,
    });
  }

  async runScript(
    body: ScriptBody,
    ctx: ScriptContext,
    opts: ScriptRunOptions,
  ): Promise<ScriptResult> {
    return this.execute({
      isExpression: false,
      source: body.source,
      capabilities: body.capabilities,
      timeoutMs: this.resolveTimeout(opts, body.timeoutMs),
      memoryMb: body.memoryMb ?? this.opts.memoryMb,
      ctx,
      origin: opts.origin,
    });
  }

  run(body: HookBody, ctx: ScriptContext, opts: ScriptRunOptions): Promise<ScriptResult> {
    return body.language === 'expression'
      ? this.evalExpression(body, ctx, opts)
      : this.runScript(body, ctx, opts);
  }

  async dispose(): Promise<void> {
    /* no-op — runtimes are per-invocation in v1 */
  }

  /** Pick the smallest of body / opts / engine-default. */
  private resolveTimeout(opts: ScriptRunOptions, bodyTimeoutMs: number | undefined): number {
    const def = opts.origin.kind === 'hook' ? this.opts.hookTimeoutMs : this.opts.actionTimeoutMs;
    return Math.min(...[def, opts.timeoutMs, bodyTimeoutMs].filter((n): n is number => typeof n === 'number'));
  }

  private async execute(args: {
    isExpression: boolean;
    source: string;
    capabilities: HookBodyCapability[];
    timeoutMs: number;
    memoryMb: number;
    ctx: ScriptContext;
    origin: ScriptOrigin;
  }): Promise<ScriptResult> {
    // Each invocation gets its own WebAssembly module via newAsyncContext().
    // This is the canonical "per-invocation isolate" model and avoids the
    // shared-runtime HostRef double-free issues we hit with a singleton
    // QuickJSAsyncWASMModule when contexts are disposed concurrently.
    const vm = await newAsyncContext();
    const runtime = vm.runtime;
    runtime.setMemoryLimit(args.memoryMb * 1024 * 1024);
    runtime.setMaxStackSize(512 * 1024);

    const start = Date.now();
    const deadline = start + args.timeoutMs;
    runtime.setInterruptHandler(() => Date.now() > deadline);

    try {
      this.installCtx(vm, args.ctx, new Set(args.capabilities), args.origin);

      // L1 expressions are pure-sync: evaluate and read __result.
      if (args.isExpression) {
        const wrapped = `globalThis.__result = JSON.stringify((function(){ return (${args.source}); })());`;
        const result = vm.evalCode(wrapped);
        if (result.error) {
          const err = vm.dump(result.error);
          result.error.dispose();
          throw new SandboxError(`${args.origin.kind} '${args.origin.name}' threw: ${formatErr(err)}`);
        }
        result.value.dispose();
        const resH = vm.getProp(vm.global, '__result');
        const resStr = vm.dump(resH);
        resH.dispose();
        const value = resStr === undefined || resStr === null || resStr === 'null'
          ? undefined
          : safeJsonParse(resStr);
        return { value, durationMs: Date.now() - start };
      }

      // L2 scripts: wrap as async IIFE and use side-channel + asyncified pump.
      // Each pump iteration:
      //   1. yield to the host event loop (lets asyncified host calls resolve)
      //   2. drain QuickJS pending jobs (advances the .then chain)
      //   3. read __result/__error from the VM
      const wrapped = args.origin.kind === 'hook'
        ? `globalThis.__result = undefined; globalThis.__error = undefined;
            (async (ctx) => { ${args.source} })(globalThis.__ctx).then(
              function(v){ globalThis.__result = JSON.stringify(v === undefined ? null : v); },
              function(e){ globalThis.__error = (e && e.message) ? (e.name + ': ' + e.message) : String(e); }
            );`
        : `globalThis.__result = undefined; globalThis.__error = undefined;
            (async (input, ctx) => { ${args.source} })(globalThis.__input, globalThis.__ctx).then(
              function(v){ globalThis.__result = JSON.stringify(v === undefined ? null : v); },
              function(e){ globalThis.__error = (e && e.message) ? (e.name + ': ' + e.message) : String(e); }
            );`;

      const evalRes = await vm.evalCodeAsync(wrapped);
      if (evalRes.error) {
        const err = vm.dump(evalRes.error);
        evalRes.error.dispose();
        throw new SandboxError(`${args.origin.kind} '${args.origin.name}' threw: ${formatErr(err)}`);
      }
      evalRes.value.dispose();

      let pumps = 0;
      while (pumps < 1000) {
        // Yield to host event loop so any in-flight asyncified host promises resolve.
        await new Promise<void>((resolve) => setImmediate(resolve));

        const pending = runtime.executePendingJobs();
        if (pending.error) {
          const err = vm.dump(pending.error);
          pending.error.dispose();
          throw new SandboxError(`${args.origin.kind} '${args.origin.name}' threw: ${formatErr(err)}`);
        }

        const errH = vm.getProp(vm.global, '__error');
        const errStr = vm.dump(errH);
        errH.dispose();
        if (errStr) {
          throw new SandboxError(`${args.origin.kind} '${args.origin.name}' threw: ${errStr}`);
        }

        const resH = vm.getProp(vm.global, '__result');
        const resStr = vm.dump(resH);
        resH.dispose();
        if (resStr !== undefined && resStr !== null) {
          const value = resStr === 'null' ? undefined : safeJsonParse(resStr);
          // Capture mutated ctx.input so the host can write through.
          const mutatedInput = readCtxInputJson(vm);
          return { value, mutatedInput, durationMs: Date.now() - start };
        }

        if (Date.now() > deadline) {
          throw new SandboxError(
            `${args.origin.kind} '${args.origin.name}' exceeded timeout of ${args.timeoutMs}ms`,
          );
        }
        pumps++;
      }
      throw new SandboxError(
        `${args.origin.kind} '${args.origin.name}' did not resolve after ${pumps} pump iterations`,
      );
    } finally {
      // newAsyncContext() owns its WASM module; disposing the context disposes
      // the runtime + module together.
      vm.dispose();
    }
  }

  /**
   * Install ctx onto the VM's globalThis. Each capability is wired in only if
   * the body declared it; missing methods throw at call-time inside the VM
   * with a clear diagnostic.
   *
   * Host API methods are installed via {@link QuickJSAsyncContext.newAsyncifiedFunction}
   * so they may return Promises (real ObjectQL `find/count/insert/...` are async).
   */
  private installCtx(
    vm: QuickJSAsyncContext,
    ctx: ScriptContext,
    caps: Set<HookBodyCapability>,
    origin: ScriptOrigin,
  ): void {
    setGlobalJson(vm, '__input', ctx.input);
    setGlobalJson(vm, '__previous', ctx.previous);

    const ctxObj = vm.newObject();
    setObjectJson(vm, ctxObj, 'input', ctx.input);
    setObjectJson(vm, ctxObj, 'previous', ctx.previous);
    setObjectJson(vm, ctxObj, 'user', ctx.user);
    setObjectJson(vm, ctxObj, 'session', ctx.session);
    if (typeof ctx.event === 'string') {
      const evH = vm.newString(ctx.event);
      vm.setProp(ctxObj, 'event', evH);
      evH.dispose();
    }
    if (typeof ctx.object === 'string') {
      const obH = vm.newString(ctx.object);
      vm.setProp(ctxObj, 'object', obH);
      obH.dispose();
    }
    if (typeof ctx.recordId === 'string') {
      const idH = vm.newString(ctx.recordId);
      vm.setProp(ctxObj, 'recordId', idH);
      idH.dispose();
    }
    if (ctx.record !== undefined) {
      setObjectJson(vm, ctxObj, 'record', ctx.record);
    }
    if (ctx.result !== undefined) {
      setObjectJson(vm, ctxObj, 'result', ctx.result);
    }

    const apiObj = vm.newObject();
    const objectFn = vm.newFunction('object', (nameH) => {
      const objectName = vm.getString(nameH);
      const wrap = vm.newObject();
      const READ = ['find', 'findOne', 'count', 'aggregate'] as const;
      const WRITE = ['insert', 'update', 'delete', 'updateMany', 'deleteMany', 'upsert'] as const;
      for (const m of READ) installApiMethod(vm, wrap, m, objectName, ctx, caps, 'api.read', origin);
      for (const m of WRITE) installApiMethod(vm, wrap, m, objectName, ctx, caps, 'api.write', origin);
      return wrap;
    });
    vm.setProp(apiObj, 'object', objectFn);
    objectFn.dispose();
    vm.setProp(ctxObj, 'api', apiObj);
    apiObj.dispose();

    const logObj = vm.newObject();
    for (const level of ['info', 'warn', 'error'] as const) {
      const fn = vm.newFunction(level, (msgH, dataH) => {
        if (!caps.has('log')) {
          throw new SandboxError(`capability 'log' not granted to ${origin.kind} '${origin.name}'`);
        }
        const msg = vm.getString(msgH);
        const data = dataH ? safeJsonParse(vm.getString(dataH)) : undefined;
        ctx.log?.[level]?.(msg, data);
        return vm.undefined;
      });
      vm.setProp(logObj, level, fn);
      fn.dispose();
    }
    vm.setProp(ctxObj, 'log', logObj);
    logObj.dispose();

    const cryptoObj = vm.newObject();
    const uuidFn = vm.newFunction('randomUUID', () => {
      if (!caps.has('crypto.uuid')) {
        throw new SandboxError(`capability 'crypto.uuid' not granted to ${origin.kind} '${origin.name}'`);
      }
      const v = ctx.crypto?.randomUUID?.() ?? cryptoRandomUUID();
      return vm.newString(v);
    });
    vm.setProp(cryptoObj, 'randomUUID', uuidFn);
    uuidFn.dispose();
    vm.setProp(ctxObj, 'crypto', cryptoObj);
    cryptoObj.dispose();

    vm.setProp(vm.global, '__ctx', ctxObj);
    ctxObj.dispose();
  }
}

/**
 * Asyncified host-bound API method.
 *
 * Awaits Promise return values from the host implementation and marshals the
 * resolved value back into the VM. Capability check happens at call time and
 * surfaces inside the VM as a thrown error with a clear diagnostic.
 */
function installApiMethod(
  vm: QuickJSAsyncContext,
  parent: QuickJSHandle,
  method: string,
  objectName: string,
  ctx: ScriptContext,
  caps: Set<HookBodyCapability>,
  required: HookBodyCapability,
  origin: ScriptOrigin,
): void {
  const fn = vm.newAsyncifiedFunction(method, async (...argHandles) => {
    if (!caps.has(required)) {
      throw new SandboxError(
        `capability '${required}' not granted to ${origin.kind} '${origin.name}' (called ctx.api.object('${objectName}').${method})`,
      );
    }
    const apiAny = ctx.api as Record<string, unknown> | undefined;
    if (!apiAny || typeof apiAny.object !== 'function') {
      throw new SandboxError(`ctx.api unavailable in ${origin.kind} '${origin.name}'`);
    }
    const args = argHandles.map((h) => vm.dump(h));
    const proxy = (apiAny.object as (n: string) => Record<string, unknown>)(objectName);
    const m = proxy[method] as ((...a: unknown[]) => unknown) | undefined;
    if (typeof m !== 'function') {
      throw new SandboxError(`ctx.api.object('${objectName}').${method} not implemented`);
    }
    const ret = await Promise.resolve(m.apply(proxy, args));
    return jsonToHandle(vm, ret);
  });
  vm.setProp(parent, method, fn);
  fn.dispose();
}

/** Marshal a host JSON-serializable value into a QuickJS handle. */
function jsonToHandle(vm: QuickJSAsyncContext, v: unknown): QuickJSHandle {
  const json = JSON.stringify(v ?? null);
  const r = vm.evalCode(`(${json})`);
  if (r.error) {
    const msg = vm.dump(r.error);
    r.error.dispose();
    throw new SandboxError(`failed to marshal host value: ${formatErr(msg)}`);
  }
  return r.value;
}

function setGlobalJson(vm: QuickJSAsyncContext, name: string, v: unknown): void {
  const json = JSON.stringify(v ?? null);
  const result = vm.evalCode(`(${json})`);
  if (result.error) {
    result.error.dispose();
    return;
  }
  vm.setProp(vm.global, name, result.value);
  result.value.dispose();
}

function setObjectJson(vm: QuickJSAsyncContext, parent: QuickJSHandle, key: string, v: unknown): void {
  const json = JSON.stringify(v ?? null);
  const result = vm.evalCode(`(${json})`);
  if (result.error) {
    result.error.dispose();
    vm.setProp(parent, key, vm.null);
    return;
  }
  vm.setProp(parent, key, result.value);
  result.value.dispose();
}

/**
 * After the script has settled, dump `globalThis.__ctx.input` so the host can
 * write through any direct property mutations the script performed (e.g.
 * `ctx.input.account_number = 'ABC'`).
 *
 * Returns `undefined` if the read fails for any reason — callers fall back to
 * the script's return value in that case.
 */
function readCtxInputJson(vm: QuickJSAsyncContext): Record<string, unknown> | undefined {
  try {
    const r = vm.evalCode(`JSON.stringify(globalThis.__ctx && globalThis.__ctx.input || null)`);
    if (r.error) {
      r.error.dispose();
      return undefined;
    }
    const s = vm.dump(r.value);
    r.value.dispose();
    if (typeof s !== 'string' || s === 'null') return undefined;
    const parsed = safeJsonParse(s);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

function safeJsonParse(s: string | undefined): unknown {
  if (s === undefined || s === '') return undefined;
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

function cryptoRandomUUID(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  // RFC 4122 v4 fallback
  const r = () => Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, '0');
  return `${r()}-${r().slice(0, 4)}-4${r().slice(0, 3)}-${r().slice(0, 4)}-${r()}${r().slice(0, 4)}`;
}

function formatErr(err: unknown): string {
  if (err && typeof err === 'object') {
    const o = err as { message?: string; name?: string; stack?: string };
    if (o.message) return `${o.name ?? 'Error'}: ${o.message}`;
    return JSON.stringify(err);
  }
  return String(err);
}

export class SandboxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SandboxError';
  }
}

// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Walk a normalized stack definition and replace every inline `function`
 * value (Hook handlers, top-level `functions` map / array entries) with a
 * stable string reference. The collected `(ref → function)` map is later
 * bundled by esbuild into `dist/objectstack-runtime.{hash}.mjs`, while the
 * lowered, JSON-safe stack ships as `dist/objectstack.json`.
 *
 * Without this lowering step, `JSON.stringify` silently drops the function
 * fields and the production server boots with **all declarative hooks
 * disabled** — see plan §1.
 */

export interface LoweringResult {
  /** A deep-cloned, JSON-safe copy of the stack with handlers replaced by strings. */
  lowered: Record<string, unknown>;
  /** name → original handler function. Empty when nothing needed lowering. */
  functions: Record<string, (...args: unknown[]) => unknown>;
  /** Number of inline function handlers replaced. */
  count: number;
}

type AnyFn = (...args: unknown[]) => unknown;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Generate a unique reference name. Hook handlers reuse the hook name
 * verbatim (callers should ensure hook names are unique anyway).
 * Anonymous registrations (e.g. `functions: { foo: fn }`) use the map key.
 * Collisions get a numeric suffix.
 */
function uniqueName(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}__${i}`)) i++;
  return `${base}__${i}`;
}

export function lowerCallables(input: Record<string, unknown>): LoweringResult {
  const functions: Record<string, AnyFn> = {};
  const taken = new Set<string>();

  // Shallow clone the top level — we only mutate the slots we touch.
  const lowered: Record<string, unknown> = { ...input };

  // 1. Lower `bundle.hooks[*].handler`
  if (Array.isArray(lowered.hooks)) {
    lowered.hooks = (lowered.hooks as unknown[]).map((raw) => {
      if (!isPlainObject(raw)) return raw;
      const hook = { ...raw };
      if (typeof hook.handler === 'function') {
        const name = typeof hook.name === 'string' && hook.name.length > 0
          ? hook.name
          : 'anon_hook';
        const ref = uniqueName(name, taken);
        taken.add(ref);
        functions[ref] = hook.handler as AnyFn;
        hook.handler = ref;
      }
      return hook;
    });
  }

  // 2. Lower top-level `functions` (map or array of records).
  //    The runtime already merges this map into the engine's resolver, so
  //    we keep the same shape after lowering — just replace fn refs with
  //    serialisable handler-name strings + register the originals.
  const fnsField = (lowered as { functions?: unknown }).functions;
  if (Array.isArray(fnsField)) {
    const arr = fnsField.map((entry) => {
      if (!isPlainObject(entry)) return entry;
      const next = { ...entry };
      if (typeof next.handler === 'function') {
        const name = typeof next.name === 'string' && next.name.length > 0
          ? next.name
          : 'anon_fn';
        const ref = uniqueName(name, taken);
        taken.add(ref);
        functions[ref] = next.handler as AnyFn;
        next.name = ref;
        next.handler = ref;
      }
      return next;
    });
    (lowered as Record<string, unknown>).functions = arr;
  } else if (isPlainObject(fnsField)) {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(fnsField)) {
      if (typeof value === 'function') {
        const ref = uniqueName(key, taken);
        taken.add(ref);
        functions[ref] = value as AnyFn;
        out[ref] = ref;
      }
    }
    // Preserve any pre-existing string entries (legacy bundles).
    for (const [key, value] of Object.entries(fnsField)) {
      if (typeof value === 'string') out[key] = value;
    }
    (lowered as Record<string, unknown>).functions = out;
  }

  return { lowered, functions, count: Object.keys(functions).length };
}

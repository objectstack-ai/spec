import { z } from 'zod';

/**
 * Helper to create async function schema compatible with Zod v4.
 * 
 * In Zod v4, z.function with z.promise doesn't correctly infer async function types.
 * This helper wraps the function schema with z.custom to ensure proper TypeScript
 * type inference for async functions.
 * 
 * @example
 * ```ts
 * const asyncFn = createAsyncFunctionSchema(
 *   z.function({
 *     input: z.tuple([z.string()]),
 *     output: z.promise(z.number())
 *   })
 * );
 * // Type is inferred as: (arg: string) => Promise<number>
 * ```
 * 
 * @see https://github.com/colinhacks/zod/issues/4143
 */
export const createAsyncFunctionSchema = <T extends z.ZodFunction<any, any>>(_schema: T) =>
  z.custom<Parameters<T['implementAsync']>[0]>((fn) => typeof fn === 'function');

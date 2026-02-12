// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { suggestFieldType, formatSuggestion, findClosestMatches } from './suggestions.zod';
import { FieldType } from '../data/field.zod';

/**
 * Zod v4 raw issue type used by the error map.
 */
export type ObjectStackRawIssue = z.core.$ZodRawIssue;

/**
 * ObjectStack Custom Zod Error Map
 *
 * Provides contextual, actionable error messages for ObjectStack schema validation.
 * Instead of generic Zod messages like "Invalid option", this error map returns
 * messages that explain the ObjectStack context and suggest fixes.
 *
 * In Zod v4, the error map is a function `(issue) => { message: string } | string | null`.
 * Pass it via the `error` option on `.safeParse()` / `.parse()`.
 *
 * @example
 * ```ts
 * import { objectStackErrorMap } from '@objectstack/spec';
 *
 * // Per-parse usage
 * SomeSchema.safeParse(data, { error: objectStackErrorMap });
 * ```
 */
export const objectStackErrorMap = (issue: ObjectStackRawIssue): { message: string } | null => {
  // --- Invalid value (enum) with suggestions ---
  if (issue.code === 'invalid_value') {
    const values = issue.values as unknown[];
    const input = issue.input;
    const received = String(input ?? '');
    const options = values.map(String);

    // Check if this looks like a FieldType enum
    const fieldTypeOptions = FieldType.options as readonly string[];
    const isFieldTypeEnum = options.length > 10 &&
      fieldTypeOptions.every((ft) => options.includes(ft));

    if (isFieldTypeEnum) {
      const suggestions = suggestFieldType(received);
      const suggestion = formatSuggestion(suggestions);
      const base = `Invalid field type '${received}'.`;
      return {
        message: suggestion ? `${base} ${suggestion}` : `${base} Valid types: ${options.slice(0, 10).join(', ')}...`,
      };
    }

    // Generic enum suggestion
    const suggestions = findClosestMatches(received, options);
    const suggestion = formatSuggestion(suggestions);
    const base = `Invalid value '${received}'.`;
    return {
      message: suggestion
        ? `${base} ${suggestion}`
        : `${base} Expected one of: ${options.join(', ')}.`,
    };
  }

  // --- String/array/number size validation ---
  if (issue.code === 'too_small') {
    const origin = issue.origin as string;
    const minimum = issue.minimum as number;
    if (origin === 'string') {
      return {
        message: `Must be at least ${minimum} character${minimum === 1 ? '' : 's'} long.`,
      };
    }
  }

  if (issue.code === 'too_big') {
    const origin = issue.origin as string;
    const maximum = issue.maximum as number;
    if (origin === 'string') {
      return {
        message: `Must be at most ${maximum} character${maximum === 1 ? '' : 's'} long.`,
      };
    }
  }

  // --- String format validation (regex) ---
  if (issue.code === 'invalid_format') {
    const format = issue.format as string;
    const input = issue.input as string | undefined;
    if (format === 'regex' && input) {
      const pathArr = issue.path as (string | number)[] | undefined;
      const pathStr = pathArr?.join('.') ?? '';
      if (pathStr.endsWith('name') || pathStr === 'name') {
        return {
          message: `Invalid identifier '${input}'. Must be lowercase snake_case (e.g., 'my_object', 'task_name'). No uppercase, spaces, or hyphens allowed.`,
        };
      }
    }
  }

  // --- Missing required / type mismatch ---
  if (issue.code === 'invalid_type') {
    const expected = issue.expected as string;
    const input = issue.input;
    if (input === undefined) {
      const pathArr = issue.path as (string | number)[] | undefined;
      const field = pathArr?.[pathArr.length - 1] ?? '';
      return {
        message: `Required property '${field}' is missing.`,
      };
    }
    const receivedType = input === null ? 'null' : typeof input;
    return {
      message: `Expected ${expected} but received ${receivedType}.`,
    };
  }

  // --- Unrecognized keys ---
  if (issue.code === 'unrecognized_keys') {
    const keys = issue.keys as string[];
    const keyStr = keys.join(', ');
    return {
      message: `Unrecognized key${keys.length > 1 ? 's' : ''}: ${keyStr}. Check for typos in property names.`,
    };
  }

  // Fallback to Zod default
  return null;
};

/**
 * Zod Issue interface (subset needed for formatting).
 */
interface ZodIssueMinimal {
  path: PropertyKey[];
  message: string;
  code?: string;
}

/**
 * Format a single Zod issue into a human-readable line.
 *
 * @param issue - A single Zod issue
 * @returns Formatted string with path and message
 */
export function formatZodIssue(issue: ZodIssueMinimal): string {
  const path = issue.path.length > 0
    ? issue.path.join('.')
    : '(root)';
  return `  ✗ ${path}: ${issue.message}`;
}

/**
 * Pretty-print Zod validation errors for CLI output.
 *
 * Formats a ZodError into a readable block suitable for terminal display.
 * Groups errors by path depth and includes a summary count.
 *
 * @param error - A ZodError to format
 * @param label - Optional label for the error block (e.g., 'Stack validation failed')
 * @returns Formatted multi-line string
 *
 * @example
 * ```ts
 * import { formatZodError, ObjectStackDefinitionSchema } from '@objectstack/spec';
 *
 * const result = ObjectStackDefinitionSchema.safeParse(data);
 * if (!result.success) {
 *   console.error(formatZodError(result.error, 'Stack validation failed'));
 * }
 * ```
 *
 * Output:
 * ```
 * Stack validation failed (3 issues):
 *
 *   ✗ manifest.name: Required property 'name' is missing.
 *   ✗ objects[0].fields.status.type: Invalid field type 'dropdown'. Did you mean 'select'?
 *   ✗ views[0].object: Invalid identifier 'MyTasks'. Must be lowercase snake_case.
 * ```
 */
export function formatZodError(error: z.ZodError, label?: string): string {
  const count = error.issues.length;
  const header = label
    ? `${label} (${count} issue${count === 1 ? '' : 's'}):`
    : `Validation failed (${count} issue${count === 1 ? '' : 's'}):`;

  const lines = error.issues.map(formatZodIssue);

  return `${header}\n\n${lines.join('\n')}`;
}

/**
 * Parse with the ObjectStack error map and return formatted errors.
 *
 * A convenience function that combines parsing with the custom error map
 * and pretty-print formatting. Returns a discriminated union result.
 *
 * @param schema - Any Zod schema to parse with
 * @param data - Data to validate
 * @param label - Optional label for error formatting
 * @returns Object with `success`, `data`, and optional `formatted` error string
 *
 * @example
 * ```ts
 * const result = safeParsePretty(ObjectStackDefinitionSchema, config, 'objectstack.config.ts');
 * if (!result.success) {
 *   console.error(result.formatted);
 *   process.exit(1);
 * }
 * ```
 */
export function safeParsePretty<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  label?: string,
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError; formatted: string } {
  const result = schema.safeParse(data, { error: objectStackErrorMap });
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error,
    formatted: formatZodError(result.error, label),
  };
}

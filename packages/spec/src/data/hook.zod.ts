import { z } from 'zod';

/**
 * Hook Lifecycle Events
 * Defines the interception points in the ObjectQL execution pipeline.
 */
export const HookEvent = z.enum([
  // Read Operations
  'beforeFind', 'afterFind',
  'beforeFindOne', 'afterFindOne',
  'beforeCount', 'afterCount',
  'beforeAggregate', 'afterAggregate',

  // Write Operations
  'beforeInsert', 'afterInsert',
  'beforeUpdate', 'afterUpdate',
  'beforeDelete', 'afterDelete',
]);

/**
 * Hook Definition Schema
 * 
 * Hooks serve as the "Logic Layer" in ObjectStack, allowing developers to 
 * inject custom code during the data access lifecycle.
 * 
 * Use cases:
 * - Data Enrichment (Default values, Calculated fields)
 * - Validation (Complex business rules)
 * - Side Effects (Sending emails, Syncing to external systems)
 * - Security (Filtering data based on context)
 */
export const HookSchema = z.object({
  /**
   * Unique identifier for the hook
   * Required for debugging and overriding.
   */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Hook unique name (snake_case)'),

  /**
   * Human readable label
   */
  label: z.string().optional().describe('Description of what this hook does'),

  /**
   * Target Object(s)
   * can be:
   * - Single object: "account"
   * - List of objects: ["account", "contact"]
   * - Wildcard: "*" (All objects)
   */
  object: z.union([z.string(), z.array(z.string())]).describe('Target object(s)'),

  /**
   * Events to subscribe to
   * Combinations of timing (before/after) and action (find/insert/update/delete/etc)
   */
  events: z.array(HookEvent).describe('Lifecycle events'),

  /**
   * Handler Logic
   * Reference to a registered function in the plugin system.
   */
  handler: z.string().optional().describe('Function handler name (e.g. "my_plugin.validate_account")'),

  /**
   * Inline Script (Optional)
   * For simple logic without a full plugin.
   * @deprecated Prefer 'handler' for better testability and type safety.
   */
  script: z.string().optional().describe('Inline script body'),

  /**
   * Execution Order
   * Lower numbers run first.
   * - System Hooks: 0-99
   * - App Hooks: 100-999
   * - User Hooks: 1000+
   */
  priority: z.number().default(100).describe('Execution priority'),

  /**
   * Async / Background Execution
   * If true, the hook runs in the background and does not block the transaction.
   * Only applicable for 'after*' events.
   * Default: false (Blocking)
   */
  async: z.boolean().default(false).describe('Run specifically as fire-and-forget'),

  /**
   * Error Policy
   * What to do if the hook throws an exception?
   * - abort: Rollback transaction (if blocking)
   * - log: Log error and continue
   */
  onError: z.enum(['abort', 'log']).default('abort').describe('Error handling strategy'),
});

export type Hook = z.infer<typeof HookSchema>;
export type HookEventType = z.infer<typeof HookEvent>;

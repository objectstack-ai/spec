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
  
  // Bulk Operations (Query-based)
  'beforeUpdateMany', 'afterUpdateMany',
  'beforeDeleteMany', 'afterDeleteMany',
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
   * Reference to a registered function in the plugin system OR a direct function (runtime only).
   */
  handler: z.union([z.string(), z.any()]).optional().describe('Function handler name or direct function'),

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

/**
 * Hook Runtime Context
 * Defines what is available to the hook handler during execution.
 * 
 * Best Practices:
 * - **Immutability**: `object`, `event`, `id` are immutable.
 * - **Mutability**: `input` and `result` are mutable to allow transformation.
 * - **Encapsulation**: `session` isolates auth info; `transaction` ensures atomicity.
 */
export const HookContextSchema = z.object({
  /** Tracing ID */
  id: z.string().optional().describe('Unique execution ID for tracing'),

  /** Target Object Name */
  object: z.string(),
  
  /** Current Lifecycle Event */
  event: HookEvent,

  /** 
   * Input Parameters (Mutable)
   * Modify this to change the behavior of the operation.
   * 
   * - find: { query: QueryAST, options: DriverOptions }
   * - insert: { doc: Record, options: DriverOptions }
   * - update: { id: ID, doc: Record, options: DriverOptions }
   * - delete: { id: ID, options: DriverOptions }
   * - updateMany: { query: QueryAST, doc: Record, options: DriverOptions }
   * - deleteMany: { query: QueryAST, options: DriverOptions }
   */
  input: z.record(z.any()).describe('Mutable input parameters'),

  /** 
   * Operation Result (Mutable)
   * Available in 'after*' events. Modify this to transform the output.
   */
  result: z.any().optional().describe('Operation result (After hooks only)'),

  /**
   * Data Snapshot
   * The state of the record BEFORE the operation (for update/delete).
   */
  previous: z.record(z.any()).optional().describe('Record state before operation'),

  /**
   * Execution Session
   * Contains authentication and tenancy information.
   */
  session: z.object({
    userId: z.string().optional(),
    tenantId: z.string().optional(),
    roles: z.array(z.string()).optional(),
    accessToken: z.string().optional(),
  }).optional().describe('Current session context'),
  
  /**
   * Transaction Handle
   * If the operation is part of a transaction, use this handle for side-effects.
   */
  transaction: z.any().optional().describe('Database transaction handle'),

  /**
   * Engine Access
   * Reference to the ObjectQL engine for performing side effects.
   */
  ql: z.any().describe('ObjectQL Engine Reference'),
});

export type Hook = z.input<typeof HookSchema>;
export type ResolvedHook = z.output<typeof HookSchema>;
export type HookEventType = z.infer<typeof HookEvent>;
export type HookContext = z.infer<typeof HookContextSchema>;

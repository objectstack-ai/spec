import { z } from 'zod';

/**
 * Trigger Action Enum
 * 
 * Defines the database operation that triggered the execution.
 */
export const TriggerAction = z.enum(['insert', 'update', 'delete']);

/**
 * Trigger Timing Enum
 * 
 * Defines when the trigger executes relative to the database operation.
 */
export const TriggerTiming = z.enum(['before', 'after']);

/**
 * Trigger Context Schema
 * 
 * This defines the runtime context available to trigger code during execution.
 * Standardizes how trigger code is written and enables AI code generation.
 * 
 * Triggers are business logic hooks that execute before or after database operations.
 * They can validate data, set defaults, update related records, or prevent operations.
 * 
 * @example Before Insert Trigger
 * export default {
 *   timing: 'before',
 *   action: 'insert',
 *   execute: async (context: TriggerContext) => {
 *     // Set default values
 *     if (!context.doc.status) {
 *       context.doc.status = 'active';
 *     }
 *     
 *     // Validation
 *     if (!context.doc.email) {
 *       context.addError('Email is required');
 *     }
 *   }
 * };
 * 
 * @example After Update Trigger
 * export default {
 *   timing: 'after',
 *   action: 'update',
 *   execute: async (context: TriggerContext) => {
 *     // Update related records
 *     if (context.getOldValue('status') !== context.doc.status) {
 *       await context.ql.object('activity_log').create({
 *         record_id: context.doc.id,
 *         message: `Status changed from ${context.getOldValue('status')} to ${context.doc.status}`,
 *         user_id: context.userId,
 *       });
 *     }
 *   }
 * };
 */
export const TriggerContextSchema = z.object({
  /**
   * The database operation that triggered execution.
   * One of: 'insert', 'update', 'delete'
   */
  action: TriggerAction.describe('Database operation type'),

  /**
   * When the trigger executes relative to the operation.
   * - 'before': Execute before database operation (can modify doc, prevent operation)
   * - 'after': Execute after database operation (can trigger side effects)
   */
  timing: TriggerTiming.describe('Trigger execution timing'),

  /**
   * The current document/record being operated on.
   * 
   * For 'before' triggers: Can be modified to change what gets saved.
   * For 'after' triggers: Contains the final saved state (read-only).
   * For 'delete' triggers: Contains the record being deleted.
   */
  doc: z.record(z.any()).describe('Current document/record'),

  /**
   * The document state before the current operation.
   * 
   * Only available for 'update' and 'delete' operations.
   * Null for 'insert' operations.
   * 
   * Use this to detect what changed in an update trigger.
   */
  previousDoc: z.record(z.any()).optional().describe('Previous document state'),

  /**
   * ID of the user performing the operation.
   */
  userId: z.string().describe('Current user ID'),

  /**
   * Complete user record of the user performing the operation.
   * Contains fields like name, email, roles, etc.
   */
  user: z.record(z.any()).describe('Current user record'),

  /**
   * ObjectQL data access API.
   * Use this to query or modify other records.
   * 
   * @example
   * await context.ql.object('account').findOne(context.doc.account_id);
   * await context.ql.object('activity').create({ ... });
   */
  ql: z.any().describe('ObjectQL data access API'),

  /**
   * Logging interface.
   * Use this for debugging and auditing.
   * 
   * @example
   * context.logger.info('Trigger executed', { recordId: context.doc.id });
   * context.logger.error('Validation failed', { error });
   */
  logger: z.any().describe('Logging interface'),

  /**
   * Add a validation error.
   * For 'before' triggers only - prevents the operation from completing.
   * 
   * @param message - Error message to display
   * @param field - Optional field name the error relates to
   * 
   * @example
   * if (context.doc.amount < 0) {
   *   context.addError('Amount must be positive', 'amount');
   * }
   */
  addError: z.function()
    .args(z.string(), z.string().optional())
    .returns(z.void())
    .describe('Add validation error'),

  /**
   * Get the old value of a field.
   * Helper function for 'update' triggers to easily compare old vs new values.
   * 
   * @param fieldName - Name of the field
   * @returns Previous value of the field, or undefined if not available
   * 
   * @example
   * if (context.getOldValue('status') !== context.doc.status) {
   *   // Status changed
   * }
   */
  getOldValue: z.function()
    .args(z.string())
    .returns(z.any())
    .describe('Get previous field value'),
});

/**
 * Trigger Definition Schema
 * 
 * Complete definition of a trigger including metadata and execution function.
 */
export const TriggerSchema = z.object({
  /**
   * Unique trigger name.
   */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Trigger name (snake_case)'),

  /**
   * Object this trigger is attached to.
   */
  object: z.string().describe('Target object name'),

  /**
   * Trigger timing.
   */
  timing: TriggerTiming.describe('Execution timing'),

  /**
   * Trigger action(s).
   * Can be a single action or array of actions.
   */
  action: z.union([
    TriggerAction,
    z.array(TriggerAction),
  ]).describe('Database operation(s) to trigger on'),

  /**
   * Trigger execution function.
   * Receives TriggerContext and performs the business logic.
   */
  execute: z.function()
    .args(TriggerContextSchema)
    .returns(z.promise(z.void()))
    .describe('Trigger execution function'),

  /**
   * Optional description of what the trigger does.
   */
  description: z.string().optional().describe('Trigger description'),

  /**
   * Whether the trigger is active.
   */
  active: z.boolean().default(true).describe('Is trigger active'),

  /**
   * Execution order when multiple triggers are defined.
   * Lower numbers execute first.
   */
  order: z.number().default(0).describe('Execution order'),
});

/**
 * TypeScript types
 */
export type TriggerAction = z.infer<typeof TriggerAction>;
export type TriggerTiming = z.infer<typeof TriggerTiming>;
export type TriggerContext = z.infer<typeof TriggerContextSchema>;
export type Trigger = z.infer<typeof TriggerSchema>;

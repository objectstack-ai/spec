import { z } from 'zod';

/**
 * Base Validation Rule
 */
const BaseValidationSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Unique rule name'),
  active: z.boolean().default(true),
  severity: z.enum(['error', 'warning', 'info']).default('error'),
  message: z.string().describe('Error message to display'),
});

/**
 * 1. Script/Expression Validation
 * Generic formula-based validation.
 */
export const ScriptValidationSchema = BaseValidationSchema.extend({
  type: z.literal('script'),
  condition: z.string().describe('Formula expression. If TRUE, validation fails. (e.g. amount < 0)'),
});

/**
 * 2. Uniqueness Validation
 * specialized optimized check for unique constraints.
 */
export const UniquenessValidationSchema = BaseValidationSchema.extend({
  type: z.literal('unique'),
  fields: z.array(z.string()).describe('Fields that must be combined unique'),
  scope: z.string().optional().describe('Formula condition for scope (e.g. active = true)'),
  caseSensitive: z.boolean().default(true),
});

/**
 * 3. State Machine Validation
 * State transition logic.
 */
export const StateMachineValidationSchema = BaseValidationSchema.extend({
  type: z.literal('state_machine'),
  field: z.string().describe('State field (e.g. status)'),
  transitions: z.record(z.array(z.string())).describe('Map of { OldState: [AllowedNewStates] }'),
});

/**
 * 4. Value Format Validation
 * Regex or specialized formats.
 */
export const FormatValidationSchema = BaseValidationSchema.extend({
  type: z.literal('format'),
  field: z.string(),
  regex: z.string().optional(),
  format: z.enum(['email', 'url', 'phone', 'json']).optional(),
});

/**
 * Master Validation Rule Schema
 */
export const ValidationRuleSchema = z.discriminatedUnion('type', [
  ScriptValidationSchema,
  UniquenessValidationSchema,
  StateMachineValidationSchema,
  FormatValidationSchema
]);

export type ValidationRule = z.infer<typeof ValidationRuleSchema>;
export type ScriptValidation = z.infer<typeof ScriptValidationSchema>;
export type UniquenessValidation = z.infer<typeof UniquenessValidationSchema>;
export type StateMachineValidation = z.infer<typeof StateMachineValidationSchema>;

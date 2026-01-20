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
 * 5. Cross-Field Validation
 * Validates relationships between multiple fields.
 */
export const CrossFieldValidationSchema = BaseValidationSchema.extend({
  type: z.literal('cross_field'),
  condition: z.string().describe('Formula expression comparing fields (e.g. "end_date > start_date")'),
  fields: z.array(z.string()).describe('Fields involved in the validation'),
});

/**
 * 6. Async Validation
 * Remote validation via API call or database query.
 */
export const AsyncValidationSchema = BaseValidationSchema.extend({
  type: z.literal('async'),
  field: z.string().describe('Field to validate'),
  validatorUrl: z.string().optional().describe('External API endpoint for validation'),
  validatorFunction: z.string().optional().describe('Reference to custom validator function'),
  timeout: z.number().optional().default(5000).describe('Timeout in milliseconds'),
  debounce: z.number().optional().describe('Debounce delay in milliseconds'),
  params: z.record(z.any()).optional().describe('Additional parameters to pass to validator'),
});

/**
 * 7. Custom Validator Function
 * User-defined validation logic with code reference.
 */
export const CustomValidatorSchema = BaseValidationSchema.extend({
  type: z.literal('custom'),
  field: z.string().optional().describe('Field to validate (optional for record-level validation)'),
  validatorFunction: z.string().describe('Function name or reference to custom validator'),
  params: z.record(z.any()).optional().describe('Additional parameters for the validator'),
});

/**
 * Master Validation Rule Schema (forward declared for circular reference)
 */
export const ValidationRuleSchema: z.ZodType<any> = z.lazy(() =>
  z.discriminatedUnion('type', [
    ScriptValidationSchema,
    UniquenessValidationSchema,
    StateMachineValidationSchema,
    FormatValidationSchema,
    CrossFieldValidationSchema,
    AsyncValidationSchema,
    CustomValidatorSchema,
    ConditionalValidationSchema,
  ])
);

/**
 * 8. Conditional Validation
 * Validation that only applies when a condition is met.
 */
export const ConditionalValidationSchema = BaseValidationSchema.extend({
  type: z.literal('conditional'),
  when: z.string().describe('Condition formula (e.g. "type = \'enterprise\'")'),
  then: ValidationRuleSchema.describe('Validation rule to apply when condition is true'),
  otherwise: ValidationRuleSchema.optional().describe('Validation rule to apply when condition is false'),
});

export type ValidationRule = z.infer<typeof ValidationRuleSchema>;
export type ScriptValidation = z.infer<typeof ScriptValidationSchema>;
export type UniquenessValidation = z.infer<typeof UniquenessValidationSchema>;
export type StateMachineValidation = z.infer<typeof StateMachineValidationSchema>;
export type FormatValidation = z.infer<typeof FormatValidationSchema>;
export type CrossFieldValidation = z.infer<typeof CrossFieldValidationSchema>;
export type AsyncValidation = z.infer<typeof AsyncValidationSchema>;
export type CustomValidation = z.infer<typeof CustomValidatorSchema>;
export type ConditionalValidation = z.infer<typeof ConditionalValidationSchema>;

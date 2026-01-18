import { z } from 'zod';

/**
 * Schema for Validation Rules.
 * Ensures data integrity by preventing saves when conditions aren't met.
 */
export const ValidationRuleSchema = z.object({
  /** Machine name of the rule */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Unique rule name'),
  
  /** 
   * The condition that triggers the error.
   * If this evaluates to TRUE, the validation FAILS and the error is shown.
   * Example: "amount < 0" (Prevents negative amounts)
   */
  error_condition: z.string().describe('Formula expression. If TRUE, validation fails.'),
  
  /** The error message displayed to the user */
  error_message: z.string().describe('Error message to display to the user'),
  
  /** Active status of the rule */
  active: z.boolean().default(true).describe('Whether this rule is active'),
});

export type ValidationRule = z.infer<typeof ValidationRuleSchema>;

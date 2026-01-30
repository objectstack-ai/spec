import { z } from 'zod';

/**
 * Data masking protocol for PII protection
 */
export const MaskingStrategySchema = z.enum([
  'redact',       // Complete redaction: ****
  'partial',      // Partial masking: 138****5678
  'hash',         // Hash value: sha256(value)
  'tokenize',     // Tokenization: token-12345
  'randomize',    // Randomize: generate random value
  'nullify',      // Null value: null
  'substitute',   // Substitute with dummy data
]);

export type MaskingStrategy = z.infer<typeof MaskingStrategySchema>;

export const MaskingRuleSchema = z.object({
  field: z.string(),
  strategy: MaskingStrategySchema,
  pattern: z.string().optional().describe('Regex pattern for partial masking'),
  preserveFormat: z.boolean().default(true),
  preserveLength: z.boolean().default(true),
  roles: z.array(z.string()).optional().describe('Roles that see masked data'),
  exemptRoles: z.array(z.string()).optional().describe('Roles that see unmasked data'),
});

export type MaskingRule = z.infer<typeof MaskingRuleSchema>;

export const MaskingConfigSchema = z.object({
  enabled: z.boolean().default(false),
  rules: z.array(MaskingRuleSchema),
  auditUnmasking: z.boolean().default(true),
});

export type MaskingConfig = z.infer<typeof MaskingConfigSchema>;

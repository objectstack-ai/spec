import { z } from 'zod';

/**
 * Metric Type Classification
 */
export const MetricType = z.enum([
  'boolean',   // Feature Flag (Enabled/Disabled)
  'counter',   // Usage Count (e.g. API Calls, Records Created) - Accumulates
  'gauge',     // Current Level (e.g. Storage Used, Users Active) - Point in time
]);

/**
 * Feature/Limit Definition Schema
 * Defines a controllable capability of the system.
 */
export const FeatureSchema = z.object({
  code: z.string().regex(/^[a-z_][a-z0-9_.]*$/).describe('Feature code (e.g. core.api_access)'),
  label: z.string(),
  description: z.string().optional(),
  
  type: MetricType.default('boolean'),
  
  /** For counters/gauges */
  unit: z.enum(['count', 'bytes', 'seconds', 'percent']).optional(),
  
  /** Dependencies (e.g. 'audit_log' requires 'enterprise_tier') */
  requires: z.array(z.string()).optional(),
});

/**
 * Subscription Plan Schema
 * Defines a tier of service (e.g. "Free", "Pro", "Enterprise").
 */
export const PlanSchema = z.object({
  code: z.string().describe('Plan code (e.g. pro_v1)'),
  label: z.string(),
  active: z.boolean().default(true),
  
  /** Feature Entitlements */
  features: z.array(z.string()).describe('List of enabled boolean features'),
  
  /** Limit Quotas */
  limits: z.record(z.string(), z.number()).describe('Map of metric codes to limit values (e.g. { storage_gb: 10 })'),
  
  /** Pricing (Optional Metadata) */
  currency: z.string().default('USD').optional(),
  priceMonthly: z.number().optional(),
  priceYearly: z.number().optional(),
});

/**
 * License Schema
 * The actual entitlement object assigned to a Space.
 * Often signed as a JWT.
 */
export const LicenseSchema = z.object({
  /** Identity */
  spaceId: z.string().describe('Target Space ID'),
  planCode: z.string(),
  
  /** Validity */
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(), // Null = Perpetual
  
  /** Status */
  status: z.enum(['active', 'expired', 'suspended', 'trial']),
  
  /** Overrides (Specific to this space, exceeding the plan) */
  customFeatures: z.array(z.string()).optional(),
  customLimits: z.record(z.string(), z.number()).optional(),
  
  /** Authorized Add-ons */
  plugins: z.array(z.string()).optional().describe('List of enabled plugin package IDs'),

  /** Signature */
  signature: z.string().optional().describe('Cryptographic signature of the license'),
});

export type Feature = z.infer<typeof FeatureSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type License = z.infer<typeof LicenseSchema>;

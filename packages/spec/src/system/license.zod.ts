// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';

/**
 * Metric Type Classification
 */
export const LicenseMetricType = z.enum([
  'boolean',   // Feature Flag (Enabled/Disabled)
  'counter',   // Usage Count (e.g. API Calls, Records Created) - Accumulates
  'gauge',     // Current Level (e.g. Storage Used, Users Active) - Point in time
]).describe('License metric type');
export type LicenseMetricType = z.infer<typeof LicenseMetricType>;

/**
 * Feature/Limit Definition Schema
 * Defines a controllable capability of the system.
 */
export const FeatureSchema = z.object({
  code: z.string().regex(/^[a-z_][a-z0-9_.]*$/).describe('Feature code (e.g. core.api_access)'),
  label: z.string().describe('Human-readable feature name'),
  description: z.string().optional().describe('Description of the feature'),
  
  type: LicenseMetricType.default('boolean').describe('Type of metric (boolean flag, counter, or gauge)'),
  
  /** For counters/gauges */
  unit: z.enum(['count', 'bytes', 'seconds', 'percent']).optional().describe('Unit of measurement for counter/gauge metrics'),
  
  /** Dependencies (e.g. 'audit_log' requires 'enterprise_tier') */
  requires: z.array(z.string()).optional().describe('List of prerequisite feature codes'),
});

/**
 * Subscription Plan Schema
 * Defines a tier of service (e.g. "Free", "Pro", "Enterprise").
 */
export const PlanSchema = z.object({
  code: z.string().describe('Plan code (e.g. pro_v1)'),
  label: z.string().describe('Human-readable plan name'),
  active: z.boolean().default(true).describe('Whether this plan is currently available for purchase'),
  
  /** Feature Entitlements */
  features: z.array(z.string()).describe('List of enabled boolean features'),
  
  /** Limit Quotas */
  limits: z.record(z.string(), z.number()).describe('Map of metric codes to limit values (e.g. { storage_gb: 10 })'),
  
  /** Pricing (Optional Metadata) */
  currency: z.string().default('USD').optional().describe('Currency code for pricing'),
  priceMonthly: z.number().optional().describe('Monthly subscription price'),
  priceYearly: z.number().optional().describe('Yearly subscription price'),
});

/**
 * License Schema
 * The actual entitlement object assigned to a Space.
 * Often signed as a JWT.
 */
export const LicenseSchema = z.object({
  /** Identity */
  spaceId: z.string().describe('Target Space ID'),
  planCode: z.string().describe('Reference to the subscription plan'),
  
  /** Validity */
  issuedAt: z.string().datetime().describe('License issue date (ISO 8601)'),
  expiresAt: z.string().datetime().optional().describe('License expiration date (null = perpetual)'),
  
  /** Status */
  status: z.enum(['active', 'expired', 'suspended', 'trial']).describe('Current license status'),
  
  /** Overrides (Specific to this space, exceeding the plan) */
  customFeatures: z.array(z.string()).optional().describe('Additional features enabled beyond the plan'),
  customLimits: z.record(z.string(), z.number()).optional().describe('Custom limit overrides for specific metrics'),
  
  /** Authorized Add-ons */
  plugins: z.array(z.string()).optional().describe('List of enabled plugin package IDs'),

  /** Signature */
  signature: z.string().optional().describe('Cryptographic signature of the license (JWT)'),
});

export type Feature = z.infer<typeof FeatureSchema>;
export type FeatureInput = z.input<typeof FeatureSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type PlanInput = z.input<typeof PlanSchema>;
export type License = z.infer<typeof LicenseSchema>;

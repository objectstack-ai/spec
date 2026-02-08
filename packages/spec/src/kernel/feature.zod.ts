import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';

/**
 * Feature Rollout Strategy
 */
export const FeatureStrategy = z.enum([
  'boolean',        // Simple On/Off
  'percentage',     // Gradual rollout (0-100%)
  'user_list',      // Specific users
  'group',          // Specific groups/roles
  'custom'          // Custom constraint/script
]).describe('Strategy for feature flag rollout and targeting');

/**
 * Feature Flag Protocol
 * 
 * Manages feature toggles and gradual rollouts.
 * Used for CI/CD, A/B Testing, and Trunk-Based Development.
 */
export const FeatureFlagSchema = z.object({
  name: SnakeCaseIdentifierSchema.describe('Feature key (snake_case)'),
  label: z.string().optional().describe('Display label'),
  description: z.string().optional().describe('Description of the feature and its purpose'),
  
  /** Default state */
  enabled: z.boolean().default(false).describe('Is globally enabled'),
  
  /** Rollout Strategy */
  strategy: FeatureStrategy.default('boolean').describe('Strategy for feature rollout'),
  
  /** Strategy Configuration */
  conditions: z.object({
    percentage: z.number().min(0).max(100).optional().describe('Percentage of users to enable (0-100)'),
    users: z.array(z.string()).optional().describe('Specific user IDs to enable'),
    groups: z.array(z.string()).optional().describe('Specific groups/roles to enable'),
    expression: z.string().optional().describe('Custom formula expression for complex targeting')
  }).optional().describe('Strategy-specific configuration parameters'),
  
  /** Integration */
  environment: z.enum(['dev', 'staging', 'prod', 'all']).default('all')
    .describe('Environment where this flag is valid'),
    
  /** Expiration */
  expiresAt: z.string().datetime().optional().describe('Feature flag expiration date (auto-disable after)'),
});

export const FeatureFlag = Object.assign(FeatureFlagSchema, {
  create: <T extends z.input<typeof FeatureFlagSchema>>(config: T) => config,
});

export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
export type FeatureFlagInput = z.input<typeof FeatureFlagSchema>;

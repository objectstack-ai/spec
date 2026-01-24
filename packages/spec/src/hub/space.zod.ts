import { z } from 'zod';
import { BillOfMaterialsSchema } from './composer.zod';
import { TenantIsolationLevel, TenantQuotaSchema } from './tenant.zod';

/**
 * # Space Protocol
 * 
 * Defines the SaaS-side representation of a Space (formerly Project).
 * A Space is a logical container for business apps, data, and logic.
 * Corresponds to an entry in the Hub's database.
 */

/**
 * Subscription Status Enum
 */
export const SubscriptionStatus = z.enum([
  'active',
  'past_due',
  'canceled',
  'trialing',
  'incomplete'
]);

/**
 * Space Subscription Info
 */
export const SpaceSubscriptionSchema = z.object({
  planId: z.string().describe('Reference to Plan Code'),
  status: SubscriptionStatus,
  currentPeriodEnd: z.string().datetime().optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  
  /**
   * Purchased Add-ons from Marketplace
   */
  addons: z.array(z.object({
    pluginId: z.string().describe('Marketplace Plugin ID (NPM package name)'),
    quantity: z.number().default(1),
    status: SubscriptionStatus.default('active'),
  })).optional(),

  /**
   * Quota Usage Snapshot
   * Cached usage metrics for quick display/validation.
   */
  usage: z.record(z.number()).optional(),
});

/**
 * Deployment Target
 * Vercel or Container configuration.
 */
export const DeploymentTargetSchema = z.object({
  provider: z.enum(['vercel', 'docker', 'kubernetes']),
  region: z.string().optional(),
  url: z.string().url().optional().describe('Public Access URL'),
  env: z.record(z.string()).optional().describe('Runtime Environment Variables'),
});

/**
 * Hub Space Schema
 */
export const HubSpaceSchema = z.object({
  id: z.string().uuid(),
  
  /**
   * Display Name
   */
  name: z.string(),
  slug: z.string().describe('URL friendly identifier'),
  
  /**
   * Owner (User or Org ID in Hub)
   */
  ownerId: z.string(),

  /**
   * The Runtime Instance Definition
   * Defines the technical execution environment.
   */
  runtime: z.object({
    isolation: TenantIsolationLevel.describe('Data isolation strategy'),
    quotas: TenantQuotaSchema.optional().describe('Resource quotas'),
  }).optional().describe('Runtime instance configuration'),
  
  /**
   * The Desired State (Bill of Materials)
   * This is what the user configures in the UI.
   */
  bom: BillOfMaterialsSchema,
  
  /**
   * The Current Actual State (Last Successful Build)
   */
  lastBuild: z.object({
    id: z.string(),
    timestamp: z.string().datetime(),
    manifestUrl: z.string().url().optional(),
    status: z.enum(['pending', 'success', 'failed']),
  }).optional(),
  
  /**
   * Commercial / Billing Info
   */
  subscription: SpaceSubscriptionSchema.optional(),
  
  /**
   * Infrastructure Settings
   */
  deployment: DeploymentTargetSchema.optional(),
  
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;
export type SpaceSubscription = z.infer<typeof SpaceSubscriptionSchema>;
export type DeploymentTarget = z.infer<typeof DeploymentTargetSchema>;
export type HubSpace = z.infer<typeof HubSpaceSchema>;

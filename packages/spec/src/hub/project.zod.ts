import { z } from 'zod';
import { BillOfMaterialsSchema } from './composer.zod';
import { TenantSchema } from './tenant.zod';

/**
 * # Project Protocol
 * 
 * Defines the SaaS-side representation of a Tenant/Project.
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
 * Project Subscription Info
 */
export const ProjectSubscriptionSchema = z.object({
  planId: z.string().describe('Reference to Plan Code'),
  status: SubscriptionStatus,
  currentPeriodEnd: z.string().datetime().optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  
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
 * Hub Project Schema
 */
export const HubProjectSchema = z.object({
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
   * The Runtime Tenant Definition
   * Defines the isolation level, quotas, and identity.
   * This is the technical configuration that corresponding to this Project.
   */
  tenant: TenantSchema.describe('Runtime tenant configuration'),
  
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
  subscription: ProjectSubscriptionSchema.optional(),
  
  /**
   * Infrastructure Settings
   */
  deployment: DeploymentTargetSchema.optional(),
  
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;
export type ProjectSubscription = z.infer<typeof ProjectSubscriptionSchema>;
export type DeploymentTarget = z.infer<typeof DeploymentTargetSchema>;
export type HubProject = z.infer<typeof HubProjectSchema>;

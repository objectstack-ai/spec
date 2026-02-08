import { z } from 'zod';

/**
 * Password Complexity Policy
 */
export const PasswordPolicySchema = z.object({
  minLength: z.number().default(8).describe('Minimum password length'),
  requireUppercase: z.boolean().default(true).describe('Require at least one uppercase letter'),
  requireLowercase: z.boolean().default(true).describe('Require at least one lowercase letter'),
  requireNumbers: z.boolean().default(true).describe('Require at least one numeric digit'),
  requireSymbols: z.boolean().default(false).describe('Require at least one special symbol'),
  expirationDays: z.number().optional().describe('Force password change every X days'),
  historyCount: z.number().default(3).describe('Prevent reusing last X passwords'),
});

/**
 * Network Access Policy (IP Whitelisting)
 */
export const NetworkPolicySchema = z.object({
  trustedRanges: z.array(z.string()).describe('CIDR ranges allowed to access (e.g. 10.0.0.0/8)'),
  blockUnknown: z.boolean().default(false).describe('Block all IPs not in trusted ranges'),
  vpnRequired: z.boolean().default(false).describe('Require VPN connection for access'),
});

/**
 * Session Policy
 */
export const SessionPolicySchema = z.object({
  idleTimeout: z.number().default(30).describe('Minutes before idle session logout'),
  absoluteTimeout: z.number().default(480).describe('Max session duration (minutes)'),
  forceMfa: z.boolean().default(false).describe('Require 2FA for all users'),
});

/**
 * Audit Retention Policy
 */
export const AuditPolicySchema = z.object({
  logRetentionDays: z.number().default(180).describe('Number of days to retain audit logs'),
  sensitiveFields: z.array(z.string()).describe('Fields to redact in logs (e.g. password, ssn)'),
  captureRead: z.boolean().default(false).describe('Log read access events (generates high volume!)'),
});

/**
 * Security Policy Schema
 * "The Cloud Compliance Contract"
 */
export const PolicySchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Policy Name (snake_case)'),
  
  password: PasswordPolicySchema.optional().describe('Password complexity and rotation rules'),
  network: NetworkPolicySchema.optional().describe('IP whitelisting and network access rules'),
  session: SessionPolicySchema.optional().describe('Session timeout and MFA requirements'),
  audit: AuditPolicySchema.optional().describe('Audit log retention and capture settings'),

  /** Assignment */
  isDefault: z.boolean().default(false).describe('Apply to all users by default'),
  assignedProfiles: z.array(z.string()).optional().describe('Apply to specific user profiles'),
});

export type Policy = z.infer<typeof PolicySchema>;

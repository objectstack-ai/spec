import { z } from 'zod';

/**
 * Role Schema (aka Business Unit / Org Unit)
 * Defines the organizational hierarchy (Reporting Structure).
 * 
 * COMPARISON:
 * - Salesforce: "Role" (Hierarchy for visibility rollup)
 * - Microsoft: "Business Unit" (Structural container for data)
 * - Kubernetes/AWS: "Role" usually refers to Permissions (we use PermissionSet for that)
 * 
 * ROLES IN OBJECTSTACK:
 * Used primarily for "Reporting Structure" - Managers see subordinates' data.
 */
export const RoleSchema = z.object({
  /** Identity */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Unique role name'),
  label: z.string().describe('Display label (e.g. VP of Sales)'),
  
  /** Hierarchy */
  parent: z.string().optional().describe('Parent Role ID (Reports To)'),
  
  /** Description */
  description: z.string().optional(),
});

export type Role = z.infer<typeof RoleSchema>;

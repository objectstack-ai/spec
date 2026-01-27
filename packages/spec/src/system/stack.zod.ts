import { z } from 'zod';

import { ManifestSchema } from './manifest.zod';

// Data Protocol
import { ObjectSchema } from '../data/object.zod';
import { FieldSchema } from '../data/field.zod';

// UI Protocol
import { AppSchema } from '../ui/app.zod';
import { ViewSchema } from '../ui/view.zod';
import { PageSchema } from '../ui/page.zod';
import { DashboardSchema } from '../ui/dashboard.zod';

// Automation Protocol
import { ApprovalProcessSchema } from '../automation/approval.zod';
import { WorkflowSchema } from '../automation/workflow.zod';

// Security Protocol (Future expansion)
// import { RoleSchema } from '../auth/role.zod';

/**
 * ObjectStack Ecosystem Definition
 * 
 * This schema represents the "Full Stack" definition of a project or environment.
 * It is used for:
 * 1. Project Export/Import (YAML/JSON dumps)
 * 2. IDE Validation (IntelliSense)
 * 3. Runtime Bootstrapping (In-memory loading)
 */
export const ObjectStackSchema = z.object({
  /** System Configuration */
  manifest: ManifestSchema.describe('Project Package Configuration'),

  /** 
   * ObjectQL: Data Layer 
   * All business objects and entities.
   */
  objects: z.array(ObjectSchema).optional().describe('Business Objects definition'),

  /** 
   * ObjectUI: User Interface Layer 
   * Apps, Menus, Pages, and Visualizations.
   */
  apps: z.array(AppSchema).optional().describe('Applications'),
  views: z.array(ViewSchema).optional().describe('List Views'),
  pages: z.array(PageSchema).optional().describe('Custom Pages'),
  dashboards: z.array(DashboardSchema).optional().describe('Dashboards'),

  /** 
   * ObjectFlow: Automation Layer 
   * Business logic, approvals, and workflows.
   */
  workflows: z.array(WorkflowSchema).optional().describe('Event-driven workflows'),
  approvals: z.array(ApprovalProcessSchema).optional().describe('Approval processes'),

  /**
   * ObjectGuard: Security Layer
   */
  // roles: z.array(RoleSchema).optional(),
});

export type ObjectStack = z.infer<typeof ObjectStackSchema>;

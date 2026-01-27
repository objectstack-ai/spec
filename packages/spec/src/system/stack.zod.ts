import { z } from 'zod';

import { ManifestSchema } from './manifest.zod';
import { DatasourceSchema } from './datasource.zod';
import { TranslationBundleSchema } from './translation.zod';

// Data Protocol
import { ObjectSchema } from '../data/object.zod';

// UI Protocol
import { AppSchema } from '../ui/app.zod';
import { ViewSchema } from '../ui/view.zod';
import { PageSchema } from '../ui/page.zod';
import { DashboardSchema } from '../ui/dashboard.zod';
import { ReportSchema } from '../ui/report.zod';
import { ActionSchema } from '../ui/action.zod';
import { ThemeSchema } from '../ui/theme.zod';

// Automation Protocol
import { ApprovalProcessSchema } from '../automation/approval.zod';
import { WorkflowSchema } from '../automation/workflow.zod';
import { FlowSchema } from '../automation/flow.zod';

// Security Protocol
import { RoleSchema } from '../auth/role.zod';
import { PermissionSetSchema } from '../permission/permission.zod';

// AI Protocol
import { AgentSchema } from '../ai/agent.zod';

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
  datasources: z.array(DatasourceSchema).optional().describe('External Data Connections'),
  translations: z.array(TranslationBundleSchema).optional().describe('I18n Translation Bundles'),

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
  reports: z.array(ReportSchema).optional().describe('Analytics Reports'),
  actions: z.array(ActionSchema).optional().describe('Global and Object Actions'),
  themes: z.array(ThemeSchema).optional().describe('UI Themes'),

  /** 
   * ObjectFlow: Automation Layer 
   * Business logic, approvals, and workflows.
   */
  workflows: z.array(WorkflowSchema).optional().describe('Event-driven workflows'),
  approvals: z.array(ApprovalProcessSchema).optional().describe('Approval processes'),
  flows: z.array(FlowSchema).optional().describe('Screen Flows'),

  /**
   * ObjectGuard: Security Layer
   */
  roles: z.array(RoleSchema).optional().describe('User Roles hierarchy'),
  permissions: z.array(PermissionSetSchema).optional().describe('Permission Sets and Profiles'),

  /**
   * ObjectAI: Artificial Intelligence Layer
   */
  agents: z.array(AgentSchema).optional().describe('AI Agents and Assistants'),
});

export type ObjectStack = z.infer<typeof ObjectStackSchema>;

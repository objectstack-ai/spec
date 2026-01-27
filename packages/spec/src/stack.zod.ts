import { z } from 'zod';

import { ManifestSchema } from './system/manifest.zod';
import { DatasourceSchema } from './system/datasource.zod';
import { TranslationBundleSchema } from './system/translation.zod';

// Data Protocol
import { ObjectSchema } from './data/object.zod';

// UI Protocol
import { AppSchema } from './ui/app.zod';
import { ViewSchema } from './ui/view.zod';
import { PageSchema } from './ui/page.zod';
import { DashboardSchema } from './ui/dashboard.zod';
import { ReportSchema } from './ui/report.zod';
import { ActionSchema } from './ui/action.zod';
import { ThemeSchema } from './ui/theme.zod';

// Automation Protocol
import { ApprovalProcessSchema } from './automation/approval.zod';
import { WorkflowRuleSchema } from './automation/workflow.zod';
import { FlowSchema } from './automation/flow.zod';

// Security Protocol
import { RoleSchema } from './auth/role.zod';
import { PermissionSetSchema } from './permission/permission.zod';

import { ApiEndpointSchema } from './api/endpoint.zod';
import { ApiCapabilitiesSchema } from './api/discovery.zod';
import { FeatureFlagSchema } from './system/feature.zod';

// AI Protocol
import { AgentSchema } from './ai/agent.zod';

/**
 * ObjectStack Ecosystem Definition
 * 
 * This schema represents the "Full Stack" definition of a project or environment.
 * It is used for:
 * 1. Project Export/Import (YAML/JSON dumps)
 * 2. IDE Validation (IntelliSense)
 * 3. Runtime Bootstrapping (In-memory loading)
 * 4. Platform Reflection (API & Capabilities Discovery)
 */
/**
 * 1. DEFINITION PROTOCOL (Static)
 * ----------------------------------------------------------------------
 * Describes the "Blueprint" or "Source Code" of an ObjectStack Plugin/Project.
 * This represents the complete declarative state of the application.
 * 
 * Usage:
 * - Developers write this in files locally.
 * - AI Agents generate this to create apps.
 * - CI Tools deploy this to the server.
 */
export const ObjectStackDefinitionSchema = z.object({
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
  workflows: z.array(WorkflowRuleSchema).optional().describe('Event-driven workflows'),
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

export type ObjectStackDefinition = z.infer<typeof ObjectStackDefinitionSchema>;

// Alias for backward compatibility
export const ObjectStackSchema = ObjectStackDefinitionSchema;
export type ObjectStack = ObjectStackDefinition;

/**
 * Type-safe helper to define a project configuration.
 * Uses input type to allow optional fields with defaults.
 */
export const defineStack = (config: z.input<typeof ObjectStackDefinitionSchema>) => config;


/**
 * 2. RUNTIME CAPABILITIES PROTOCOL (Dynamic)
 * ----------------------------------------------------------------------
 * Describes what the ObjectOS Platform *is* and *can do*.
 * AI Agents read this to understand:
 * - What APIs are available?
 * - What features are enabled?
 * - What limits exist?
 */
export const ObjectStackCapabilitiesSchema = z.object({
  /** System Identity */
  version: z.string().describe('ObjectOS Kernel Version'),
  environment: z.enum(['development', 'test', 'staging', 'production']),
  
  /** Active Features & Flags */
  features: z.array(FeatureFlagSchema).optional().describe('Active Feature Flags'),
  
  /** API Surface & Discovery */
  apis: z.array(ApiEndpointSchema).optional().describe('Available System & Business APIs'),
  network: ApiCapabilitiesSchema.optional().describe('Network Capabilities (GraphQL, WS, etc.)'),

  /** Introspection */
  system_objects: z.array(z.string()).optional().describe('List of globally available System Objects'),
  supported_drivers: z.array(z.string()).optional().describe('Available database drivers'),
  
  /** Constraints (for AI Generation) */
  limits: z.object({
    maxObjects: z.number().optional(),
    maxFieldsPerObject: z.number().optional(),
    apiRateLimit: z.number().optional()
  }).optional()
});

export type ObjectStackCapabilities = z.infer<typeof ObjectStackCapabilitiesSchema>;

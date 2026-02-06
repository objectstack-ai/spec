import { z } from 'zod';

import { ManifestSchema } from './kernel/manifest.zod';
import { DatasourceSchema } from './data/datasource.zod';
import { TranslationBundleSchema } from './system/translation.zod';

// Data Protocol
import { ObjectSchema, ObjectExtensionSchema } from './data/object.zod';

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
import { RoleSchema } from './identity/role.zod';
import { PermissionSetSchema } from './security/permission.zod';

import { ApiEndpointSchema } from './api/endpoint.zod';
import { ApiCapabilitiesSchema } from './api/discovery.zod';
import { FeatureFlagSchema } from './kernel/feature.zod';

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
  objects: z.array(ObjectSchema).optional().describe('Business Objects definition (owned by this package)'),

  /**
   * Object Extensions: fields/config to merge into objects owned by other packages.
   * Use this instead of redefining an object when you want to add fields to
   * an existing object from another package.
   * 
   * @example
   * ```ts
   * objectExtensions: [{
   *   extend: 'contact',
   *   fields: { sales_stage: Field.select([...]) },
   * }]
   * ```
   */
  objectExtensions: z.array(ObjectExtensionSchema).optional().describe('Extensions to objects owned by other packages'),

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
   * ObjectAPI: API Layer
   */
  apis: z.array(ApiEndpointSchema).optional().describe('API Endpoints'),

  /**
   * ObjectAI: Artificial Intelligence Layer
   */
  agents: z.array(AgentSchema).optional().describe('AI Agents and Assistants'),

  /**
   * Plugins: External Capabilities
   * List of plugins to load. Can be a Manifest object, a package name string, or a Runtime Plugin instance.
   */
  plugins: z.array(z.any()).optional().describe('Plugins to load'),

  /**
   * DevPlugins: Development Capabilities
   * List of plugins to load ONLY in development environment.
   * Equivalent to `devDependencies` in package.json.
   * Useful for loading dev-tools, mock data generators, or referencing local sibling packages for debugging.
   */
  devPlugins: z.array(z.union([ManifestSchema, z.string()])).optional().describe('Plugins to load only in development (CLI dev command)'),
});

export type ObjectStackDefinition = z.infer<typeof ObjectStackDefinitionSchema>;

// Alias for backward compatibility
export const ObjectStackSchema = ObjectStackDefinitionSchema;
export type ObjectStack = ObjectStackDefinition;

/**
 * Type-safe helper to define a generic stack.
 * 
 * In ObjectStack, the concept of "Project" and "Plugin" is fluid:
 * - A **Project** is simply a Stack that is currently being executed (the `cwd`).
 * - A **Plugin** is a Stack that is being loaded by another Stack.
 * 
 * This unified definition allows any "Project" (e.g., Todo App) to be imported 
 * as a "Plugin" into a larger system (e.g., Company PaaS) without code changes.
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
 * 
 * The capabilities are organized by subsystem for clarity:
 * - ObjectQL: Data Layer capabilities
 * - ObjectUI: User Interface Layer capabilities  
 * - ObjectOS: System Layer capabilities
 */

/**
 * ObjectQL Capabilities Schema
 * 
 * Defines capabilities related to the Data Layer:
 * - Query operations and advanced SQL features
 * - Data validation and business logic
 * - Database driver support
 * - AI/ML data features
 */
export const ObjectQLCapabilitiesSchema = z.object({
  /** Query Capabilities */
  queryFilters: z.boolean().default(true).describe('Supports WHERE clause filtering'),
  queryAggregations: z.boolean().default(true).describe('Supports GROUP BY and aggregation functions'),
  querySorting: z.boolean().default(true).describe('Supports ORDER BY sorting'),
  queryPagination: z.boolean().default(true).describe('Supports LIMIT/OFFSET pagination'),
  queryWindowFunctions: z.boolean().default(false).describe('Supports window functions with OVER clause'),
  querySubqueries: z.boolean().default(false).describe('Supports subqueries'),
  queryDistinct: z.boolean().default(true).describe('Supports SELECT DISTINCT'),
  queryHaving: z.boolean().default(false).describe('Supports HAVING clause for aggregations'),
  queryJoins: z.boolean().default(false).describe('Supports SQL-style joins'),
  
  /** Advanced Data Features */
  fullTextSearch: z.boolean().default(false).describe('Supports full-text search'),
  vectorSearch: z.boolean().default(false).describe('Supports vector embeddings and similarity search for AI/RAG'),
  geoSpatial: z.boolean().default(false).describe('Supports geospatial queries and location fields'),
  
  /** Field Type Support */
  jsonFields: z.boolean().default(true).describe('Supports JSON field types'),
  arrayFields: z.boolean().default(false).describe('Supports array field types'),
  
  /** Data Validation & Logic */
  validationRules: z.boolean().default(true).describe('Supports validation rules'),
  workflows: z.boolean().default(true).describe('Supports workflow automation'),
  triggers: z.boolean().default(true).describe('Supports database triggers'),
  formulas: z.boolean().default(true).describe('Supports formula fields'),
  
  /** Transaction & Performance */
  transactions: z.boolean().default(true).describe('Supports database transactions'),
  bulkOperations: z.boolean().default(true).describe('Supports bulk create/update/delete'),
  
  /** Driver Support */
  supportedDrivers: z.array(z.string()).optional().describe('Available database drivers (e.g., postgresql, mongodb, excel)'),
});

/**
 * ObjectUI Capabilities Schema
 * 
 * Defines capabilities related to the UI Layer:
 * - View rendering (List, Form, Calendar, etc.)
 * - Dashboard and reporting
 * - Theming and customization
 * - UI actions and interactions
 */
export const ObjectUICapabilitiesSchema = z.object({
  /** View Types */
  listView: z.boolean().default(true).describe('Supports list/grid views'),
  formView: z.boolean().default(true).describe('Supports form views'),
  kanbanView: z.boolean().default(false).describe('Supports kanban board views'),
  calendarView: z.boolean().default(false).describe('Supports calendar views'),
  ganttView: z.boolean().default(false).describe('Supports Gantt chart views'),
  
  /** Analytics & Reporting */
  dashboards: z.boolean().default(true).describe('Supports dashboard creation'),
  reports: z.boolean().default(true).describe('Supports report generation'),
  charts: z.boolean().default(true).describe('Supports chart widgets'),
  
  /** Customization */
  customPages: z.boolean().default(true).describe('Supports custom page creation'),
  customThemes: z.boolean().default(false).describe('Supports custom theme creation'),
  customComponents: z.boolean().default(false).describe('Supports custom UI components/widgets'),
  
  /** Actions & Interactions */
  customActions: z.boolean().default(true).describe('Supports custom button actions'),
  screenFlows: z.boolean().default(false).describe('Supports interactive screen flows'),
  
  /** Responsive & Accessibility */
  mobileOptimized: z.boolean().default(false).describe('UI optimized for mobile devices'),
  accessibility: z.boolean().default(false).describe('WCAG accessibility support'),
});

/**
 * ObjectOS Capabilities Schema
 * 
 * Defines capabilities related to the System Layer:
 * - Runtime environment and platform features
 * - API and integration capabilities
 * - Security and multi-tenancy
 * - System services (events, jobs, audit)
 */
export const ObjectOSCapabilitiesSchema = z.object({
  /** System Identity */
  version: z.string().describe('ObjectOS Kernel Version'),
  environment: z.enum(['development', 'test', 'staging', 'production']),
  
  /** API Surface */
  restApi: z.boolean().default(true).describe('REST API available'),
  graphqlApi: z.boolean().default(false).describe('GraphQL API available'),
  odataApi: z.boolean().default(false).describe('OData API available'),
  
  /** Real-time & Events */
  websockets: z.boolean().default(false).describe('WebSocket support for real-time updates'),
  serverSentEvents: z.boolean().default(false).describe('Server-Sent Events support'),
  eventBus: z.boolean().default(false).describe('Internal event bus for pub/sub'),
  
  /** Integration */
  webhooks: z.boolean().default(true).describe('Outbound webhook support'),
  apiContracts: z.boolean().default(false).describe('API contract definitions'),
  
  /** Security & Access Control */
  authentication: z.boolean().default(true).describe('Authentication system'),
  rbac: z.boolean().default(true).describe('Role-Based Access Control'),
  fieldLevelSecurity: z.boolean().default(false).describe('Field-level permissions'),
  rowLevelSecurity: z.boolean().default(false).describe('Row-level security/sharing rules'),
  
  /** Multi-tenancy */
  multiTenant: z.boolean().default(false).describe('Multi-tenant architecture support'),
  
  /** Platform Services */
  backgroundJobs: z.boolean().default(false).describe('Background job scheduling'),
  auditLogging: z.boolean().default(false).describe('Audit trail logging'),
  fileStorage: z.boolean().default(true).describe('File upload and storage'),
  
  /** Internationalization */
  i18n: z.boolean().default(true).describe('Internationalization support'),
  
  /** Plugin System */
  pluginSystem: z.boolean().default(false).describe('Plugin/extension system'),
  
  /** Active Features & Flags */
  features: z.array(FeatureFlagSchema).optional().describe('Active Feature Flags'),
  
  /** Available APIs */
  apis: z.array(ApiEndpointSchema).optional().describe('Available System & Business APIs'),
  network: ApiCapabilitiesSchema.optional().describe('Network Capabilities (GraphQL, WS, etc.)'),

  /** Introspection */
  systemObjects: z.array(z.string()).optional().describe('List of globally available System Objects'),
  
  /** Constraints (for AI Generation) */
  limits: z.object({
    maxObjects: z.number().optional(),
    maxFieldsPerObject: z.number().optional(),
    maxRecordsPerQuery: z.number().optional(),
    apiRateLimit: z.number().optional(),
    fileUploadSizeLimit: z.number().optional().describe('Max file size in bytes'),
  }).optional()
});

/**
 * Unified ObjectStack Capabilities Schema
 * 
 * Complete capability descriptor for an ObjectStack instance.
 * Organized by architectural layer for clarity and maintainability.
 */
export const ObjectStackCapabilitiesSchema = z.object({
  /** Data Layer Capabilities (ObjectQL) */
  data: ObjectQLCapabilitiesSchema.describe('Data Layer capabilities'),
  
  /** User Interface Layer Capabilities (ObjectUI) */
  ui: ObjectUICapabilitiesSchema.describe('UI Layer capabilities'),
  
  /** System/Runtime Layer Capabilities (ObjectOS) */
  system: ObjectOSCapabilitiesSchema.describe('System/Runtime Layer capabilities'),
});

export type ObjectQLCapabilities = z.infer<typeof ObjectQLCapabilitiesSchema>;
export type ObjectUICapabilities = z.infer<typeof ObjectUICapabilitiesSchema>;
export type ObjectOSCapabilities = z.infer<typeof ObjectOSCapabilitiesSchema>;
export type ObjectStackCapabilities = z.infer<typeof ObjectStackCapabilitiesSchema>;




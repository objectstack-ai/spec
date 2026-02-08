import { z } from 'zod';
import {
  ConnectorSchema,
  FieldMappingSchema,
} from '../connector.zod';

/**
 * HRIS (Human Resource Information System) Connector Protocol
 * 
 * Specialized connector for HR and payroll integration enabling automated
 * employee lifecycle management, payroll processing, and organizational
 * structure synchronization.
 * 
 * Use Cases:
 * - Employee onboarding and offboarding automation
 * - Payroll processing and approval workflows
 * - Leave request management
 * - Organizational structure synchronization
 * - Benefits and compensation tracking
 * - PII-compliant data handling
 * 
 * @example
 * ```typescript
 * import { HrisConnector } from '@objectstack/spec/integration';
 * 
 * const bambooConnector: HrisConnector = {
 *   name: 'bamboohr_production',
 *   label: 'BambooHR Production',
 *   type: 'saas',
 *   provider: 'bamboohr',
 *   baseUrl: 'https://api.bamboohr.com/api/gateway.php',
 *   companyId: 'acme-corp',
 *   environment: 'production',
 *   authentication: {
 *     type: 'api-key',
 *     key: '${BAMBOOHR_API_KEY}',
 *     headerName: 'Authorization',
 *   },
 *   objectTypes: [
 *     {
 *       name: 'employees',
 *       label: 'Employees',
 *       apiName: 'employees',
 *       enabled: true,
 *       supportsCreate: true,
 *       supportsUpdate: true,
 *       supportsDelete: false,
 *     },
 *   ],
 * };
 * ```
 */

/**
 * HRIS Provider Types
 */
export const HrisProviderSchema = z.enum([
  'bamboohr',
  'workday',
  'adp',
  'gusto',
  'rippling',
  'custom',
]).describe('HRIS provider');

export type HrisProvider = z.infer<typeof HrisProviderSchema>;

/**
 * HRIS Environment
 */
export const HrisEnvironmentSchema = z.enum([
  'production',
  'sandbox',
]).describe('HRIS environment (production or sandbox)');

export type HrisEnvironment = z.infer<typeof HrisEnvironmentSchema>;

/**
 * HRIS Webhook Event Types
 */
export const HrisWebhookEventSchema = z.enum([
  'employee.created',
  'employee.updated',
  'employee.terminated',
  'leave.requested',
  'leave.approved',
  'leave.denied',
  'payroll.processed',
  'payroll.approved',
  'position.created',
  'position.filled',
]).describe('HRIS webhook event type');

export type HrisWebhookEvent = z.infer<typeof HrisWebhookEventSchema>;

/**
 * HRIS Object Type Schema
 * Represents a syncable entity in the HRIS system (e.g., Employee, Department, Payroll Run)
 */
export const HrisObjectTypeSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Object type name (snake_case)'),
  label: z.string().describe('Display label'),
  apiName: z.string().describe('API name in external system'),
  enabled: z.boolean().default(true).describe('Enable sync for this object'),
  supportsCreate: z.boolean().default(true).describe('Supports record creation'),
  supportsUpdate: z.boolean().default(true).describe('Supports record updates'),
  supportsDelete: z.boolean().default(true).describe('Supports record deletion'),
  fieldMappings: z.array(FieldMappingSchema).optional().describe('Object-specific field mappings'),
});

export type HrisObjectType = z.infer<typeof HrisObjectTypeSchema>;

/**
 * Employee Sync Configuration
 * Controls which employee data categories are synchronized
 */
export const EmployeeSyncConfigSchema = z.object({
  syncPersonalInfo: z.boolean().default(true).describe('Sync personal information (name, contact, etc.)'),
  syncEmploymentInfo: z.boolean().default(true).describe('Sync employment details (title, department, etc.)'),
  syncCompensation: z.boolean().default(false).describe('Sync compensation data'),
  syncBenefits: z.boolean().default(false).describe('Sync benefits enrollment data'),
  includeTerminated: z.boolean().default(false).describe('Include terminated employees in sync'),
  customFieldMappings: z.array(FieldMappingSchema).optional().describe('Custom field mappings for employee data'),
});

export type EmployeeSyncConfig = z.infer<typeof EmployeeSyncConfigSchema>;

/**
 * Payroll Integration Configuration
 * Controls payroll data sync and approval workflows
 */
export const PayrollConfigSchema = z.object({
  enabled: z.boolean().default(false).describe('Enable payroll integration'),
  syncFrequency: z.enum([
    'per_pay_period',
    'monthly',
    'on_demand',
  ]).default('per_pay_period').describe('Payroll sync frequency'),
  autoApprove: z.boolean().default(false).describe('Automatically approve payroll runs'),
  defaultPaySchedule: z.string().optional().describe('Default pay schedule identifier'),
});

export type PayrollConfig = z.infer<typeof PayrollConfigSchema>;

/**
 * Organization Structure Configuration
 * Controls how organizational hierarchy is synchronized
 */
export const OrgStructureConfigSchema = z.object({
  syncDepartments: z.boolean().default(true).describe('Sync department hierarchy'),
  syncLocations: z.boolean().default(true).describe('Sync office locations'),
  syncCostCenters: z.boolean().default(false).describe('Sync cost center assignments'),
  hierarchyDepth: z.number().int().min(1).optional().describe('Maximum hierarchy depth to sync'),
});

export type OrgStructureConfig = z.infer<typeof OrgStructureConfigSchema>;

/**
 * PII (Personally Identifiable Information) Protection Configuration
 * Controls how sensitive employee data is handled
 */
export const PiiProtectionConfigSchema = z.object({
  maskSsn: z.boolean().default(true).describe('Mask Social Security Numbers'),
  maskBankAccount: z.boolean().default(true).describe('Mask bank account numbers'),
  encryptionRequired: z.boolean().default(true).describe('Require encryption for PII fields'),
  dataRetentionDays: z.number().int().min(1).optional().describe('Data retention period in days'),
});

export type PiiProtectionConfig = z.infer<typeof PiiProtectionConfigSchema>;

/**
 * HRIS Connector Schema
 * Complete HRIS integration configuration
 */
export const HrisConnectorSchema = ConnectorSchema.extend({
  type: z.literal('saas'),

  /**
   * HRIS provider
   */
  provider: HrisProviderSchema.describe('HRIS provider'),

  /**
   * HRIS API base URL
   */
  baseUrl: z.string().url().describe('HRIS API base URL'),

  /**
   * Company identifier in the HRIS platform
   */
  companyId: z.string().describe('Company identifier in HRIS platform'),

  /**
   * HRIS environment
   */
  environment: HrisEnvironmentSchema.describe('HRIS environment'),

  /**
   * Syncable HRIS object types
   */
  objectTypes: z.array(HrisObjectTypeSchema).describe('Syncable HRIS object types'),

  /**
   * Webhook events to subscribe to
   */
  webhookEvents: z.array(HrisWebhookEventSchema).optional().describe('HRIS webhook events to subscribe to'),

  /**
   * Employee sync configuration
   */
  employeeSyncConfig: EmployeeSyncConfigSchema.optional().describe('Employee data sync configuration'),

  /**
   * Payroll integration configuration
   */
  payrollConfig: PayrollConfigSchema.optional().describe('Payroll integration configuration'),

  /**
   * Organization structure sync configuration
   */
  orgStructureConfig: OrgStructureConfigSchema.optional().describe('Organization structure sync configuration'),

  /**
   * PII protection configuration
   */
  piiProtectionConfig: PiiProtectionConfigSchema.optional().describe('PII protection configuration'),

  /**
   * OAuth-specific settings
   */
  oauthSettings: z.object({
    scopes: z.array(z.string()).describe('Required OAuth scopes'),
    refreshTokenUrl: z.string().url().optional().describe('Token refresh endpoint'),
    revokeTokenUrl: z.string().url().optional().describe('Token revocation endpoint'),
    autoRefresh: z.boolean().default(true).describe('Automatically refresh expired tokens'),
  }).optional().describe('OAuth-specific configuration'),
});

export type HrisConnector = z.infer<typeof HrisConnectorSchema>;

// ============================================================================
// Helper Functions & Examples
// ============================================================================

/**
 * Example: BambooHR Connector Configuration
 */
export const bamboohrConnectorExample = {
  name: 'bamboohr_production',
  label: 'BambooHR Production',
  type: 'saas',
  provider: 'bamboohr',
  baseUrl: 'https://api.bamboohr.com/api/gateway.php',
  companyId: 'acme-corp',
  environment: 'production',

  authentication: {
    type: 'api-key',
    key: '${BAMBOOHR_API_KEY}',
    headerName: 'Authorization',
  },

  objectTypes: [
    {
      name: 'employees',
      label: 'Employees',
      apiName: 'employees',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'departments',
      label: 'Departments',
      apiName: 'meta/lists',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'positions',
      label: 'Positions',
      apiName: 'meta/positions',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'leave_requests',
      label: 'Leave Requests',
      apiName: 'time_off/requests',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'time_entries',
      label: 'Time Entries',
      apiName: 'timetracking',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
  ],

  webhookEvents: [
    'employee.created',
    'employee.updated',
    'employee.terminated',
    'leave.requested',
    'leave.approved',
    'leave.denied',
  ],

  employeeSyncConfig: {
    syncPersonalInfo: true,
    syncEmploymentInfo: true,
    syncCompensation: false,
    syncBenefits: false,
    includeTerminated: false,
  },

  orgStructureConfig: {
    syncDepartments: true,
    syncLocations: true,
    syncCostCenters: false,
  },

  piiProtectionConfig: {
    maskSsn: true,
    maskBankAccount: true,
    encryptionRequired: true,
    dataRetentionDays: 365,
  },

  syncConfig: {
    strategy: 'incremental',
    direction: 'bidirectional',
    schedule: '0 */4 * * *',
    conflictResolution: 'source_wins',
    batchSize: 200,
  },

  rateLimitConfig: {
    strategy: 'token_bucket',
    maxRequests: 100,
    windowSeconds: 60,
    respectUpstreamLimits: true,
  },

  status: 'active',
  enabled: true,
};

/**
 * Example: Workday Connector Configuration
 */
export const workdayConnectorExample = {
  name: 'workday_enterprise',
  label: 'Workday Enterprise',
  type: 'saas',
  provider: 'workday',
  baseUrl: 'https://wd5-impl-services1.workday.com/ccx/api/v1',
  companyId: 'acme_tenant',
  environment: 'production',

  authentication: {
    type: 'oauth2',
    clientId: '${WORKDAY_CLIENT_ID}',
    clientSecret: '${WORKDAY_CLIENT_SECRET}',
    authorizationUrl: 'https://wd5-impl-services1.workday.com/authorize',
    tokenUrl: 'https://wd5-impl-services1.workday.com/token',
    grantType: 'authorization_code',
    scopes: ['r_worker', 'w_worker', 'r_organization', 'r_payroll'],
  },

  objectTypes: [
    {
      name: 'employees',
      label: 'Workers',
      apiName: 'workers',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'departments',
      label: 'Supervisory Organizations',
      apiName: 'supervisoryOrganizations',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'positions',
      label: 'Positions',
      apiName: 'positions',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'payroll_runs',
      label: 'Payroll Runs',
      apiName: 'payrollResults',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: false,
      supportsDelete: false,
    },
    {
      name: 'benefits',
      label: 'Benefit Elections',
      apiName: 'benefitElections',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'compensations',
      label: 'Compensation Plans',
      apiName: 'compensationPlans',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'leave_requests',
      label: 'Leave of Absence',
      apiName: 'leaveOfAbsence',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'time_entries',
      label: 'Time Entries',
      apiName: 'timeEntries',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
  ],

  webhookEvents: [
    'employee.created',
    'employee.updated',
    'employee.terminated',
    'leave.requested',
    'leave.approved',
    'leave.denied',
    'payroll.processed',
    'payroll.approved',
    'position.created',
    'position.filled',
  ],

  employeeSyncConfig: {
    syncPersonalInfo: true,
    syncEmploymentInfo: true,
    syncCompensation: true,
    syncBenefits: true,
    includeTerminated: true,
  },

  payrollConfig: {
    enabled: true,
    syncFrequency: 'per_pay_period',
    autoApprove: false,
    defaultPaySchedule: 'bi_weekly_us',
  },

  orgStructureConfig: {
    syncDepartments: true,
    syncLocations: true,
    syncCostCenters: true,
    hierarchyDepth: 5,
  },

  piiProtectionConfig: {
    maskSsn: true,
    maskBankAccount: true,
    encryptionRequired: true,
    dataRetentionDays: 730,
  },

  oauthSettings: {
    scopes: ['r_worker', 'w_worker', 'r_organization', 'r_payroll'],
    refreshTokenUrl: 'https://wd5-impl-services1.workday.com/token',
    autoRefresh: true,
  },

  syncConfig: {
    strategy: 'incremental',
    direction: 'bidirectional',
    schedule: '0 */2 * * *',
    realtimeSync: true,
    conflictResolution: 'source_wins',
    batchSize: 500,
    deleteMode: 'soft_delete',
  },

  rateLimitConfig: {
    strategy: 'token_bucket',
    maxRequests: 50,
    windowSeconds: 60,
    respectUpstreamLimits: true,
  },

  retryConfig: {
    strategy: 'exponential_backoff',
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    retryOnNetworkError: true,
    jitter: true,
  },

  status: 'active',
  enabled: true,
};

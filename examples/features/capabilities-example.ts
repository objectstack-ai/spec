/**
 * Example: ObjectStack Capabilities Configuration
 * 
 * This example demonstrates how to define runtime capabilities for an ObjectStack instance.
 * The capabilities are organized by subsystem: ObjectQL (Data), ObjectUI (UI), and ObjectOS (System).
 * 
 * This configuration is typically returned by the /api/discovery endpoint to inform
 * clients (frontends, AI agents, tools) about what features are available.
 */

import type {
  ObjectStackCapabilities,
  ObjectQLCapabilities,
  ObjectUICapabilities,
  ObjectOSCapabilities,
} from '@objectstack/spec';

/**
 * Example 1: Full-Featured Production Instance
 * 
 * This configuration represents a complete ObjectStack deployment with all features enabled.
 * Suitable for enterprise production environments.
 */
export const productionCapabilities: ObjectStackCapabilities = {
  // ============================================================================
  // ObjectQL: Data Layer Capabilities
  // ============================================================================
  data: {
    // Query Operations
    queryFilters: true,
    queryAggregations: true,
    querySorting: true,
    queryPagination: true,
    queryWindowFunctions: true,
    querySubqueries: true,
    queryDistinct: true,
    queryHaving: true,
    queryJoins: true,

    // Advanced Data Features
    fullTextSearch: true,
    vectorSearch: true, // AI/RAG support
    geoSpatial: true,

    // Field Type Support
    jsonFields: true,
    arrayFields: true,

    // Data Validation & Logic
    validationRules: true,
    workflows: true,
    triggers: true,
    formulas: true,

    // Transaction & Performance
    transactions: true,
    bulkOperations: true,

    // Driver Support
    supportedDrivers: ['postgresql', 'mongodb', 'mysql', 'sqlite'],
  },

  // ============================================================================
  // ObjectUI: User Interface Layer Capabilities
  // ============================================================================
  ui: {
    // View Types
    listView: true,
    formView: true,
    kanbanView: true,
    calendarView: true,
    ganttView: true,

    // Analytics & Reporting
    dashboards: true,
    reports: true,
    charts: true,

    // Customization
    customPages: true,
    customThemes: true,
    customComponents: true,

    // Actions & Interactions
    customActions: true,
    screenFlows: true,

    // Responsive & Accessibility
    mobileOptimized: true,
    accessibility: true,
  },

  // ============================================================================
  // ObjectOS: System Layer Capabilities
  // ============================================================================
  system: {
    // System Identity
    version: '1.0.0',
    environment: 'production',

    // API Surface
    restApi: true,
    graphqlApi: true,
    odataApi: true,

    // Real-time & Events
    websockets: true,
    serverSentEvents: true,
    eventBus: true,

    // Integration
    webhooks: true,
    apiContracts: true,

    // Security & Access Control
    authentication: true,
    rbac: true,
    fieldLevelSecurity: true,
    rowLevelSecurity: true,

    // Multi-tenancy
    multiTenant: true,

    // Platform Services
    backgroundJobs: true,
    auditLogging: true,
    fileStorage: true,

    // Internationalization
    i18n: true,

    // Plugin System
    pluginSystem: true,

    // System Objects
    systemObjects: ['user', 'role', 'permission', 'object', 'field'],

    // Constraints
    limits: {
      maxObjects: 1000,
      maxFieldsPerObject: 500,
      maxRecordsPerQuery: 10000,
      apiRateLimit: 1000,
      fileUploadSizeLimit: 10485760, // 10 MB
    },
  },
};

/**
 * Example 2: Development/Prototype Instance
 * 
 * Minimal configuration suitable for local development or prototyping.
 * Many advanced features are disabled to simplify the runtime.
 */
export const developmentCapabilities: ObjectStackCapabilities = {
  data: {
    // Basic query operations only
    queryFilters: true,
    queryAggregations: true,
    querySorting: true,
    queryPagination: true,
    queryWindowFunctions: false,
    querySubqueries: false,
    queryDistinct: true,
    queryHaving: false,
    queryJoins: false,

    // No advanced data features in dev
    fullTextSearch: false,
    vectorSearch: false,
    geoSpatial: false,

    // Basic field support
    jsonFields: true,
    arrayFields: false,

    // Simplified logic
    validationRules: true,
    workflows: false,
    triggers: false,
    formulas: true,

    // Basic operations
    transactions: true,
    bulkOperations: true,

    // In-memory driver only
    supportedDrivers: ['memory', 'sqlite'],
  },

  ui: {
    // Basic views
    listView: true,
    formView: true,
    kanbanView: false,
    calendarView: false,
    ganttView: false,

    // Basic reporting
    dashboards: true,
    reports: true,
    charts: true,

    // Limited customization
    customPages: true,
    customThemes: false,
    customComponents: false,

    // Basic actions
    customActions: true,
    screenFlows: false,

    // Desktop only
    mobileOptimized: false,
    accessibility: false,
  },

  system: {
    version: '0.1.0',
    environment: 'development',

    // Basic REST API only
    restApi: true,
    graphqlApi: false,
    odataApi: false,

    // No real-time in dev
    websockets: false,
    serverSentEvents: false,
    eventBus: false,

    // Basic integration
    webhooks: true,
    apiContracts: false,

    // Basic security
    authentication: true,
    rbac: true,
    fieldLevelSecurity: false,
    rowLevelSecurity: false,

    // Single-tenant
    multiTenant: false,

    // Minimal platform services
    backgroundJobs: false,
    auditLogging: false,
    fileStorage: true,

    // Basic i18n
    i18n: true,

    // No plugins in dev
    pluginSystem: false,

    // Core system objects only
    systemObjects: ['user', 'role', 'object'],

    // Generous limits for dev
    limits: {
      maxObjects: 100,
      maxFieldsPerObject: 200,
      maxRecordsPerQuery: 1000,
      apiRateLimit: 100,
      fileUploadSizeLimit: 5242880, // 5 MB
    },
  },
};

/**
 * Example 3: Custom AI-Focused Instance
 * 
 * Configuration optimized for AI/ML workloads with RAG and vector search.
 */
export const aiCapabilities: ObjectStackCapabilities = {
  data: {
    queryFilters: true,
    queryAggregations: true,
    querySorting: true,
    queryPagination: true,
    queryWindowFunctions: true,
    querySubqueries: true,
    queryDistinct: true,
    queryHaving: true,
    queryJoins: true,

    // AI-focused features enabled
    fullTextSearch: true,
    vectorSearch: true, // ✅ Critical for RAG
    geoSpatial: false,

    jsonFields: true,
    arrayFields: true,

    validationRules: true,
    workflows: true,
    triggers: true,
    formulas: true,

    transactions: true,
    bulkOperations: true,

    // Vector-capable drivers
    supportedDrivers: ['postgresql', 'pinecone', 'chromadb'],
  },

  ui: {
    // Standard UI capabilities
    listView: true,
    formView: true,
    kanbanView: false,
    calendarView: false,
    ganttView: false,

    dashboards: true,
    reports: true,
    charts: true,

    customPages: true,
    customThemes: false,
    customComponents: false,

    customActions: true,
    screenFlows: false,

    mobileOptimized: false,
    accessibility: false,
  },

  system: {
    version: '1.2.0',
    environment: 'production',

    restApi: true,
    graphqlApi: true,
    odataApi: false,

    websockets: true,
    serverSentEvents: true,
    eventBus: true,

    webhooks: true,
    apiContracts: true,

    authentication: true,
    rbac: true,
    fieldLevelSecurity: true,
    rowLevelSecurity: false,

    multiTenant: false,

    backgroundJobs: true, // For batch embeddings
    auditLogging: true,
    fileStorage: true,

    i18n: false,

    pluginSystem: false,

    systemObjects: ['user', 'role', 'document', 'embedding'],

    limits: {
      maxObjects: 500,
      maxFieldsPerObject: 300,
      maxRecordsPerQuery: 5000,
      apiRateLimit: 500,
      fileUploadSizeLimit: 52428800, // 50 MB for large documents
    },
  },
};

/**
 * Helper: Check if a specific capability is enabled
 */
export function hasCapability(
  capabilities: ObjectStackCapabilities,
  subsystem: 'data' | 'ui' | 'system',
  capability: string
): boolean {
  const subsystemCaps = capabilities[subsystem] as any;
  return subsystemCaps?.[capability] === true;
}

/**
 * Helper: Get all enabled capabilities for a subsystem
 */
export function getEnabledCapabilities(
  capabilities: ObjectStackCapabilities,
  subsystem: 'data' | 'ui' | 'system'
): string[] {
  const subsystemCaps = capabilities[subsystem] as any;
  return Object.keys(subsystemCaps).filter((key) => subsystemCaps[key] === true);
}

// ============================================================================
// Usage Examples (uncomment to run)
// ============================================================================

// Example: Check if vector search is available
// if (hasCapability(productionCapabilities, 'data', 'vectorSearch')) {
//   console.log('✅ Vector search is available for RAG workflows');
// }

// Example: Get all enabled ObjectUI capabilities
// const uiFeatures = getEnabledCapabilities(productionCapabilities, 'ui');
// console.log('Enabled UI features:', uiFeatures);

// Example: Compare capabilities between environments
// console.log(
//   'Production has GraphQL?',
//   hasCapability(productionCapabilities, 'system', 'graphqlApi')
// );
// console.log(
//   'Development has GraphQL?',
//   hasCapability(developmentCapabilities, 'system', 'graphqlApi')
// );

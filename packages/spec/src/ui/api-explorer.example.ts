/**
 * API Explorer UI Examples
 * 
 * This file demonstrates how to configure the API Explorer UI components
 * for different use cases and scenarios.
 */

import type {
  ApiExplorerPage,
  ApiBrowserComponent,
  ApiEndpointViewerComponent,
  ApiTestingPlaygroundComponent,
  ApiDocumentationViewerComponent,
  ApiHealthMonitorComponent,
} from './api-explorer.zod';

// ==========================================
// Example 1: Complete Swagger UI-Style Page
// ==========================================

/**
 * Example: Swagger UI-style API Explorer
 * 
 * A complete page configuration that mimics Swagger UI's interface.
 * Features:
 * - Tag-based grouping
 * - Interactive testing
 * - Code examples in multiple languages
 * - Combined documentation and testing view
 */
export const swaggerStyleExplorer: ApiExplorerPage = {
  name: 'swagger_ui',
  label: 'Swagger UI',
  description: 'Interactive API documentation and testing interface',
  layout: 'sidebar-main',
  
  // Sidebar: API browser with tag grouping
  sidebar: {
    type: 'api-browser',
    groupBy: 'tag',
    showSearch: true,
    showFilters: true,
    collapsible: true,
    showEndpointCount: true,
    defaultExpanded: ['customer', 'order', 'auth'],
    sortBy: 'name',
  },
  
  // Main: Combined endpoint viewer
  main: {
    type: 'api-endpoint-viewer',
    defaultMode: 'combined',
    enableTesting: true,
    showCodeExamples: true,
    codeLanguages: ['curl', 'javascript', 'python', 'typescript'],
    showSchemas: true,
    schemaExpandDepth: 1,
    showSecurity: true,
    showRateLimits: true,
    enableHistory: true,
    enableSaveRequests: true,
    autoFormatResponse: true,
    showResponseTime: true,
  },
  
  theme: 'light',
  showBreadcrumb: true,
  enableKeyboardShortcuts: true,
};

// ==========================================
// Example 2: Postman-Style Testing Interface
// ==========================================

/**
 * Example: Postman-style API testing interface
 * 
 * A testing-focused interface similar to Postman.
 * Features:
 * - Collection management
 * - Environment variables
 * - Request history
 * - Advanced request builder
 */
export const postmanStyleTester: ApiExplorerPage = {
  name: 'api_tester',
  label: 'API Tester',
  description: 'Advanced API testing workspace',
  layout: 'sidebar-main',
  
  // Sidebar: Flat API list with drag-drop
  sidebar: {
    type: 'api-browser',
    groupBy: 'none',
    showSearch: true,
    showFilters: false,
    enableDragDrop: true,
    sortBy: 'custom',
  },
  
  // Main: Full-featured testing playground
  main: {
    type: 'api-testing-playground',
    
    // Request editor configuration
    requestEditor: {
      showMethodSelector: true,
      showUrlBuilder: true,
      showHeadersEditor: true,
      showQueryEditor: true,
      showBodyEditor: true,
      syntaxHighlighting: true,
      autoCompleteHeaders: true,
      enableVariables: true,
      enablePreRequestScript: true,
    },
    
    // Response viewer configuration
    responseViewer: {
      showStatus: true,
      showHeaders: true,
      showBody: true,
      showTime: true,
      showSize: true,
      prettyPrint: true,
      syntaxHighlighting: true,
      enableCopy: true,
      enableDownload: true,
      enableTabs: true,
    },
    
    enableEnvironments: true,
    enableCollections: true,
    enableHistory: true,
    historyLimit: 100,
    enableAuthHelpers: true,
    defaultTimeout: 60000,
    enableSslVerification: true,
    enableProxy: false,
  },
  
  theme: 'dark',
  showBreadcrumb: false,
  enableKeyboardShortcuts: true,
};

// ==========================================
// Example 3: ReDoc-Style Documentation
// ==========================================

/**
 * Example: ReDoc-style API documentation
 * 
 * A documentation-focused interface similar to ReDoc.
 * Features:
 * - Clean, readable documentation
 * - Three-column layout (nav, content, code)
 * - Comprehensive code examples
 * - Deep linking support
 */
export const redocStyleDocumentation: ApiExplorerPage = {
  name: 'api_reference',
  label: 'API Reference',
  description: 'Comprehensive API documentation',
  layout: 'three-column',
  
  // Sidebar: Type-based grouping
  sidebar: {
    type: 'api-browser',
    groupBy: 'type',
    showSearch: true,
    showFilters: true,
    collapsible: true,
    defaultExpanded: ['rest', 'graphql'],
  },
  
  // Main: Documentation viewer
  main: {
    type: 'api-documentation-viewer',
    style: 'redoc',
    showToc: true,
    showCodeExamples: true,
    codeLanguages: ['typescript', 'python', 'go', 'java', 'curl'],
    enableSearch: true,
    showAuthentication: true,
    showErrorCodes: true,
    showChangelog: true,
    expandModels: false,
    enableDeepLinking: true,
    theme: 'light',
  },
  
  theme: 'light',
  showBreadcrumb: true,
  enableKeyboardShortcuts: true,
};

// ==========================================
// Example 4: GraphQL Playground
// ==========================================

/**
 * Example: GraphQL-focused API explorer
 * 
 * Specialized for GraphQL APIs with schema explorer.
 * Features:
 * - GraphQL-specific testing
 * - Schema explorer
 * - Query builder
 */
export const graphqlPlayground: ApiExplorerPage = {
  name: 'graphql_playground',
  label: 'GraphQL Playground',
  description: 'Interactive GraphQL API explorer',
  layout: 'split-vertical',
  
  sidebar: {
    type: 'api-browser',
    groupBy: 'type',
    defaultFilters: {
      types: ['graphql'],
    },
    showSearch: true,
  },
  
  main: {
    type: 'api-testing-playground',
    requestEditor: {
      showMethodSelector: false,
      syntaxHighlighting: true,
      enableVariables: true,
    },
    responseViewer: {
      prettyPrint: true,
      syntaxHighlighting: true,
    },
    enableHistory: true,
    historyLimit: 50,
  },
  
  theme: 'dark',
  defaultApi: 'graphql_api',
};

// ==========================================
// Example 5: API Health Monitoring Dashboard
// ==========================================

/**
 * Example: API health monitoring dashboard
 * 
 * Monitor API health, performance, and uptime.
 * Features:
 * - Real-time health status
 * - Performance metrics
 * - Alert management
 * - Historical trends
 */
export const apiHealthDashboard: ApiExplorerPage = {
  name: 'api_health_dashboard',
  label: 'API Health Dashboard',
  description: 'Monitor API health and performance',
  layout: 'sidebar-main',
  
  // Sidebar: Status-based grouping
  sidebar: {
    type: 'api-browser',
    groupBy: 'status',
    showSearch: true,
    showFilters: true,
    defaultFilters: {
      statuses: ['active'],
    },
    showEndpointCount: true,
  },
  
  // Enable health monitoring
  enableHealthMonitor: true,
  healthMonitor: {
    type: 'api-health-monitor',
    displayMode: 'dashboard',
    refreshInterval: 30, // 30 seconds
    showMetrics: true,
    showAlerts: true,
    showUptime: true,
    showErrorRate: true,
    showResponseTime: true,
    metricsTimeRange: '24h',
    alertThresholds: {
      errorRate: 5,        // 5% error rate threshold
      responseTime: 1000,  // 1000ms response time threshold
      uptime: 99,          // 99% uptime threshold
    },
  },
  
  theme: 'dark',
  showBreadcrumb: true,
};

// ==========================================
// Example 6: Internal Admin API Explorer
// ==========================================

/**
 * Example: Internal admin API explorer
 * 
 * For internal/admin users with advanced features.
 * Features:
 * - All API types
 * - Full testing capabilities
 * - Permission-based access
 */
export const adminApiExplorer: ApiExplorerPage = {
  name: 'admin_api_explorer',
  label: 'Admin API Explorer',
  description: 'Internal API management and testing',
  layout: 'three-column',
  
  sidebar: {
    type: 'api-browser',
    groupBy: 'owner',
    showSearch: true,
    showFilters: true,
    enableDragDrop: true,
    showEndpointCount: true,
  },
  
  main: {
    type: 'api-endpoint-viewer',
    defaultMode: 'combined',
    enableTesting: true,
    showCodeExamples: true,
    codeLanguages: ['typescript', 'python', 'curl', 'javascript', 'go'],
    showSchemas: true,
    schemaExpandDepth: 2,
    showSecurity: true,
    showRateLimits: true,
    enableHistory: true,
    enableSaveRequests: true,
  },
  
  enableHealthMonitor: true,
  healthMonitor: {
    type: 'api-health-monitor',
    displayMode: 'detailed-list',
    refreshInterval: 60,
    showMetrics: true,
    showAlerts: true,
  },
  
  theme: 'auto',
  requiredPermissions: ['api.read', 'api.execute', 'admin'],
  enableKeyboardShortcuts: true,
};

// ==========================================
// Example 7: Public API Documentation
// ==========================================

/**
 * Example: Public API documentation
 * 
 * Read-only documentation for external developers.
 * Features:
 * - Clean documentation interface
 * - Code examples
 * - No testing capabilities (read-only)
 */
export const publicApiDocs: ApiExplorerPage = {
  name: 'public_api_docs',
  label: 'API Documentation',
  description: 'Public API documentation for developers',
  layout: 'sidebar-main',
  
  sidebar: {
    type: 'api-browser',
    groupBy: 'tag',
    showSearch: true,
    showFilters: false,
    defaultFilters: {
      tags: ['public'],
      statuses: ['active'],
    },
  },
  
  main: {
    type: 'api-documentation-viewer',
    style: 'stoplight',
    showToc: true,
    showCodeExamples: true,
    codeLanguages: ['curl', 'javascript', 'python', 'ruby', 'php'],
    enableSearch: true,
    showAuthentication: true,
    showErrorCodes: true,
    showChangelog: true,
    expandModels: false,
    enableDeepLinking: true,
    theme: 'light',
  },
  
  theme: 'light',
  showBreadcrumb: true,
  requiredPermissions: [], // Public access
};

// ==========================================
// Example 8: WebSocket API Explorer
// ==========================================

/**
 * Example: WebSocket API explorer
 * 
 * Specialized for real-time WebSocket APIs.
 * Features:
 * - WebSocket connection testing
 * - Event subscription
 * - Real-time message viewing
 */
export const websocketExplorer: ApiExplorerPage = {
  name: 'websocket_explorer',
  label: 'WebSocket Explorer',
  description: 'Test and monitor WebSocket APIs',
  layout: 'split-horizontal',
  
  sidebar: {
    type: 'api-browser',
    groupBy: 'type',
    defaultFilters: {
      types: ['websocket'],
    },
    showSearch: true,
  },
  
  main: {
    type: 'api-testing-playground',
    requestEditor: {
      showMethodSelector: false,
      syntaxHighlighting: true,
      enableVariables: true,
    },
    responseViewer: {
      prettyPrint: true,
      syntaxHighlighting: true,
      enableTabs: true,
    },
    enableHistory: true,
    historyLimit: 200, // More history for real-time events
    defaultTimeout: 0, // No timeout for WebSocket
  },
  
  theme: 'dark',
};

// ==========================================
// Example 9: Minimal API Browser
// ==========================================

/**
 * Example: Minimal API browser
 * 
 * Simple, lightweight API browser for quick reference.
 * Features:
 * - Minimal UI
 * - Quick access
 * - Basic documentation
 */
export const minimalApiBrowser: ApiExplorerPage = {
  name: 'api_quick_reference',
  label: 'API Quick Reference',
  description: 'Quick API reference',
  layout: 'sidebar-main',
  
  sidebar: {
    type: 'api-browser',
    groupBy: 'none',
    showSearch: true,
    showFilters: false,
    collapsible: false,
  },
  
  main: {
    type: 'api-endpoint-viewer',
    defaultMode: 'documentation',
    enableTesting: false,
    showCodeExamples: true,
    codeLanguages: ['curl', 'javascript'],
    showSchemas: true,
    schemaExpandDepth: 0,
    showSecurity: true,
    showRateLimits: false,
    enableHistory: false,
    enableSaveRequests: false,
  },
  
  theme: 'light',
  showBreadcrumb: false,
  enableKeyboardShortcuts: false,
};

// ==========================================
// Example 10: Custom Component Configurations
// ==========================================

/**
 * Example: Standalone components for custom layouts
 * 
 * Individual component configurations that can be composed
 * into custom page layouts.
 */

// API Browser with custom grouping
export const customApiBrowser: ApiBrowserComponent = {
  type: 'api-browser',
  groupBy: 'custom',
  showSearch: true,
  showFilters: true,
  defaultFilters: {
    types: ['rest', 'graphql'],
    statuses: ['active', 'beta'],
  },
  collapsible: true,
  defaultExpanded: ['core', 'plugins'],
  enableDragDrop: true,
  sortBy: 'custom',
};

// Endpoint viewer with all features enabled
export const fullFeaturedEndpointViewer: ApiEndpointViewerComponent = {
  type: 'api-endpoint-viewer',
  defaultMode: 'combined',
  enableTesting: true,
  showCodeExamples: true,
  codeLanguages: ['typescript', 'python', 'go', 'java', 'curl', 'javascript'],
  showSchemas: true,
  schemaExpandDepth: -1, // Fully expanded
  showSecurity: true,
  showRateLimits: true,
  enableHistory: true,
  enableSaveRequests: true,
  autoFormatResponse: true,
  showResponseTime: true,
};

// Advanced testing playground
export const advancedTestingPlayground: ApiTestingPlaygroundComponent = {
  type: 'api-testing-playground',
  requestEditor: {
    showMethodSelector: true,
    showUrlBuilder: true,
    showHeadersEditor: true,
    showQueryEditor: true,
    showBodyEditor: true,
    syntaxHighlighting: true,
    autoCompleteHeaders: true,
    enableVariables: true,
    enablePreRequestScript: true,
  },
  responseViewer: {
    showStatus: true,
    showHeaders: true,
    showBody: true,
    showTime: true,
    showSize: true,
    prettyPrint: true,
    syntaxHighlighting: true,
    enableCopy: true,
    enableDownload: true,
    enableTabs: true,
  },
  enableEnvironments: true,
  enableCollections: true,
  enableHistory: true,
  historyLimit: 100,
  enableAuthHelpers: true,
  defaultTimeout: 30000,
  enableSslVerification: true,
  enableProxy: true,
};

// Comprehensive documentation viewer
export const comprehensiveDocViewer: ApiDocumentationViewerComponent = {
  type: 'api-documentation-viewer',
  style: 'slate',
  showToc: true,
  showCodeExamples: true,
  codeLanguages: ['typescript', 'python', 'go', 'java', 'ruby', 'php', 'curl'],
  enableSearch: true,
  showAuthentication: true,
  showErrorCodes: true,
  showChangelog: true,
  expandModels: true,
  enableDeepLinking: true,
  theme: 'auto',
};

// Real-time health monitor
export const realtimeHealthMonitor: ApiHealthMonitorComponent = {
  type: 'api-health-monitor',
  displayMode: 'dashboard',
  refreshInterval: 10, // 10 seconds
  showMetrics: true,
  showAlerts: true,
  showUptime: true,
  showErrorRate: true,
  showResponseTime: true,
  metricsTimeRange: '1h',
  alertThresholds: {
    errorRate: 2,
    responseTime: 500,
    uptime: 99.9,
  },
};

// Export all examples
export const apiExplorerExamples = {
  swaggerStyleExplorer,
  postmanStyleTester,
  redocStyleDocumentation,
  graphqlPlayground,
  apiHealthDashboard,
  adminApiExplorer,
  publicApiDocs,
  websocketExplorer,
  minimalApiBrowser,
  
  // Standalone components
  customApiBrowser,
  fullFeaturedEndpointViewer,
  advancedTestingPlayground,
  comprehensiveDocViewer,
  realtimeHealthMonitor,
};

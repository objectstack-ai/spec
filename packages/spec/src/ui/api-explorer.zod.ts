import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';
import { ApiProtocolType } from '../api/registry.zod';

/**
 * API Explorer UI Protocol
 * 
 * Provides UI schemas for building interactive API exploration and testing interfaces.
 * This protocol bridges the API Registry (backend) with user-facing UI components.
 * 
 * **Purpose:**
 * Enable developers and users to:
 * - Browse and discover available APIs
 * - View comprehensive API documentation
 * - Test API endpoints interactively
 * - Monitor API health and performance
 * - Manage API configurations
 * 
 * **Architecture Alignment:**
 * - Swagger UI: Interactive API documentation and testing
 * - Postman: API testing and collections
 * - GraphQL Playground: GraphQL-specific testing
 * - Kong Manager: API gateway management UI
 * - AWS API Gateway Console: API management interface
 * 
 * **Integration:**
 * - Data Source: API Registry (`api/registry.zod.ts`)
 * - Documentation: API Documentation (`api/documentation.zod.ts`)
 * - Testing: Built-in testing UI with request/response inspection
 * 
 * @example API Explorer Page
 * ```typescript
 * const apiExplorerPage: ApiExplorerPage = {
 *   name: 'api_explorer',
 *   label: 'API Explorer',
 *   layout: 'sidebar-main',
 *   sidebar: {
 *     type: 'api-browser',
 *     groupBy: 'type',
 *     showSearch: true
 *   },
 *   main: {
 *     type: 'api-endpoint-viewer',
 *     enableTesting: true
 *   }
 * }
 * ```
 */

// ==========================================
// API Browser Component
// ==========================================

/**
 * API Browser Grouping Strategy
 * 
 * Determines how APIs are organized in the browser sidebar.
 */
export const ApiBrowserGrouping = z.enum([
  'none',        // Flat list
  'type',        // Group by API type (REST, GraphQL, WebSocket, etc.)
  'status',      // Group by status (active, deprecated, beta, etc.)
  'tag',         // Group by tags
  'owner',       // Group by team/owner
  'version',     // Group by version
  'custom',      // Custom grouping function
]);

export type ApiBrowserGrouping = z.infer<typeof ApiBrowserGrouping>;

/**
 * API Browser Filter Options
 * 
 * Filters available in the API browser.
 */
export const ApiBrowserFilterSchema = z.object({
  /** Filter by API protocol type */
  types: z.array(ApiProtocolType).optional().describe('Filter by API types'),
  
  /** Filter by status */
  statuses: z.array(z.string()).optional().describe('Filter by API status'),
  
  /** Filter by tags */
  tags: z.array(z.string()).optional().describe('Filter by tags'),
  
  /** Filter by owner */
  owners: z.array(z.string()).optional().describe('Filter by owner/team'),
  
  /** Search query */
  search: z.string().optional().describe('Search query for API name/description'),
});

export type ApiBrowserFilter = z.infer<typeof ApiBrowserFilterSchema>;

/**
 * API Browser Component Schema
 * 
 * Left sidebar component for browsing and discovering APIs.
 * Similar to Swagger UI sidebar or Postman collection explorer.
 * 
 * @example
 * ```typescript
 * const apiBrowser: ApiBrowserComponent = {
 *   type: 'api-browser',
 *   groupBy: 'type',
 *   showSearch: true,
 *   showFilters: true,
 *   collapsible: true,
 *   defaultExpanded: ['rest', 'graphql']
 * }
 * ```
 */
export const ApiBrowserComponentSchema = z.object({
  /** Component type identifier */
  type: z.literal('api-browser').describe('Component type'),
  
  /** Grouping strategy */
  groupBy: ApiBrowserGrouping.default('type').describe('How to group APIs'),
  
  /** Show search bar */
  showSearch: z.boolean().default(true).describe('Show search bar'),
  
  /** Show filter controls */
  showFilters: z.boolean().default(true).describe('Show filter controls'),
  
  /** Default filters */
  defaultFilters: ApiBrowserFilterSchema.optional().describe('Default filter values'),
  
  /** Collapsible groups */
  collapsible: z.boolean().default(true).describe('Allow collapsing groups'),
  
  /** Default expanded groups */
  defaultExpanded: z.array(z.string()).optional().describe('Groups expanded by default'),
  
  /** Show endpoint count badges */
  showEndpointCount: z.boolean().default(true).describe('Show endpoint count for each API'),
  
  /** Enable drag & drop for organization */
  enableDragDrop: z.boolean().default(false).describe('Enable drag & drop reordering'),
  
  /** Custom sort order */
  sortBy: z.enum(['name', 'type', 'status', 'updated', 'custom']).default('name')
    .describe('Sort order for APIs'),
});

export type ApiBrowserComponent = z.infer<typeof ApiBrowserComponentSchema>;

// ==========================================
// API Endpoint Viewer Component
// ==========================================

/**
 * Endpoint Display Mode
 * 
 * How endpoint information is displayed.
 */
export const EndpointDisplayMode = z.enum([
  'documentation',  // Documentation view (similar to Swagger UI)
  'testing',        // Testing playground (similar to Postman)
  'code',           // Code examples and snippets
  'schema',         // Schema/model view
  'combined',       // Combined view with tabs
]);

export type EndpointDisplayMode = z.infer<typeof EndpointDisplayMode>;

/**
 * API Endpoint Viewer Component Schema
 * 
 * Main content area for viewing and testing API endpoints.
 * Displays comprehensive endpoint documentation and interactive testing interface.
 * 
 * @example
 * ```typescript
 * const endpointViewer: ApiEndpointViewerComponent = {
 *   type: 'api-endpoint-viewer',
 *   defaultMode: 'combined',
 *   enableTesting: true,
 *   showCodeExamples: true,
 *   codeLanguages: ['typescript', 'python', 'curl']
 * }
 * ```
 */
export const ApiEndpointViewerComponentSchema = z.object({
  /** Component type identifier */
  type: z.literal('api-endpoint-viewer').describe('Component type'),
  
  /** Default display mode */
  defaultMode: EndpointDisplayMode.default('combined').describe('Default display mode'),
  
  /** Enable interactive testing */
  enableTesting: z.boolean().default(true).describe('Enable try-it-out testing'),
  
  /** Show code examples */
  showCodeExamples: z.boolean().default(true).describe('Show code examples'),
  
  /** Supported code languages */
  codeLanguages: z.array(z.string()).default(['typescript', 'python', 'curl', 'javascript'])
    .describe('Languages for code examples'),
  
  /** Show request/response schemas */
  showSchemas: z.boolean().default(true).describe('Show request/response schemas'),
  
  /** Schema expand depth */
  schemaExpandDepth: z.number().int().min(-1).default(1)
    .describe('Default schema expand depth (-1 = fully expand)'),
  
  /** Show security information */
  showSecurity: z.boolean().default(true).describe('Show security requirements'),
  
  /** Show rate limiting info */
  showRateLimits: z.boolean().default(true).describe('Show rate limit information'),
  
  /** Enable request history */
  enableHistory: z.boolean().default(true).describe('Enable request history'),
  
  /** Save test requests */
  enableSaveRequests: z.boolean().default(true).describe('Allow saving test requests'),
  
  /** Auto-format responses */
  autoFormatResponse: z.boolean().default(true).describe('Auto-format JSON/XML responses'),
  
  /** Show response time */
  showResponseTime: z.boolean().default(true).describe('Show request response time'),
});

export type ApiEndpointViewerComponent = z.infer<typeof ApiEndpointViewerComponentSchema>;

// ==========================================
// API Testing Playground Component
// ==========================================

/**
 * Request Editor Configuration
 * 
 * Configuration for the request editor interface.
 */
export const RequestEditorConfigSchema = z.object({
  /** Show method selector */
  showMethodSelector: z.boolean().default(true).describe('Show HTTP method selector'),
  
  /** Show URL builder */
  showUrlBuilder: z.boolean().default(true).describe('Show URL builder with path params'),
  
  /** Show headers editor */
  showHeadersEditor: z.boolean().default(true).describe('Show headers editor'),
  
  /** Show query params editor */
  showQueryEditor: z.boolean().default(true).describe('Show query parameters editor'),
  
  /** Show body editor */
  showBodyEditor: z.boolean().default(true).describe('Show request body editor'),
  
  /** Body editor syntax highlighting */
  syntaxHighlighting: z.boolean().default(true).describe('Enable syntax highlighting'),
  
  /** Auto-complete for headers */
  autoCompleteHeaders: z.boolean().default(true).describe('Auto-complete common headers'),
  
  /** Variable support */
  enableVariables: z.boolean().default(true).describe('Enable template variables {{var}}'),
  
  /** Pre-request scripts */
  enablePreRequestScript: z.boolean().default(false).describe('Enable pre-request scripts'),
});

export type RequestEditorConfig = z.infer<typeof RequestEditorConfigSchema>;

/**
 * Response Viewer Configuration
 * 
 * Configuration for the response viewer interface.
 */
export const ResponseViewerConfigSchema = z.object({
  /** Show status code prominently */
  showStatus: z.boolean().default(true).describe('Show HTTP status code'),
  
  /** Show response headers */
  showHeaders: z.boolean().default(true).describe('Show response headers'),
  
  /** Show response body */
  showBody: z.boolean().default(true).describe('Show response body'),
  
  /** Show response time */
  showTime: z.boolean().default(true).describe('Show response time'),
  
  /** Show response size */
  showSize: z.boolean().default(true).describe('Show response size'),
  
  /** Pretty print JSON/XML */
  prettyPrint: z.boolean().default(true).describe('Pretty print formatted responses'),
  
  /** Syntax highlighting */
  syntaxHighlighting: z.boolean().default(true).describe('Enable syntax highlighting'),
  
  /** Copy to clipboard button */
  enableCopy: z.boolean().default(true).describe('Enable copy to clipboard'),
  
  /** Download response button */
  enableDownload: z.boolean().default(true).describe('Enable download response'),
  
  /** Response tabs (body, headers, raw) */
  enableTabs: z.boolean().default(true).describe('Enable response tabs'),
});

export type ResponseViewerConfig = z.infer<typeof ResponseViewerConfigSchema>;

/**
 * API Testing Playground Component Schema
 * 
 * Standalone testing playground component for API testing.
 * Similar to Postman's request builder or Swagger UI's try-it-out.
 * 
 * @example
 * ```typescript
 * const testingPlayground: ApiTestingPlaygroundComponent = {
 *   type: 'api-testing-playground',
 *   requestEditor: {
 *     syntaxHighlighting: true,
 *     enableVariables: true
 *   },
 *   responseViewer: {
 *     prettyPrint: true,
 *     syntaxHighlighting: true
 *   },
 *   enableEnvironments: true,
 *   enableCollections: true
 * }
 * ```
 */
export const ApiTestingPlaygroundComponentSchema = z.object({
  /** Component type identifier */
  type: z.literal('api-testing-playground').describe('Component type'),
  
  /** Request editor configuration */
  requestEditor: RequestEditorConfigSchema.optional().describe('Request editor settings'),
  
  /** Response viewer configuration */
  responseViewer: ResponseViewerConfigSchema.optional().describe('Response viewer settings'),
  
  /** Enable environment variables */
  enableEnvironments: z.boolean().default(true).describe('Enable environment management'),
  
  /** Enable collections */
  enableCollections: z.boolean().default(true).describe('Enable request collections'),
  
  /** Enable request history */
  enableHistory: z.boolean().default(true).describe('Enable request history'),
  
  /** History limit */
  historyLimit: z.number().int().min(0).default(50).describe('Maximum history items'),
  
  /** Enable authentication helpers */
  enableAuthHelpers: z.boolean().default(true).describe('Enable auth helpers (OAuth, JWT, etc.)'),
  
  /** Default timeout (ms) */
  defaultTimeout: z.number().int().min(0).default(30000).describe('Default request timeout'),
  
  /** Enable SSL verification toggle */
  enableSslVerification: z.boolean().default(true).describe('Enable SSL verification toggle'),
  
  /** Enable proxy configuration */
  enableProxy: z.boolean().default(false).describe('Enable proxy configuration'),
});

export type ApiTestingPlaygroundComponent = z.infer<typeof ApiTestingPlaygroundComponentSchema>;

// ==========================================
// API Documentation Viewer Component
// ==========================================

/**
 * Documentation Rendering Style
 * 
 * Style of documentation rendering.
 */
export const DocumentationStyle = z.enum([
  'swagger',      // Swagger UI style
  'redoc',        // ReDoc style
  'slate',        // Slate style (two-column)
  'stoplight',    // Stoplight style
  'custom',       // Custom template
]);

export type DocumentationStyle = z.infer<typeof DocumentationStyle>;

/**
 * API Documentation Viewer Component Schema
 * 
 * Component for rendering API documentation.
 * Displays comprehensive API documentation with navigation.
 * 
 * @example
 * ```typescript
 * const docViewer: ApiDocumentationViewerComponent = {
 *   type: 'api-documentation-viewer',
 *   style: 'redoc',
 *   showToc: true,
 *   showCodeExamples: true,
 *   enableSearch: true
 * }
 * ```
 */
export const ApiDocumentationViewerComponentSchema = z.object({
  /** Component type identifier */
  type: z.literal('api-documentation-viewer').describe('Component type'),
  
  /** Documentation rendering style */
  style: DocumentationStyle.default('swagger').describe('Documentation style'),
  
  /** Show table of contents */
  showToc: z.boolean().default(true).describe('Show table of contents'),
  
  /** Show code examples */
  showCodeExamples: z.boolean().default(true).describe('Show code examples'),
  
  /** Code example languages */
  codeLanguages: z.array(z.string()).default(['typescript', 'python', 'curl'])
    .describe('Languages for code examples'),
  
  /** Enable search */
  enableSearch: z.boolean().default(true).describe('Enable documentation search'),
  
  /** Show authentication section */
  showAuthentication: z.boolean().default(true).describe('Show authentication docs'),
  
  /** Show error codes */
  showErrorCodes: z.boolean().default(true).describe('Show error code reference'),
  
  /** Show changelog */
  showChangelog: z.boolean().default(true).describe('Show API changelog'),
  
  /** Expand models by default */
  expandModels: z.boolean().default(false).describe('Expand schema models by default'),
  
  /** Enable deep linking */
  enableDeepLinking: z.boolean().default(true).describe('Enable deep linking to sections'),
  
  /** Theme */
  theme: z.enum(['light', 'dark', 'auto']).default('light').describe('Documentation theme'),
});

export type ApiDocumentationViewerComponent = z.infer<typeof ApiDocumentationViewerComponentSchema>;

// ==========================================
// API Health Monitor Component
// ==========================================

/**
 * Health Check Display Mode
 * 
 * How to display API health information.
 */
export const HealthDisplayMode = z.enum([
  'status-badge',   // Simple status badges
  'detailed-list',  // Detailed list with metrics
  'dashboard',      // Dashboard with charts
  'timeline',       // Timeline view
]);

export type HealthDisplayMode = z.infer<typeof HealthDisplayMode>;

/**
 * API Health Monitor Component Schema
 * 
 * Component for monitoring API health and performance.
 * Displays real-time status, response times, and error rates.
 * 
 * @example
 * ```typescript
 * const healthMonitor: ApiHealthMonitorComponent = {
 *   type: 'api-health-monitor',
 *   displayMode: 'dashboard',
 *   refreshInterval: 30,
 *   showMetrics: true,
 *   showAlerts: true
 * }
 * ```
 */
export const ApiHealthMonitorComponentSchema = z.object({
  /** Component type identifier */
  type: z.literal('api-health-monitor').describe('Component type'),
  
  /** Display mode */
  displayMode: HealthDisplayMode.default('detailed-list').describe('Display mode'),
  
  /** Auto-refresh interval (seconds) */
  refreshInterval: z.number().int().min(0).default(60)
    .describe('Auto-refresh interval in seconds (0 = disabled)'),
  
  /** Show performance metrics */
  showMetrics: z.boolean().default(true).describe('Show performance metrics'),
  
  /** Show alerts */
  showAlerts: z.boolean().default(true).describe('Show health alerts'),
  
  /** Show uptime */
  showUptime: z.boolean().default(true).describe('Show API uptime'),
  
  /** Show error rate */
  showErrorRate: z.boolean().default(true).describe('Show error rate'),
  
  /** Show response time */
  showResponseTime: z.boolean().default(true).describe('Show average response time'),
  
  /** Time range for metrics */
  metricsTimeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h')
    .describe('Time range for metrics'),
  
  /** Alert thresholds */
  alertThresholds: z.object({
    errorRate: z.number().min(0).max(100).default(5).describe('Error rate threshold %'),
    responseTime: z.number().min(0).default(1000).describe('Response time threshold (ms)'),
    uptime: z.number().min(0).max(100).default(99).describe('Uptime threshold %'),
  }).optional().describe('Alert threshold configuration'),
});

export type ApiHealthMonitorComponent = z.infer<typeof ApiHealthMonitorComponentSchema>;

// ==========================================
// API Explorer Page Schema
// ==========================================

/**
 * API Explorer Page Layout
 * 
 * Layout configuration for the API Explorer page.
 */
export const ApiExplorerLayout = z.enum([
  'sidebar-main',      // Sidebar + main content (Swagger UI style)
  'three-column',      // Browser + content + inspector
  'tabbed',            // Tabbed interface
  'split-horizontal',  // Horizontal split
  'split-vertical',    // Vertical split
  'custom',            // Custom layout
]);

export type ApiExplorerLayout = z.infer<typeof ApiExplorerLayout>;

/**
 * API Explorer Page Schema
 * 
 * Complete page configuration for the API Explorer interface.
 * This is the main entry point for API exploration and testing.
 * 
 * **NAMING CONVENTION:**
 * Page name must be lowercase snake_case.
 * 
 * @example
 * ```typescript
 * const apiExplorerPage: ApiExplorerPage = {
 *   name: 'api_explorer',
 *   label: 'API Explorer',
 *   description: 'Explore and test ObjectStack APIs',
 *   layout: 'sidebar-main',
 *   sidebar: {
 *     type: 'api-browser',
 *     groupBy: 'type',
 *     showSearch: true
 *   },
 *   main: {
 *     type: 'api-endpoint-viewer',
 *     enableTesting: true,
 *     showCodeExamples: true
 *   },
 *   enableHealthMonitor: true,
 *   theme: 'light'
 * }
 * ```
 */
export const ApiExplorerPageSchema = z.object({
  /** Page unique name */
  name: SnakeCaseIdentifierSchema.describe('Page unique name (lowercase snake_case)'),
  
  /** Display label */
  label: z.string().describe('Display label for the page'),
  
  /** Description */
  description: z.string().optional().describe('Page description'),
  
  /** Layout type */
  layout: ApiExplorerLayout.default('sidebar-main').describe('Page layout'),
  
  /** Sidebar component configuration */
  sidebar: ApiBrowserComponentSchema.optional().describe('Sidebar API browser configuration'),
  
  /** Main content component configuration */
  main: z.union([
    ApiEndpointViewerComponentSchema,
    ApiTestingPlaygroundComponentSchema,
    ApiDocumentationViewerComponentSchema,
  ]).optional().describe('Main content area configuration'),
  
  /** Enable health monitor */
  enableHealthMonitor: z.boolean().default(false).describe('Enable API health monitoring'),
  
  /** Health monitor configuration */
  healthMonitor: ApiHealthMonitorComponentSchema.optional().describe('Health monitor configuration'),
  
  /** Theme */
  theme: z.enum(['light', 'dark', 'auto']).default('light').describe('UI theme'),
  
  /** Enable breadcrumb navigation */
  showBreadcrumb: z.boolean().default(true).describe('Show breadcrumb navigation'),
  
  /** Default selected API */
  defaultApi: z.string().optional().describe('Default API ID to display on load'),
  
  /** Default selected endpoint */
  defaultEndpoint: z.string().optional().describe('Default endpoint ID to display on load'),
  
  /** Enable keyboard shortcuts */
  enableKeyboardShortcuts: z.boolean().default(true).describe('Enable keyboard shortcuts'),
  
  /** Custom CSS classes */
  customClasses: z.array(z.string()).optional().describe('Custom CSS classes'),
  
  /** Permissions required to access this page */
  requiredPermissions: z.array(z.string()).optional().describe('Required permissions'),
});

export type ApiExplorerPage = z.infer<typeof ApiExplorerPageSchema>;

// ==========================================
// Component Union & Helpers
// ==========================================

/**
 * API Explorer Component Union
 * 
 * Union of all API Explorer components.
 */
export const ApiExplorerComponentSchema = z.union([
  ApiBrowserComponentSchema,
  ApiEndpointViewerComponentSchema,
  ApiTestingPlaygroundComponentSchema,
  ApiDocumentationViewerComponentSchema,
  ApiHealthMonitorComponentSchema,
]);

export type ApiExplorerComponent = z.infer<typeof ApiExplorerComponentSchema>;

/**
 * API Explorer Factory Helpers
 * 
 * Helper functions for creating API Explorer configurations.
 */
export const ApiExplorer = {
  createPage: (config: z.input<typeof ApiExplorerPageSchema>): ApiExplorerPage =>
    ApiExplorerPageSchema.parse(config),
  
  createBrowser: (config: z.input<typeof ApiBrowserComponentSchema>): ApiBrowserComponent =>
    ApiBrowserComponentSchema.parse(config),
  
  createEndpointViewer: (config: z.input<typeof ApiEndpointViewerComponentSchema>): ApiEndpointViewerComponent =>
    ApiEndpointViewerComponentSchema.parse(config),
  
  createTestingPlayground: (config: z.input<typeof ApiTestingPlaygroundComponentSchema>): ApiTestingPlaygroundComponent =>
    ApiTestingPlaygroundComponentSchema.parse(config),
  
  createDocViewer: (config: z.input<typeof ApiDocumentationViewerComponentSchema>): ApiDocumentationViewerComponent =>
    ApiDocumentationViewerComponentSchema.parse(config),
  
  createHealthMonitor: (config: z.input<typeof ApiHealthMonitorComponentSchema>): ApiHealthMonitorComponent =>
    ApiHealthMonitorComponentSchema.parse(config),
} as const;

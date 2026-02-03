import { describe, it, expect } from 'vitest';
import {
  ApiBrowserComponentSchema,
  ApiEndpointViewerComponentSchema,
  ApiTestingPlaygroundComponentSchema,
  ApiDocumentationViewerComponentSchema,
  ApiHealthMonitorComponentSchema,
  ApiExplorerPageSchema,
  ApiExplorer,
  ApiBrowserGrouping,
  EndpointDisplayMode,
  DocumentationStyle,
  HealthDisplayMode,
  ApiExplorerLayout,
} from './api-explorer.zod';

describe('API Explorer UI Schema', () => {
  // ==========================================
  // API Browser Component Tests
  // ==========================================
  
  describe('ApiBrowserComponent', () => {
    it('should validate a basic API browser component', () => {
      const browser = {
        type: 'api-browser' as const,
        groupBy: 'type' as const,
        showSearch: true,
      };
      
      const result = ApiBrowserComponentSchema.parse(browser);
      expect(result.type).toBe('api-browser');
      expect(result.groupBy).toBe('type');
      expect(result.showSearch).toBe(true);
    });
    
    it('should use default values for optional fields', () => {
      const browser = {
        type: 'api-browser' as const,
      };
      
      const result = ApiBrowserComponentSchema.parse(browser);
      expect(result.groupBy).toBe('type');
      expect(result.showSearch).toBe(true);
      expect(result.showFilters).toBe(true);
      expect(result.collapsible).toBe(true);
      expect(result.showEndpointCount).toBe(true);
      expect(result.enableDragDrop).toBe(false);
      expect(result.sortBy).toBe('name');
    });
    
    it('should validate all grouping strategies', () => {
      const groupings: ApiBrowserGrouping[] = [
        'none', 'type', 'status', 'tag', 'owner', 'version', 'custom'
      ];
      
      groupings.forEach(groupBy => {
        const browser = {
          type: 'api-browser' as const,
          groupBy,
        };
        
        const result = ApiBrowserComponentSchema.parse(browser);
        expect(result.groupBy).toBe(groupBy);
      });
    });
    
    it('should validate default filters configuration', () => {
      const browser = {
        type: 'api-browser' as const,
        defaultFilters: {
          types: ['rest', 'graphql'],
          statuses: ['active'],
          tags: ['public', 'v1'],
          search: 'customer',
        },
      };
      
      const result = ApiBrowserComponentSchema.parse(browser);
      expect(result.defaultFilters?.types).toContain('rest');
      expect(result.defaultFilters?.statuses).toContain('active');
      expect(result.defaultFilters?.tags).toHaveLength(2);
      expect(result.defaultFilters?.search).toBe('customer');
    });
    
    it('should validate expanded groups configuration', () => {
      const browser = {
        type: 'api-browser' as const,
        defaultExpanded: ['rest', 'graphql', 'websocket'],
      };
      
      const result = ApiBrowserComponentSchema.parse(browser);
      expect(result.defaultExpanded).toHaveLength(3);
      expect(result.defaultExpanded).toContain('rest');
    });
  });
  
  // ==========================================
  // API Endpoint Viewer Component Tests
  // ==========================================
  
  describe('ApiEndpointViewerComponent', () => {
    it('should validate a basic endpoint viewer', () => {
      const viewer = {
        type: 'api-endpoint-viewer' as const,
        enableTesting: true,
      };
      
      const result = ApiEndpointViewerComponentSchema.parse(viewer);
      expect(result.type).toBe('api-endpoint-viewer');
      expect(result.enableTesting).toBe(true);
    });
    
    it('should use default values for optional fields', () => {
      const viewer = {
        type: 'api-endpoint-viewer' as const,
      };
      
      const result = ApiEndpointViewerComponentSchema.parse(viewer);
      expect(result.defaultMode).toBe('combined');
      expect(result.enableTesting).toBe(true);
      expect(result.showCodeExamples).toBe(true);
      expect(result.showSchemas).toBe(true);
      expect(result.schemaExpandDepth).toBe(1);
      expect(result.codeLanguages).toContain('typescript');
    });
    
    it('should validate all display modes', () => {
      const modes: EndpointDisplayMode[] = [
        'documentation', 'testing', 'code', 'schema', 'combined'
      ];
      
      modes.forEach(mode => {
        const viewer = {
          type: 'api-endpoint-viewer' as const,
          defaultMode: mode,
        };
        
        const result = ApiEndpointViewerComponentSchema.parse(viewer);
        expect(result.defaultMode).toBe(mode);
      });
    });
    
    it('should validate code languages configuration', () => {
      const viewer = {
        type: 'api-endpoint-viewer' as const,
        codeLanguages: ['typescript', 'python', 'go', 'java', 'curl'],
      };
      
      const result = ApiEndpointViewerComponentSchema.parse(viewer);
      expect(result.codeLanguages).toHaveLength(5);
      expect(result.codeLanguages).toContain('go');
    });
    
    it('should validate schema expand depth', () => {
      const viewer = {
        type: 'api-endpoint-viewer' as const,
        schemaExpandDepth: -1, // Fully expand
      };
      
      const result = ApiEndpointViewerComponentSchema.parse(viewer);
      expect(result.schemaExpandDepth).toBe(-1);
    });
    
    it('should validate all boolean flags', () => {
      const viewer = {
        type: 'api-endpoint-viewer' as const,
        enableTesting: false,
        showCodeExamples: false,
        showSchemas: false,
        showSecurity: false,
        showRateLimits: false,
        enableHistory: false,
        enableSaveRequests: false,
        autoFormatResponse: false,
        showResponseTime: false,
      };
      
      const result = ApiEndpointViewerComponentSchema.parse(viewer);
      expect(result.enableTesting).toBe(false);
      expect(result.showCodeExamples).toBe(false);
    });
  });
  
  // ==========================================
  // API Testing Playground Component Tests
  // ==========================================
  
  describe('ApiTestingPlaygroundComponent', () => {
    it('should validate a basic testing playground', () => {
      const playground = {
        type: 'api-testing-playground' as const,
      };
      
      const result = ApiTestingPlaygroundComponentSchema.parse(playground);
      expect(result.type).toBe('api-testing-playground');
    });
    
    it('should use default values', () => {
      const playground = {
        type: 'api-testing-playground' as const,
      };
      
      const result = ApiTestingPlaygroundComponentSchema.parse(playground);
      expect(result.enableEnvironments).toBe(true);
      expect(result.enableCollections).toBe(true);
      expect(result.enableHistory).toBe(true);
      expect(result.historyLimit).toBe(50);
      expect(result.enableAuthHelpers).toBe(true);
      expect(result.defaultTimeout).toBe(30000);
      expect(result.enableSslVerification).toBe(true);
      expect(result.enableProxy).toBe(false);
    });
    
    it('should validate request editor configuration', () => {
      const playground = {
        type: 'api-testing-playground' as const,
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
      };
      
      const result = ApiTestingPlaygroundComponentSchema.parse(playground);
      expect(result.requestEditor?.syntaxHighlighting).toBe(true);
      expect(result.requestEditor?.enableVariables).toBe(true);
      expect(result.requestEditor?.enablePreRequestScript).toBe(true);
    });
    
    it('should validate response viewer configuration', () => {
      const playground = {
        type: 'api-testing-playground' as const,
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
      };
      
      const result = ApiTestingPlaygroundComponentSchema.parse(playground);
      expect(result.responseViewer?.prettyPrint).toBe(true);
      expect(result.responseViewer?.enableCopy).toBe(true);
    });
    
    it('should validate history limit', () => {
      const playground = {
        type: 'api-testing-playground' as const,
        historyLimit: 100,
      };
      
      const result = ApiTestingPlaygroundComponentSchema.parse(playground);
      expect(result.historyLimit).toBe(100);
    });
    
    it('should validate timeout configuration', () => {
      const playground = {
        type: 'api-testing-playground' as const,
        defaultTimeout: 60000, // 1 minute
      };
      
      const result = ApiTestingPlaygroundComponentSchema.parse(playground);
      expect(result.defaultTimeout).toBe(60000);
    });
  });
  
  // ==========================================
  // API Documentation Viewer Component Tests
  // ==========================================
  
  describe('ApiDocumentationViewerComponent', () => {
    it('should validate a basic documentation viewer', () => {
      const docViewer = {
        type: 'api-documentation-viewer' as const,
      };
      
      const result = ApiDocumentationViewerComponentSchema.parse(docViewer);
      expect(result.type).toBe('api-documentation-viewer');
    });
    
    it('should use default values', () => {
      const docViewer = {
        type: 'api-documentation-viewer' as const,
      };
      
      const result = ApiDocumentationViewerComponentSchema.parse(docViewer);
      expect(result.style).toBe('swagger');
      expect(result.showToc).toBe(true);
      expect(result.showCodeExamples).toBe(true);
      expect(result.enableSearch).toBe(true);
      expect(result.theme).toBe('light');
    });
    
    it('should validate all documentation styles', () => {
      const styles: DocumentationStyle[] = [
        'swagger', 'redoc', 'slate', 'stoplight', 'custom'
      ];
      
      styles.forEach(style => {
        const docViewer = {
          type: 'api-documentation-viewer' as const,
          style,
        };
        
        const result = ApiDocumentationViewerComponentSchema.parse(docViewer);
        expect(result.style).toBe(style);
      });
    });
    
    it('should validate code languages configuration', () => {
      const docViewer = {
        type: 'api-documentation-viewer' as const,
        codeLanguages: ['typescript', 'python', 'ruby', 'php'],
      };
      
      const result = ApiDocumentationViewerComponentSchema.parse(docViewer);
      expect(result.codeLanguages).toHaveLength(4);
      expect(result.codeLanguages).toContain('ruby');
    });
    
    it('should validate all boolean options', () => {
      const docViewer = {
        type: 'api-documentation-viewer' as const,
        showToc: false,
        showCodeExamples: false,
        enableSearch: false,
        showAuthentication: false,
        showErrorCodes: false,
        showChangelog: false,
        expandModels: true,
        enableDeepLinking: false,
      };
      
      const result = ApiDocumentationViewerComponentSchema.parse(docViewer);
      expect(result.showToc).toBe(false);
      expect(result.expandModels).toBe(true);
    });
    
    it('should validate theme options', () => {
      const themes = ['light', 'dark', 'auto'] as const;
      
      themes.forEach(theme => {
        const docViewer = {
          type: 'api-documentation-viewer' as const,
          theme,
        };
        
        const result = ApiDocumentationViewerComponentSchema.parse(docViewer);
        expect(result.theme).toBe(theme);
      });
    });
  });
  
  // ==========================================
  // API Health Monitor Component Tests
  // ==========================================
  
  describe('ApiHealthMonitorComponent', () => {
    it('should validate a basic health monitor', () => {
      const monitor = {
        type: 'api-health-monitor' as const,
      };
      
      const result = ApiHealthMonitorComponentSchema.parse(monitor);
      expect(result.type).toBe('api-health-monitor');
    });
    
    it('should use default values', () => {
      const monitor = {
        type: 'api-health-monitor' as const,
      };
      
      const result = ApiHealthMonitorComponentSchema.parse(monitor);
      expect(result.displayMode).toBe('detailed-list');
      expect(result.refreshInterval).toBe(60);
      expect(result.showMetrics).toBe(true);
      expect(result.metricsTimeRange).toBe('24h');
    });
    
    it('should validate all display modes', () => {
      const modes: HealthDisplayMode[] = [
        'status-badge', 'detailed-list', 'dashboard', 'timeline'
      ];
      
      modes.forEach(mode => {
        const monitor = {
          type: 'api-health-monitor' as const,
          displayMode: mode,
        };
        
        const result = ApiHealthMonitorComponentSchema.parse(monitor);
        expect(result.displayMode).toBe(mode);
      });
    });
    
    it('should validate refresh interval', () => {
      const monitor = {
        type: 'api-health-monitor' as const,
        refreshInterval: 0, // Disabled
      };
      
      const result = ApiHealthMonitorComponentSchema.parse(monitor);
      expect(result.refreshInterval).toBe(0);
    });
    
    it('should validate time ranges', () => {
      const ranges = ['1h', '6h', '24h', '7d', '30d'] as const;
      
      ranges.forEach(range => {
        const monitor = {
          type: 'api-health-monitor' as const,
          metricsTimeRange: range,
        };
        
        const result = ApiHealthMonitorComponentSchema.parse(monitor);
        expect(result.metricsTimeRange).toBe(range);
      });
    });
    
    it('should validate alert thresholds', () => {
      const monitor = {
        type: 'api-health-monitor' as const,
        alertThresholds: {
          errorRate: 10,
          responseTime: 2000,
          uptime: 95,
        },
      };
      
      const result = ApiHealthMonitorComponentSchema.parse(monitor);
      expect(result.alertThresholds?.errorRate).toBe(10);
      expect(result.alertThresholds?.responseTime).toBe(2000);
      expect(result.alertThresholds?.uptime).toBe(95);
    });
  });
  
  // ==========================================
  // API Explorer Page Tests
  // ==========================================
  
  describe('ApiExplorerPage', () => {
    it('should validate a complete API Explorer page', () => {
      const page = {
        name: 'api_explorer',
        label: 'API Explorer',
        description: 'Explore and test ObjectStack APIs',
        layout: 'sidebar-main' as const,
        sidebar: {
          type: 'api-browser' as const,
          groupBy: 'type' as const,
          showSearch: true,
        },
        main: {
          type: 'api-endpoint-viewer' as const,
          enableTesting: true,
        },
        enableHealthMonitor: true,
        theme: 'light' as const,
      };
      
      const result = ApiExplorerPageSchema.parse(page);
      expect(result.name).toBe('api_explorer');
      expect(result.label).toBe('API Explorer');
      expect(result.layout).toBe('sidebar-main');
      expect(result.sidebar?.type).toBe('api-browser');
      expect(result.main?.type).toBe('api-endpoint-viewer');
    });
    
    it('should enforce snake_case naming convention', () => {
      const validNames = ['api_explorer', 'api_docs', 'rest_api_viewer'];
      
      validNames.forEach(name => {
        const page = {
          name,
          label: 'Test Page',
        };
        
        const result = ApiExplorerPageSchema.parse(page);
        expect(result.name).toBe(name);
      });
    });
    
    it('should reject invalid naming conventions', () => {
      const invalidNames = ['ApiExplorer', 'API Explorer', 'api-explorer', 'API_EXPLORER'];
      
      invalidNames.forEach(name => {
        const page = {
          name,
          label: 'Test Page',
        };
        
        expect(() => ApiExplorerPageSchema.parse(page)).toThrow();
      });
    });
    
    it('should validate all layout types', () => {
      const layouts: ApiExplorerLayout[] = [
        'sidebar-main', 'three-column', 'tabbed', 
        'split-horizontal', 'split-vertical', 'custom'
      ];
      
      layouts.forEach(layout => {
        const page = {
          name: 'test_page',
          label: 'Test Page',
          layout,
        };
        
        const result = ApiExplorerPageSchema.parse(page);
        expect(result.layout).toBe(layout);
      });
    });
    
    it('should validate with testing playground as main component', () => {
      const page = {
        name: 'api_tester',
        label: 'API Tester',
        layout: 'sidebar-main' as const,
        main: {
          type: 'api-testing-playground' as const,
          enableCollections: true,
        },
      };
      
      const result = ApiExplorerPageSchema.parse(page);
      expect(result.main?.type).toBe('api-testing-playground');
    });
    
    it('should validate with documentation viewer as main component', () => {
      const page = {
        name: 'api_docs',
        label: 'API Documentation',
        layout: 'sidebar-main' as const,
        main: {
          type: 'api-documentation-viewer' as const,
          style: 'redoc' as const,
        },
      };
      
      const result = ApiExplorerPageSchema.parse(page);
      expect(result.main?.type).toBe('api-documentation-viewer');
    });
    
    it('should validate health monitor configuration', () => {
      const page = {
        name: 'api_health',
        label: 'API Health',
        enableHealthMonitor: true,
        healthMonitor: {
          type: 'api-health-monitor' as const,
          displayMode: 'dashboard' as const,
          refreshInterval: 30,
        },
      };
      
      const result = ApiExplorerPageSchema.parse(page);
      expect(result.enableHealthMonitor).toBe(true);
      expect(result.healthMonitor?.displayMode).toBe('dashboard');
    });
    
    it('should validate default selections', () => {
      const page = {
        name: 'api_explorer',
        label: 'API Explorer',
        defaultApi: 'customer_api',
        defaultEndpoint: 'get_customer',
      };
      
      const result = ApiExplorerPageSchema.parse(page);
      expect(result.defaultApi).toBe('customer_api');
      expect(result.defaultEndpoint).toBe('get_customer');
    });
    
    it('should validate permissions', () => {
      const page = {
        name: 'admin_api_explorer',
        label: 'Admin API Explorer',
        requiredPermissions: ['api.read', 'api.execute', 'admin'],
      };
      
      const result = ApiExplorerPageSchema.parse(page);
      expect(result.requiredPermissions).toHaveLength(3);
      expect(result.requiredPermissions).toContain('admin');
    });
    
    it('should use default values for optional fields', () => {
      const page = {
        name: 'simple_explorer',
        label: 'Simple Explorer',
      };
      
      const result = ApiExplorerPageSchema.parse(page);
      expect(result.layout).toBe('sidebar-main');
      expect(result.theme).toBe('light');
      expect(result.showBreadcrumb).toBe(true);
      expect(result.enableKeyboardShortcuts).toBe(true);
      expect(result.enableHealthMonitor).toBe(false);
    });
  });
  
  // ==========================================
  // Factory Helper Tests
  // ==========================================
  
  describe('ApiExplorer Factory Helpers', () => {
    it('should create a page using factory', () => {
      const page = ApiExplorer.createPage({
        name: 'test_explorer',
        label: 'Test Explorer',
      });
      
      expect(page.name).toBe('test_explorer');
      expect(page.label).toBe('Test Explorer');
    });
    
    it('should create a browser using factory', () => {
      const browser = ApiExplorer.createBrowser({
        type: 'api-browser',
        groupBy: 'status',
      });
      
      expect(browser.type).toBe('api-browser');
      expect(browser.groupBy).toBe('status');
    });
    
    it('should create an endpoint viewer using factory', () => {
      const viewer = ApiExplorer.createEndpointViewer({
        type: 'api-endpoint-viewer',
        defaultMode: 'testing',
      });
      
      expect(viewer.type).toBe('api-endpoint-viewer');
      expect(viewer.defaultMode).toBe('testing');
    });
    
    it('should create a testing playground using factory', () => {
      const playground = ApiExplorer.createTestingPlayground({
        type: 'api-testing-playground',
        historyLimit: 100,
      });
      
      expect(playground.type).toBe('api-testing-playground');
      expect(playground.historyLimit).toBe(100);
    });
    
    it('should create a doc viewer using factory', () => {
      const docViewer = ApiExplorer.createDocViewer({
        type: 'api-documentation-viewer',
        style: 'redoc',
      });
      
      expect(docViewer.type).toBe('api-documentation-viewer');
      expect(docViewer.style).toBe('redoc');
    });
    
    it('should create a health monitor using factory', () => {
      const monitor = ApiExplorer.createHealthMonitor({
        type: 'api-health-monitor',
        displayMode: 'dashboard',
      });
      
      expect(monitor.type).toBe('api-health-monitor');
      expect(monitor.displayMode).toBe('dashboard');
    });
  });
  
  // ==========================================
  // Integration Tests
  // ==========================================
  
  describe('Integration Tests', () => {
    it('should create a complete Swagger UI-like page', () => {
      const swaggerPage = ApiExplorer.createPage({
        name: 'swagger_ui',
        label: 'Swagger UI',
        description: 'Swagger-style API documentation and testing',
        layout: 'sidebar-main',
        sidebar: {
          type: 'api-browser',
          groupBy: 'tag',
          showSearch: true,
          showFilters: true,
        },
        main: {
          type: 'api-endpoint-viewer',
          defaultMode: 'combined',
          enableTesting: true,
          showCodeExamples: true,
          codeLanguages: ['curl', 'javascript', 'python'],
        },
        theme: 'light',
      });
      
      expect(swaggerPage.name).toBe('swagger_ui');
      expect(swaggerPage.sidebar?.groupBy).toBe('tag');
      expect(swaggerPage.main?.type).toBe('api-endpoint-viewer');
    });
    
    it('should create a complete Postman-like page', () => {
      const postmanPage = ApiExplorer.createPage({
        name: 'api_tester',
        label: 'API Tester',
        description: 'Postman-style API testing interface',
        layout: 'sidebar-main',
        sidebar: {
          type: 'api-browser',
          groupBy: 'none',
          showSearch: true,
          enableDragDrop: true,
        },
        main: {
          type: 'api-testing-playground',
          enableEnvironments: true,
          enableCollections: true,
          enableHistory: true,
          historyLimit: 50,
          requestEditor: {
            enableVariables: true,
            autoCompleteHeaders: true,
          },
          responseViewer: {
            prettyPrint: true,
            syntaxHighlighting: true,
            enableCopy: true,
          },
        },
        theme: 'dark',
      });
      
      expect(postmanPage.name).toBe('api_tester');
      expect(postmanPage.theme).toBe('dark');
      expect(postmanPage.main?.type).toBe('api-testing-playground');
    });
    
    it('should create a ReDoc-style documentation page', () => {
      const redocPage = ApiExplorer.createPage({
        name: 'api_reference',
        label: 'API Reference',
        description: 'ReDoc-style API documentation',
        layout: 'sidebar-main',
        sidebar: {
          type: 'api-browser',
          groupBy: 'type',
          showSearch: true,
        },
        main: {
          type: 'api-documentation-viewer',
          style: 'redoc',
          showToc: true,
          showCodeExamples: true,
          enableSearch: true,
          codeLanguages: ['typescript', 'python', 'curl'],
        },
        theme: 'light',
      });
      
      expect(redocPage.name).toBe('api_reference');
      expect(redocPage.main?.type).toBe('api-documentation-viewer');
    });
    
    it('should create an API health monitoring dashboard', () => {
      const healthPage = ApiExplorer.createPage({
        name: 'api_health_dashboard',
        label: 'API Health Dashboard',
        description: 'Monitor API health and performance',
        layout: 'sidebar-main',
        sidebar: {
          type: 'api-browser',
          groupBy: 'status',
          defaultFilters: {
            statuses: ['active'],
          },
        },
        enableHealthMonitor: true,
        healthMonitor: {
          type: 'api-health-monitor',
          displayMode: 'dashboard',
          refreshInterval: 30,
          showMetrics: true,
          showAlerts: true,
          metricsTimeRange: '24h',
          alertThresholds: {
            errorRate: 5,
            responseTime: 1000,
            uptime: 99,
          },
        },
        theme: 'dark',
      });
      
      expect(healthPage.name).toBe('api_health_dashboard');
      expect(healthPage.enableHealthMonitor).toBe(true);
      expect(healthPage.healthMonitor?.displayMode).toBe('dashboard');
    });
  });
});

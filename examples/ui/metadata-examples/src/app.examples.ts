// @ts-nocheck
import { App } from '@objectstack/spec/ui';

/**
 * App Examples - Demonstrating ObjectStack App Protocol
 * 
 * Apps provide logical containers for business functionality with navigation and branding.
 * Inspired by Salesforce Lightning Apps and ServiceNow Applications.
 */

// ============================================================================
// BASIC APPS
// ============================================================================

/**
 * Example 1: Simple Sales CRM App
 * Basic sales application with essential objects
 * Use Case: Small teams, simple CRM needs
 */
export const SimpleSalesCrmApp: App = {
  name: 'simple_sales_crm',
  label: 'Sales CRM',
  description: 'Simple sales management application',
  version: '1.0.0',
  icon: 'briefcase',
  
  navigation: [
    {
      id: 'nav_home',
      type: 'page',
      label: 'Home',
      icon: 'home',
      pageName: 'sales_home',
    },
    {
      id: 'nav_leads',
      type: 'object',
      label: 'Leads',
      icon: 'users',
      objectName: 'lead',
    },
    {
      id: 'nav_accounts',
      type: 'object',
      label: 'Accounts',
      icon: 'building',
      objectName: 'account',
    },
    {
      id: 'nav_opportunities',
      type: 'object',
      label: 'Opportunities',
      icon: 'trending-up',
      objectName: 'opportunity',
    },
    {
      id: 'nav_dashboard',
      type: 'dashboard',
      label: 'Dashboard',
      icon: 'bar-chart',
      dashboardName: 'sales_dashboard',
    },
  ],
  
  branding: {
    primaryColor: '#4169E1',
    logo: '/assets/sales-logo.png',
  },
  
  active: true,
  isDefault: true,
};

/**
 * Example 2: Customer Service App
 * Support and service management application
 * Use Case: Customer support teams
 */
export const CustomerServiceApp: App = {
  name: 'customer_service',
  label: 'Customer Service',
  description: 'Support case and customer service management',
  version: '1.0.0',
  icon: 'headphones',
  
  navigation: [
    {
      id: 'nav_home',
      type: 'page',
      label: 'Service Console',
      icon: 'layout-dashboard',
      pageName: 'service_console',
    },
    {
      id: 'nav_cases',
      type: 'object',
      label: 'Cases',
      icon: 'inbox',
      objectName: 'case',
      viewName: 'my_open_cases',
    },
    {
      id: 'nav_accounts',
      type: 'object',
      label: 'Accounts',
      icon: 'building',
      objectName: 'account',
    },
    {
      id: 'nav_knowledge',
      type: 'object',
      label: 'Knowledge Base',
      icon: 'book-open',
      objectName: 'knowledge_article',
    },
    {
      id: 'nav_dashboard',
      type: 'dashboard',
      label: 'Service Metrics',
      icon: 'activity',
      dashboardName: 'service_dashboard',
    },
  ],
  
  branding: {
    primaryColor: '#10B981',
    logo: '/assets/service-logo.png',
  },
  
  active: true,
};

// ============================================================================
// ADVANCED APPS WITH HIERARCHICAL NAVIGATION
// ============================================================================

/**
 * Example 3: Comprehensive CRM App
 * Full-featured CRM with hierarchical navigation
 * Use Case: Large organizations, complex business processes
 */
export const ComprehensiveCrmApp: App = {
  name: 'crm_enterprise',
  label: 'CRM Enterprise',
  description: 'Comprehensive CRM with sales, service, and marketing',
  version: '2.0.0',
  icon: 'layers',
  
  navigation: [
    // Home
    {
      id: 'nav_home',
      type: 'page',
      label: 'Home',
      icon: 'home',
      pageName: 'crm_home',
    },
    
    // Sales Group
    {
      id: 'group_sales',
      type: 'group',
      label: 'Sales',
      icon: 'trending-up',
      expanded: true,
      children: [
        {
          id: 'nav_leads',
          type: 'object',
          label: 'Leads',
          icon: 'user-plus',
          objectName: 'lead',
        },
        {
          id: 'nav_accounts',
          type: 'object',
          label: 'Accounts',
          icon: 'building',
          objectName: 'account',
        },
        {
          id: 'nav_contacts',
          type: 'object',
          label: 'Contacts',
          icon: 'users',
          objectName: 'contact',
        },
        {
          id: 'nav_opportunities',
          type: 'object',
          label: 'Opportunities',
          icon: 'target',
          objectName: 'opportunity',
        },
        {
          id: 'nav_quotes',
          type: 'object',
          label: 'Quotes',
          icon: 'file-text',
          objectName: 'quote',
        },
        {
          id: 'nav_sales_dashboard',
          type: 'dashboard',
          label: 'Sales Dashboard',
          icon: 'bar-chart',
          dashboardName: 'sales_dashboard',
        },
      ],
    },
    
    // Service Group
    {
      id: 'group_service',
      type: 'group',
      label: 'Service',
      icon: 'headphones',
      expanded: false,
      children: [
        {
          id: 'nav_cases',
          type: 'object',
          label: 'Cases',
          icon: 'inbox',
          objectName: 'case',
        },
        {
          id: 'nav_knowledge',
          type: 'object',
          label: 'Knowledge',
          icon: 'book',
          objectName: 'knowledge_article',
        },
        {
          id: 'nav_service_dashboard',
          type: 'dashboard',
          label: 'Service Dashboard',
          icon: 'activity',
          dashboardName: 'service_dashboard',
        },
      ],
    },
    
    // Marketing Group
    {
      id: 'group_marketing',
      type: 'group',
      label: 'Marketing',
      icon: 'megaphone',
      expanded: false,
      children: [
        {
          id: 'nav_campaigns',
          type: 'object',
          label: 'Campaigns',
          icon: 'send',
          objectName: 'campaign',
        },
        {
          id: 'nav_email_templates',
          type: 'object',
          label: 'Email Templates',
          icon: 'mail',
          objectName: 'email_template',
        },
        {
          id: 'nav_marketing_dashboard',
          type: 'dashboard',
          label: 'Marketing Dashboard',
          icon: 'pie-chart',
          dashboardName: 'marketing_dashboard',
        },
      ],
    },
    
    // Analytics Group
    {
      id: 'group_analytics',
      type: 'group',
      label: 'Analytics',
      icon: 'bar-chart-2',
      expanded: false,
      children: [
        {
          id: 'nav_exec_dashboard',
          type: 'dashboard',
          label: 'Executive Dashboard',
          icon: 'trending-up',
          dashboardName: 'executive_dashboard',
        },
        {
          id: 'nav_reports',
          type: 'page',
          label: 'Reports',
          icon: 'file-bar-chart',
          pageName: 'reports_page',
        },
        {
          id: 'nav_forecasts',
          type: 'object',
          label: 'Forecasts',
          icon: 'calendar',
          objectName: 'forecast',
        },
      ],
    },
    
    // Settings Group
    {
      id: 'group_settings',
      type: 'group',
      label: 'Settings',
      icon: 'settings',
      expanded: false,
      children: [
        {
          id: 'nav_users',
          type: 'object',
          label: 'Users',
          icon: 'user',
          objectName: 'user',
          visible: 'user.role = "admin"',
        },
        {
          id: 'nav_teams',
          type: 'object',
          label: 'Teams',
          icon: 'users',
          objectName: 'team',
        },
        {
          id: 'nav_setup',
          type: 'page',
          label: 'Setup',
          icon: 'tool',
          pageName: 'setup_page',
          visible: 'user.role = "admin"',
        },
      ],
    },
  ],
  
  branding: {
    primaryColor: '#6366F1',
    logo: '/assets/crm-logo.png',
    favicon: '/assets/crm-favicon.ico',
  },
  
  active: true,
};

// ============================================================================
// SPECIALIZED APPS
// ============================================================================

/**
 * Example 4: Project Management App
 * Project and task management application
 * Use Case: Project teams, agile workflows
 */
export const ProjectManagementApp: App = {
  name: 'project_management',
  label: 'Project Manager',
  description: 'Project, sprint, and task management',
  version: '1.0.0',
  icon: 'folder',
  
  navigation: [
    {
      id: 'nav_home',
      type: 'page',
      label: 'My Dashboard',
      icon: 'home',
      pageName: 'project_home',
    },
    {
      id: 'group_planning',
      type: 'group',
      label: 'Planning',
      icon: 'calendar',
      children: [
        {
          id: 'nav_projects',
          type: 'object',
          label: 'Projects',
          icon: 'folder',
          objectName: 'project',
        },
        {
          id: 'nav_sprints',
          type: 'object',
          label: 'Sprints',
          icon: 'zap',
          objectName: 'sprint',
        },
        {
          id: 'nav_roadmap',
          type: 'page',
          label: 'Roadmap',
          icon: 'map',
          pageName: 'product_roadmap',
        },
      ],
    },
    {
      id: 'group_execution',
      type: 'group',
      label: 'Execution',
      icon: 'check-circle',
      children: [
        {
          id: 'nav_tasks',
          type: 'object',
          label: 'Tasks',
          icon: 'check-square',
          objectName: 'task',
          viewName: 'my_tasks',
        },
        {
          id: 'nav_kanban',
          type: 'object',
          label: 'Kanban Board',
          icon: 'columns',
          objectName: 'task',
          viewName: 'kanban_view',
        },
        {
          id: 'nav_issues',
          type: 'object',
          label: 'Issues',
          icon: 'alert-circle',
          objectName: 'issue',
        },
      ],
    },
    {
      id: 'group_reporting',
      type: 'group',
      label: 'Reporting',
      icon: 'bar-chart',
      children: [
        {
          id: 'nav_burndown',
          type: 'dashboard',
          label: 'Burndown Chart',
          icon: 'trending-down',
          dashboardName: 'sprint_burndown',
        },
        {
          id: 'nav_velocity',
          type: 'dashboard',
          label: 'Velocity',
          icon: 'activity',
          dashboardName: 'team_velocity',
        },
      ],
    },
  ],
  
  branding: {
    primaryColor: '#8B5CF6',
    logo: '/assets/pm-logo.png',
  },
  
  active: true,
};

/**
 * Example 5: HR Management App
 * Human resources and employee management
 * Use Case: HR departments, employee self-service
 */
export const HrManagementApp: App = {
  name: 'hr_management',
  label: 'HR Portal',
  description: 'Human resources and employee management',
  version: '1.0.0',
  icon: 'users',
  
  navigation: [
    {
      id: 'nav_home',
      type: 'page',
      label: 'My HR',
      icon: 'home',
      pageName: 'employee_portal',
    },
    {
      id: 'group_employees',
      type: 'group',
      label: 'Employees',
      icon: 'users',
      visible: 'user.department = "hr"',
      children: [
        {
          id: 'nav_employees',
          type: 'object',
          label: 'Employee Directory',
          icon: 'user',
          objectName: 'employee',
        },
        {
          id: 'nav_departments',
          type: 'object',
          label: 'Departments',
          icon: 'layers',
          objectName: 'department',
        },
        {
          id: 'nav_positions',
          type: 'object',
          label: 'Positions',
          icon: 'briefcase',
          objectName: 'position',
        },
      ],
    },
    {
      id: 'group_recruitment',
      type: 'group',
      label: 'Recruitment',
      icon: 'user-plus',
      visible: 'user.department = "hr"',
      children: [
        {
          id: 'nav_jobs',
          type: 'object',
          label: 'Job Openings',
          icon: 'clipboard',
          objectName: 'job_opening',
        },
        {
          id: 'nav_applications',
          type: 'object',
          label: 'Applications',
          icon: 'file-text',
          objectName: 'job_application',
        },
      ],
    },
    {
      id: 'group_time_off',
      type: 'group',
      label: 'Time Off',
      icon: 'calendar',
      children: [
        {
          id: 'nav_requests',
          type: 'object',
          label: 'Time Off Requests',
          icon: 'calendar-days',
          objectName: 'time_off_request',
        },
        {
          id: 'nav_my_balance',
          type: 'page',
          label: 'My Balance',
          icon: 'clock',
          pageName: 'time_off_balance',
        },
      ],
    },
    {
      id: 'nav_analytics',
      type: 'dashboard',
      label: 'HR Analytics',
      icon: 'bar-chart',
      dashboardName: 'hr_dashboard',
      visible: 'user.department = "hr"',
    },
  ],
  
  branding: {
    primaryColor: '#EC4899',
    logo: '/assets/hr-logo.png',
  },
  
  active: true,
};

// ============================================================================
// APPS WITH EXTERNAL LINKS
// ============================================================================

/**
 * Example 6: App with External Integrations
 * App that includes external tools and resources
 * Use Case: Mixed internal/external tools
 */
export const IntegratedWorkspaceApp: App = {
  name: 'integrated_workspace',
  label: 'Workspace',
  description: 'Integrated workspace with internal and external tools',
  version: '1.0.0',
  icon: 'grid',
  
  navigation: [
    {
      id: 'nav_home',
      type: 'page',
      label: 'Home',
      icon: 'home',
      pageName: 'workspace_home',
    },
    {
      id: 'group_internal',
      type: 'group',
      label: 'Internal Apps',
      icon: 'package',
      children: [
        {
          id: 'nav_tasks',
          type: 'object',
          label: 'Tasks',
          icon: 'check-square',
          objectName: 'task',
        },
        {
          id: 'nav_projects',
          type: 'object',
          label: 'Projects',
          icon: 'folder',
          objectName: 'project',
        },
      ],
    },
    {
      id: 'group_external',
      type: 'group',
      label: 'External Tools',
      icon: 'external-link',
      children: [
        {
          id: 'nav_slack',
          type: 'url',
          label: 'Slack',
          icon: 'message-square',
          url: 'https://slack.com/app',
          target: '_blank',
        },
        {
          id: 'nav_github',
          type: 'url',
          label: 'GitHub',
          icon: 'github',
          url: 'https://github.com/org/repos',
          target: '_blank',
        },
        {
          id: 'nav_docs',
          type: 'url',
          label: 'Documentation',
          icon: 'book-open',
          url: 'https://docs.example.com',
          target: '_blank',
        },
      ],
    },
  ],
  
  branding: {
    primaryColor: '#3B82F6',
    logo: '/assets/workspace-logo.png',
  },
  
  active: true,
};

// ============================================================================
// APP WITH PERMISSION-BASED NAVIGATION
// ============================================================================

/**
 * Example 7: App with Role-Based Access
 * App requiring specific permissions for access
 * Use Case: Secure apps, admin tools
 */
export const AdminApp: App = {
  name: 'admin_console',
  label: 'Admin Console',
  description: 'Administrative tools and settings',
  version: '1.0.0',
  icon: 'shield',
  
  navigation: [
    {
      id: 'nav_dashboard',
      type: 'dashboard',
      label: 'Overview',
      icon: 'layout-dashboard',
      dashboardName: 'admin_dashboard',
    },
    {
      id: 'group_users',
      type: 'group',
      label: 'User Management',
      icon: 'users',
      children: [
        {
          id: 'nav_users',
          type: 'object',
          label: 'Users',
          icon: 'user',
          objectName: 'user',
        },
        {
          id: 'nav_roles',
          type: 'object',
          label: 'Roles',
          icon: 'shield-check',
          objectName: 'role',
        },
        {
          id: 'nav_permissions',
          type: 'object',
          label: 'Permissions',
          icon: 'key',
          objectName: 'permission',
        },
      ],
    },
    {
      id: 'group_system',
      type: 'group',
      label: 'System',
      icon: 'settings',
      children: [
        {
          id: 'nav_audit_log',
          type: 'object',
          label: 'Audit Log',
          icon: 'file-text',
          objectName: 'audit_log',
        },
        {
          id: 'nav_integrations',
          type: 'object',
          label: 'Integrations',
          icon: 'plug',
          objectName: 'integration',
        },
        {
          id: 'nav_settings',
          type: 'page',
          label: 'System Settings',
          icon: 'sliders',
          pageName: 'system_settings',
        },
      ],
    },
  ],
  
  branding: {
    primaryColor: '#F59E0B',
    logo: '/assets/admin-logo.png',
  },
  
  active: true,
  requiredPermissions: ['app.access.admin'],
};

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export const AppExamples = {
  SimpleSalesCrmApp,
  CustomerServiceApp,
  ComprehensiveCrmApp,
  ProjectManagementApp,
  HrManagementApp,
  IntegratedWorkspaceApp,
  AdminApp,
};

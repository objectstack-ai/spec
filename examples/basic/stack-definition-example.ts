/**
 * Example: ObjectStack Definition with defineStack()
 * 
 * This example demonstrates the comprehensive stack definition using the defineStack() helper.
 * It shows how to define a complete ObjectStack project including:
 * - Manifest configuration
 * - Objects (Data Protocol)
 * - UI components (UI Protocol)
 * - Automation (Workflow Protocol)
 * - Security (Auth & Permission Protocol)
 * - AI Agents (AI Protocol)
 */

import { defineStack } from '@objectstack/spec';

/**
 * Example 1: Minimal Stack Definition
 * 
 * The simplest possible ObjectStack configuration.
 */
export const minimalStack = defineStack({
  manifest: {
    id: 'com.example.my-app',
    type: 'app',
    name: 'my-app',
    version: '1.0.0',
    description: 'Minimal ObjectStack application',
  },
});

/**
 * Example 2: Task Management Stack
 * 
 * A complete task management application with Objects, UI, and Workflows.
 */
export const taskManagementStack = defineStack({
  // ============================================================================
  // System Configuration
  // ============================================================================
  manifest: {
    id: 'com.example.task-manager',
    type: 'app',
    name: 'task-manager',
    version: '1.0.0',
    description: 'Task management application with ObjectStack',
  },

  // ============================================================================
  // Data Layer: Objects
  // ============================================================================
  objects: [
    {
      name: 'task',
      label: 'Task',
      labelPlural: 'Tasks',
      icon: 'check-square',
      description: 'Work items and to-dos',
      nameField: 'subject',
      
      enable: {
        apiEnabled: true,
        trackHistory: true,
      },

      fields: {
        subject: {
          type: 'text',
          label: 'Subject',
          description: 'Task title',
          required: true,
          maxLength: 255,
        },
        description: {
          type: 'textarea',
          label: 'Description',
          description: 'Detailed description',
          maxLength: 5000,
        },
        status: {
          type: 'select',
          label: 'Status',
          description: 'Current status',
          options: [
            { value: 'todo', label: 'To Do' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'done', label: 'Done' },
          ],
          defaultValue: 'todo',
        },
        priority: {
          type: 'select',
          label: 'Priority',
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ],
          defaultValue: 'medium',
        },
        due_date: {
          type: 'date',
          label: 'Due Date',
        },
        assigned_to: {
          type: 'lookup',
          label: 'Assigned To',
          reference: 'user',
        },
      },
    },
  ],

  // ============================================================================
  // UI Layer: Apps, Views, Dashboards
  // ============================================================================
  apps: [
    {
      name: 'task_manager',
      label: 'Task Manager',
      description: 'Manage your tasks',
      icon: 'clipboard-list',
      navigation: [
        {
          type: 'object',
          object: 'task',
          label: 'My Tasks',
          defaultView: 'my_tasks',
        },
        {
          type: 'dashboard',
          dashboard: 'task_overview',
          label: 'Overview',
        },
      ],
    },
  ],

  views: [
    {
      list: {
        type: 'grid',
        columns: ['subject', 'status', 'priority', 'due_date', 'assigned_to'],
        filter: {
          operator: 'AND',
          conditions: [
            {
              field: 'assigned_to',
              operator: 'equals',
              value: '$CurrentUser.id',
            },
          ],
        },
        sort: [
          { field: 'priority', direction: 'desc' },
          { field: 'due_date', direction: 'asc' },
        ],
      },
    },
  ],

  dashboards: [
    {
      name: 'task_overview',
      label: 'Task Overview',
      description: 'Task statistics and metrics',
      layout: {
        rows: 2,
        columns: 2,
      },
      widgets: [
        {
          type: 'metric',
          layout: { x: 0, y: 0, w: 6, h: 2 },
          title: 'Total Tasks',
          object: 'task',
          aggregate: 'count',
        },
        {
          type: 'pie',
          layout: { x: 6, y: 0, w: 6, h: 2 },
          title: 'Tasks by Status',
          object: 'task',
          categoryField: 'status',
          aggregate: 'count',
        },
      ],
    },
  ],

  // ============================================================================
  // Automation Layer: Workflows
  // ============================================================================
  workflows: [
    {
      name: 'notify_overdue_tasks',
      object: 'task',
      description: 'Notify users of overdue tasks',
      trigger: {
        type: 'scheduled',
        schedule: '0 9 * * *', // Daily at 9 AM
      },
      criteria: 'status != "done" && due_date < $Today',
      actions: [
        {
          type: 'email_alert',
          recipient: 'assigned_to',
          template: 'overdue_task_notification',
        },
      ],
    },
  ],

  // ============================================================================
  // Security Layer: Roles & Permissions
  // ============================================================================
  roles: [
    {
      name: 'task_manager',
      label: 'Task Manager',
      description: 'Can manage all tasks',
    },
    {
      name: 'task_user',
      label: 'Task User',
      description: 'Can manage own tasks',
    },
  ],
});

/**
 * Example 3: CRM Stack with AI Agent
 * 
 * A CRM system with an AI sales assistant.
 */
export const crmWithAIStack = defineStack({
  manifest: {
    id: 'com.example.ai-crm',
    type: 'app',
    name: 'ai-crm',
    version: '1.0.0',
    description: 'CRM with AI-powered sales assistant',
  },

  // Objects
  objects: [
    {
      name: 'account',
      label: 'Account',
      labelPlural: 'Accounts',
      icon: 'building',
      nameField: 'name',
      enable: {
        apiEnabled: true,
        trackHistory: true,
      },
      fields: {
        name: {
          type: 'text',
          label: 'Account Name',
          required: true,
        },
        industry: {
          type: 'select',
          label: 'Industry',
          options: [
            { value: 'technology', label: 'Technology' },
            { value: 'finance', label: 'Finance' },
            { value: 'healthcare', label: 'Healthcare' },
          ],
        },
        annual_revenue: {
          type: 'currency',
          label: 'Annual Revenue',
        },
      },
    },
    {
      name: 'opportunity',
      label: 'Opportunity',
      labelPlural: 'Opportunities',
      icon: 'target',
      nameField: 'name',
      enable: {
        apiEnabled: true,
        trackHistory: true,
      },
      fields: {
        name: {
          type: 'text',
          label: 'Opportunity Name',
          required: true,
        },
        account: {
          type: 'lookup',
          label: 'Account',
          reference: 'account',
        },
        amount: {
          type: 'currency',
          label: 'Amount',
        },
        stage: {
          type: 'select',
          label: 'Stage',
          options: [
            { value: 'prospecting', label: 'Prospecting' },
            { value: 'qualification', label: 'Qualification' },
            { value: 'proposal', label: 'Proposal' },
            { value: 'negotiation', label: 'Negotiation' },
            { value: 'closed_won', label: 'Closed Won' },
            { value: 'closed_lost', label: 'Closed Lost' },
          ],
          defaultValue: 'prospecting',
        },
        close_date: {
          type: 'date',
          label: 'Expected Close Date',
        },
      },
    },
  ],

  // AI Agent
  agents: [
    {
      name: 'sales_assistant',
      label: 'Sales Assistant',
      role: 'Sales Operations Assistant',
      
      instructions: `You are a helpful sales assistant with access to the CRM system.
You can help users:
- Find and analyze account and opportunity data
- Create new opportunities
- Update deal stages
- Provide sales insights and forecasts

Always be professional and data-driven in your responses.`,

      tools: [
        {
          name: 'search_accounts',
          description: 'Search for accounts by name or industry',
          type: 'query',
        },
        {
          name: 'get_opportunity_pipeline',
          description: 'Get pipeline statistics by stage',
          type: 'query',
        },
        {
          name: 'create_opportunity',
          description: 'Create a new sales opportunity',
          type: 'action',
        },
      ],
    },
  ],

  // Apps
  apps: [
    {
      name: 'sales_app',
      label: 'Sales',
      description: 'Sales CRM Application',
      icon: 'briefcase',
      navigation: [
        {
          type: 'object',
          object: 'account',
          label: 'Accounts',
        },
        {
          type: 'object',
          object: 'opportunity',
          label: 'Opportunities',
        },
        {
          type: 'custom',
          label: 'AI Assistant',
          component: 'ChatInterface',
          componentProps: {
            agent: 'sales_assistant',
          },
        },
      ],
    },
  ],
});

/**
 * Example 4: Using Stack Definition
 * 
 * How to use the stack definition in your application.
 */
export function demonstrateStackUsage() {
  // TypeScript knows the exact structure
  console.log('App Name:', taskManagementStack.manifest.name);
  console.log('Objects:', taskManagementStack.objects?.length);
  console.log('Apps:', taskManagementStack.apps?.length);

  // Access specific objects
  const taskObject = taskManagementStack.objects?.[0];
  if (taskObject) {
    console.log('Task Object:', taskObject.name);
    console.log('Task Fields:', taskObject.fields.length);
  }

  // Access AI agents
  const agent = crmWithAIStack.agents?.[0];
  if (agent) {
    console.log('AI Agent:', agent.name);
    console.log('Capabilities:', agent.capabilities);
  }
}

// Run demonstration (uncomment to run)
// demonstrateStackUsage();

// ============================================================================
// Export for use
// ============================================================================
export default {
  minimalStack,
  taskManagementStack,
  crmWithAIStack,
};

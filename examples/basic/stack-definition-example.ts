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
    name: 'task-manager',
    version: '1.0.0',
    description: 'Task management application with ObjectStack',
    author: 'Your Name',
    license: 'MIT',
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

      fields: [
        {
          name: 'subject',
          type: 'text',
          label: 'Subject',
          description: 'Task title',
          required: true,
          maxLength: 255,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          description: 'Detailed description',
          maxLength: 5000,
        },
        {
          name: 'status',
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
        {
          name: 'priority',
          type: 'select',
          label: 'Priority',
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ],
          defaultValue: 'medium',
        },
        {
          name: 'due_date',
          type: 'date',
          label: 'Due Date',
        },
        {
          name: 'assigned_to',
          type: 'lookup',
          label: 'Assigned To',
          reference: {
            object: 'user',
            field: 'id',
          },
        },
      ],
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
      name: 'my_tasks',
      object: 'task',
      type: 'list',
      label: 'My Tasks',
      listType: 'grid',
      fields: ['subject', 'status', 'priority', 'due_date', 'assigned_to'],
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
          position: { row: 0, col: 0 },
          title: 'Total Tasks',
          dataSource: {
            type: 'aggregation',
            object: 'task',
            aggregation: 'count',
          },
        },
        {
          type: 'chart',
          position: { row: 0, col: 1 },
          title: 'Tasks by Status',
          chartType: 'pie',
          dataSource: {
            type: 'groupBy',
            object: 'task',
            groupBy: 'status',
            aggregation: 'count',
          },
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
      criteria: {
        operator: 'AND',
        conditions: [
          {
            field: 'status',
            operator: 'notEquals',
            value: 'done',
          },
          {
            field: 'due_date',
            operator: 'lessThan',
            value: '$Today',
          },
        ],
      },
      actions: [
        {
          type: 'emailAlert',
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
      permissions: {
        task: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
      },
    },
    {
      name: 'task_user',
      label: 'Task User',
      description: 'Can manage own tasks',
      permissions: {
        task: {
          create: true,
          read: true,
          update: {
            condition: {
              field: 'assigned_to',
              operator: 'equals',
              value: '$CurrentUser.id',
            },
          },
          delete: false,
        },
      },
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
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Account Name',
          required: true,
        },
        {
          name: 'industry',
          type: 'select',
          label: 'Industry',
          options: [
            { value: 'technology', label: 'Technology' },
            { value: 'finance', label: 'Finance' },
            { value: 'healthcare', label: 'Healthcare' },
          ],
        },
        {
          name: 'annual_revenue',
          type: 'currency',
          label: 'Annual Revenue',
        },
      ],
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
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Opportunity Name',
          required: true,
        },
        {
          name: 'account',
          type: 'lookup',
          label: 'Account',
          reference: {
            object: 'account',
            field: 'id',
          },
        },
        {
          name: 'amount',
          type: 'currency',
          label: 'Amount',
        },
        {
          name: 'stage',
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
        {
          name: 'close_date',
          type: 'date',
          label: 'Expected Close Date',
        },
      ],
    },
  ],

  // AI Agent
  agents: [
    {
      name: 'sales_assistant',
      type: 'conversational',
      label: 'Sales Assistant',
      description: 'AI assistant for sales operations',
      
      capabilities: {
        objectAccess: ['account', 'opportunity'],
        canCreate: true,
        canUpdate: true,
        canAnalyze: true,
      },

      systemPrompt: `You are a helpful sales assistant with access to the CRM system.
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
          parameters: {
            query: 'string',
            industry: 'string?',
          },
        },
        {
          name: 'get_opportunity_pipeline',
          description: 'Get pipeline statistics by stage',
        },
        {
          name: 'create_opportunity',
          description: 'Create a new sales opportunity',
          parameters: {
            name: 'string',
            account: 'string',
            amount: 'number',
            stage: 'string',
          },
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

// ============================================================================
// Export for use
// ============================================================================
export default {
  minimalStack,
  taskManagementStack,
  crmWithAIStack,
};

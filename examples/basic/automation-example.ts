/**
 * Example: Automation Protocol - Workflows & Approvals
 * 
 * This example demonstrates automation capabilities in ObjectStack:
 * - Workflow rules (event-driven automation)
 * - Approval processes (multi-step approvals)
 * - Screen flows (visual automation)
 * - ETL processes (data integration)
 */

import type {
  WorkflowRule,
  ApprovalProcess,
  Flow,
  ETLPipeline,
} from '@objectstack/spec';

/**
 * Example 1: Field Update Workflow
 * 
 * Automatically update fields when conditions are met
 */
export const fieldUpdateWorkflows: WorkflowRule[] = [
  {
    name: 'set_opportunity_probability',
    object: 'opportunity',
    description: 'Automatically set probability based on stage',
    
    // When to trigger
    trigger: {
      type: 'fieldChange',
      fields: ['stage'],
    },
    
    // Conditions to check
    criteria: {
      operator: 'ALWAYS', // Run for all records
    },
    
    // What to do
    actions: [
      {
        type: 'fieldUpdate',
        updates: [
          {
            field: 'probability',
            value: {
              formula: `
                CASE stage
                  WHEN 'prospecting' THEN 10
                  WHEN 'qualification' THEN 25
                  WHEN 'proposal' THEN 50
                  WHEN 'negotiation' THEN 75
                  WHEN 'closed_won' THEN 100
                  WHEN 'closed_lost' THEN 0
                  ELSE 0
                END
              `,
            },
          },
        ],
      },
    ],
  },

  {
    name: 'update_account_rating',
    object: 'account',
    description: 'Update account rating based on revenue',
    
    trigger: {
      type: 'fieldChange',
      fields: ['annual_revenue'],
    },
    
    criteria: {
      operator: 'AND',
      conditions: [
        {
          field: 'annual_revenue',
          operator: 'greaterThan',
          value: 0,
        },
      ],
    },
    
    actions: [
      {
        type: 'fieldUpdate',
        updates: [
          {
            field: 'rating',
            value: {
              formula: `
                CASE
                  WHEN annual_revenue > 10000000 THEN 'hot'
                  WHEN annual_revenue > 1000000 THEN 'warm'
                  ELSE 'cold'
                END
              `,
            },
          },
        ],
      },
    ],
  },
];

/**
 * Example 2: Email Alert Workflows
 * 
 * Send notifications when events occur
 */
export const emailAlertWorkflows: WorkflowRule[] = [
  {
    name: 'notify_manager_large_opportunity',
    object: 'opportunity',
    description: 'Notify manager when large opportunity is created',
    
    trigger: {
      type: 'onCreate',
    },
    
    criteria: {
      operator: 'AND',
      conditions: [
        {
          field: 'amount',
          operator: 'greaterThan',
          value: 100000,
        },
      ],
    },
    
    actions: [
      {
        type: 'emailAlert',
        template: 'large_opportunity_alert',
        recipients: [
          {
            type: 'field',
            field: 'owner.manager.email',
          },
          {
            type: 'role',
            role: 'sales_director',
          },
        ],
        subject: 'Large Opportunity Created: {{name}}',
        body: `
          A large opportunity has been created:
          
          Name: {{name}}
          Amount: {{amount | currency}}
          Owner: {{owner.name}}
          Expected Close: {{close_date | date}}
          
          Please review and approve.
        `,
      },
    ],
  },

  {
    name: 'notify_overdue_tasks',
    object: 'task',
    description: 'Daily notification for overdue tasks',
    
    trigger: {
      type: 'scheduled',
      schedule: '0 9 * * *', // Daily at 9 AM (cron format)
    },
    
    criteria: {
      operator: 'AND',
      conditions: [
        {
          field: 'status',
          operator: 'notEquals',
          value: 'completed',
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
        template: 'overdue_task_reminder',
        recipients: [
          {
            type: 'field',
            field: 'assigned_to.email',
          },
        ],
        subject: 'Overdue Task: {{subject}}',
        body: `
          You have an overdue task:
          
          Subject: {{subject}}
          Due Date: {{due_date | date}}
          Priority: {{priority}}
          
          Please update the status or due date.
        `,
      },
    ],
  },
];

/**
 * Example 3: Task Creation Workflows
 * 
 * Automatically create related records
 */
export const taskCreationWorkflows: WorkflowRule[] = [
  {
    name: 'create_followup_tasks',
    object: 'lead',
    description: 'Create follow-up tasks when lead is created',
    
    trigger: {
      type: 'onCreate',
    },
    
    criteria: {
      operator: 'AND',
      conditions: [
        {
          field: 'status',
          operator: 'equals',
          value: 'new',
        },
      ],
    },
    
    actions: [
      {
        type: 'createRecord',
        object: 'task',
        values: {
          subject: 'Initial Contact - {{name}}',
          description: 'Make initial contact with lead',
          due_date: '$Today + 1',
          priority: 'high',
          assigned_to: '{{owner}}',
          related_to: '{{id}}',
        },
      },
      {
        type: 'createRecord',
        object: 'task',
        values: {
          subject: 'Qualification Call - {{name}}',
          description: 'Schedule qualification call',
          due_date: '$Today + 3',
          priority: 'medium',
          assigned_to: '{{owner}}',
          related_to: '{{id}}',
        },
      },
    ],
  },
];

/**
 * Example 4: Approval Process
 * 
 * Multi-step approval workflow for discounts
 */
export const discountApprovalProcess: ApprovalProcess = {
  name: 'opportunity_discount_approval',
  object: 'opportunity',
  description: 'Approval process for opportunity discounts',
  
  // When to trigger approval
  entryCriteria: {
    operator: 'AND',
    conditions: [
      {
        field: 'discount_percent',
        operator: 'greaterThan',
        value: 0,
      },
    ],
  },
  
  // Approval steps (sequential)
  steps: [
    {
      name: 'manager_approval',
      label: 'Manager Approval',
      description: 'Requires manager approval for discounts up to 20%',
      
      // When this step applies
      stepCriteria: {
        operator: 'AND',
        conditions: [
          {
            field: 'discount_percent',
            operator: 'lessOrEqual',
            value: 20,
          },
        ],
      },
      
      // Who can approve
      approvers: [
        {
          type: 'field',
          field: 'owner.manager',
        },
      ],
      
      // Approval actions
      approvalActions: [
        {
          type: 'fieldUpdate',
          updates: [
            {
              field: 'approval_status',
              value: 'approved',
            },
          ],
        },
      ],
      
      // Rejection actions
      rejectionActions: [
        {
          type: 'fieldUpdate',
          updates: [
            {
              field: 'approval_status',
              value: 'rejected',
            },
            {
              field: 'discount_percent',
              value: 0,
            },
          ],
        },
      ],
    },
    
    {
      name: 'director_approval',
      label: 'Director Approval',
      description: 'Requires director approval for discounts over 20%',
      
      stepCriteria: {
        operator: 'AND',
        conditions: [
          {
            field: 'discount_percent',
            operator: 'greaterThan',
            value: 20,
          },
        ],
      },
      
      approvers: [
        {
          type: 'role',
          role: 'sales_director',
        },
      ],
      
      approvalActions: [
        {
          type: 'fieldUpdate',
          updates: [
            {
              field: 'approval_status',
              value: 'approved',
            },
          ],
        },
        {
          type: 'emailAlert',
          template: 'discount_approved',
          recipients: [
            {
              type: 'field',
              field: 'owner.email',
            },
          ],
        },
      ],
      
      rejectionActions: [
        {
          type: 'fieldUpdate',
          updates: [
            {
              field: 'approval_status',
              value: 'rejected',
            },
            {
              field: 'discount_percent',
              value: 0,
            },
          ],
        },
        {
          type: 'emailAlert',
          template: 'discount_rejected',
          recipients: [
            {
              type: 'field',
              field: 'owner.email',
            },
          ],
        },
      ],
    },
  ],
  
  // Final approval actions
  finalApprovalActions: [
    {
      type: 'fieldUpdate',
      updates: [
        {
          field: 'approved_discount',
          value: '{{discount_percent}}',
        },
      ],
    },
  ],
  
  // Final rejection actions
  finalRejectionActions: [
    {
      type: 'fieldUpdate',
      updates: [
        {
          field: 'discount_percent',
          value: 0,
        },
      ],
    },
  ],
};

/**
 * Example 5: Screen Flow
 * 
 * Visual automation with user interaction
 */
export const leadConversionFlow: Flow = {
  name: 'lead_conversion',
  type: 'screen',
  label: 'Convert Lead',
  description: 'Guide users through lead conversion process',
  
  // Entry point
  startElement: 'welcome_screen',
  
  // Flow elements
  elements: [
    {
      name: 'welcome_screen',
      type: 'screen',
      label: 'Convert Lead to Opportunity',
      
      fields: [
        {
          name: 'opportunity_name',
          type: 'text',
          label: 'Opportunity Name',
          required: true,
          defaultValue: '{{Lead.company}} - {{Lead.product_interest}}',
        },
        {
          name: 'amount',
          type: 'currency',
          label: 'Expected Amount',
          required: true,
        },
        {
          name: 'close_date',
          type: 'date',
          label: 'Expected Close Date',
          required: true,
        },
      ],
      
      nextElement: 'create_records',
    },
    
    {
      name: 'create_records',
      type: 'recordCreate',
      label: 'Create Account and Opportunity',
      
      creates: [
        {
          object: 'account',
          values: {
            name: '{{Lead.company}}',
            phone: '{{Lead.phone}}',
            website: '{{Lead.website}}',
          },
          assignTo: 'accountId',
        },
        {
          object: 'contact',
          values: {
            first_name: '{{Lead.first_name}}',
            last_name: '{{Lead.last_name}}',
            email: '{{Lead.email}}',
            account: '{{accountId}}',
          },
          assignTo: 'contactId',
        },
        {
          object: 'opportunity',
          values: {
            name: '{{opportunity_name}}',
            amount: '{{amount}}',
            close_date: '{{close_date}}',
            account: '{{accountId}}',
            stage: 'qualification',
          },
          assignTo: 'opportunityId',
        },
      ],
      
      nextElement: 'update_lead',
    },
    
    {
      name: 'update_lead',
      type: 'recordUpdate',
      label: 'Mark Lead as Converted',
      
      object: 'lead',
      recordId: '{{Lead.id}}',
      values: {
        status: 'converted',
        converted_account: '{{accountId}}',
        converted_opportunity: '{{opportunityId}}',
        converted_date: '$Now',
      },
      
      nextElement: 'success_screen',
    },
    
    {
      name: 'success_screen',
      type: 'screen',
      label: 'Conversion Successful',
      
      message: `
        Lead converted successfully!
        
        Created:
        - Account: {{Account.name}}
        - Contact: {{Contact.name}}
        - Opportunity: {{Opportunity.name}}
      `,
      
      buttons: [
        {
          label: 'View Opportunity',
          action: 'navigate',
          target: '/opportunities/{{opportunityId}}',
        },
        {
          label: 'Close',
          action: 'finish',
        },
      ],
    },
  ],
};

/**
 * Example 6: ETL Pipeline
 * 
 * Data integration and transformation
 */
export const dailyLeadImportETL: ETLPipeline = {
  name: 'daily_lead_import',
  description: 'Import leads from external system daily',
  
  // Schedule
  schedule: '0 2 * * *', // Daily at 2 AM
  
  // Extract
  extract: {
    source: {
      type: 'api',
      endpoint: 'https://marketing.example.com/api/leads',
      method: 'GET',
      authentication: {
        type: 'apiKey',
        header: 'X-API-Key',
        key: '$Env.MARKETING_API_KEY',
      },
    },
    
    // Incremental load
    incrementalField: 'created_at',
    lastRunTimestamp: true,
  },
  
  // Transform
  transform: [
    {
      type: 'fieldMapping',
      mappings: [
        { source: 'firstName', target: 'first_name' },
        { source: 'lastName', target: 'last_name' },
        { source: 'emailAddress', target: 'email' },
        { source: 'phoneNumber', target: 'phone' },
        { source: 'companyName', target: 'company' },
      ],
    },
    {
      type: 'fieldTransform',
      transforms: [
        {
          field: 'status',
          value: {
            formula: `
              CASE source
                WHEN 'web' THEN 'new'
                WHEN 'event' THEN 'contacted'
                ELSE 'unqualified'
              END
            `,
          },
        },
      ],
    },
    {
      type: 'deduplication',
      matchFields: ['email'],
      strategy: 'skip', // or 'update', 'merge'
    },
  ],
  
  // Load
  load: {
    target: {
      object: 'lead',
    },
    
    // Error handling
    onError: {
      strategy: 'continue', // or 'stop'
      logErrors: true,
      notifyOnFailure: true,
      notificationRecipients: ['admin@example.com'],
    },
  },
  
  // Post-processing
  postProcess: [
    {
      type: 'workflow',
      workflow: 'assign_leads_to_reps',
    },
  ],
};

/**
 * Example 7: Usage Demonstration
 */
export function demonstrateAutomation() {
  console.log('=== Automation Examples ===\n');

  console.log('1. Field Update Workflows:');
  console.log(`   - ${fieldUpdateWorkflows.length} rules configured`);
  console.log(`   - Example: "${fieldUpdateWorkflows[0].description}"`);
  console.log('');

  console.log('2. Email Alert Workflows:');
  console.log(`   - ${emailAlertWorkflows.length} alert rules`);
  console.log(`   - Example: "${emailAlertWorkflows[0].description}"`);
  console.log('');

  console.log('3. Approval Process:');
  console.log(`   - Name: ${discountApprovalProcess.name}`);
  console.log(`   - Steps: ${discountApprovalProcess.steps?.length || 0}`);
  console.log(`   - Description: "${discountApprovalProcess.description}"`);
  console.log('');

  console.log('4. Screen Flow:');
  console.log(`   - Name: ${leadConversionFlow.name}`);
  console.log(`   - Elements: ${leadConversionFlow.elements?.length || 0}`);
  console.log(`   - Type: ${leadConversionFlow.type}`);
  console.log('');

  console.log('5. ETL Process:');
  console.log(`   - Name: ${dailyLeadImportETL.name}`);
  console.log(`   - Schedule: ${dailyLeadImportETL.schedule}`);
  console.log(`   - Source: ${dailyLeadImportETL.extract?.source.type}`);
}

// Run demonstration (uncomment to run)
// demonstrateAutomation();

// Export all examples
export default {
  fieldUpdateWorkflows,
  emailAlertWorkflows,
  taskCreationWorkflows,
  discountApprovalProcess,
  leadConversionFlow,
  dailyLeadImportETL,
};

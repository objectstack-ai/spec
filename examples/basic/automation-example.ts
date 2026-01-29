/**
 * Example: Automation Protocol - Workflows & Approvals
 * 
 * This example demonstrates automation capabilities in ObjectStack:
 * - Workflow rules (event-driven automation)
 * - Approval processes (multi-step approvals)
 * - Screen flows (visual automation)
 * - ETL processes (data integration)
 */

import type { Automation } from '@objectstack/spec';

/**
 * Example 1: Field Update Workflow
 * 
 * Automatically update fields when conditions are met
 */
export const fieldUpdateWorkflows: Automation.WorkflowRule[] = [
  {
    name: 'set_opportunity_probability',
    objectName: 'opportunity',
    active: true,
    reevaluateOnChange: false,
    
    // When to trigger
    triggerType: 'on_update',
    
    // Conditions to check
    criteria: 'true', // Run for all records
    
    // What to do
    actions: [
      {
        name: 'update_probability',
        type: 'field_update',
        field: 'probability',
        value: `
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
    ],
  },

  {
    name: 'update_account_rating',
    objectName: 'account',
    active: true,
    reevaluateOnChange: false,
    
    triggerType: 'on_update',
    
    criteria: 'annual_revenue > 0',
    
    actions: [
      {
        name: 'update_rating',
        type: 'field_update',
        field: 'rating',
        value: `
          CASE
            WHEN annual_revenue > 10000000 THEN 'hot'
            WHEN annual_revenue > 1000000 THEN 'warm'
            ELSE 'cold'
          END
        `,
      },
    ],
  },
];

/**
 * Example 2: Email Alert Workflows
 * 
 * Send notifications when events occur
 */
export const emailAlertWorkflows: Automation.WorkflowRule[] = [
  {
    name: 'notify_manager_large_opportunity',
    objectName: 'opportunity',
    active: true,
    reevaluateOnChange: false,
    
    triggerType: 'on_create',
    
    criteria: 'amount > 100000',
    
    actions: [
      {
        name: 'notify_manager',
        type: 'email_alert',
        template: 'large_opportunity_alert',
        recipients: ['owner.manager.email', 'role:sales_director'],
      },
    ],
  },

  {
    name: 'notify_overdue_tasks',
    objectName: 'task',
    active: true,
    reevaluateOnChange: false,
    
    triggerType: 'schedule',
    
    criteria: 'status != "completed" && due_date < $Today',
    
    actions: [
      {
        name: 'send_overdue_reminder',
        type: 'email_alert',
        template: 'overdue_task_reminder',
        recipients: ['assigned_to.email'],
      },
    ],
  },
];

/**
 * Example 3: Task Creation Workflows
 * 
 * Automatically create related records
 */
export const taskCreationWorkflows: Automation.WorkflowRule[] = [
  {
    name: 'create_followup_tasks',
    objectName: 'lead',
    active: true,
    reevaluateOnChange: false,
    
    triggerType: 'on_create',
    
    criteria: 'status == "new"',
    
    actions: [
      {
        name: 'create_initial_contact_task',
        type: 'task_creation',
        taskObject: 'task',
        subject: 'Initial Contact - {{name}}',
        description: 'Make initial contact with lead',
        dueDate: '$Today + 1',
        priority: 'high',
        assignedTo: '{{owner}}',
        relatedTo: '{{id}}',
      },
      {
        name: 'create_qualification_task',
        type: 'task_creation',
        taskObject: 'task',
        subject: 'Qualification Call - {{name}}',
        description: 'Schedule qualification call',
        dueDate: '$Today + 3',
        priority: 'medium',
        assignedTo: '{{owner}}',
        relatedTo: '{{id}}',
      },
    ],
  },
];

/**
 * Example 4: Approval Process
 * 
 * Multi-step approval workflow for discounts
 */
export const discountApprovalProcess: Automation.ApprovalProcess = {
  name: 'opportunity_discount_approval',
  label: 'Opportunity Discount Approval',
  object: 'opportunity',
  description: 'Approval process for opportunity discounts',
  active: true,
  lockRecord: true,
  
  // When to trigger approval
  entryCriteria: 'discount_percent > 0',
  
  // Approval steps (sequential)
  steps: [
    {
      name: 'manager_approval',
      label: 'Manager Approval',
      description: 'Requires manager approval for discounts up to 20%',
      behavior: 'first_response',
      rejectionBehavior: 'reject_process',
      
      // When this step applies
      entryCriteria: 'discount_percent <= 20',
      
      // Who can approve
      approvers: [
        {
          type: 'field',
          value: 'owner.manager',
        },
      ],
      
      // Approval actions
      onApprove: [
        {
          type: 'field_update',
          name: 'set_approved',
          config: {
            field: 'approval_status',
            value: 'approved',
          },
        },
      ],
      
      // Rejection actions
      onReject: [
        {
          type: 'field_update',
          name: 'set_rejected',
          config: {
            field: 'approval_status',
            value: 'rejected',
          },
        },
        {
          type: 'field_update',
          name: 'clear_discount',
          config: {
            field: 'discount_percent',
            value: 0,
          },
        },
      ],
    },
    
    {
      name: 'director_approval',
      label: 'Director Approval',
      description: 'Requires director approval for discounts over 20%',
      behavior: 'first_response',
      rejectionBehavior: 'reject_process',
      
      entryCriteria: 'discount_percent > 20',
      
      approvers: [
        {
          type: 'role',
          value: 'sales_director',
        },
      ],
      
      onApprove: [
        {
          type: 'field_update',
          name: 'set_approved',
          config: {
            field: 'approval_status',
            value: 'approved',
          },
        },
        {
          type: 'email_alert',
          name: 'notify_owner_approval',
          config: {
            template: 'discount_approved',
            recipients: ['owner.email'],
          },
        },
      ],
      
      onReject: [
        {
          type: 'field_update',
          name: 'set_rejected',
          config: {
            field: 'approval_status',
            value: 'rejected',
          },
        },
        {
          type: 'field_update',
          name: 'clear_discount',
          config: {
            field: 'discount_percent',
            value: 0,
          },
        },
        {
          type: 'email_alert',
          name: 'notify_owner_rejection',
          config: {
            template: 'discount_rejected',
            recipients: ['owner.email'],
          },
        },
      ],
    },
  ],
  
  // Final approval actions
  onFinalApprove: [
    {
      type: 'field_update',
      name: 'save_approved_discount',
      config: {
        field: 'approved_discount',
        value: '{{discount_percent}}',
      },
    },
  ],
  
  // Final rejection actions
  onFinalReject: [
    {
      type: 'field_update',
      name: 'clear_discount',
      config: {
        field: 'discount_percent',
        value: 0,
      },
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
  console.log(`   - Example: "${fieldUpdateWorkflows[0].name}"`);
  console.log('');

  console.log('2. Email Alert Workflows:');
  console.log(`   - ${emailAlertWorkflows.length} alert rules`);
  console.log(`   - Example: "${emailAlertWorkflows[0].name}"`);
  console.log('');

  console.log('3. Approval Process:');
  console.log(`   - Name: ${discountApprovalProcess.name}`);
  console.log(`   - Steps: ${discountApprovalProcess.steps?.length || 0}`);
  console.log(`   - Description: "${discountApprovalProcess.description || 'N/A'}"`);
  console.log('');
}

// Run demonstration (uncomment to run)
// demonstrateAutomation();

// Export all examples
export default {
  fieldUpdateWorkflows,
  emailAlertWorkflows,
  taskCreationWorkflows,
  discountApprovalProcess,
};

import { z } from 'zod';

/**
 * Trigger events for workflow automation
 */
export const WorkflowTriggerType = z.enum([
  'on_create',               // When record is created
  'on_update',               // When record is updated
  'on_create_or_update',     // Both
  'on_delete',               // When record is deleted
  'schedule'                 // Time-based (cron)
]);

/**
 * Schema for Workflow Field Update Action
 */
export const FieldUpdateActionSchema = z.object({
  name: z.string().describe('Action name'),
  type: z.literal('field_update'),
  field: z.string().describe('Field to update'),
  value: z.any().describe('Value or Formula to set'),
});

/**
 * Schema for Workflow Email Alert Action
 */
export const EmailAlertActionSchema = z.object({
  name: z.string().describe('Action name'),
  type: z.literal('email_alert'),
  template: z.string().describe('Email template ID/DevName'),
  recipients: z.array(z.string()).describe('List of recipient emails or user IDs'),
});

/**
 * Generic Workflow Action Wrapper
 */
export const WorkflowActionSchema = z.union([
    FieldUpdateActionSchema,
    EmailAlertActionSchema,
    z.object({
        name: z.string(),
        type: z.string(),
        options: z.any()
    })
]);

/**
 * Schema for Workflow Rules (Automation)
 */
export const WorkflowRuleSchema = z.object({
  /** Machine name */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Unique workflow name'),
  
  /** Target Object */
  objectName: z.string().describe('Target Object'),
  
  /** When to evaluate the rule */
  triggerType: WorkflowTriggerType.describe('When to evaluate'),
  
  /** 
   * Condition to start the workflow.
   * If empty, runs on every trigger event.
   */
  criteria: z.string().optional().describe('Formula condition. If TRUE, actions execute.'),
  
  /** Actions to execute immediately */
  actions: z.array(WorkflowActionSchema).optional().describe('Immediate actions'),
  
  /** Active status */
  active: z.boolean().default(true).describe('Whether this workflow is active'),
});

export type WorkflowRule = z.infer<typeof WorkflowRuleSchema>;

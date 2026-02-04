import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';
import { WebhookSchema } from './webhook.zod';

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
 * Schema for Connector Action Reference
 * Executes a capability defined in an integration connector.
 * Replaces hardcoded vendor actions (Slack, Twilio, etc).
 */
export const ConnectorActionRefSchema = z.object({
  name: z.string().describe('Action name'),
  type: z.literal('connector_action'),
  connectorId: z.string().describe('Target Connector ID (e.g. slack, twilio)'),
  actionId: z.string().describe('Target Action ID (e.g. send_message)'),
  input: z.record(z.string(), z.any()).describe('Input parameters matching the action schema'),
});

/**
 * Universal Workflow Action Schema
 * Union of all supported action types.
 */
export const WorkflowActionSchema = z.discriminatedUnion('type', [
  FieldUpdateActionSchema,
  EmailAlertActionSchema,
  HttpCallActionSchema,
  WebhookTriggerActionSchema,
  ConnectorActionRefSchema,
]);

export type WorkflowAction = z.infer<typeof WorkflowActionSchema>;


/**
 * Schema for Workflow Task Creation Action
 */
export const TaskCreationActionSchema = z.object({
  name: z.string().describe('Action name'),
  type: z.literal('task_creation'),
  taskObject: z.string().describe('Task object name (e.g., "task", "project_task")'),
  subject: z.string().describe('Task subject/title'),
  description: z.string().optional().describe('Task description'),
  assignedTo: z.string().optional().describe('User ID or field reference for assignee'),
  dueDate: z.string().optional().describe('Due date (ISO string or formula)'),
  priority: z.string().optional().describe('Task priority'),
  relatedTo: z.string().optional().describe('Related record ID or field reference'),
  additionalFields: z.record(z.string(), z.any()).optional().describe('Additional custom fields'),
});

/**
 * Schema for Workflow Push Notification Action
 */
export const PushNotificationActionSchema = z.object({
  name: z.string().describe('Action name'),
  type: z.literal('push_notification'),
  title: z.string().describe('Notification title'),
  body: z.string().describe('Notification body text'),
  recipients: z.array(z.string()).describe('User IDs or device tokens'),
  data: z.record(z.string(), z.any()).optional().describe('Additional data payload'),
  badge: z.number().optional().describe('Badge count (iOS)'),
  sound: z.string().optional().describe('Notification sound'),
  clickAction: z.string().optional().describe('Action/URL when notification is clicked'),
});

/**
 * Schema for Workflow Custom Script Action
 */
export const CustomScriptActionSchema = z.object({
  name: z.string().describe('Action name'),
  type: z.literal('custom_script'),
  language: z.enum(['javascript', 'typescript', 'python']).default('javascript').describe('Script language'),
  code: z.string().describe('Script code to execute'),
  timeout: z.number().default(30000).describe('Execution timeout in milliseconds'),
  context: z.record(z.string(), z.any()).optional().describe('Additional context variables'),
});

/**
 * Generic Workflow Action Wrapper
 * Supports 10 action types for comprehensive automation
 */
export const WorkflowActionSchema = z.discriminatedUnion('type', [
    FieldUpdateActionSchema,
    EmailAlertActionSchema,
    SmsNotificationActionSchema,
    SlackMessageActionSchema,
    TeamsMessageActionSchema,
    HttpCallActionSchema,
    WebhookTriggerActionSchema,
    TaskCreationActionSchema,
    PushNotificationActionSchema,
    CustomScriptActionSchema,
]);

/**
 * Time Trigger Definition
 * Schedules actions to run relative to a specific time or date field.
 */
export const TimeTriggerSchema = z.object({
  id: z.string().optional().describe('Unique identifier'),
  
  /** Timing Logic */
  timeLength: z.number().int().describe('Duration amount (e.g. 1, 30)'),
  timeUnit: z.enum(['minutes', 'hours', 'days']).describe('Unit of time'),
  
  /** Reference Point */
  offsetDirection: z.enum(['before', 'after']).describe('Before or After the reference date'),
  offsetFrom: z.enum(['trigger_date', 'date_field']).describe('Basis for calculation'),
  dateField: z.string().optional().describe('Date field to calculate from (required if offsetFrom is date_field)'),
  
  /** Actions */
  actions: z.array(WorkflowActionSchema).describe('Actions to execute at the scheduled time'),
});

/**
 * Schema for Workflow Rules (Automation)
 * 
 * **NAMING CONVENTION:**
 * Workflow names are machine identifiers and must be lowercase snake_case.
 * 
 * @example Good workflow names
 * - 'send_welcome_email'
 * - 'update_lead_status'
 * - 'notify_manager_on_close'
 * - 'calculate_discount'
 * 
 * @example Bad workflow names (will be rejected)
 * - 'SendWelcomeEmail' (PascalCase)
 * - 'updateLeadStatus' (camelCase)
 * - 'Send Welcome Email' (spaces)
 */
export const WorkflowRuleSchema = z.object({
  /** Machine name */
  name: SnakeCaseIdentifierSchema.describe('Unique workflow name (lowercase snake_case)'),
  
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
  
  /** 
   * Time-Dependent Actions 
   * Actions scheduled to run in the future.
   */
  timeTriggers: z.array(TimeTriggerSchema).optional().describe('Scheduled actions relative to trigger or date field'),
  
  /** Active status */
  active: z.boolean().default(true).describe('Whether this workflow is active'),
  
  /** Recursion Control */
  reevaluateOnChange: z.boolean().default(false).describe('Re-evaluate rule if field updates change the record validity'),
});

export type WorkflowRule = z.infer<typeof WorkflowRuleSchema>;
export type TimeTrigger = z.infer<typeof TimeTriggerSchema>;

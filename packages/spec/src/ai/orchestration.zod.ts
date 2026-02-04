import { z } from 'zod';
import { TokenUsageSchema } from './cost.zod';

/**
 * AI Agentic Orchestration Protocol
 * 
 * Defines intelligent orchestration flows where AI Agents leverage cognitive skills
 * to automate business processes with dynamic reasoning, planning, and execution.
 * 
 * Distinction from Standard Workflows:
 * - Standard Workflow: Deterministic (If X then Y). defined in src/data/workflow.zod.ts
 * - AI Orchestration: Probabilistic & Agentic (Goal -> Plan -> Execute).
 * 
 * Use Cases:
 * - Complex Support Triage (Analyze sentiment + intent -> Draft response -> Route)
 * - Intelligent Document Processing (OCR -> Extract Entities -> Validate -> Entry)
 * - Research Agent (Search Web -> Summarize -> Generate Report)
 */

/**
 * Orchestration Trigger Types
 * Defines when an AI Agentic Flow should be initiated
 */
export const AIOrchestrationTriggerSchema = z.enum([
  'record_created',      // When a new record is created
  'record_updated',      // When a record is updated
  'field_changed',       // When specific field(s) change
  'scheduled',           // Time-based trigger (cron)
  'manual',              // User-initiated trigger
  'webhook',             // External system trigger
  'batch',               // Batch processing trigger
]);

/**
 * AI Task Types
 * Cognitive operations that can be performed by AI
 */
export const AITaskTypeSchema = z.enum([
  'classify',            // Categorize content into predefined classes
  'extract',             // Extract structured data from unstructured content
  'summarize',           // Generate concise summaries of text
  'generate',            // Generate new content (text, code, etc.)
  'predict',             // Make predictions based on historical data
  'translate',           // Translate text between languages
  'sentiment',           // Analyze sentiment (positive, negative, neutral)
  'entity_recognition',  // Identify named entities (people, places, etc.)
  'anomaly_detection',   // Detect outliers or unusual patterns
  'recommendation',      // Recommend items or actions
]);

/**
 * AI Task Configuration
 * Individual AI task within a workflow
 */
export const AITaskSchema = z.object({
  /** Task Identity */
  id: z.string().optional().describe('Optional task ID for referencing'),
  name: z.string().describe('Human-readable task name'),
  type: AITaskTypeSchema,
  
  /** Model Configuration */
  model: z.string().optional().describe('Model ID from registry (uses default if not specified)'),
  promptTemplate: z.string().optional().describe('Prompt template ID for this task'),
  
  /** Input Configuration */
  inputFields: z.array(z.string()).describe('Source fields to process (e.g., ["description", "comments"])'),
  inputSchema: z.record(z.string(), z.any()).optional().describe('Validation schema for inputs'),
  inputContext: z.record(z.string(), z.any()).optional().describe('Additional context for the AI model'),
  
  /** Output Configuration */
  outputField: z.string().describe('Target field to store the result'),
  outputSchema: z.record(z.string(), z.any()).optional().describe('Validation schema for output'),
  outputFormat: z.enum(['text', 'json', 'number', 'boolean', 'array']).optional().default('text'),
  
  /** Classification-specific options */
  classes: z.array(z.string()).optional().describe('Valid classes for classification tasks'),
  multiClass: z.boolean().optional().default(false).describe('Allow multiple classes to be selected'),
  
  /** Extraction-specific options */
  extractionSchema: z.record(z.string(), z.any()).optional().describe('JSON schema for structured extraction'),
  
  /** Generation-specific options */
  maxLength: z.number().optional().describe('Maximum length for generated content'),
  temperature: z.number().min(0).max(2).optional().describe('Model temperature override'),
  
  /** Error Handling */
  fallbackValue: z.any().optional().describe('Fallback value if AI task fails'),
  retryAttempts: z.number().int().min(0).max(5).optional().default(1),
  
  /** Conditional Execution */
  condition: z.string().optional().describe('Formula condition - task only runs if TRUE'),
  
  /** Task Metadata */
  description: z.string().optional(),
  active: z.boolean().optional().default(true),
});

/**
 * Workflow Field Condition
 * Specifies which field changes trigger the workflow
 */
export const WorkflowFieldConditionSchema = z.object({
  field: z.string().describe('Field name to monitor'),
  operator: z.enum(['changed', 'changed_to', 'changed_from', 'is', 'is_not']).optional().default('changed'),
  value: z.any().optional().describe('Value to compare against (for changed_to/changed_from/is/is_not)'),
});

/**
 * Workflow Schedule Configuration
 * For time-based workflow execution
 */
export const WorkflowScheduleSchema = z.object({
  type: z.enum(['cron', 'interval', 'daily', 'weekly', 'monthly']).default('cron'),
  cron: z.string().optional().describe('Cron expression (required if type is "cron")'),
  interval: z.number().optional().describe('Interval in minutes (required if type is "interval")'),
  time: z.string().optional().describe('Time of day for daily schedules (HH:MM format)'),
  dayOfWeek: z.number().int().min(0).max(6).optional().describe('Day of week for weekly (0=Sunday)'),
  dayOfMonth: z.number().int().min(1).max(31).optional().describe('Day of month for monthly'),
  timezone: z.string().optional().default('UTC'),
});

/**
 * Post-Processing Action
 * Actions to execute after AI tasks complete
 */
export const PostProcessingActionSchema = z.object({
  type: z.enum(['field_update', 'send_email', 'create_record', 'update_related', 'trigger_flow', 'webhook']),
  name: z.string().describe('Action name'),
  config: z.record(z.string(), z.any()).describe('Action-specific configuration'),
  condition: z.string().optional().describe('Execute only if condition is TRUE'),
});

/**
 * AI Agentic Orchestration Schema
 * Complete workflow definition with AI-powered tasks
 */
export const AIOrchestrationSchema = z.object({
  /** Identity */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Orchestration unique identifier (snake_case)'),
  label: z.string().describe('Display name'),
  description: z.string().optional(),
  
  /** Target Object */
  objectName: z.string().describe('Target object for this orchestration'),
  
  /** Trigger Configuration */
  trigger: AIOrchestrationTriggerSchema,
  
  /** Trigger-specific configuration */
  fieldConditions: z.array(WorkflowFieldConditionSchema).optional().describe('Fields to monitor (for field_changed trigger)'),
  schedule: WorkflowScheduleSchema.optional().describe('Schedule configuration (for scheduled trigger)'),
  webhookConfig: z.object({
    secret: z.string().optional().describe('Webhook verification secret'),
    headers: z.record(z.string(), z.string()).optional().describe('Expected headers'),
  }).optional().describe('Webhook configuration (for webhook trigger)'),
  
  /** Entry Criteria */
  entryCriteria: z.string().optional().describe('Formula condition - workflow only runs if TRUE'),
  
  /** AI Tasks */
  aiTasks: z.array(AITaskSchema).describe('AI tasks to execute in sequence'),
  
  /** Post-Processing */
  postActions: z.array(PostProcessingActionSchema).optional().describe('Actions after AI tasks complete'),
  
  /** Execution Options */
  executionMode: z.enum(['sequential', 'parallel']).optional().default('sequential').describe('How to execute multiple AI tasks'),
  stopOnError: z.boolean().optional().default(false).describe('Stop workflow if any task fails'),
  
  /** Performance & Limits */
  timeout: z.number().optional().describe('Maximum execution time in seconds'),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional().default('normal'),
  
  /** Monitoring & Logging */
  enableLogging: z.boolean().optional().default(true),
  enableMetrics: z.boolean().optional().default(true),
  notifyOnFailure: z.array(z.string()).optional().describe('User IDs to notify on failure'),
  
  /** Status */
  active: z.boolean().optional().default(true),
  version: z.string().optional().default('1.0.0'),
  
  /** Metadata */
  tags: z.array(z.string()).optional(),
  category: z.string().optional().describe('Workflow category (e.g., "support", "sales", "hr")'),
  owner: z.string().optional().describe('User ID of workflow owner'),
  createdAt: z.string().datetime().optional().describe('ISO timestamp'),
  updatedAt: z.string().datetime().optional().describe('ISO timestamp'),
});

/**
 * Batch AI Orchestration Execution Request
 * For processing multiple records at once
 */
export const BatchAIOrchestrationExecutionSchema = z.object({
  workflowName: z.string().describe('Orchestration to execute'),
  recordIds: z.array(z.string()).describe('Records to process'),
  batchSize: z.number().int().min(1).max(1000).optional().default(10),
  parallelism: z.number().int().min(1).max(10).optional().default(3),
  priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),
});

/**
 * AI Orchestration Execution Result
 * Result of a single execution
 */
export const AIOrchestrationExecutionResultSchema = z.object({
  workflowName: z.string(),
  recordId: z.string(),
  status: z.enum(['success', 'partial_success', 'failed', 'skipped']),
  executionTime: z.number().describe('Execution time in milliseconds'),
  tasksExecuted: z.number().int().describe('Number of tasks executed'),
  tasksSucceeded: z.number().int().describe('Number of tasks succeeded'),
  tasksFailed: z.number().int().describe('Number of tasks failed'),
  taskResults: z.array(z.object({
    taskId: z.string().optional(),
    taskName: z.string(),
    status: z.enum(['success', 'failed', 'skipped']),
    output: z.any().optional(),
    error: z.string().optional(),
    executionTime: z.number().optional().describe('Task execution time in milliseconds'),
    modelUsed: z.string().optional(),
    tokensUsed: z.number().optional(),
  })).optional(),
  tokens: TokenUsageSchema.optional().describe('Total token usage for this execution'),
  cost: z.number().nonnegative().optional().describe('Total cost for this execution in USD'),
  error: z.string().optional(),
  startedAt: z.string().datetime().describe('ISO timestamp'),
  completedAt: z.string().datetime().optional().describe('ISO timestamp'),
});

// Type exports
export type AIOrchestrationTrigger = z.infer<typeof AIOrchestrationTriggerSchema>;
export type AITaskType = z.infer<typeof AITaskTypeSchema>;
export type AITask = z.infer<typeof AITaskSchema>;
export type WorkflowFieldCondition = z.infer<typeof WorkflowFieldConditionSchema>;
export type WorkflowSchedule = z.infer<typeof WorkflowScheduleSchema>;
export type PostProcessingAction = z.infer<typeof PostProcessingActionSchema>;
export type AIOrchestration = z.infer<typeof AIOrchestrationSchema>;
export type BatchAIOrchestrationExecution = z.infer<typeof BatchAIOrchestrationExecutionSchema>;
export type AIOrchestrationExecutionResult = z.infer<typeof AIOrchestrationExecutionResultSchema>;

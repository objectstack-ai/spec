import { z } from 'zod';

// Helper to create async function schema compatible with Zod v4
const createAsyncFunctionSchema = <T extends z.ZodFunction<any, any>>(_schema: T) =>
  z.custom<Parameters<T['implementAsync']>[0]>((fn) => typeof fn === 'function');

/**
 * Cron Schedule Schema
 * Schedule jobs using cron expressions
 */
export const CronScheduleSchema = z.object({
  type: z.literal('cron'),
  expression: z.string().describe('Cron expression (e.g., "0 0 * * *" for daily at midnight)'),
  timezone: z.string().optional().default('UTC').describe('Timezone for cron execution (e.g., "America/New_York")'),
});

/**
 * Interval Schedule Schema
 * Schedule jobs at fixed intervals
 */
export const IntervalScheduleSchema = z.object({
  type: z.literal('interval'),
  intervalMs: z.number().int().positive().describe('Interval in milliseconds'),
});

/**
 * Once Schedule Schema
 * Schedule a job to run once at a specific time
 */
export const OnceScheduleSchema = z.object({
  type: z.literal('once'),
  at: z.string().datetime().describe('ISO 8601 datetime when to execute'),
});

/**
 * Schedule Schema
 * Discriminated union of all schedule types
 */
export const ScheduleSchema = z.discriminatedUnion('type', [
  CronScheduleSchema,
  IntervalScheduleSchema,
  OnceScheduleSchema,
]);

export type Schedule = z.infer<typeof ScheduleSchema>;
export type CronSchedule = z.infer<typeof CronScheduleSchema>;
export type IntervalSchedule = z.infer<typeof IntervalScheduleSchema>;
export type OnceSchedule = z.infer<typeof OnceScheduleSchema>;
export type JobSchedule = Schedule; // Alias for backwards compatibility

/**
 * Retry Policy Schema
 * Configuration for job retry behavior with exponential backoff
 */
export const RetryPolicySchema = z.object({
  maxRetries: z.number().int().min(0).default(3).describe('Maximum number of retry attempts'),
  backoffMs: z.number().int().positive().default(1000).describe('Initial backoff delay in milliseconds'),
  backoffMultiplier: z.number().positive().default(2).describe('Multiplier for exponential backoff'),
});

export type RetryPolicy = z.infer<typeof RetryPolicySchema>;

/**
 * Job Schema
 * Defines a scheduled job
 */
export const JobSchema = z.object({
  id: z.string().describe('Unique job identifier'),
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Job name (snake_case)'),
  schedule: ScheduleSchema.describe('Job schedule configuration'),
  handler: createAsyncFunctionSchema(
    z.function({
      input: z.tuple([]),
      output: z.promise(z.void())
    })
  ).describe('Job handler function'),
  retryPolicy: RetryPolicySchema.optional().describe('Retry policy configuration'),
  timeout: z.number().int().positive().optional().describe('Timeout in milliseconds'),
  enabled: z.boolean().default(true).describe('Whether the job is enabled'),
});

export type Job = z.infer<typeof JobSchema>;

/**
 * Job Execution Status Enum
 * Status of job execution
 */
export const JobExecutionStatus = z.enum([
  'running',
  'success',
  'failed',
  'timeout',
]);

export type JobExecutionStatus = z.infer<typeof JobExecutionStatus>;

/**
 * Job Execution Schema
 * Logs for job execution
 */
export const JobExecutionSchema = z.object({
  jobId: z.string().describe('Job identifier'),
  startedAt: z.string().datetime().describe('ISO 8601 datetime when execution started'),
  completedAt: z.string().datetime().optional().describe('ISO 8601 datetime when execution completed'),
  status: JobExecutionStatus.describe('Execution status'),
  error: z.string().optional().describe('Error message if failed'),
  duration: z.number().int().optional().describe('Execution duration in milliseconds'),
});

export type JobExecution = z.infer<typeof JobExecutionSchema>;

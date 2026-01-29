import { z } from 'zod';

/**
 * Log Level Enum
 * Standard RFC 5424 severity levels (simplified)
 */
export const LogLevel = z.enum([
  'debug',
  'info',
  'warn',
  'error',
  'fatal'
]).describe('Log severity level');

export type LogLevel = z.infer<typeof LogLevel>;

/**
 * Log Format Enum
 */
export const LogFormat = z.enum([
  'json',   // Structured JSON for machine parsing
  'text',   // Simple text format
  'pretty'  // Colored human-readable output for CLI/console
]).describe('Log output format');

export type LogFormat = z.infer<typeof LogFormat>;

/**
 * Logger Configuration Schema
 * Configuration for the Kernel's internal logger
 */
export const LoggerConfigSchema = z.object({
  /**
   * Minimum level to log
   */
  level: LogLevel.optional().default('info'),

  /**
   * Output format
   */
  format: LogFormat.optional().default('json'),

  /**
   * Redact sensitive keys
   */
  redact: z.array(z.string()).optional().default(['password', 'token', 'secret', 'key'])
    .describe('Keys to redact from log context'),

  /**
   * Enable source location (file/line)
   */
  sourceLocation: z.boolean().optional().default(false)
    .describe('Include file and line number'),

  /**
   * Log to file (optional)
   */
  file: z.string().optional().describe('Path to log file'),

  /**
   * Log rotation config (if file is set)
   */
  rotation: z.object({
      maxSize: z.string().optional().default('10m'),
      maxFiles: z.number().optional().default(5)
  }).optional()
});

export type LoggerConfig = z.infer<typeof LoggerConfigSchema>;

/**
 * Log Entry Schema
 * The shape of a structured log record
 */
export const LogEntrySchema = z.object({
  timestamp: z.string().datetime().describe('ISO 8601 timestamp'),
  level: LogLevel,
  message: z.string().describe('Log message'),
  context: z.record(z.any()).optional().describe('Structured context data'),
  error: z.record(z.any()).optional().describe('Error object if present'),
  
  /** Tracing */
  traceId: z.string().optional().describe('Distributed trace ID'),
  spanId: z.string().optional().describe('Span ID'),
  
  /** Source */
  service: z.string().optional().describe('Service name'),
  component: z.string().optional().describe('Component name (e.g. plugin id)'),
});

export type LogEntry = z.infer<typeof LogEntrySchema>;

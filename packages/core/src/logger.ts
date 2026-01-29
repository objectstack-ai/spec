import type { LoggerConfig, LogLevel, LogEntry } from '@objectstack/spec/system';
import type { Logger } from './contracts/logger.js';

/**
 * Universal Logger Implementation
 * 
 * A configurable logger that works in both browser and Node.js environments.
 * Features:
 * - Structured logging with multiple formats (json, text, pretty)
 * - Log level filtering
 * - Sensitive data redaction
 * - File logging with rotation (Node.js only)
 * - Browser console integration
 * - Distributed tracing support (traceId, spanId)
 */
export class ObjectLogger implements Logger {
    private config: Required<Omit<LoggerConfig, 'file' | 'rotation'>> & { file?: string; rotation?: { maxSize: string; maxFiles: number } };
    private isNode: boolean;
    private fileWriter?: any; // FileWriter for Node.js

    constructor(config: Partial<LoggerConfig> = {}) {
        // Detect runtime environment
        this.isNode = typeof process !== 'undefined' && process.versions?.node !== undefined;

        // Set defaults
        this.config = {
            level: config.level ?? 'info',
            format: config.format ?? (this.isNode ? 'json' : 'pretty'),
            redact: config.redact ?? ['password', 'token', 'secret', 'key'],
            sourceLocation: config.sourceLocation ?? false,
            file: config.file,
            rotation: config.rotation ?? {
                maxSize: '10m',
                maxFiles: 5
            }
        };

        // Initialize file writer if file logging is enabled (Node.js only)
        if (this.isNode && this.config.file) {
            this.initFileWriter();
        }
    }

    /**
     * Initialize file writer for Node.js (synchronous to ensure logs aren't dropped)
     */
    private initFileWriter() {
        if (!this.isNode) return;

        try {
            // Dynamic require for Node.js-only modules (synchronous)
            const fs = require('fs');
            const path = require('path');
            
            // Ensure log directory exists
            const logDir = path.dirname(this.config.file!);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            // Create write stream (synchronous operation)
            // TODO: Implement rotation based on config.rotation
            this.fileWriter = fs.createWriteStream(this.config.file!, { flags: 'a' });
        } catch (error) {
            console.error('[Logger] Failed to initialize file writer:', error);
        }
    }

    /**
     * Check if a log level should be logged based on configured minimum level
     */
    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
        const configuredLevelIndex = levels.indexOf(this.config.level);
        const currentLevelIndex = levels.indexOf(level);
        return currentLevelIndex >= configuredLevelIndex;
    }

    /**
     * Redact sensitive keys from context object
     */
    private redactSensitive(obj: any): any {
        if (!obj || typeof obj !== 'object') return obj;

        const redacted = Array.isArray(obj) ? [...obj] : { ...obj };

        for (const key in redacted) {
            const lowerKey = key.toLowerCase();
            const shouldRedact = this.config.redact.some(pattern => 
                lowerKey.includes(pattern.toLowerCase())
            );

            if (shouldRedact) {
                redacted[key] = '***REDACTED***';
            } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
                redacted[key] = this.redactSensitive(redacted[key]);
            }
        }

        return redacted;
    }

    /**
     * Format log entry based on configured format
     */
    private formatEntry(entry: LogEntry): string {
        const { format } = this.config;

        if (format === 'json') {
            return JSON.stringify(entry);
        }

        if (format === 'text') {
            const parts = [
                entry.timestamp,
                entry.level.toUpperCase(),
                entry.message
            ];
            if (entry.context && Object.keys(entry.context).length > 0) {
                parts.push(JSON.stringify(entry.context));
            }
            return parts.join(' | ');
        }

        // Pretty format (with colors in browser/terminal)
        const levelColors: Record<LogLevel, string> = {
            debug: '\x1b[36m',   // Cyan
            info: '\x1b[32m',    // Green
            warn: '\x1b[33m',    // Yellow
            error: '\x1b[31m',   // Red
            fatal: '\x1b[35m'    // Magenta
        };
        const reset = '\x1b[0m';
        const color = levelColors[entry.level] || '';

        let output = `${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`;
        
        if (entry.context && Object.keys(entry.context).length > 0) {
            output += ` ${JSON.stringify(entry.context, null, 2)}`;
        }

        if (entry.error) {
            output += `\n${JSON.stringify(entry.error, null, 2)}`;
        }

        return output;
    }

    /**
     * Get source location (file and line number)
     * Only enabled if sourceLocation config is true
     */
    private getSourceLocation(): { file?: string; line?: number } | undefined {
        if (!this.config.sourceLocation) return undefined;

        try {
            const stack = new Error().stack;
            if (!stack) return undefined;

            // Parse stack trace to get caller location
            const lines = stack.split('\n');
            // Skip first 4 lines (Error, getSourceLocation, log method, actual caller)
            const callerLine = lines[4];
            if (!callerLine) return undefined;

            const match = callerLine.match(/\((.+):(\d+):\d+\)/) || callerLine.match(/at (.+):(\d+):\d+/);
            if (match) {
                return {
                    file: match[1],
                    line: parseInt(match[2], 10)
                };
            }
        } catch (error) {
            // Silently fail if stack parsing fails
        }

        return undefined;
    }

    /**
     * Core logging method
     */
    private logInternal(
        level: LogLevel,
        message: string,
        context?: Record<string, any>,
        error?: Error
    ): void {
        if (!this.shouldLog(level)) return;

        // Build log entry
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context: context ? this.redactSensitive(context) : undefined,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : undefined
        };

        // Add source location if enabled
        const sourceLocation = this.getSourceLocation();
        if (sourceLocation) {
            entry.context = {
                ...entry.context,
                _source: sourceLocation
            };
        }

        // Format the entry
        const formatted = this.formatEntry(entry);

        // Output to console (browser or Node.js)
        if (this.isNode || (typeof globalThis !== 'undefined' && globalThis.console)) {
            const consoleMethod = level === 'debug' ? 'debug' :
                                level === 'info' ? 'log' :
                                level === 'warn' ? 'warn' :
                                level === 'error' || level === 'fatal' ? 'error' :
                                'log';
            console[consoleMethod](formatted);
        }

        // Output to file (Node.js only)
        if (this.fileWriter && this.isNode) {
            this.fileWriter.write(formatted + '\n');
        }
    }

    /**
     * Public logging methods
     */
    debug(message: string, meta?: Record<string, any>): void {
        this.logInternal('debug', message, meta);
    }

    info(message: string, meta?: Record<string, any>): void {
        this.logInternal('info', message, meta);
    }

    warn(message: string, meta?: Record<string, any>): void {
        this.logInternal('warn', message, meta);
    }

    error(message: string, error?: Error, meta?: Record<string, any>): void {
        const context = meta || {};
        this.logInternal('error', message, context, error);
    }

    fatal(message: string, error?: Error, meta?: Record<string, any>): void {
        const context = meta || {};
        this.logInternal('fatal', message, context, error);
    }

    /**
     * Create a child logger with additional context
     * Note: Child loggers share the parent's file writer to avoid multiple streams to the same file
     */
    child(context: Record<string, any>): ObjectLogger {
        const childLogger = new ObjectLogger(this.config);
        
        // Share file writer with parent to avoid multiple streams to same file
        if (this.fileWriter) {
            childLogger.fileWriter = this.fileWriter;
        }
        
        // Override log method to inject context
        const originalLog = childLogger.logInternal.bind(childLogger);
        childLogger.logInternal = (level: LogLevel, message: string, meta?: Record<string, any>, error?: Error) => {
            const mergedContext = { ...context, ...meta };
            originalLog(level, message, mergedContext, error);
        };

        return childLogger;
    }

    /**
     * Set trace context for distributed tracing
     */
    withTrace(traceId: string, spanId?: string): ObjectLogger {
        return this.child({ traceId, spanId });
    }

    /**
     * Cleanup resources (close file streams)
     */
    async destroy(): Promise<void> {
        if (this.fileWriter) {
            return new Promise((resolve) => {
                this.fileWriter.end(() => resolve());
            });
        }
    }

    /**
     * Compatibility method for console.log usage
     */
    log(message: string, ...args: any[]): void {
        this.info(message, args.length > 0 ? { args } : undefined);
    }
}

/**
 * Create a logger instance
 */
export function createLogger(config?: Partial<LoggerConfig>): ObjectLogger {
    return new ObjectLogger(config);
}

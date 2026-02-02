import { createRequire } from 'module';
import type { LoggerConfig, LogLevel } from '@objectstack/spec/system';
import type { Logger } from '@objectstack/spec/contracts';

const require = createRequire(import.meta.url);

/**
 * Universal Logger Implementation
 * 
 * A configurable logger that works in both browser and Node.js environments.
 * - Node.js: Uses Pino for high-performance structured logging
 * - Browser: Simple console-based implementation
 * 
 * Features:
 * - Structured logging with multiple formats (json, text, pretty)
 * - Log level filtering
 * - Sensitive data redaction
 * - File logging with rotation (Node.js only via Pino)
 * - Browser console integration
 * - Distributed tracing support (traceId, spanId)
 */
export class ObjectLogger implements Logger {
    private config: Required<Omit<LoggerConfig, 'file' | 'rotation' | 'name'>> & { file?: string; rotation?: { maxSize: string; maxFiles: number }; name?: string };
    private isNode: boolean;
    private pinoLogger?: any; // Pino logger instance for Node.js
    private pinoInstance?: any; // Base Pino instance for creating child loggers

    constructor(config: Partial<LoggerConfig> = {}) {
        // Detect runtime environment
        this.isNode = typeof process !== 'undefined' && process.versions?.node !== undefined;

        // Set defaults
        this.config = {
            name: config.name,
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

        // Initialize Pino logger for Node.js
        if (this.isNode) {
            this.initPinoLogger();
        }
    }

    /**
     * Initialize Pino logger for Node.js
     */
    private initPinoLogger() {
        if (!this.isNode) return;

        try {
            // Synchronous import for Pino using createRequire (works in ESM)
            const pino = require('pino');
            
            // Build Pino options
            const pinoOptions: any = {
                level: this.config.level,
                redact: {
                    paths: this.config.redact,
                    censor: '***REDACTED***'
                }
            };

            // Add name if provided
            if (this.config.name) {
                pinoOptions.name = this.config.name;
            }

            // Transport configuration for pretty printing or file output
            const targets: any[] = [];

            // Console transport
            if (this.config.format === 'pretty') {
                // Check if pino-pretty is available
                let hasPretty = false;
                try {
                    require.resolve('pino-pretty');
                    hasPretty = true;
                } catch (e) {
                    // ignore
                }

                if (hasPretty) {
                    targets.push({
                        target: 'pino-pretty',
                        options: {
                            colorize: true,
                            translateTime: 'SYS:standard',
                            ignore: 'pid,hostname'
                        },
                        level: this.config.level
                    });
                } else {
                     console.warn('[Logger] pino-pretty not found. Install it for pretty logging: pnpm add -D pino-pretty');
                     // Fallback to text/simple
                     targets.push({
                        target: 'pino/file',
                        options: { destination: 1 },
                        level: this.config.level
                    });
                }
            } else if (this.config.format === 'json') {
                // JSON to stdout
                targets.push({
                    target: 'pino/file',
                    options: { destination: 1 }, // stdout
                    level: this.config.level
                });
            } else {
                // text format (simple)
                targets.push({
                    target: 'pino/file',
                    options: { destination: 1 },
                    level: this.config.level
                });
            }

            // File transport (if configured)
            if (this.config.file) {
                targets.push({
                    target: 'pino/file',
                    options: {
                        destination: this.config.file,
                        mkdir: true
                    },
                    level: this.config.level
                });
            }

            // Create transport
            if (targets.length > 0) {
                pinoOptions.transport = targets.length === 1 ? targets[0] : { targets };
            }

            // Create Pino logger
            this.pinoInstance = pino(pinoOptions);
            this.pinoLogger = this.pinoInstance;

        } catch (error) {
            // Fallback to console if Pino is not available
            console.warn('[Logger] Pino not available, falling back to console:', error);
            this.pinoLogger = null;
        }
    }

    /**
     * Redact sensitive keys from context object (for browser)
     */
    private redactSensitive(obj: any): any {
        if (!obj || typeof obj !== 'object') return obj;

        const redacted = Array.isArray(obj) ? [...obj] : { ...obj };

        for (const key in redacted) {
            const lowerKey = key.toLowerCase();
            const shouldRedact = this.config.redact.some((pattern: string) => 
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
     * Format log entry for browser
     */
    private formatBrowserLog(level: LogLevel, message: string, context?: Record<string, any>): string {
        if (this.config.format === 'json') {
            return JSON.stringify({
                timestamp: new Date().toISOString(),
                level,
                message,
                ...context
            });
        }

        if (this.config.format === 'text') {
            const parts = [new Date().toISOString(), level.toUpperCase(), message];
            if (context && Object.keys(context).length > 0) {
                parts.push(JSON.stringify(context));
            }
            return parts.join(' | ');
        }

        // Pretty format
        const levelColors: Record<LogLevel, string> = {
            debug: '\x1b[36m',   // Cyan
            info: '\x1b[32m',    // Green
            warn: '\x1b[33m',    // Yellow
            error: '\x1b[31m',   // Red
            fatal: '\x1b[35m'    // Magenta
        };
        const reset = '\x1b[0m';
        const color = levelColors[level] || '';

        let output = `${color}[${level.toUpperCase()}]${reset} ${message}`;
        
        if (context && Object.keys(context).length > 0) {
            output += ` ${JSON.stringify(context, null, 2)}`;
        }

        return output;
    }

    /**
     * Log using browser console
     */
    private logBrowser(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
        const redactedContext = context ? this.redactSensitive(context) : undefined;
        const mergedContext = error ? { ...redactedContext, error: { message: error.message, stack: error.stack } } : redactedContext;
        
        const formatted = this.formatBrowserLog(level, message, mergedContext);
        
        const consoleMethod = level === 'debug' ? 'debug' :
                            level === 'info' ? 'log' :
                            level === 'warn' ? 'warn' :
                            level === 'error' || level === 'fatal' ? 'error' :
                            'log';
        
        console[consoleMethod](formatted);
    }

    /**
     * Public logging methods
     */
    debug(message: string, meta?: Record<string, any>): void {
        if (this.isNode && this.pinoLogger) {
            this.pinoLogger.debug(meta || {}, message);
        } else {
            this.logBrowser('debug', message, meta);
        }
    }

    info(message: string, meta?: Record<string, any>): void {
        if (this.isNode && this.pinoLogger) {
            this.pinoLogger.info(meta || {}, message);
        } else {
            this.logBrowser('info', message, meta);
        }
    }

    warn(message: string, meta?: Record<string, any>): void {
        if (this.isNode && this.pinoLogger) {
            this.pinoLogger.warn(meta || {}, message);
        } else {
            this.logBrowser('warn', message, meta);
        }
    }

    error(message: string, error?: Error, meta?: Record<string, any>): void {
        if (this.isNode && this.pinoLogger) {
            const errorContext = error ? { err: error, ...meta } : meta || {};
            this.pinoLogger.error(errorContext, message);
        } else {
            this.logBrowser('error', message, meta, error);
        }
    }

    fatal(message: string, error?: Error, meta?: Record<string, any>): void {
        if (this.isNode && this.pinoLogger) {
            const errorContext = error ? { err: error, ...meta } : meta || {};
            this.pinoLogger.fatal(errorContext, message);
        } else {
            this.logBrowser('fatal', message, meta, error);
        }
    }

    /**
     * Create a child logger with additional context
     * Note: Child loggers share the parent's Pino instance
     */
    child(context: Record<string, any>): ObjectLogger {
        const childLogger = new ObjectLogger(this.config);
        
        // For Node.js with Pino, create a Pino child logger
        if (this.isNode && this.pinoInstance) {
            childLogger.pinoLogger = this.pinoInstance.child(context);
            childLogger.pinoInstance = this.pinoInstance;
        }

        return childLogger;
    }

    /**
     * Set trace context for distributed tracing
     */
    withTrace(traceId: string, spanId?: string): ObjectLogger {
        return this.child({ traceId, spanId });
    }

    /**
     * Cleanup resources
     */
    async destroy(): Promise<void> {
        if (this.pinoLogger && this.pinoLogger.flush) {
            await new Promise<void>((resolve) => {
                this.pinoLogger.flush(() => resolve());
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

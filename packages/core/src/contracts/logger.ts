// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Logger Contract
 * 
 * Defines the interface for logging in ObjectStack.
 * Compatible with both browser console and structured logging systems.
 */
export interface Logger {
    /**
     * Log a debug message
     * @param message - The message to log
     * @param meta - Optional metadata to include
     */
    debug(message: string, meta?: Record<string, any>): void;

    /**
     * Log an informational message
     * @param message - The message to log
     * @param meta - Optional metadata to include
     */
    info(message: string, meta?: Record<string, any>): void;

    /**
     * Log a warning message
     * @param message - The message to log
     * @param meta - Optional metadata to include
     */
    warn(message: string, meta?: Record<string, any>): void;

    /**
     * Log an error message
     * @param message - The message to log
     * @param error - Optional error object
     * @param meta - Optional metadata to include
     */
    error(message: string, error?: Error, meta?: Record<string, any>): void;

    /**
     * Log a fatal error message
     * @param message - The message to log
     * @param error - Optional error object
     * @param meta - Optional metadata to include
     */
    fatal?(message: string, error?: Error, meta?: Record<string, any>): void;

    /**
     * Create a child logger with additional context
     * @param context - Context to add to all logs from this child
     */
    child?(context: Record<string, any>): Logger;

    /**
     * Set trace context for distributed tracing
     * @param traceId - Trace identifier
     * @param spanId - Span identifier
     */
    withTrace?(traceId: string, spanId?: string): Logger;

    /**
     * Compatibility method for console.log usage
     * @param message - The message to log
     * @param args - Additional arguments
     */
    log?(message: string, ...args: any[]): void;

    /**
     * Cleanup resources (close file streams, etc.)
     * Should be called when the logger is no longer needed
     */
    destroy?(): Promise<void>;
}

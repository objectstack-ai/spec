// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Environment utilities for universal (Node/Browser) compatibility.
 */

// Check if running in a Node.js environment
export const isNode = typeof process !== 'undefined' && 
                      process.versions != null && 
                      process.versions.node != null;

/**
 * Safely access environment variables
 */
export function getEnv(key: string, defaultValue?: string): string | undefined {
    // Node.js
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key] || defaultValue;
    }
    
    // Browser (Vite/Webpack replacement usually handles process.env, 
    // but if not, we check safe global access)
    try {
        // @ts-ignore
        if (typeof globalThis !== 'undefined' && globalThis.process?.env) {
             // @ts-ignore
            return globalThis.process.env[key] || defaultValue;
        }
    } catch (e) {
        // Ignore access errors
    }
    
    return defaultValue;
}

/**
 * Safely exit the process if in Node.js
 */
export function safeExit(code: number = 0): void {
    if (isNode) {
        process.exit(code);
    }
}

/**
 * Safely get memory usage
 */
export function getMemoryUsage(): { heapUsed: number; heapTotal: number } {
    if (isNode) {
        return process.memoryUsage();
    }
    return { heapUsed: 0, heapTotal: 0 };
}

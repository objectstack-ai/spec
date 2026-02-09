// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Plugin } from './plugin-validator.js';

/**
 * IStartupOrchestrator - Startup Orchestrator Interface
 * 
 * Abstract interface for orchestrating plugin startup with advanced features:
 * - Timeout handling
 * - Rollback on failure
 * - Health checks
 * - Startup metrics
 * 
 * Extracted from PluginLoader to follow Single Responsibility Principle.
 */

/**
 * Startup options for orchestration
 */
export interface StartupOptions {
    /**
     * Maximum time (ms) to wait for each plugin to start
     * @default 30000 (30 seconds)
     */
    timeout?: number;
    
    /**
     * Whether to rollback (destroy) already-started plugins on failure
     * @default true
     */
    rollbackOnFailure?: boolean;
    
    /**
     * Whether to run health checks after startup
     * @default false
     */
    healthCheck?: boolean;
    
    /**
     * Whether to run plugins in parallel (if dependencies allow)
     * @default false (sequential startup)
     */
    parallel?: boolean;
    
    /**
     * Custom context to pass to plugin lifecycle methods
     */
    context?: any;
}

/**
 * Plugin startup result
 */
export interface PluginStartupResult {
    /**
     * Plugin that was started
     */
    plugin: Plugin;
    
    /**
     * Whether startup was successful
     */
    success: boolean;
    
    /**
     * Time taken to start (milliseconds)
     */
    duration: number;
    
    /**
     * Error if startup failed
     */
    error?: Error;
    
    /**
     * Health status after startup (if healthCheck enabled)
     */
    health?: HealthStatus;
}

/**
 * Health status for a plugin
 */
export interface HealthStatus {
    /**
     * Whether the plugin is healthy
     */
    healthy: boolean;
    
    /**
     * Health check timestamp
     */
    timestamp: number;
    
    /**
     * Optional health details
     */
    details?: Record<string, any>;
    
    /**
     * Optional error message if unhealthy
     */
    message?: string;
}

/**
 * IStartupOrchestrator - Plugin startup orchestration interface
 */
export interface IStartupOrchestrator {
    /**
     * Orchestrate startup of multiple plugins
     * Handles timeout, rollback, and health checks
     * @param plugins - Array of plugins to start (in dependency order)
     * @param options - Startup options
     * @returns Promise resolving to startup results for each plugin
     */
    orchestrateStartup(
        plugins: Plugin[], 
        options: StartupOptions
    ): Promise<PluginStartupResult[]>;
    
    /**
     * Rollback (destroy) a set of plugins
     * Used when startup fails and rollback is enabled
     * @param startedPlugins - Plugins that were successfully started
     * @returns Promise that resolves when rollback is complete
     */
    rollback(startedPlugins: Plugin[]): Promise<void>;
    
    /**
     * Check health of a single plugin
     * @param plugin - Plugin to check
     * @returns Promise resolving to health status
     */
    checkHealth(plugin: Plugin): Promise<HealthStatus>;
    
    /**
     * Wait for a plugin to start with timeout
     * @param plugin - Plugin to start
     * @param context - Plugin context
     * @param timeoutMs - Maximum time to wait (milliseconds)
     * @returns Promise resolving when plugin starts or rejecting on timeout
     */
    startWithTimeout?(
        plugin: Plugin, 
        context: any, 
        timeoutMs: number
    ): Promise<void>;
}

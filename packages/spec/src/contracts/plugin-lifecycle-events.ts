// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * IPluginLifecycleEvents - Typed Plugin Lifecycle Events
 * 
 * Type-safe event definitions for plugin and kernel lifecycle.
 * Provides strong typing for event emitters and listeners.
 * 
 * This replaces the generic Map<string, any[]> approach with typed events.
 */

/**
 * Plugin lifecycle event types and their payloads
 */
export interface IPluginLifecycleEvents {
    /**
     * Emitted when kernel is ready (all plugins initialized)
     * Payload: []
     */
    'kernel:ready': [];
    
    /**
     * Emitted when kernel is shutting down
     * Payload: []
     */
    'kernel:shutdown': [];
    
    /**
     * Emitted before kernel initialization starts
     * Payload: []
     */
    'kernel:before-init': [];
    
    /**
     * Emitted after kernel initialization completes
     * Payload: [duration: number (milliseconds)]
     */
    'kernel:after-init': [duration: number];
    
    /**
     * Emitted when a plugin is registered
     * Payload: [pluginName: string]
     */
    'plugin:registered': [pluginName: string];
    
    /**
     * Emitted before a plugin's init method is called
     * Payload: [pluginName: string]
     */
    'plugin:before-init': [pluginName: string];
    
    /**
     * Emitted when a plugin has been initialized
     * Payload: [pluginName: string]
     */
    'plugin:init': [pluginName: string];
    
    /**
     * Emitted after a plugin's init method completes
     * Payload: [pluginName: string, duration: number (milliseconds)]
     */
    'plugin:after-init': [pluginName: string, duration: number];
    
    /**
     * Emitted before a plugin's start method is called
     * Payload: [pluginName: string]
     */
    'plugin:before-start': [pluginName: string];
    
    /**
     * Emitted when a plugin has started successfully
     * Payload: [pluginName: string, duration: number (milliseconds)]
     */
    'plugin:started': [pluginName: string, duration: number];
    
    /**
     * Emitted after a plugin's start method completes
     * Payload: [pluginName: string, duration: number (milliseconds)]
     */
    'plugin:after-start': [pluginName: string, duration: number];
    
    /**
     * Emitted before a plugin's destroy method is called
     * Payload: [pluginName: string]
     */
    'plugin:before-destroy': [pluginName: string];
    
    /**
     * Emitted when a plugin has been destroyed
     * Payload: [pluginName: string]
     */
    'plugin:destroyed': [pluginName: string];
    
    /**
     * Emitted after a plugin's destroy method completes
     * Payload: [pluginName: string, duration: number (milliseconds)]
     */
    'plugin:after-destroy': [pluginName: string, duration: number];
    
    /**
     * Emitted when a plugin encounters an error
     * Payload: [pluginName: string, error: Error, phase: 'init' | 'start' | 'destroy']
     */
    'plugin:error': [pluginName: string, error: Error, phase: 'init' | 'start' | 'destroy'];
    
    /**
     * Emitted when a service is registered
     * Payload: [serviceName: string]
     */
    'service:registered': [serviceName: string];
    
    /**
     * Emitted when a service is unregistered
     * Payload: [serviceName: string]
     */
    'service:unregistered': [serviceName: string];
    
    /**
     * Emitted when a hook is registered
     * Payload: [hookName: string, handlerCount: number]
     */
    'hook:registered': [hookName: string, handlerCount: number];
    
    /**
     * Emitted when a hook is triggered
     * Payload: [hookName: string, args: any[]]
     */
    'hook:triggered': [hookName: string, args: any[]];
}

/**
 * Type-safe event emitter interface
 * Provides compile-time type checking for event names and payloads
 */
export interface ITypedEventEmitter<Events extends Record<string, any[]>> {
    /**
     * Register an event listener
     * @param event - Event name (type-checked)
     * @param handler - Event handler (type-checked against event payload)
     */
    on<K extends keyof Events>(
        event: K,
        handler: (...args: Events[K]) => void | Promise<void>
    ): void;
    
    /**
     * Unregister an event listener
     * @param event - Event name (type-checked)
     * @param handler - Event handler to remove
     */
    off<K extends keyof Events>(
        event: K,
        handler: (...args: Events[K]) => void | Promise<void>
    ): void;
    
    /**
     * Emit an event with type-checked payload
     * @param event - Event name (type-checked)
     * @param args - Event payload (type-checked)
     */
    emit<K extends keyof Events>(
        event: K,
        ...args: Events[K]
    ): Promise<void>;
    
    /**
     * Register a one-time event listener
     * @param event - Event name (type-checked)
     * @param handler - Event handler (type-checked against event payload)
     */
    once?<K extends keyof Events>(
        event: K,
        handler: (...args: Events[K]) => void | Promise<void>
    ): void;
    
    /**
     * Get the number of listeners for an event
     * @param event - Event name
     * @returns Number of registered listeners
     */
    listenerCount?<K extends keyof Events>(event: K): number;
    
    /**
     * Remove all listeners for an event (or all events if not specified)
     * @param event - Optional event name
     */
    removeAllListeners?<K extends keyof Events>(event?: K): void;
}

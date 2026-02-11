// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * IRealtimeService - Realtime / PubSub Service Contract
 *
 * Defines the interface for realtime event subscription and publishing
 * in ObjectStack. Concrete implementations (WebSocket, SSE, Socket.IO, etc.)
 * should implement this interface.
 *
 * Follows Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete realtime transport implementations.
 *
 * Aligned with CoreServiceName 'realtime' in core-services.zod.ts.
 */

/**
 * A realtime event payload
 */
export interface RealtimeEventPayload {
    /** Event type (e.g. 'record.created', 'record.updated') */
    type: string;
    /** Object name the event relates to */
    object?: string;
    /** Event data */
    payload: Record<string, unknown>;
    /** Timestamp (ISO 8601) */
    timestamp: string;
}

/**
 * Handler function for realtime event subscriptions
 */
export type RealtimeEventHandler = (event: RealtimeEventPayload) => void | Promise<void>;

/**
 * Subscription options for filtering events
 */
export interface RealtimeSubscriptionOptions {
    /** Object name to filter events for */
    object?: string;
    /** Event types to listen for */
    eventTypes?: string[];
    /** Additional filter conditions */
    filter?: Record<string, unknown>;
}

export interface IRealtimeService {
    /**
     * Publish an event to all subscribers
     * @param event - The event to publish
     */
    publish(event: RealtimeEventPayload): Promise<void>;

    /**
     * Subscribe to realtime events
     * @param channel - Channel/topic name
     * @param handler - Event handler function
     * @param options - Optional subscription filters
     * @returns Subscription identifier for unsubscribing
     */
    subscribe(channel: string, handler: RealtimeEventHandler, options?: RealtimeSubscriptionOptions): Promise<string>;

    /**
     * Unsubscribe from a channel
     * @param subscriptionId - Subscription identifier returned by subscribe()
     */
    unsubscribe(subscriptionId: string): Promise<void>;

    /**
     * Handle an incoming HTTP upgrade request (WebSocket handshake)
     * @param request - Standard Request object
     * @returns Standard Response object
     */
    handleUpgrade?(request: Request): Promise<Response>;
}

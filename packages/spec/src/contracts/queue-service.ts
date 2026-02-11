// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * IQueueService - Message Queue Service Contract
 * 
 * Defines the interface for asynchronous message queue operations in ObjectStack.
 * Concrete implementations (BullMQ, Redis Pub/Sub, Kafka, etc.)
 * should implement this interface.
 * 
 * Follows Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete queue implementations.
 * 
 * Aligned with CoreServiceName 'queue' in core-services.zod.ts.
 */

/**
 * Options for publishing a message to a queue
 */
export interface QueuePublishOptions {
    /** Delay before the message becomes available (in milliseconds) */
    delay?: number;
    /** Message priority (lower = higher priority) */
    priority?: number;
    /** Number of retry attempts on failure */
    retries?: number;
}

/**
 * A message received from a queue
 */
export interface QueueMessage<T = unknown> {
    /** Unique message identifier */
    id: string;
    /** The message payload */
    data: T;
    /** Number of times this message has been attempted */
    attempts: number;
    /** Timestamp when the message was published */
    timestamp: number;
}

/**
 * Handler function for processing queue messages
 */
export type QueueHandler<T = unknown> = (message: QueueMessage<T>) => Promise<void>;

export interface IQueueService {
    /**
     * Publish a message to a named queue
     * @param queue - Queue name
     * @param data - Message payload
     * @param options - Publish options (delay, priority, retries)
     * @returns The message identifier
     */
    publish<T = unknown>(queue: string, data: T, options?: QueuePublishOptions): Promise<string>;

    /**
     * Subscribe to messages from a named queue
     * @param queue - Queue name
     * @param handler - Message handler function
     */
    subscribe<T = unknown>(queue: string, handler: QueueHandler<T>): Promise<void>;

    /**
     * Unsubscribe from a named queue
     * @param queue - Queue name
     */
    unsubscribe(queue: string): Promise<void>;

    /**
     * Get the number of messages waiting in a queue
     * @param queue - Queue name
     * @returns Number of pending messages
     */
    getQueueSize?(queue: string): Promise<number>;

    /**
     * Purge all messages from a queue
     * @param queue - Queue name
     */
    purge?(queue: string): Promise<void>;
}

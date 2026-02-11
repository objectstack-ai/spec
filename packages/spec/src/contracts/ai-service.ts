// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * IAIService - AI Engine Service Contract
 *
 * Defines the interface for AI capabilities (NLQ, chat, suggestions, embeddings)
 * in ObjectStack. Concrete implementations (OpenAI, Anthropic, Ollama, etc.)
 * should implement this interface.
 *
 * Follows Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete AI/LLM provider implementations.
 *
 * Aligned with CoreServiceName 'ai' in core-services.zod.ts.
 */

/**
 * A chat message in a conversation
 */
export interface AIMessage {
    /** Message role */
    role: 'system' | 'user' | 'assistant';
    /** Message content */
    content: string;
}

/**
 * Options for AI completion/chat requests
 */
export interface AIRequestOptions {
    /** Model identifier to use */
    model?: string;
    /** Sampling temperature (0-2) */
    temperature?: number;
    /** Maximum tokens to generate */
    maxTokens?: number;
    /** Stop sequences */
    stop?: string[];
}

/**
 * Result of an AI completion/chat request
 */
export interface AIResult {
    /** Generated text content */
    content: string;
    /** Model used for generation */
    model?: string;
    /** Token usage statistics */
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface IAIService {
    /**
     * Generate a chat completion from a conversation
     * @param messages - Array of conversation messages
     * @param options - Optional request configuration
     * @returns AI-generated response
     */
    chat(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResult>;

    /**
     * Generate a text completion from a prompt
     * @param prompt - Input prompt string
     * @param options - Optional request configuration
     * @returns AI-generated response
     */
    complete(prompt: string, options?: AIRequestOptions): Promise<AIResult>;

    /**
     * Generate embeddings for a text input
     * @param input - Text or array of texts to embed
     * @param model - Optional embedding model identifier
     * @returns Array of embedding vectors
     */
    embed?(input: string | string[], model?: string): Promise<number[][]>;

    /**
     * List available models
     * @returns Array of model identifiers
     */
    listModels?(): Promise<string[]>;
}

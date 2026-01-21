"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportFieldSynonyms = exports.KnowledgeBaseRAG = exports.SupportModelRegistry = exports.SupportAgent = void 0;
/**
 * AI Support Assistant - Agent Configuration
 */
exports.SupportAgent = {
    name: 'customer_support_ai',
    label: 'AI Support Agent',
    avatar: '/avatars/support-bot.png',
    role: 'Senior Customer Support Specialist',
    instructions: `You are an experienced customer support agent for ObjectStack.

Your responsibilities:
- Answer customer questions professionally and accurately
- Search the knowledge base for solutions
- Create support tickets when needed
- Escalate complex issues to human agents
- Track customer satisfaction

Always be polite, empathetic, and solution-oriented. If you don't know something, say so and offer to escalate.`,
    model: {
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 2048,
    },
    tools: [
        {
            type: 'action',
            name: 'create_support_ticket',
            description: 'Create a new support ticket for the customer',
        },
        {
            type: 'action',
            name: 'escalate_to_human',
            description: 'Transfer conversation to a human agent',
        },
        {
            type: 'query',
            name: 'search_tickets',
            description: 'Search existing support tickets for similar issues',
        },
        {
            type: 'vector_search',
            name: 'kb_search',
            description: 'Search the knowledge base for relevant documentation',
        },
        {
            type: 'action',
            name: 'update_ticket_status',
            description: 'Update the status of a support ticket',
        },
        {
            type: 'flow',
            name: 'collect_customer_feedback',
            description: 'Collect customer satisfaction feedback',
        },
    ],
    knowledge: {
        topics: [
            'product_documentation',
            'troubleshooting_guides',
            'faq',
            'api_reference',
            'best_practices',
            'release_notes',
        ],
        indexes: ['support_kb_v2'],
    },
    access: ['support_team', 'customers'],
    active: true,
};
/**
 * Model Registry for AI Support
 */
exports.SupportModelRegistry = {
    name: 'ai_support_registry',
    models: {
        'gpt-4-turbo': {
            model: {
                id: 'gpt-4-turbo',
                name: 'GPT-4 Turbo',
                version: 'gpt-4-turbo-2024-04-09',
                provider: 'openai',
                capabilities: {
                    textGeneration: true,
                    textEmbedding: false,
                    imageGeneration: false,
                    imageUnderstanding: false,
                    functionCalling: true,
                    codeGeneration: false,
                    reasoning: true,
                },
                limits: {
                    maxTokens: 4096,
                    contextWindow: 128000,
                    rateLimit: {
                        requestsPerMinute: 100,
                    },
                },
                pricing: {
                    currency: 'USD',
                    inputCostPer1kTokens: 0.01,
                    outputCostPer1kTokens: 0.03,
                },
                tags: ['chat', 'support'],
                deprecated: false,
            },
            status: 'active',
            priority: 10,
            fallbackModels: ['gpt-3.5-turbo'],
            healthCheck: {
                enabled: true,
                intervalSeconds: 300,
                status: 'healthy',
            },
        },
        'text-embedding-3-large': {
            model: {
                id: 'text-embedding-3-large',
                name: 'Text Embedding 3 Large',
                version: 'text-embedding-3-large',
                provider: 'openai',
                capabilities: {
                    textGeneration: false,
                    textEmbedding: true,
                    imageGeneration: false,
                    imageUnderstanding: false,
                    functionCalling: false,
                    codeGeneration: false,
                    reasoning: false,
                },
                limits: {
                    maxTokens: 8191,
                    contextWindow: 8191,
                },
                pricing: {
                    currency: 'USD',
                    embeddingCostPer1kTokens: 0.00013,
                },
                tags: ['embedding', 'rag'],
                deprecated: false,
            },
            status: 'active',
            priority: 10,
        },
    },
    promptTemplates: {
        support_response: {
            id: 'support-response-v1',
            name: 'support_response',
            label: 'Support Response Template',
            version: '1.0.0',
            system: 'You are a helpful customer support agent. Be empathetic and solution-oriented.',
            user: `Customer: {{customer_name}}
Question: {{question}}
Knowledge Base Context: {{kb_context}}

Provide a helpful, professional response.`,
            variables: [
                { name: 'customer_name', type: 'string', required: true },
                { name: 'question', type: 'string', required: true },
                { name: 'kb_context', type: 'string', required: false },
            ],
            modelId: 'gpt-4-turbo',
            temperature: 0.7,
            category: 'support',
        },
    },
    defaultModel: 'gpt-4-turbo',
    enableAutoFallback: true,
};
/**
 * RAG Pipeline for Knowledge Base
 */
exports.KnowledgeBaseRAG = {
    name: 'support_knowledge_base',
    label: 'Customer Support Knowledge Base',
    description: 'RAG pipeline for customer support documentation, FAQs, and troubleshooting guides',
    embedding: {
        provider: 'openai',
        model: 'text-embedding-3-large',
        dimensions: 3072,
        batchSize: 100,
    },
    vectorStore: {
        provider: 'pinecone',
        indexName: 'support-kb-prod',
        namespace: 'v2',
        dimensions: 3072,
        metric: 'cosine',
        batchSize: 100,
        connectionPoolSize: 10,
        timeout: 30000,
    },
    chunking: {
        type: 'markdown',
        maxChunkSize: 1000,
        respectHeaders: true,
        respectCodeBlocks: true,
    },
    retrieval: {
        type: 'mmr',
        topK: 5,
        fetchK: 20,
        lambda: 0.7,
    },
    reranking: {
        enabled: true,
        model: 'rerank-english-v3.0',
        provider: 'cohere',
        topK: 3,
    },
    loaders: [
        {
            type: 'directory',
            source: '/knowledge-base/docs',
            fileTypes: ['.md', '.txt', '.pdf'],
            recursive: true,
            maxFileSize: 5242880, // 5MB
            excludePatterns: ['**/archive/**', '**/drafts/**'],
            extractImages: false,
            extractTables: true,
        },
    ],
    maxContextTokens: 6000,
    contextWindow: 128000,
    metadataFilters: {
        status: 'published',
        language: 'en',
    },
    enableCache: true,
    cacheTTL: 3600,
};
/**
 * Field Synonyms for Natural Language Queries
 */
exports.SupportFieldSynonyms = [
    {
        object: 'support_ticket',
        field: 'status',
        synonyms: ['state', 'current status', 'ticket status', 'situation'],
        examples: [
            'show open tickets',
            'what is the current status of my ticket',
        ],
    },
    {
        object: 'support_ticket',
        field: 'priority',
        synonyms: ['urgency', 'importance', 'severity'],
        examples: [
            'show high priority tickets',
            'urgent cases',
        ],
    },
];

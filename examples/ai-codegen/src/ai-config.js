"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectStackDocsRAG = exports.CodeGenModelRegistry = exports.CodeGenAgent = void 0;
/**
 * ObjectStack Code Generator Agent
 */
exports.CodeGenAgent = {
    name: 'objectstack_code_generator',
    label: 'ObjectStack Code Generator',
    role: 'Senior ObjectStack Developer',
    instructions: `You are an expert ObjectStack developer who generates high-quality applications.

Rules:
1. Follow ObjectStack naming conventions (camelCase for props, snake_case for names)
2. Generate complete, production-ready code
3. Include validation rules and indexes
4. Create appropriate views and forms
5. Follow best practices from the knowledge base

Always validate generated code before returning.`,
    model: {
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        temperature: 0.3,
        maxTokens: 8192,
    },
    tools: [
        {
            type: 'action',
            name: 'generate_object',
            description: 'Generate ObjectStack object definition',
        },
        {
            type: 'action',
            name: 'generate_field',
            description: 'Generate field definition',
        },
        {
            type: 'action',
            name: 'generate_view',
            description: 'Generate view configuration',
        },
        {
            type: 'action',
            name: 'validate_schema',
            description: 'Validate generated schema',
        },
        {
            type: 'vector_search',
            name: 'search_examples',
            description: 'Search example applications',
        },
    ],
    knowledge: {
        topics: [
            'objectstack_protocol',
            'best_practices',
            'code_examples',
            'design_patterns',
        ],
        indexes: ['objectstack_knowledge'],
    },
    active: true,
};
/**
 * Code Generation Model Registry
 */
exports.CodeGenModelRegistry = {
    name: 'code_generation_registry',
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
                    functionCalling: false,
                    codeGeneration: true,
                    reasoning: true,
                },
                limits: {
                    maxTokens: 8192,
                    contextWindow: 128000,
                },
                recommendedFor: ['code_generation', 'complex_reasoning'],
                deprecated: false,
            },
            status: 'active',
            priority: 10,
        },
    },
    promptTemplates: {
        object_generator: {
            id: 'object-gen-v1',
            name: 'object_generator',
            label: 'Object Generator',
            version: '1.0.0',
            system: `You are an expert at generating ObjectStack object definitions.

Generate valid TypeScript code following ObjectStack Protocol.
Use camelCase for configuration properties, snake_case for name identifiers.`,
            user: `Generate an ObjectStack object for: {{description}}

Requirements:
{{requirements}}

Include:
- Field definitions with proper types
- Validation rules if needed
- Indexes for performance
- Enable appropriate features`,
            variables: [
                { name: 'description', type: 'string', required: true },
                { name: 'requirements', type: 'string', required: false },
            ],
            modelId: 'gpt-4-turbo',
            temperature: 0.3,
            category: 'code_generation',
        },
    },
    defaultModel: 'gpt-4-turbo',
    enableAutoFallback: true,
};
/**
 * RAG for ObjectStack Documentation
 */
exports.ObjectStackDocsRAG = {
    name: 'objectstack_documentation',
    label: 'ObjectStack Documentation RAG',
    description: 'RAG pipeline for ObjectStack protocol docs and examples',
    embedding: {
        provider: 'openai',
        model: 'text-embedding-3-large',
        dimensions: 3072,
        batchSize: 100,
    },
    vectorStore: {
        provider: 'pinecone',
        indexName: 'objectstack-docs',
        dimensions: 3072,
        metric: 'cosine',
        batchSize: 100,
        connectionPoolSize: 10,
        timeout: 30000,
    },
    chunking: {
        type: 'markdown',
        maxChunkSize: 1500,
        respectHeaders: true,
        respectCodeBlocks: true,
    },
    retrieval: {
        type: 'similarity',
        topK: 5,
        scoreThreshold: 0.7,
    },
    maxContextTokens: 8000,
    enableCache: true,
    cacheTTL: 7200,
};

/**
 * Example: AI Protocol - RAG Pipeline
 * 
 * This example demonstrates the Retrieval-Augmented Generation (RAG) pipeline in ObjectStack.
 * RAG combines:
 * - Vector database for semantic search
 * - Document chunking and embedding
 * - Context retrieval for LLM prompts
 * - AI-powered question answering
 */

import type {
  RAGPipelineConfig,
  DocumentChunk,
  DocumentMetadata,
  RAGQueryRequest,
  RAGQueryResponse,
  Agent,
} from '@objectstack/spec';

/**
 * Example 1: RAG Pipeline Configuration
 * 
 * Complete RAG pipeline setup for a knowledge base system
 */
export const knowledgeBaseRAG: RAGPipelineConfig = {
  name: 'knowledge_base_rag',
  label: 'Knowledge Base RAG Pipeline',
  description: 'RAG pipeline for company knowledge base',

  // Embedding Configuration
  embedding: {
    provider: 'openai',
    model: 'text-embedding-ada-002',
    dimensions: 1536,
    batchSize: 100,
  },

  // Vector Store
  vectorStore: {
    provider: 'pinecone',
    indexName: 'knowledge-base',
    namespace: 'production',
    dimensions: 1536,
    metric: 'cosine',
  },

  // Chunking strategy
  chunking: {
    type: 'recursive',
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', ' ', ''],
  },

  // Retrieval Configuration
  retrieval: {
    type: 'hybrid',
    topK: 5,
    vectorWeight: 0.7,
    keywordWeight: 0.3,
  },

  // Reranking for better results
  reranking: {
    enabled: true,
    model: 'cohere-rerank-v3',
    provider: 'cohere',
    topK: 3,
  },

  // Context Management
  maxContextTokens: 3000,

  // Metadata filtering
  metadataFilters: {
    status: 'published',
  },
};

/**
 * Example 2: Document Ingestion
 * 
 * How to index documents into the RAG pipeline
 */
export const sampleDocumentMetadata: DocumentMetadata[] = [
  {
    source: 'https://docs.objectstack.dev/architecture',
    sourceType: 'url',
    title: 'ObjectStack Architecture',
    author: 'Technical Team',
    createdAt: '2024-01-15T00:00:00Z',
    category: 'Architecture',
  },
  {
    source: 'https://docs.objectstack.dev/guides/objects',
    sourceType: 'url',
    title: 'Creating Objects Guide',
    author: 'DevRel Team',
    createdAt: '2024-01-20T00:00:00Z',
    category: 'Tutorial',
  },
  {
    source: 'https://docs.objectstack.dev/ai/bridge',
    sourceType: 'url',
    title: 'AI Bridge Documentation',
    author: 'AI Team',
    createdAt: '2024-02-01T00:00:00Z',
    category: 'AI Features',
  },
];

export const sampleDocumentChunks: DocumentChunk[] = [
  {
    id: 'chunk_001',
    content: `ObjectStack is a metadata-driven low-code platform that enables rapid application development.
It uses a three-layer architecture: ObjectQL for data, ObjectUI for presentation, and ObjectOS for runtime.
The platform supports multiple databases and provides built-in AI capabilities.`,
    metadata: sampleDocumentMetadata[0],
    chunkIndex: 0,
    tokens: 45,
  },
  {
    id: 'chunk_002',
    content: `To create a new object in ObjectStack, use the Object Schema definition.
Define fields with types like text, number, lookup, and more.
Enable features like API access, history tracking, and workflows.`,
    metadata: sampleDocumentMetadata[1],
    chunkIndex: 0,
    tokens: 38,
  },
  {
    id: 'chunk_003',
    content: `ObjectStack's AI Bridge allows integration with LLMs like GPT-4, Claude, and Gemini.
It provides model abstraction, cost tracking, and automatic retries.
Use the Agent protocol to define AI assistants with specific capabilities.`,
    metadata: sampleDocumentMetadata[2],
    chunkIndex: 0,
    tokens: 42,
  },
];

/**
 * Example 3: RAG Query
 * 
 * Performing a RAG query with filters and options
 */
export const sampleQueries: RAGQueryRequest[] = [
  {
    // Simple question
    query: 'What is ObjectStack?',
    pipelineName: 'knowledge_base_rag',
    topK: 5,
  },
  {
    // Question with metadata filtering
    query: 'How do I create objects?',
    pipelineName: 'knowledge_base_rag',
    topK: 3,
    metadataFilters: {
      category: 'Tutorial',
    },
  },
  {
    // Advanced query
    query: 'Tell me about AI integration',
    pipelineName: 'knowledge_base_rag',
    topK: 10,
    metadataFilters: {
      category: 'AI Features',
    },
    includeMetadata: true,
    includeSources: true,
  },
];

/**
 * Example 4: RAG Results
 * 
 * What the pipeline returns
 */
export const sampleResults: RAGQueryResponse = {
  query: 'What is ObjectStack?',
  
  // Retrieved chunks
  results: [
    {
      content: `ObjectStack is a metadata-driven low-code platform that enables rapid application development.
It uses a three-layer architecture: ObjectQL for data, ObjectUI for presentation, and ObjectOS for runtime.`,
      score: 0.92,
      metadata: {
        source: 'https://docs.objectstack.dev/architecture',
        sourceType: 'url',
        category: 'Architecture',
      },
    },
    {
      content: `The platform supports multiple databases and provides built-in AI capabilities.`,
      score: 0.85,
      metadata: {
        source: 'https://docs.objectstack.dev/architecture',
        sourceType: 'url',
        category: 'Architecture',
      },
    },
  ],

  // Context assembled for LLM
  context: `Context from knowledge base:

[Source: https://docs.objectstack.dev/architecture]
ObjectStack is a metadata-driven low-code platform that enables rapid application development.
It uses a three-layer architecture: ObjectQL for data, ObjectUI for presentation, and ObjectOS for runtime.

[Source: https://docs.objectstack.dev/architecture]
The platform supports multiple databases and provides built-in AI capabilities.`,

  // Metadata
  processingTimeMs: 150,
  totalResults: 2,
};

/**
 * Example 5: AI Agent with RAG
 * 
 * Integrating RAG into an AI agent
 */
export const ragEnabledAgent: Agent = {
  name: 'documentation_assistant',
  type: 'conversational',
  label: 'Documentation Assistant',
  description: 'AI assistant powered by RAG for answering questions about ObjectStack',

  // Agent capabilities
  capabilities: {
    objectAccess: [],
    canCreate: false,
    canUpdate: false,
    canAnalyze: true,
  },

  // System prompt with RAG instructions
  systemPrompt: `You are a helpful documentation assistant for ObjectStack.

You have access to the knowledge base through RAG (Retrieval-Augmented Generation).
When answering questions:
1. Use the retrieved context to provide accurate information
2. Cite sources when possible
3. If the context doesn't contain the answer, say so honestly
4. Be concise but comprehensive

Always format your responses in a clear, structured way.`,

  // RAG Configuration
  rag: {
    pipeline: 'knowledge_base_rag',
    enabled: true,
    
    // When to trigger RAG
    trigger: 'always', // or 'auto', 'manual'
    
    // Number of chunks to retrieve
    topK: 5,
    
    // Include source attribution
    includeSources: true,
  },

  // Model configuration
  model: {
    provider: 'openai',
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
  },

  // Tools (optional - for function calling)
  tools: [
    {
      name: 'search_documentation',
      description: 'Search the ObjectStack documentation for specific topics',
      parameters: {
        query: 'string',
        category: 'string?',
      },
    },
  ],
};

/**
 * Example 6: Using RAG in Practice
 * 
 * Simulated conversation flow
 */
export function demonstrateRAGUsage() {
  console.log('=== RAG Pipeline Demo ===\n');

  // Step 1: User asks a question
  const userQuestion = 'What is ObjectStack and what are its main components?';
  console.log(`User: ${userQuestion}\n`);

  // Step 2: RAG retrieves relevant chunks
  console.log('RAG Pipeline:');
  console.log('- Embedding query...');
  console.log('- Searching vector database...');
  console.log(`- Retrieved ${sampleResults.results.length} relevant chunks`);
  console.log(`- Processing time: ${sampleResults.processingTimeMs}ms\n`);

  // Step 3: Context is assembled
  console.log('Assembled Context:');
  console.log(sampleResults.context);
  console.log('');

  // Step 4: LLM generates response
  const assistantResponse = `Based on the documentation, ObjectStack is a metadata-driven low-code platform designed for rapid application development. 

It has three main architectural layers:
1. **ObjectQL**: The data layer that handles business logic and data operations
2. **ObjectUI**: The presentation layer for user interfaces
3. **ObjectOS**: The runtime layer that manages system operations

The platform supports multiple databases and includes built-in AI capabilities, making it suitable for creating intelligent applications.

*Source: https://docs.objectstack.dev/architecture*`;

  console.log('Assistant:');
  console.log(assistantResponse);
}

/**
 * Example 7: Advanced RAG Patterns
 */
export const advancedRAGPatterns = {
  // Multi-query RAG: Generate multiple search queries for better retrieval
  multiQuery: {
    originalQuery: 'How do I use AI in ObjectStack?',
    generatedQueries: [
      'ObjectStack AI integration guide',
      'AI agent configuration in ObjectStack',
      'Using LLMs with ObjectStack',
      'ObjectStack AI Bridge tutorial',
    ],
  },

  // Parent Document Retrieval: Retrieve small chunks but return larger parent
  parentDocRetrieval: {
    retrievedChunk: 'Small focused chunk about AI',
    returnedContext: 'Full section containing the chunk with more context',
  },

  // Contextual Compression: Remove irrelevant parts of retrieved chunks
  contextualCompression: {
    original: 'Long chunk with lots of text, some relevant, some not...',
    compressed: 'Only the relevant parts extracted by LLM...',
  },
};

// ============================================================================
// Usage
// ============================================================================

// Demonstrate RAG usage (uncomment to run)
// demonstrateRAGUsage();

// Export all examples
export default {
  knowledgeBaseRAG,
  sampleDocumentMetadata,
  sampleDocumentChunks,
  sampleQueries,
  sampleResults,
  ragEnabledAgent,
  advancedRAGPatterns,
};

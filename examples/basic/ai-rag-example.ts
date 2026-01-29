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
  RAGPipeline,
  RAGDocument,
  RAGQuery,
  RAGResult,
  Agent,
} from '@objectstack/spec';

/**
 * Example 1: RAG Pipeline Configuration
 * 
 * Complete RAG pipeline setup for a knowledge base system
 */
export const knowledgeBaseRAG: RAGPipeline = {
  name: 'knowledge_base_rag',
  description: 'RAG pipeline for company knowledge base',

  // Document Processing
  documentProcessing: {
    // Chunking strategy
    chunkSize: 1000,
    chunkOverlap: 200,
    chunkingStrategy: 'recursive',

    // Text cleaning
    preprocessing: {
      removeHtml: true,
      normalizeWhitespace: true,
      removePunctuation: false,
    },
  },

  // Embedding Configuration
  embedding: {
    model: 'text-embedding-ada-002',
    provider: 'openai',
    dimensions: 1536,

    // Batching for performance
    batchSize: 100,
    maxRetries: 3,
  },

  // Vector Store
  vectorStore: {
    type: 'pinecone',
    index: 'knowledge-base',
    namespace: 'production',

    // Metadata filtering
    metadataFields: ['category', 'author', 'created_at', 'source'],
  },

  // Retrieval Configuration
  retrieval: {
    // How many chunks to retrieve
    topK: 5,

    // Similarity threshold (0-1)
    similarityThreshold: 0.7,

    // Reranking for better results
    reranking: {
      enabled: true,
      model: 'cohere-rerank',
      topN: 3,
    },

    // Hybrid search (combine vector + keyword)
    hybridSearch: {
      enabled: true,
      alpha: 0.7, // 0 = pure keyword, 1 = pure vector
    },
  },

  // Context Assembly
  contextAssembly: {
    // How to combine retrieved chunks
    strategy: 'concatenate',

    // Maximum context length
    maxTokens: 3000,

    // Include metadata in context
    includeMetadata: true,

    // Template for formatting context
    template: `Context from knowledge base:

{{#each chunks}}
[Source: {{metadata.source}}]
{{content}}

{{/each}}`,
  },
};

/**
 * Example 2: Document Ingestion
 * 
 * How to index documents into the RAG pipeline
 */
export const sampleDocuments: RAGDocument[] = [
  {
    id: 'doc_001',
    content: `ObjectStack is a metadata-driven low-code platform that enables rapid application development.
It uses a three-layer architecture: ObjectQL for data, ObjectUI for presentation, and ObjectOS for runtime.
The platform supports multiple databases and provides built-in AI capabilities.`,
    
    metadata: {
      source: 'Product Documentation',
      category: 'Architecture',
      author: 'Technical Team',
      created_at: '2024-01-15',
      url: 'https://docs.objectstack.dev/architecture',
    },
  },
  {
    id: 'doc_002',
    content: `To create a new object in ObjectStack, use the Object Schema definition.
Define fields with types like text, number, lookup, and more.
Enable features like API access, history tracking, and workflows.`,
    
    metadata: {
      source: 'Developer Guide',
      category: 'Tutorial',
      author: 'DevRel Team',
      created_at: '2024-01-20',
      url: 'https://docs.objectstack.dev/guides/objects',
    },
  },
  {
    id: 'doc_003',
    content: `ObjectStack's AI Bridge allows integration with LLMs like GPT-4, Claude, and Gemini.
It provides model abstraction, cost tracking, and automatic retries.
Use the Agent protocol to define AI assistants with specific capabilities.`,
    
    metadata: {
      source: 'AI Documentation',
      category: 'AI Features',
      author: 'AI Team',
      created_at: '2024-02-01',
      url: 'https://docs.objectstack.dev/ai/bridge',
    },
  },
];

/**
 * Example 3: RAG Query
 * 
 * Performing a RAG query with filters and options
 */
export const sampleQueries: RAGQuery[] = [
  {
    // Simple question
    query: 'What is ObjectStack?',
    topK: 5,
  },
  {
    // Question with metadata filtering
    query: 'How do I create objects?',
    topK: 3,
    filter: {
      category: 'Tutorial',
    },
  },
  {
    // Advanced query with reranking
    query: 'Tell me about AI integration',
    topK: 10,
    rerank: true,
    rerankTopN: 3,
    filter: {
      category: 'AI Features',
    },
  },
];

/**
 * Example 4: RAG Results
 * 
 * What the pipeline returns
 */
export const sampleResults: RAGResult = {
  query: 'What is ObjectStack?',
  
  // Retrieved chunks
  chunks: [
    {
      id: 'chunk_001',
      documentId: 'doc_001',
      content: `ObjectStack is a metadata-driven low-code platform that enables rapid application development.
It uses a three-layer architecture: ObjectQL for data, ObjectUI for presentation, and ObjectOS for runtime.`,
      
      score: 0.92,
      
      metadata: {
        source: 'Product Documentation',
        category: 'Architecture',
      },
    },
    {
      id: 'chunk_002',
      documentId: 'doc_001',
      content: `The platform supports multiple databases and provides built-in AI capabilities.`,
      
      score: 0.85,
      
      metadata: {
        source: 'Product Documentation',
        category: 'Architecture',
      },
    },
  ],

  // Assembled context for LLM
  context: `Context from knowledge base:

[Source: Product Documentation]
ObjectStack is a metadata-driven low-code platform that enables rapid application development.
It uses a three-layer architecture: ObjectQL for data, ObjectUI for presentation, and ObjectOS for runtime.

[Source: Product Documentation]
The platform supports multiple databases and provides built-in AI capabilities.`,

  // Metadata
  retrievalTime: 150, // milliseconds
  totalChunks: 2,
  averageScore: 0.885,
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
  console.log(`- Retrieved ${sampleResults.chunks.length} relevant chunks`);
  console.log(`- Average relevance score: ${sampleResults.averageScore}\n`);

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

*Source: Product Documentation - Architecture*`;

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
  sampleDocuments,
  sampleQueries,
  sampleResults,
  ragEnabledAgent,
  advancedRAGPatterns,
};

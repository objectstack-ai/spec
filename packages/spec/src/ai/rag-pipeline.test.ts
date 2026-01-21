import { describe, it, expect } from 'vitest';
import {
  VectorStoreProviderSchema,
  EmbeddingModelSchema,
  ChunkingStrategySchema,
  DocumentMetadataSchema,
  DocumentChunkSchema,
  RetrievalStrategySchema,
  RerankingConfigSchema,
  VectorStoreConfigSchema,
  DocumentLoaderConfigSchema,
  RAGPipelineConfigSchema,
  RAGQueryRequestSchema,
  RAGQueryResponseSchema,
  RAGPipelineStatusSchema,
  type EmbeddingModel,
  type RAGPipelineConfig,
  type RAGQueryRequest,
} from './rag-pipeline.zod';

describe('VectorStoreProviderSchema', () => {
  it('should accept all valid providers', () => {
    const providers = ['pinecone', 'weaviate', 'qdrant', 'milvus', 'chroma', 'pgvector', 'redis', 'opensearch', 'elasticsearch', 'custom'] as const;
    
    providers.forEach(provider => {
      expect(() => VectorStoreProviderSchema.parse(provider)).not.toThrow();
    });
  });
});

describe('EmbeddingModelSchema', () => {
  it('should accept minimal embedding model', () => {
    const model: EmbeddingModel = {
      provider: 'openai',
      model: 'text-embedding-3-large',
      dimensions: 3072,
    };
    const result = EmbeddingModelSchema.parse(model);
    expect(result.batchSize).toBe(100);
  });

  it('should accept full embedding model config', () => {
    const model: EmbeddingModel = {
      provider: 'azure_openai',
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      maxTokens: 8191,
      batchSize: 50,
      endpoint: 'https://mycompany.openai.azure.com',
      apiKey: 'sk-...',
    };
    expect(() => EmbeddingModelSchema.parse(model)).not.toThrow();
  });
});

describe('ChunkingStrategySchema', () => {
  it('should accept fixed chunking strategy', () => {
    const strategy = {
      type: 'fixed',
      chunkSize: 512,
      chunkOverlap: 50,
      unit: 'tokens',
    };
    expect(() => ChunkingStrategySchema.parse(strategy)).not.toThrow();
  });

  it('should accept semantic chunking strategy', () => {
    const strategy = {
      type: 'semantic',
      model: 'sentence-transformers',
      minChunkSize: 100,
      maxChunkSize: 1000,
    };
    expect(() => ChunkingStrategySchema.parse(strategy)).not.toThrow();
  });

  it('should accept recursive chunking strategy', () => {
    const strategy = {
      type: 'recursive',
      separators: ['\n\n', '\n', ' '],
      chunkSize: 1000,
      chunkOverlap: 100,
    };
    expect(() => ChunkingStrategySchema.parse(strategy)).not.toThrow();
  });

  it('should accept markdown chunking strategy', () => {
    const strategy = {
      type: 'markdown',
      maxChunkSize: 1500,
      respectHeaders: true,
      respectCodeBlocks: true,
    };
    expect(() => ChunkingStrategySchema.parse(strategy)).not.toThrow();
  });
});

describe('DocumentMetadataSchema', () => {
  it('should accept minimal metadata', () => {
    const metadata = {
      source: '/docs/user-guide.md',
    };
    expect(() => DocumentMetadataSchema.parse(metadata)).not.toThrow();
  });

  it('should accept full metadata', () => {
    const metadata = {
      source: 'https://docs.example.com/api',
      sourceType: 'url' as const,
      title: 'API Documentation',
      author: 'Engineering Team',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      tags: ['api', 'reference', 'v2'],
      category: 'documentation',
      language: 'en',
      custom: {
        version: '2.0',
        deprecated: false,
      },
    };
    expect(() => DocumentMetadataSchema.parse(metadata)).not.toThrow();
  });
});

describe('DocumentChunkSchema', () => {
  it('should accept document chunk', () => {
    const chunk = {
      id: 'chunk-001',
      content: 'This is the content of the first chunk.',
      metadata: {
        source: '/docs/file.md',
      },
      chunkIndex: 0,
    };
    expect(() => DocumentChunkSchema.parse(chunk)).not.toThrow();
  });

  it('should accept chunk with embedding', () => {
    const chunk = {
      id: 'chunk-002',
      content: 'Second chunk with embedding.',
      embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
      metadata: {
        source: '/docs/file.md',
        sourceType: 'file' as const,
      },
      chunkIndex: 1,
      tokens: 15,
    };
    expect(() => DocumentChunkSchema.parse(chunk)).not.toThrow();
  });
});

describe('RetrievalStrategySchema', () => {
  it('should accept similarity retrieval', () => {
    const strategy = {
      type: 'similarity',
      topK: 5,
      scoreThreshold: 0.7,
    };
    expect(() => RetrievalStrategySchema.parse(strategy)).not.toThrow();
  });

  it('should accept MMR retrieval', () => {
    const strategy = {
      type: 'mmr',
      topK: 5,
      fetchK: 20,
      lambda: 0.5,
    };
    expect(() => RetrievalStrategySchema.parse(strategy)).not.toThrow();
  });

  it('should accept hybrid retrieval', () => {
    const strategy = {
      type: 'hybrid',
      topK: 10,
      vectorWeight: 0.7,
      keywordWeight: 0.3,
    };
    expect(() => RetrievalStrategySchema.parse(strategy)).not.toThrow();
  });

  it('should accept parent document retrieval', () => {
    const strategy = {
      type: 'parent_document',
      topK: 3,
      retrieveParent: true,
    };
    expect(() => RetrievalStrategySchema.parse(strategy)).not.toThrow();
  });
});

describe('RerankingConfigSchema', () => {
  it('should accept disabled reranking', () => {
    const config = {
      enabled: false,
    };
    expect(() => RerankingConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept enabled reranking with model', () => {
    const config = {
      enabled: true,
      model: 'rerank-english-v2.0',
      provider: 'cohere' as const,
      topK: 3,
    };
    expect(() => RerankingConfigSchema.parse(config)).not.toThrow();
  });
});

describe('VectorStoreConfigSchema', () => {
  it('should accept minimal vector store config', () => {
    const config = {
      provider: 'pinecone' as const,
      indexName: 'my-index',
      dimensions: 1536,
    };
    const result = VectorStoreConfigSchema.parse(config);
    expect(result.metric).toBe('cosine');
    expect(result.batchSize).toBe(100);
  });

  it('should accept full vector store config', () => {
    const config = {
      provider: 'qdrant' as const,
      indexName: 'knowledge-base',
      namespace: 'production',
      host: 'localhost',
      port: 6333,
      apiKey: 'api-key-123',
      dimensions: 1536,
      metric: 'cosine' as const,
      batchSize: 50,
      connectionPoolSize: 20,
      timeout: 60000,
    };
    expect(() => VectorStoreConfigSchema.parse(config)).not.toThrow();
  });
});

describe('DocumentLoaderConfigSchema', () => {
  it('should accept file loader', () => {
    const loader = {
      type: 'file' as const,
      source: '/path/to/document.pdf',
    };
    expect(() => DocumentLoaderConfigSchema.parse(loader)).not.toThrow();
  });

  it('should accept directory loader with options', () => {
    const loader = {
      type: 'directory' as const,
      source: '/docs',
      fileTypes: ['.md', '.txt', '.pdf'],
      recursive: true,
      maxFileSize: 10485760, // 10MB
      excludePatterns: ['**/node_modules/**', '**/.git/**'],
      extractImages: true,
      extractTables: true,
    };
    expect(() => DocumentLoaderConfigSchema.parse(loader)).not.toThrow();
  });

  it('should accept API loader', () => {
    const loader = {
      type: 'api' as const,
      source: 'https://api.example.com/documents',
      loaderConfig: {
        headers: {
          'Authorization': 'Bearer token',
        },
        pagination: true,
      },
    };
    expect(() => DocumentLoaderConfigSchema.parse(loader)).not.toThrow();
  });
});

describe('RAGPipelineConfigSchema', () => {
  it('should accept minimal pipeline config', () => {
    const config: RAGPipelineConfig = {
      name: 'basic_rag',
      label: 'Basic RAG Pipeline',
      embedding: {
        provider: 'openai',
        model: 'text-embedding-3-small',
        dimensions: 1536,
      },
      vectorStore: {
        provider: 'pinecone',
        indexName: 'docs-index',
        dimensions: 1536,
      },
      chunking: {
        type: 'fixed',
        chunkSize: 512,
      },
      retrieval: {
        type: 'similarity',
        topK: 5,
      },
    };
    const result = RAGPipelineConfigSchema.parse(config);
    expect(result.maxContextTokens).toBe(4000);
    expect(result.enableCache).toBe(true);
  });

  it('should enforce snake_case for pipeline name', () => {
    const validNames = ['support_docs', 'api_reference', 'user_guide'];
    validNames.forEach(name => {
      expect(() => RAGPipelineConfigSchema.parse({
        name,
        label: 'Test',
        embedding: {
          provider: 'openai',
          model: 'text-embedding-3-small',
          dimensions: 1536,
        },
        vectorStore: {
          provider: 'pinecone',
          indexName: 'test',
          dimensions: 1536,
        },
        chunking: {
          type: 'fixed',
          chunkSize: 512,
        },
        retrieval: {
          type: 'similarity',
        },
      })).not.toThrow();
    });

    const invalidNames = ['supportDocs', 'Support-Docs', '123docs'];
    invalidNames.forEach(name => {
      expect(() => RAGPipelineConfigSchema.parse({
        name,
        label: 'Test',
        embedding: {
          provider: 'openai',
          model: 'text-embedding-3-small',
          dimensions: 1536,
        },
        vectorStore: {
          provider: 'pinecone',
          indexName: 'test',
          dimensions: 1536,
        },
        chunking: {
          type: 'fixed',
          chunkSize: 512,
        },
        retrieval: {
          type: 'similarity',
        },
      })).toThrow();
    });
  });

  it('should accept full pipeline config', () => {
    const config: RAGPipelineConfig = {
      name: 'enterprise_kb',
      label: 'Enterprise Knowledge Base',
      description: 'RAG pipeline for company documentation',
      embedding: {
        provider: 'azure_openai',
        model: 'text-embedding-ada-002',
        dimensions: 1536,
        batchSize: 100,
        endpoint: 'https://mycompany.openai.azure.com',
      },
      vectorStore: {
        provider: 'qdrant',
        indexName: 'enterprise-kb',
        namespace: 'production',
        host: 'qdrant.example.com',
        port: 6333,
        dimensions: 1536,
        metric: 'cosine',
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
        lambda: 0.6,
      },
      reranking: {
        enabled: true,
        model: 'rerank-english-v2.0',
        provider: 'cohere',
        topK: 3,
      },
      loaders: [
        {
          type: 'directory',
          source: '/docs',
          fileTypes: ['.md', '.txt'],
          recursive: true,
        },
        {
          type: 'url',
          source: 'https://docs.example.com',
        },
      ],
      maxContextTokens: 8000,
      contextWindow: 128000,
      metadataFilters: {
        language: 'en',
        category: 'public',
      },
      enableCache: true,
      cacheTTL: 7200,
    };
    expect(() => RAGPipelineConfigSchema.parse(config)).not.toThrow();
  });
});

describe('RAGQueryRequestSchema', () => {
  it('should accept minimal query request', () => {
    const request: RAGQueryRequest = {
      query: 'How do I create a new object?',
      pipelineName: 'support_docs',
    };
    const result = RAGQueryRequestSchema.parse(request);
    expect(result.includeMetadata).toBe(true);
    expect(result.includeSources).toBe(true);
  });

  it('should accept full query request', () => {
    const request: RAGQueryRequest = {
      query: 'How do I configure authentication?',
      pipelineName: 'api_docs',
      topK: 10,
      metadataFilters: {
        category: 'security',
        version: '2.0',
      },
      conversationHistory: [
        {
          role: 'user',
          content: 'Tell me about authentication',
        },
        {
          role: 'assistant',
          content: 'ObjectStack supports multiple authentication methods...',
        },
      ],
      includeMetadata: true,
      includeSources: true,
    };
    expect(() => RAGQueryRequestSchema.parse(request)).not.toThrow();
  });
});

describe('RAGQueryResponseSchema', () => {
  it('should accept query response', () => {
    const response = {
      query: 'How do I create objects?',
      results: [
        {
          content: 'To create an object, define a schema...',
          score: 0.89,
          metadata: {
            source: '/docs/objects.md',
            title: 'Object Creation Guide',
          },
          chunkId: 'chunk-123',
        },
        {
          content: 'Objects are the foundation...',
          score: 0.82,
          metadata: {
            source: '/docs/concepts.md',
          },
          chunkId: 'chunk-456',
        },
      ],
      context: 'To create an object, define a schema...\n\nObjects are the foundation...',
      tokensUsed: 1500,
      retrievalTime: 250,
    };
    expect(() => RAGQueryResponseSchema.parse(response)).not.toThrow();
  });
});

describe('RAGPipelineStatusSchema', () => {
  it('should accept pipeline status', () => {
    const status = {
      name: 'support_kb',
      status: 'active' as const,
      documentsIndexed: 1250,
      lastIndexed: '2024-01-15T10:00:00Z',
      health: {
        vectorStore: 'healthy' as const,
        embeddingService: 'healthy' as const,
      },
    };
    expect(() => RAGPipelineStatusSchema.parse(status)).not.toThrow();
  });

  it('should accept error status', () => {
    const status = {
      name: 'failed_pipeline',
      status: 'error' as const,
      documentsIndexed: 500,
      errorMessage: 'Failed to connect to vector store',
      health: {
        vectorStore: 'unhealthy' as const,
        embeddingService: 'healthy' as const,
      },
    };
    expect(() => RAGPipelineStatusSchema.parse(status)).not.toThrow();
  });
});

describe('Real-World RAG Pipeline Examples', () => {
  it('should accept production support pipeline', () => {
    const config: RAGPipelineConfig = {
      name: 'customer_support_kb',
      label: 'Customer Support Knowledge Base',
      description: 'RAG pipeline for customer support documentation and FAQs',
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
      },
      chunking: {
        type: 'recursive',
        separators: ['\n\n', '\n', '. ', ' '],
        chunkSize: 800,
        chunkOverlap: 100,
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
          maxFileSize: 5242880,
          excludePatterns: ['**/archive/**', '**/drafts/**'],
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
    
    expect(() => RAGPipelineConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept code documentation pipeline', () => {
    const config: RAGPipelineConfig = {
      name: 'api_reference_rag',
      label: 'API Reference RAG',
      description: 'RAG pipeline for API documentation with code examples',
      embedding: {
        provider: 'cohere',
        model: 'embed-english-v3.0',
        dimensions: 1024,
      },
      vectorStore: {
        provider: 'weaviate',
        indexName: 'ApiDocs',
        host: 'weaviate.example.com',
        dimensions: 1024,
        metric: 'cosine',
      },
      chunking: {
        type: 'markdown',
        maxChunkSize: 1500,
        respectHeaders: true,
        respectCodeBlocks: true,
      },
      retrieval: {
        type: 'hybrid',
        topK: 8,
        vectorWeight: 0.8,
        keywordWeight: 0.2,
      },
      loaders: [
        {
          type: 'api',
          source: 'https://api.example.com/docs',
          loaderConfig: {
            authToken: 'token-123',
            format: 'openapi',
          },
        },
      ],
      maxContextTokens: 4000,
      enableCache: true,
      cacheTTL: 7200,
    };
    
    expect(() => RAGPipelineConfigSchema.parse(config)).not.toThrow();
  });
});

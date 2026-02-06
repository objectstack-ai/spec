import type { RagPipeline } from '@objectstack/spec/ai';

/**
 * CRM RAG Pipelines
 * Define Retrieval-Augmented Generation pipelines for knowledge retrieval
 */

// Sales Knowledge RAG Pipeline
export const SalesKnowledgeRAG: RagPipeline = {
  name: 'sales_knowledge',
  label: 'Sales Knowledge Pipeline',
  description: 'RAG pipeline for sales team knowledge and best practices',
  
  indexes: [
    {
      name: 'sales_playbook_index',
      type: 'vector',
      
      sources: [
        {
          type: 'document',
          path: '/knowledge/sales/**/*.md',
          watch: true,
        },
        {
          type: 'document',
          path: '/knowledge/products/**/*.pdf',
          watch: true,
        },
        {
          type: 'object',
          objectName: 'opportunity',
          fields: ['name', 'description', 'stage', 'amount'],
          filter: {
            stage: 'closed_won',
            close_date: { $gte: '{last_12_months}' },
          },
        },
      ],
      
      embedding: {
        provider: 'openai',
        model: 'text-embedding-3-large',
        dimensions: 1536,
      },
      
      chunking: {
        strategy: 'semantic',
        chunkSize: 1000,
        chunkOverlap: 200,
      },
      
      metadata: {
        extractors: [
          {
            type: 'title',
            source: 'filename',
          },
          {
            type: 'date',
            source: 'modified_date',
          },
          {
            type: 'category',
            source: 'directory',
          },
        ],
      },
    },
  ],
  
  retrieval: {
    strategy: 'hybrid',
    
    vectorSearch: {
      topK: 10,
      scoreThreshold: 0.7,
      algorithm: 'cosine',
    },
    
    keywordSearch: {
      enabled: true,
      weight: 0.3,
    },
    
    reranking: {
      enabled: true,
      model: 'cohere-rerank',
      topK: 5,
    },
  },
  
  generation: {
    model: {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
    },
    
    promptTemplate: `You are a sales expert assistant. Use the following context to answer the question.

Context:
{context}

Question: {question}

Answer the question based on the context. If you cannot find the answer in the context, say so.`,
  },
  
  caching: {
    enabled: true,
    ttl: 3600, // 1 hour
  },
};

// Customer Support Knowledge RAG Pipeline
export const SupportKnowledgeRAG: RagPipeline = {
  name: 'support_knowledge',
  label: 'Support Knowledge Pipeline',
  description: 'RAG pipeline for customer support knowledge base',
  
  indexes: [
    {
      name: 'support_kb_index',
      type: 'vector',
      
      sources: [
        {
          type: 'document',
          path: '/knowledge/support/**/*.md',
          watch: true,
        },
        {
          type: 'object',
          objectName: 'case',
          fields: ['subject', 'description', 'resolution', 'status'],
          filter: {
            is_closed: true,
            resolution: { $ne: null },
          },
        },
      ],
      
      embedding: {
        provider: 'openai',
        model: 'text-embedding-3-small',
        dimensions: 768,
      },
      
      chunking: {
        strategy: 'fixed',
        chunkSize: 512,
        chunkOverlap: 100,
      },
      
      metadata: {
        extractors: [
          {
            type: 'category',
            source: 'directory',
          },
          {
            type: 'tags',
            source: 'frontmatter.tags',
          },
        ],
      },
    },
  ],
  
  retrieval: {
    strategy: 'vector_only',
    
    vectorSearch: {
      topK: 5,
      scoreThreshold: 0.75,
      algorithm: 'cosine',
    },
  },
  
  generation: {
    model: {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1500,
    },
    
    promptTemplate: `You are a customer support specialist. Use the knowledge base to help resolve customer issues.

Knowledge Base:
{context}

Customer Issue: {question}

Provide a clear, step-by-step solution. If you need more information, ask clarifying questions.`,
  },
  
  caching: {
    enabled: true,
    ttl: 7200, // 2 hours
  },
};

// Product Information RAG Pipeline
export const ProductInfoRAG: RagPipeline = {
  name: 'product_info',
  label: 'Product Information Pipeline',
  description: 'RAG pipeline for product catalog and specifications',
  
  indexes: [
    {
      name: 'product_catalog_index',
      type: 'vector',
      
      sources: [
        {
          type: 'object',
          objectName: 'product',
          fields: ['name', 'description', 'category', 'family', 'sku'],
        },
        {
          type: 'document',
          path: '/knowledge/products/**/*.{md,pdf}',
          watch: true,
        },
      ],
      
      embedding: {
        provider: 'openai',
        model: 'text-embedding-3-small',
        dimensions: 768,
      },
      
      chunking: {
        strategy: 'semantic',
        chunkSize: 800,
        chunkOverlap: 150,
      },
    },
  ],
  
  retrieval: {
    strategy: 'hybrid',
    
    vectorSearch: {
      topK: 8,
      scoreThreshold: 0.6,
      algorithm: 'cosine',
    },
    
    keywordSearch: {
      enabled: true,
      weight: 0.4,
    },
  },
  
  generation: {
    model: {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      temperature: 0.5,
      maxTokens: 1000,
    },
    
    promptTemplate: `You are a product specialist. Answer questions about our products using the catalog.

Product Catalog:
{context}

Question: {question}

Provide accurate product information. Highlight key features and benefits.`,
  },
  
  caching: {
    enabled: true,
    ttl: 14400, // 4 hours
  },
};

// Competitive Intelligence RAG Pipeline
export const CompetitiveIntelRAG: RagPipeline = {
  name: 'competitive_intel',
  label: 'Competitive Intelligence Pipeline',
  description: 'RAG pipeline for competitive analysis and market insights',
  
  indexes: [
    {
      name: 'competitive_index',
      type: 'vector',
      
      sources: [
        {
          type: 'document',
          path: '/knowledge/competitive/**/*.md',
          watch: true,
        },
        {
          type: 'document',
          path: '/knowledge/market-research/**/*.pdf',
          watch: true,
        },
      ],
      
      embedding: {
        provider: 'openai',
        model: 'text-embedding-3-large',
        dimensions: 1536,
      },
      
      chunking: {
        strategy: 'semantic',
        chunkSize: 1200,
        chunkOverlap: 250,
      },
      
      metadata: {
        extractors: [
          {
            type: 'competitor',
            source: 'frontmatter.competitor',
          },
          {
            type: 'date',
            source: 'frontmatter.date',
          },
        ],
      },
    },
  ],
  
  retrieval: {
    strategy: 'vector_only',
    
    vectorSearch: {
      topK: 7,
      scoreThreshold: 0.65,
      algorithm: 'cosine',
    },
    
    reranking: {
      enabled: true,
      model: 'cohere-rerank',
      topK: 5,
    },
  },
  
  generation: {
    model: {
      provider: 'anthropic',
      model: 'claude-3-sonnet',
      temperature: 0.6,
      maxTokens: 2500,
    },
    
    promptTemplate: `You are a competitive intelligence analyst. Provide strategic insights based on market data.

Market Intelligence:
{context}

Analysis Request: {question}

Provide comprehensive analysis with data-driven insights. Identify opportunities and threats.`,
  },
  
  caching: {
    enabled: true,
    ttl: 3600, // 1 hour
  },
};

export const CrmRagPipelines = {
  SalesKnowledgeRAG,
  SupportKnowledgeRAG,
  ProductInfoRAG,
  CompetitiveIntelRAG,
};

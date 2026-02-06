import type { RagPipeline } from '@objectstack/spec/ai';

export const ProductInfoRAG: RagPipeline = {
  name: 'product_info',
  label: 'Product Information Pipeline',
  description: 'RAG pipeline for product catalog and specifications',
  
  indexes: [{
    name: 'product_catalog_index',
    type: 'vector',
    sources: [
      { type: 'object', objectName: 'product', fields: ['name', 'description', 'category', 'family', 'sku'] },
      { type: 'document', path: '/knowledge/products/**/*.{md,pdf}', watch: true },
    ],
    embedding: { provider: 'openai', model: 'text-embedding-3-small', dimensions: 768 },
    chunking: { strategy: 'semantic', chunkSize: 800, chunkOverlap: 150 },
  }],
  
  retrieval: {
    strategy: 'hybrid',
    vectorSearch: { topK: 8, scoreThreshold: 0.6, algorithm: 'cosine' },
    keywordSearch: { enabled: true, weight: 0.4 },
  },
  
  generation: {
    model: { provider: 'openai', model: 'gpt-3.5-turbo', temperature: 0.5, maxTokens: 1000 },
    promptTemplate: `You are a product specialist. Answer questions about our products using the catalog.

Product Catalog:
{context}

Question: {question}

Provide accurate product information. Highlight key features and benefits.`,
  },
  
  caching: { enabled: true, ttl: 14400 },
};

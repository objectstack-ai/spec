import type { RagPipeline } from '@objectstack/spec/ai';

export const SalesKnowledgeRAG: RagPipeline = {
  name: 'sales_knowledge',
  label: 'Sales Knowledge Pipeline',
  description: 'RAG pipeline for sales team knowledge and best practices',
  
  indexes: [{
    name: 'sales_playbook_index',
    type: 'vector',
    sources: [
      { type: 'document', path: '/knowledge/sales/**/*.md', watch: true },
      { type: 'document', path: '/knowledge/products/**/*.pdf', watch: true },
      { type: 'object', objectName: 'opportunity', fields: ['name', 'description', 'stage', 'amount'], filter: { stage: 'closed_won', close_date: { $gte: '{last_12_months}' } } },
    ],
    embedding: { provider: 'openai', model: 'text-embedding-3-large', dimensions: 1536 },
    chunking: { strategy: 'semantic', chunkSize: 1000, chunkOverlap: 200 },
    metadata: { extractors: [{ type: 'title', source: 'filename' }, { type: 'date', source: 'modified_date' }, { type: 'category', source: 'directory' }] },
  }],
  
  retrieval: {
    strategy: 'hybrid',
    vectorSearch: { topK: 10, scoreThreshold: 0.7, algorithm: 'cosine' },
    keywordSearch: { enabled: true, weight: 0.3 },
    reranking: { enabled: true, model: 'cohere-rerank', topK: 5 },
  },
  
  generation: {
    model: { provider: 'openai', model: 'gpt-4', temperature: 0.7, maxTokens: 2000 },
    promptTemplate: `You are a sales expert assistant. Use the following context to answer the question.

Context:
{context}

Question: {question}

Answer the question based on the context. If you cannot find the answer in the context, say so.`,
  },
  
  caching: { enabled: true, ttl: 3600 },
};

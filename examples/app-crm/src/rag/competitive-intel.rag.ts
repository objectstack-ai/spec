import type { RagPipeline } from '@objectstack/spec/ai';

export const CompetitiveIntelRAG: RagPipeline = {
  name: 'competitive_intel',
  label: 'Competitive Intelligence Pipeline',
  description: 'RAG pipeline for competitive analysis and market insights',
  
  indexes: [{
    name: 'competitive_index',
    type: 'vector',
    sources: [
      { type: 'document', path: '/knowledge/competitive/**/*.md', watch: true },
      { type: 'document', path: '/knowledge/market-research/**/*.pdf', watch: true },
    ],
    embedding: { provider: 'openai', model: 'text-embedding-3-large', dimensions: 1536 },
    chunking: { strategy: 'semantic', chunkSize: 1200, chunkOverlap: 250 },
    metadata: { extractors: [{ type: 'competitor', source: 'frontmatter.competitor' }, { type: 'date', source: 'frontmatter.date' }] },
  }],
  
  retrieval: {
    strategy: 'vector_only',
    vectorSearch: { topK: 7, scoreThreshold: 0.65, algorithm: 'cosine' },
    reranking: { enabled: true, model: 'cohere-rerank', topK: 5 },
  },
  
  generation: {
    model: { provider: 'anthropic', model: 'claude-3-sonnet', temperature: 0.6, maxTokens: 2500 },
    promptTemplate: `You are a competitive intelligence analyst. Provide strategic insights based on market data.

Market Intelligence:
{context}

Analysis Request: {question}

Provide comprehensive analysis with data-driven insights. Identify opportunities and threats.`,
  },
  
  caching: { enabled: true, ttl: 3600 },
};

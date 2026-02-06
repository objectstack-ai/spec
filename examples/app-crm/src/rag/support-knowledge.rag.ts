import type { RagPipeline } from '@objectstack/spec/ai';

export const SupportKnowledgeRAG: RagPipeline = {
  name: 'support_knowledge',
  label: 'Support Knowledge Pipeline',
  description: 'RAG pipeline for customer support knowledge base',
  
  indexes: [{
    name: 'support_kb_index',
    type: 'vector',
    sources: [
      { type: 'document', path: '/knowledge/support/**/*.md', watch: true },
      { type: 'object', objectName: 'case', fields: ['subject', 'description', 'resolution', 'status'], filter: { is_closed: true, resolution: { $ne: null } } },
    ],
    embedding: { provider: 'openai', model: 'text-embedding-3-small', dimensions: 768 },
    chunking: { strategy: 'fixed', chunkSize: 512, chunkOverlap: 100 },
    metadata: { extractors: [{ type: 'category', source: 'directory' }, { type: 'tags', source: 'frontmatter.tags' }] },
  }],
  
  retrieval: {
    strategy: 'vector_only',
    vectorSearch: { topK: 5, scoreThreshold: 0.75, algorithm: 'cosine' },
  },
  
  generation: {
    model: { provider: 'openai', model: 'gpt-4', temperature: 0.3, maxTokens: 1500 },
    promptTemplate: `You are a customer support specialist. Use the knowledge base to help resolve customer issues.

Knowledge Base:
{context}

Customer Issue: {question}

Provide a clear, step-by-step solution. If you need more information, ask clarifying questions.`,
  },
  
  caching: { enabled: true, ttl: 7200 },
};

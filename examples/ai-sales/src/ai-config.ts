import type { Agent, ModelRegistry, RAGPipelineConfig } from '@objectstack/spec/ai';

/**
 * AI Sales Assistant Agent
 */
export const SalesAgent: Agent = {
  name: 'sales_assistant_ai',
  label: 'AI Sales Assistant',
  role: 'Sales Development Representative',
  
  instructions: `You are a sales assistant helping SDRs close deals.

Core capabilities:
- Research accounts and contacts
- Draft personalized outreach emails
- Update opportunity information
- Provide competitive intelligence
- Schedule follow-ups

Be persuasive but honest. Focus on value creation.`,
  
  model: {
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    temperature: 0.8,
  },
  
  tools: [
    {
      type: 'query',
      name: 'get_account_info',
      description: 'Retrieve account and contact details',
    },
    {
      type: 'action',
      name: 'update_opportunity',
      description: 'Update opportunity fields and stage',
    },
    {
      type: 'action',
      name: 'send_email',
      description: 'Send personalized email via template',
    },
    {
      type: 'flow',
      name: 'create_follow_up_task',
      description: 'Schedule follow-up activity',
    },
    {
      type: 'vector_search',
      name: 'search_case_studies',
      description: 'Find relevant customer success stories',
    },
  ],
  
  knowledge: {
    topics: ['sales_playbooks', 'product_features', 'case_studies', 'competitor_analysis'],
    indexes: ['sales_intelligence'],
  },
  
  access: ['sales_team'],
  active: true,
};

/**
 * Sales Model Registry
 */
export const SalesModelRegistry: ModelRegistry = {
  name: 'sales_ai_registry',
  
  models: {
    'claude-3-sonnet': {
      model: {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        version: 'claude-3-sonnet-20240229',
        provider: 'anthropic',
        capabilities: {
          textGeneration: true,
          textEmbedding: false,
          imageGeneration: false,
          imageUnderstanding: false,
          functionCalling: false,
          codeGeneration: false,
          reasoning: true,
        },
        limits: {
          maxTokens: 4096,
          contextWindow: 200000,
        },
        pricing: {
          currency: 'USD',
          inputCostPer1kTokens: 0.003,
          outputCostPer1kTokens: 0.015,
        },
        recommendedFor: ['creative_writing', 'personalization'],
        deprecated: false,
      },
      status: 'active',
      priority: 10,
    },
  },
  
  promptTemplates: {
    personalized_email: {
      id: 'email-v1',
      name: 'personalized_email',
      label: 'Personalized Sales Email',
      version: '1.0.0',
      system: 'You are an expert sales writer. Create compelling, personalized emails.',
      user: `Write a personalized email to:
Company: {{company_name}}
Contact: {{contact_name}}
Title: {{contact_title}}
Industry: {{industry}}

Objective: {{objective}}
Value Proposition: {{value_prop}}

Tone: Professional but friendly. Max 150 words.`,
      variables: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'contact_title', type: 'string', required: false },
        { name: 'industry', type: 'string', required: false },
        { name: 'objective', type: 'string', required: true },
        { name: 'value_prop', type: 'string', required: true },
      ],
      modelId: 'claude-3-sonnet',
      temperature: 0.8,
      category: 'sales_outreach',
    },
  },
  
  defaultModel: 'claude-3-sonnet',
  enableAutoFallback: true,
};

/**
 * Sales Intelligence RAG
 */
export const SalesIntelligenceRAG: RAGPipelineConfig = {
  name: 'sales_intelligence',
  label: 'Sales Intelligence',
  description: 'RAG pipeline for sales playbooks, case studies, and competitive intel',
  
  embedding: {
    provider: 'openai',
    model: 'text-embedding-3-small',
    dimensions: 1536,
    batchSize: 100,
  },
  
  vectorStore: {
    provider: 'weaviate',
    indexName: 'SalesIntelligence',
    dimensions: 1536,
    metric: 'cosine',
    batchSize: 100,
    connectionPoolSize: 10,
    timeout: 30000,
  },
  
  chunking: {
    type: 'recursive',
    separators: ['\n\n', '\n', '. ', ' '],
    chunkSize: 800,
    chunkOverlap: 100,
  },
  
  retrieval: {
    type: 'hybrid',
    topK: 8,
    vectorWeight: 0.7,
    keywordWeight: 0.3,
  },
  
  maxContextTokens: 4000,
  enableCache: true,
  cacheTTL: 3600,
};

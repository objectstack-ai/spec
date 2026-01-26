# 🤖 ObjectStack AI Agent Specification

**Role:** You are the **Chief AI Architect** designing autonomous agents and cognitive pipelines.
**Task:** Define AI Agents, RAG Knowledge Bases, and Tool Interfaces.
**Environment:** Standalone repository. You import definitions from `@objectstack/spec`.

---

## 1. The Agent Protocol

Agents are autonomous entities with a **Persona** (System Prompt), **Tools** (Capabilities), and **Knowledge** (RAG).

**Reference Schema:** `@objectstack/spec` -> `dist/ai/agent.zod.d.ts`

### Example: Customer Support Agent

```typescript
// src/ai/agents/support.agent.ts
import { AgentSchema } from '@objectstack/spec/ai';

export const SupportAgent: AgentSchema = {
  name: 'support_bot_v1',
  label: 'Tier 1 Support',
  role: 'Customer Service Representative',
  avatar: '/avatars/support.png',
  
  // The "Brain" Configuration
  model: {
    provider: 'openai',
    model: 'gpt-4-turbo',
    temperature: 0.3 // Low temperature for factual responses
  },

  // Prime Directives
  instructions: `
    You are a helpful support agent for the ACME Corp.
    1. Always be polite and concise.
    2. Check the Knowledge Base before asking the user for details.
    3. If you cannot solve the issue, escalte to a human using the 'escalate_ticket' tool.
  `,

  // RAG Configuration (Long-term Memory)
  knowledge: {
    topics: ['troubleshooting', 'refund_policy', 'api_docs'],
    indexes: ['acme_docs_vector_store']
  },

  // Capabilities (Action Space)
  tools: [
    {
      type: 'query',
      name: 'lookup_order',
      description: 'Get order details by Order ID'
    },
    {
      type: 'action',
      name: 'process_refund',
      description: 'Issue a refund for a valid order'
    },
    {
      type: 'flow',
      name: 'troubleshoot_device',
      description: 'Interactive wizard to diagnose hardware issues'
    }
  ]
};
```

---

## 2. RAG Pipeline Configuration

Define how data is ingested and indexed for the Agent's knowledge base.

**Reference Schema:** `@objectstack/spec` -> `dist/ai/rag-pipeline.zod.d.ts`

```typescript
// src/ai/pipelines/docs.pipeline.ts
import { RAGPipelineSchema } from '@objectstack/spec/ai';

export const DocsPipeline: RAGPipelineSchema = {
    name: 'acme_docs_indexer',
    source: {
        type: 'web_crawler',
        startUrls: ['https://docs.acme.com'],
        depth: 2
    },
    chunking: {
        strategy: 'markdown',
        size: 1000,
        overlap: 200
    },
    embedding: {
        provider: 'openai',
        model: 'text-embedding-3-small'
    },
    vectorStore: {
        provider: 'pinecone',
        indexName: 'acme_docs_vector_store'
    }
}
```

---

## 3. Implementation Guidelines

1.  **Tool Description is Key:** The `description` field in `tools` is what the LLM sees. Be descriptive about *when* and *how* to use the tool.
2.  **Safety First:** Always set a strict `instructions` block to prevent jailbreaks.
3.  **Model Selection:** Use faster models (GPT-3.5, Haiku) for simple triage, and smarter models (GPT-4, Opus) for complex reasoning.

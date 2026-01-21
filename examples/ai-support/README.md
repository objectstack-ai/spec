# AI Support Assistant

> **RAG-powered customer support system demonstrating ObjectStack AI protocols**

## Overview

This example demonstrates how to build an intelligent customer support system using ObjectStack's AI protocols:

- **RAG Pipeline**: Knowledge base powered by vector search
- **AI Agent**: Intelligent support agent with function calling
- **Model Registry**: Centralized LLM configuration with fallback support
- **Natural Language Queries**: Business users can query tickets using natural language

## Features

### 1. RAG-Powered Knowledge Base
- Vector search across documentation
- Semantic chunking of markdown content
- MMR retrieval for diverse results
- Cohere reranking for accuracy

### 2. Intelligent Support Agent
- Answer customer questions using RAG
- Create and update support tickets
- Search existing tickets for similar issues
- Escalate to human agents when needed
- Collect customer satisfaction feedback

### 3. Natural Language Ticketing
- "Show me all high priority tickets"
- "What tickets are assigned to me?"
- "How many open tickets from last week?"

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Customer Interface                     │
│              (Chat, Email, Web Portal)                   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  AI Support Agent                        │
│           (GPT-4 Turbo with function calling)            │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
│ RAG Pipeline │ │  Actions  │ │  ObjectQL  │
│  (Pinecone)  │ │  (CRUD)   │ │  (Query)   │
└──────────────┘ └───────────┘ └────────────┘
```

## Configuration Files

- `src/ai-config.ts` - AI agent, model registry, and RAG pipeline
- `src/domains/ticket.object.ts` - Support ticket data model
- `objectstack.config.ts` - Application configuration

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## AI Configuration

### Agent Configuration
```typescript
export const SupportAgent: Agent = {
  name: 'customer_support_ai',
  label: 'AI Support Agent',
  role: 'Senior Customer Support Specialist',
  
  tools: [
    { type: 'action', name: 'create_support_ticket' },
    { type: 'vector_search', name: 'kb_search' },
    { type: 'query', name: 'search_tickets' },
  ],
  
  knowledge: {
    topics: ['product_documentation', 'faq', 'troubleshooting'],
    indexes: ['support_kb_v2'],
  },
};
```

### RAG Pipeline
```typescript
export const KnowledgeBaseRAG: RAGPipelineConfig = {
  embedding: {
    provider: 'openai',
    model: 'text-embedding-3-large',
    dimensions: 3072,
  },
  
  vectorStore: {
    provider: 'pinecone',
    indexName: 'support-kb-prod',
  },
  
  retrieval: {
    type: 'mmr',
    topK: 5,
    lambda: 0.7,
  },
};
```

## Example Interactions

### Customer Query
**Customer**: "My API calls are failing with a 401 error"

**AI Agent**:
1. Searches knowledge base for authentication errors
2. Finds relevant documentation
3. Provides step-by-step troubleshooting
4. If unresolved, creates a ticket and escalates

### Natural Language Ticket Query
**Support Manager**: "Show me all critical tickets from the last 24 hours"

**System**:
1. Parses natural language to ObjectQL
2. Executes query: `ticket.filter(priority='critical', created_date>yesterday)`
3. Returns formatted results with summaries

## Success Metrics

- **Response Time**: < 2s for RAG queries
- **Accuracy**: 90%+ customer satisfaction
- **Automation**: 70% of tickets handled without human intervention
- **Knowledge Coverage**: 95% of queries have relevant KB articles

## Related Examples

- [AI Data Analyst](../ai-analyst) - NLQ for business intelligence
- [AI Code Generator](../ai-codegen) - Generate ObjectStack apps from descriptions
- [AI Sales Assistant](../ai-sales) - Intelligent sales automation

# ObjectAI Implementation Agent

**Role:** You are the Lead AI Engineer building the `objectai` intelligent layer.
**Constraint:** Your implementation must strictly adhere to the `@objectstack/spec` protocol.

## 1. Setup

You are working in a repository that depends on `@objectstack/spec`.
Your source of truth is `node_modules/@objectstack/spec`.

## 2. Implementation Rules

### Rule #1: Protocol-Driven Intelligence
AI Agents must be defined using `ai/agent.zod.ts`.
- Do not create ad-hoc agent configurations.
- Agents must expose their capabilities via standard `tools` definitions.

### Rule #2: Schema-Aware RAG
The RAG pipeline (`ai/rag-pipeline.zod.ts`) must obey ObjectQL security rules.
- When retrieving documents, the AI **MUST** enforce `PermissionSchema`.
- Do not allow the LLM to access data the user cannot see (RLS Enforcement).

### Rule #3: Orchestration & chaining
Complex workflows are orchestrated using `ai/orchestration.zod.ts`.
- Steps must be strongly typed (input/output validated by Zod).
- Use `ModelRegistrySchema` to select LLM providers (OpenAI, Anthropic, Local).

## 3. Workflow

1.  **Model Registry**: Implement the adapter layer for different LLMs defined in `model-registry.zod.ts`.
2.  **Vector Store**: Implement the embedding and retrieval logic defined in `rag-pipeline.zod.ts`.
3.  **Agent Runtime**: Build the execution loop that consumes `AgentSchema` and executes `orchestration.zod.ts` plans.

## 4. Key Files to Watch

- `ai/agent.zod.ts`: The Agent definition.
- `ai/model-registry.zod.ts`: LLM provider configuration.
- `ai/rag-pipeline.zod.ts`: Vector search and retrieval.
- `ai/orchestration.zod.ts`: Tool execution and planning.

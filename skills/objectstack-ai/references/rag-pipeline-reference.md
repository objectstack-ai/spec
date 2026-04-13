# AI Agent Design — RAG Pipeline Reference

> Auto-derived from `packages/spec/src/ai/rag-pipeline.zod.ts` and `model-registry.zod.ts`.
> This file is bundled with the skill for offline/external use.

## Vector Store Providers

| Provider | Description |
|:---------|:------------|
| `pinecone` | Managed vector database |
| `weaviate` | Open-source vector search |
| `qdrant` | Rust-based vector engine |
| `milvus` | Scalable similarity search |
| `chroma` | Lightweight embedding DB |
| `pgvector` | PostgreSQL extension |
| `redis` | Redis vector search |
| `opensearch` | AWS OpenSearch |
| `elasticsearch` | Elastic vector search |
| `custom` | Custom implementation |

## Chunking Strategies (Discriminated Union)

| Strategy | Key Config | Use Case |
|:---------|:-----------|:---------|
| `fixed` | `chunkSize`, `chunkOverlap` | Simple, predictable splitting |
| `semantic` | `model`, `threshold` | Split by semantic boundaries |
| `recursive` | `separators`, `chunkSize` | Hierarchical splitting (most common) |
| `markdown` | `headingLevel` | Markdown-aware splitting |

## Retrieval Strategies (Discriminated Union)

| Strategy | Key Config | Use Case |
|:---------|:-----------|:---------|
| `similarity` | `topK`, `scoreThreshold` | Standard nearest-neighbor |
| `mmr` | `topK`, `diversityWeight` | Maximal Marginal Relevance (reduce redundancy) |
| `hybrid` | `textWeight`, `vectorWeight` | Combine keyword + vector search |
| `parent_document` | `childChunkSize` | Retrieve parent doc from child match |

## Embedding Model Config

| Property | Required | Description |
|:---------|:---------|:------------|
| `provider` | ✅ | Model provider (e.g., `openai`, `local`) |
| `model` | ✅ | Model name (e.g., `text-embedding-3-small`) |
| `dimensions` | ✅ | Output vector dimensions |
| `maxTokens` | — | Max tokens per input |
| `batchSize` | — | Batch processing size |
| `endpoint` | — | Custom endpoint URL |
| `apiKey` | — | API key (use `secretRef` instead for production) |
| `secretRef` | — | Reference to secret manager |

## Knowledge Source Types

| Type | Description |
|:-----|:------------|
| `object` | ObjectStack records (auto-indexed) |
| `document` | Uploaded files (PDF, DOCX, etc.) |
| `url` | Web pages (crawled) |
| `api` | External API response data |

## MCP (Model Context Protocol)

| Property | Description |
|:---------|:------------|
| `transport` | `stdio` (local) or `http` (remote) |
| `tools` | Exposed tool definitions |
| `resources` | Exposed metadata resources |
| `prompts` | Exposed agent prompts |

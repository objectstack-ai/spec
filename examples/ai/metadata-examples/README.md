# ObjectStack AI Protocol Examples

This package contains comprehensive examples demonstrating all aspects of the ObjectStack AI Protocol.

## 📚 What's Included

### Core Examples

1. **agent.examples.ts** - AI agent configuration examples
   - Conversational agents
   - Task-specific agents
   - Multi-agent systems
   - Agent tools and capabilities

2. **conversation.examples.ts** - Conversation management examples
   - Chat interfaces
   - Message threading
   - Context management
   - Conversation history

3. **cost.examples.ts** - Cost tracking examples
   - Token usage tracking
   - Cost allocation
   - Budget management
   - Usage analytics

4. **model-registry.examples.ts** - Model registry examples
   - Model configurations
   - Provider settings
   - Model capabilities
   - Fallback strategies

5. **nlq.examples.ts** - Natural Language Query examples
   - Text-to-SQL generation
   - Query understanding
   - Semantic search
   - Intent recognition

6. **orchestration.examples.ts** - AI orchestration examples
   - Multi-step workflows
   - Agent coordination
   - Task routing
   - Error handling

7. **predictive.examples.ts** - Predictive analytics examples
   - Forecasting models
   - Classification
   - Regression
   - Anomaly detection

8. **rag-pipeline.examples.ts** - RAG pipeline examples
   - Document indexing
   - Vector search
   - Context retrieval
   - Answer generation

## 🚀 Usage

```typescript
import {
  SalesAssistantAgent,
  CustomerConversation,
  CostTracker,
  OpenAIModel,
  NaturalLanguageQuery,
  AgentOrchestration,
  SalesForecast,
  DocumentRAGPipeline,
} from '@objectstack/example-ai';
```

## 🏗️ Building

```bash
npm run build
```

This compiles all TypeScript examples to JavaScript and generates type declarations.

## 📖 Example Structure

Each example follows this pattern:
- Descriptive constant name (e.g., `SalesAssistantAgent`)
- Comprehensive JSDoc comment explaining the use case
- Complete, valid example using proper schemas
- Realistic, practical scenarios

## 🎯 Use Cases

These examples are designed for:
- **Learning**: Understand ObjectStack AI Protocol patterns
- **Reference**: Copy-paste starting points for your own metadata
- **Testing**: Validate implementations against standard patterns
- **Documentation**: Illustrate best practices and conventions

## 📝 Naming Conventions

- **Configuration Keys**: camelCase (e.g., `modelName`, `maxTokens`)
- **Machine Names**: snake_case (e.g., `sales_agent`, `rag_pipeline`)
- **Example Constants**: PascalCase (e.g., `SalesAgent`, `RAGPipeline`)

## 🔗 Related

- [ObjectStack Spec](../../../packages/spec) - Core schema definitions
- [Data Examples](../../data/metadata-examples) - Data Protocol examples

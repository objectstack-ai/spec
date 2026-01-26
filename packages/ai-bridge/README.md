# @objectstack/ai-bridge

**AI Context Bridge** for ObjectStack.
This library provides a set of tools to bridge the gap between your metadata definitions (`Spec`) and Generative AI agents.

It translates your static schema definitions into formats that LLMs (Large Language Models) can understand, strictly adhere to, and execute against.

## 🌟 Capabilities

1.  **Static Type Generator (Code Scaffolding)**
    *   Converts Object/Field definitions into strong TypeScript Interfaces (`.d.ts`).
    *   Generates ObjectQL Query types (`$select`, `$filter`) with literal types for fields.
    *   *Use Case:* Fed into "Coding Agents" to ensure they generate valid, compiling code.

2.  **Runtime Introspection Manifest (System Prompts)**
    *   Generates a token-optimized, compressed JSON representation of your system.
    *   Strip UI/Config noise, keeping only Business Logic (Objects, Fields, Capabilities).
    *   Context-aware: Filters capabilities based on the current user's permissions.
    *   *Use Case:* Injected into the System Prompt so the AI knows "Permission to Speak".

3.  **Tool Definitions (Function Calling)**
    *   Outputs standard OpenAI `tools` (JSON Schema) for core ObjectQL operations (`search`, `create`, `update`).
    *   *Use Case:* Enables "Agentic" behavior where the AI directly queries your database.

## 📦 Installation

```bash
pnpm add @objectstack/ai-bridge
```

## 🛠️ Usage

### 1. Generating TypeScript Definitions
Generate `.d.ts` content to paste into an LLM context or save to a file for dynamic execution.

```typescript
import { generateTypeScriptDefinition } from '@objectstack/ai-bridge';

const objects = [
  {
    name: 'project',
    fields: {
       name: { type: 'text', required: true },
       status: { type: 'select', options: ['planning', 'active'] }
    }
  }
];

const tsContent = generateTypeScriptDefinition(objects);
console.log(tsContent);
// Output: 
// export interface Project { name: string; status?: 'planning' | 'active'; ... }
```

### 2. Runtime Context (Token Efficient)
Create a lightweight manifest for the AI's "Short-term Memory".

```typescript
import { generateAIManifest } from '@objectstack/ai-bridge';

const manifest = generateAIManifest(objects, {
  // Optional: Filter capabilities based on real permissions
  userPermissions: {
    'project': ['read', 'create'] // User cannot delete
  }
});

// Inject this into your System Prompt
const systemPrompt = `
You are an assistant. Here is the database schema you have access to:
${JSON.stringify(manifest)}
`;
```

### 3. OpenAI Tools
Get standard Function Calling definitions to pass to the OpenAI API.

```typescript
import { generateOpenAITools } from '@objectstack/ai-bridge';
import OpenAI from 'openai';

const tools = generateOpenAITools();

const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo',
  messages: [...],
  tools: tools, // <-- Direct integration
  tool_choice: 'auto'
});
```

## 🏗️ Architecture

This package is designed to be **isomorphic** and **dependency-light**. It does not depend on the heavy `runtime` or `core` packages of ObjectStack, meaning it can be run in Edge functions, Lambda, or client-side environments to help construct prompts.

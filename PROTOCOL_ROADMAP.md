# 🚀 ObjectStack Protocol Roadmap

This document outlines the strategic evolution of the ObjectStack specifications. The goal is to move from a "Definition Language" to a "Executable Knowledge Graph".

## 📅 Phase 1: Hardening & Standardization (Current)
**Focus:** Strict typing, Zod v4 compliance, and stability.

- [x] **Zod v4 Upgrade**: strict `z.record()` and inferred types.
- [x] **Monorepo Structure**: Isolated `spec` package.
- [x] **Doc Generation**: Automated reference docs from schemas.

## 📅 Phase 2: Expression & Logic (Next Quarter)
**Focus:** Making strings executable and safe.

### 1. Formula Protocol (`data/formula.zod.ts`)
Currently, formulas are raw strings. We need a standardized AST (Abstract Syntax Tree) to ensuring formulas can run anywhere (SQL, MongoDB, Browser, Node.js).
*   **Goal**: `z.string()` -> `FormulaASTNode`.
*   **Features**: Type checking for formulas at design time.

### 2. Refined Plugin Context (`system/plugin.zod.ts`)
Move from loose `z.function()` definitions to strict Service Contracts.
*   **Goal**: Replace `z.any()` arguments with specific Schemas (e.g., `ObjectQLRequestSchema`).
*   **Benefit**: Plugin authors get full IntelliSense for the host API.

### 3. Flow Component Protocol (`automation/flow-component.zod.ts`)
Define the input/output contract for Flow Nodes so the UI can auto-generate configuration panels.
*   **Goal**: Replace `config: z.record(z.any())` with `configSchema: JSONSchema`.

## 📅 Phase 3: AI & Agents (Future)
**Focus:** Autonomous behaviors and cognitive architectures.

### 1. Agent Memory Protocol (`ai/memory.zod.ts`)
Standardize how agents store and retrieve conversation history and facts.
*   **Components**: Short-term (Window), Long-term (Vector), Episodic.

### 2. Tooling Protocol (`ai/tool.zod.ts`)
Universal definition for tools that can be consumed by Agents, APIs, and Humans.
*   **Strategy**: align with OpenAI Function Calling format but add permissioning layer.

### 3. Evaluation Protocol (`ai/eval.zod.ts`)
files to define test cases for Agents (Inputs -> Expected Reasoning -> Expected Output).

## 📅 Phase 4: SDK Generation
**Focus:** Developer Experience.

- **Auto-generated SDKs**: Use `zod-to-ts` and `openapi-generator` to build `@objectstack/client` directly from the `spec`.
- **UI Component Generation**: Generate React form components from `ui/*.zod.ts` definitions.

## 🔍 Optimization Opportunities

| Area | Issue | Proposed Solution |
| :--- | :--- | :--- |
| **Performance** | Large recursive schemas (Flow/Tree) slow down TS. | Use `z.lazy()` and interface separation. |
| **Validation** | Frontend/Backend validation duplication. | Share `FieldSchema` directly with React Hook Form. |
| **Database** | Driver-specific options in generic schemas. | Use **Discriminated Unions** for Driver Configs (e.g., `type: 'postgres'` vs `type: 'mongo'`). |

---

> *This roadmap is a living document. Updates are driven by community feedback and implementation challenges.*

# AI Context & Prompts

This directory contains architectural context and system prompts designed to help AI Agents (Copilot, Cursor, OpenAI) understand the ObjectStack protocol.

## Usage

If you are building an AI-assisted tool or just want your IDE AI to be smarter about ObjectStack, you can feed these files into the context window.

*   **`architecture.md`**: High-level architectural philosophy, layer definitions, and core mission.
*   **`instructions.md`**: Coding styles, naming conventions, and specific implementation rules.

## Example (System Prompt)

```text
You are an expert ObjectStack developer.
Use the context provided in @objectstack/spec/prompts/architecture.md to understand the system design.
Follow the rules in @objectstack/spec/prompts/instructions.md when writing code.
```

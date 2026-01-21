# AI Code Generator

> **Generate ObjectStack applications from natural language descriptions**

## Overview

AI-powered code generator that creates complete ObjectStack applications from high-level requirements.

## Features

- **App Generation**: Create full apps from descriptions
- **Schema Generation**: Generate object definitions
- **Validation**: Ensure generated code follows best practices
- **Test Generation**: Auto-generate tests for objects

## Example Usage

**Input**: "Create a project management app with projects, tasks, and team members. Projects should have milestones and budgets. Tasks can be assigned to team members with due dates and priorities."

**Output**: Complete ObjectStack application with:
- Object definitions (Project, Task, TeamMember, Milestone)
- Relationships (lookup fields)
- Validation rules
- List views and forms
- Navigation structure
- Reports and dashboards

## Agent Configuration

```typescript
export const CodeGenAgent: Agent = {
  name: 'objectstack_code_generator',
  role: 'Senior ObjectStack Developer',
  
  tools: [
    { type: 'action', name: 'generate_object' },
    { type: 'action', name: 'generate_field' },
    { type: 'action', name: 'generate_view' },
    { type: 'action', name: 'validate_schema' },
  ],
  
  knowledge: {
    topics: ['objectstack_patterns', 'best_practices', 'examples'],
    indexes: ['objectstack_docs'],
  },
};
```

## Capabilities

1. **Object Schema Generation**: Field types, validation, relationships
2. **UI Generation**: Views, forms, dashboards
3. **Logic Generation**: Workflows, validations, triggers
4. **Best Practices**: Follows naming conventions and patterns

## Success Criteria

- Generated code passes all validations
- Follows ObjectStack conventions (camelCase, snake_case)
- Includes appropriate indexes and constraints
- Complete with UI configuration

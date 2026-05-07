// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Skill } from '@objectstack/spec/ai';

/**
 * Built-in `metadata_authoring` skill — the write-side schema-design
 * capability bundle attached to the `metadata_assistant` agent (and
 * any other agent that should be allowed to mutate schema).
 *
 * Splitting this off from the agent record lets us:
 * - Reuse the same authoring tools across multiple agent personas
 *   (e.g. an "ops bot" that ALSO can author).
 * - Disable authoring globally by setting `active: false` on the
 *   skill metadata, without redeploying the agent.
 * - Layer permissions via `Skill.permissions` independent of the
 *   agent's permissions.
 */
export const METADATA_AUTHORING_SKILL: Skill = {
  name: 'metadata_authoring',
  label: 'Metadata Authoring',
  description: 'Create and modify ObjectStack metadata — objects, fields, schema changes through natural language.',
  instructions: `You are an expert metadata architect. When the user asks you to design or change a data model, use these tools.

Capabilities:
- Create new data objects (tables) with fields
- Add fields (columns) to existing objects
- Modify field properties (label, type, required, default value)
- Delete fields from objects
- List all registered metadata objects and their schemas
- Describe the full schema of a specific object

Guidelines:
1. Before creating a new object, use list_objects to check if a similar one already exists.
2. Before modifying or deleting fields, use describe_object to understand the current schema.
3. Always use snake_case for object names and field names (e.g. project_task, due_date).
4. Suggest meaningful field types based on the user's description (e.g. "deadline" → date, "active" → boolean).
5. When creating objects, propose a reasonable set of initial fields based on the entity type.
6. Explain what changes you are about to make before executing them.
7. After making changes, confirm the result by describing the updated schema.
8. For destructive operations (deleting fields), always warn the user about potential data loss.
9. Always answer in the same language the user is using.
10. If the user's request is ambiguous, ask clarifying questions before proceeding.`,
  tools: [
    'create_object',
    'add_field',
    'modify_field',
    'delete_field',
    'list_objects',
    'describe_object',
  ],
  triggerPhrases: [
    'create object',
    'create table',
    'add field',
    'add column',
    'modify field',
    'change field',
    'delete field',
    'drop field',
    'design schema',
    'new entity',
  ],
  active: true,
};

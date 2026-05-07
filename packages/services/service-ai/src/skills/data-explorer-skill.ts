// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Skill } from '@objectstack/spec/ai';

/**
 * Built-in `data_explorer` skill — the read-only data-Q&A capability
 * bundle that the `data_chat` agent (and any other agent that wants
 * data-exploration powers) attaches to its `skills[]`.
 *
 * Following the platform's metadata-driven philosophy, the agent
 * itself no longer hardcodes which tools it can call; instead it
 * names this skill and the SkillRegistry resolves the tool list at
 * request time. Disabling this skill via the metadata service
 * disables data exploration for every agent that references it,
 * without code changes.
 */
export const DATA_EXPLORER_SKILL: Skill = {
  name: 'data_explorer',
  label: 'Data Explorer',
  description: 'Read-only Q&A over the user\'s business data — schema discovery, filtered queries, lookups, and aggregations.',
  instructions: `You can explore the user's business data through these tools.

Capabilities:
- List available data objects (tables) and their schemas
- Query records with filters, sorting, and pagination
- Look up individual records by ID
- Perform aggregations and statistical analysis (count, sum, avg, min, max)

Guidelines:
1. Always use the describe_object tool first to understand a table's structure before querying it.
2. Respect the user's current context — if they are viewing a specific object or record, use that as the default scope.
3. When presenting data, format it in a clear and readable way using markdown tables or bullet lists.
4. For large result sets, summarize the data and mention the total count.
5. When performing aggregations, explain the results in plain language.
6. If a query returns no results, suggest possible reasons and alternative queries.
7. Never expose internal IDs unless the user explicitly asks for them.
8. Always answer in the same language the user is using.`,
  tools: [
    'list_objects',
    'describe_object',
    'query_records',
    'get_record',
    'aggregate_data',
  ],
  triggerPhrases: [
    'show me',
    'list',
    'how many',
    'count',
    'find records',
    'query',
    'aggregate',
    'sum',
    'average',
  ],
  active: true,
};

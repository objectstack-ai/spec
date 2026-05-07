// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineSkill } from '@objectstack/spec';

export const Customer360Skill = defineSkill({
  name: 'customer_360',
  label: 'Customer 360',
  description: 'Aggregates account, recent cases, open opportunities, and knowledge hits into a single customer profile.',

  instructions: `When the user asks for "the full picture" of a
customer / account / contact:
1. Search the knowledge base via search_knowledge for any policy or
   playbook context relevant to this account.
2. Summarise into three sections: Account Snapshot · Active Work ·
   Risks & Notes.
3. Cite record IDs inline (e.g. "case CASE-1234") so the UI can deep
   link.`,

  tools: ['search_knowledge'],

  triggerPhrases: [
    'customer 360',
    'tell me about this account',
    'give me the full picture',
    'account summary',
  ],

  permissions: ['crm:account:read'],
});

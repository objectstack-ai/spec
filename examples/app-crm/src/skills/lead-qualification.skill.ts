// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineSkill } from '@objectstack/spec';

/**
 * Lead Qualification Skill — qualifies inbound leads using BANT
 * (Budget, Authority, Need, Timeline) and emits a 0–100 score.
 *
 * Auto-activates when the user is viewing a lead record so the LLM
 * naturally surfaces the "Qualify Lead" capability without the user
 * having to pick an agent.
 */
export const LeadQualificationSkill = defineSkill({
  name: 'lead_qualification',
  label: 'Lead Qualification',
  description: 'Qualifies inbound leads using BANT criteria and assigns a 0–100 score.',

  instructions: `When the user asks to qualify, score, or analyze a lead:
1. Fetch the current lead with analyze_lead.
2. Apply BANT (Budget, Authority, Need, Timeline) reasoning.
3. Return a numeric score (0–100), a one-line justification per BANT
   dimension, and the recommended next action.
4. If the score >= 70, propose calling suggest_next_action to draft
   the follow-up.`,

  tools: ['analyze_lead', 'suggest_next_action'],

  triggerPhrases: [
    'qualify this lead',
    'score this lead',
    'is this a hot lead',
    'BANT analysis',
    'lead score',
  ],

  triggerConditions: [
    { field: 'objectName', operator: 'eq', value: 'lead' },
  ],

  permissions: ['crm:lead:read'],
});

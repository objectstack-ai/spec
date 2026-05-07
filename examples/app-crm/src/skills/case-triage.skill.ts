// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineSkill } from '@objectstack/spec';

export const CaseTriageSkill = defineSkill({
  name: 'case_triage',
  label: 'Case Triage',
  description: 'Triages a support case, assigns priority, and recommends the next action.',

  instructions: `When the user asks to triage, prioritise, or
classify a case:
1. Call triage_case with the current record.
2. If priority resolves to "critical", immediately recommend
   escalation and draft an internal notification message.
3. Otherwise, propose a customer-facing response by handing off to
   the response_drafting skill (do NOT inline-draft here).`,

  tools: ['triage_case'],

  triggerPhrases: [
    'triage this case',
    'prioritise case',
    'how urgent is this',
    'case severity',
  ],

  triggerConditions: [
    { field: 'objectName', operator: 'eq', value: 'case' },
  ],

  permissions: ['crm:case:write'],
});

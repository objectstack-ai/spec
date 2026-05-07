// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineAgent } from '@objectstack/spec';

export const ServiceCopilotAgent = defineAgent({
  name: 'service_copilot',
  label: 'Service Copilot',
  role: 'assistant',
  active: true,
  visibility: 'organization',

  instructions: `You are the Service Copilot — a single AI surface
that helps support reps triage and resolve cases. Be empathetic and
solution-focused. Use the Active Skills block in system context to
pick capabilities; never list skills back to the user. Always cite
case IDs.`,

  model: { provider: 'openai', model: 'gpt-4', temperature: 0.5, maxTokens: 1500 },

  skills: [
    'case_triage',
    'customer_360',
    'email_drafting',
  ],

  knowledge: {
    topics: ['support_kb', 'sla_policies', 'case_resolution'],
    indexes: ['support_knowledge'],
  },
});

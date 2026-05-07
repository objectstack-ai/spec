// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineAgent } from '@objectstack/spec';

/**
 * Sales Copilot — the unified persona for everything a sales rep does.
 */
export const SalesCopilotAgent = defineAgent({
  name: 'sales_copilot',
  label: 'Sales Copilot',
  role: 'assistant',
  active: true,
  visibility: 'organization',

  instructions: `You are the Sales Copilot — a single AI surface that
helps sales reps work an account end-to-end. Use the Active Skills
block in your system context to pick capabilities; do NOT enumerate
skills back to the user. Answer concisely, lead with the
recommendation, and cite record IDs whenever you reference data.`,

  model: { provider: 'openai', model: 'gpt-4', temperature: 0.6, maxTokens: 2000 },

  skills: [
    'lead_qualification',
    'email_drafting',
    'revenue_forecasting',
    'customer_360',
  ],

  knowledge: {
    topics: ['sales_playbook', 'product_catalog', 'lead_qualification'],
    indexes: ['sales_knowledge'],
  },
});

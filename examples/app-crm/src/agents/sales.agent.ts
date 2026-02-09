// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/** Sales Assistant — helps reps with lead qualification and opportunity management */
export const SalesAssistantAgent = {
  name: 'sales_assistant',
  label: 'Sales Assistant',
  role: 'assistant',

  instructions: `You are a sales assistant AI helping sales representatives manage their pipeline.

Your responsibilities:
1. Qualify incoming leads based on BANT criteria (Budget, Authority, Need, Timeline)
2. Suggest next best actions for opportunities
3. Draft personalized email templates
4. Analyze win/loss patterns
5. Provide competitive intelligence
6. Generate sales forecasts

Always be professional, data-driven, and focused on helping close deals.`,

  model: { provider: 'openai', model: 'gpt-4', temperature: 0.7, maxTokens: 2000 },

  tools: [
    { type: 'action' as const, name: 'analyze_lead', description: 'Analyze a lead and provide qualification score' },
    { type: 'action' as const, name: 'suggest_next_action', description: 'Suggest next best action for an opportunity' },
    { type: 'action' as const, name: 'generate_email', description: 'Generate a personalized email template' },
  ],

  knowledge: {
    topics: ['sales_playbook', 'product_catalog', 'lead_qualification'],
    indexes: ['sales_knowledge'],
  },

  triggers: [
    { type: 'object_create', objectName: 'lead', condition: 'rating = "hot"' },
    { type: 'object_update', objectName: 'opportunity', condition: 'ISCHANGED(stage)' },
  ],
};

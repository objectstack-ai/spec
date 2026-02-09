// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/** Customer Service Agent — assists with case triage and resolution */
export const ServiceAgent = {
  name: 'service_agent',
  label: 'Customer Service Agent',
  role: 'assistant',

  instructions: `You are a customer service AI agent helping support representatives resolve customer issues.

Your responsibilities:
1. Triage incoming cases based on priority and category
2. Suggest relevant knowledge articles
3. Draft response templates
4. Escalate critical issues
5. Identify common problems and patterns
6. Recommend process improvements

Always be empathetic, solution-focused, and customer-centric.`,

  model: { provider: 'openai', model: 'gpt-4', temperature: 0.5, maxTokens: 1500 },

  tools: [
    { type: 'action' as const, name: 'triage_case', description: 'Analyze case and assign priority' },
    { type: 'vector_search' as const, name: 'search_knowledge', description: 'Search knowledge base for solutions' },
    { type: 'action' as const, name: 'generate_response', description: 'Generate customer response' },
  ],

  knowledge: {
    topics: ['support_kb', 'sla_policies', 'case_resolution'],
    indexes: ['support_knowledge'],
  },

  triggers: [
    { type: 'object_create', objectName: 'case' },
    { type: 'object_update', objectName: 'case', condition: 'priority = "critical"' },
  ],
};

import type { Agent } from '@objectstack/spec/ai';

export const SalesAssistantAgent: Agent = {
  name: 'sales_assistant',
  label: 'Sales Assistant',
  description: 'AI agent to help sales reps with lead qualification and opportunity management',
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
    { name: 'analyze_lead', description: 'Analyze a lead and provide qualification score', parameters: { lead_id: 'string' } },
    { name: 'suggest_next_action', description: 'Suggest next best action for an opportunity', parameters: { opportunity_id: 'string' } },
    { name: 'generate_email', description: 'Generate a personalized email template', parameters: { recipient_id: 'string', context: 'string', tone: 'string' } },
  ],
  
  knowledge: {
    sources: [
      { type: 'object', objectName: 'lead', fields: ['*'] },
      { type: 'object', objectName: 'opportunity', fields: ['*'] },
      { type: 'object', objectName: 'account', fields: ['*'] },
      { type: 'document', path: '/knowledge/sales-playbook.md' },
      { type: 'document', path: '/knowledge/product-catalog.md' },
    ],
  },
  
  triggers: [
    { type: 'object_create', objectName: 'lead', condition: 'rating = "hot"' },
    { type: 'object_update', objectName: 'opportunity', condition: 'ISCHANGED(stage)' },
  ],
};

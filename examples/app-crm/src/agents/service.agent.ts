import type { Agent } from '@objectstack/spec/ai';

export const ServiceAgent: Agent = {
  name: 'service_agent',
  label: 'Customer Service Agent',
  description: 'AI agent to assist with customer support cases',
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
    { name: 'triage_case', description: 'Analyze case and assign priority', parameters: { case_id: 'string' } },
    { name: 'search_knowledge', description: 'Search knowledge base for solutions', parameters: { query: 'string' } },
    { name: 'generate_response', description: 'Generate customer response', parameters: { case_id: 'string', tone: 'string' } },
  ],
  
  knowledge: {
    sources: [
      { type: 'object', objectName: 'case', fields: ['*'] },
      { type: 'object', objectName: 'account', fields: ['*'] },
      { type: 'document', path: '/knowledge/support-kb/**/*.md' },
      { type: 'document', path: '/knowledge/sla-policies.md' },
    ],
  },
  
  triggers: [
    { type: 'object_create', objectName: 'case' },
    { type: 'object_update', objectName: 'case', condition: 'priority = "critical"' },
  ],
};

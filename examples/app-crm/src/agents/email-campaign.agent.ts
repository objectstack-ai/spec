import type { Agent } from '@objectstack/spec/ai';

export const EmailCampaignAgent: Agent = {
  name: 'email_campaign',
  label: 'Email Campaign Agent',
  description: 'AI agent to create and optimize email campaigns',
  role: 'creator',
  
  instructions: `You are an email marketing AI that creates and optimizes email campaigns.

Your responsibilities:
1. Write compelling email copy
2. Optimize subject lines for open rates
3. Personalize content based on recipient data
4. A/B test different variations
5. Analyze campaign performance
6. Suggest improvements

Follow email marketing best practices and maintain brand voice.`,

  model: { provider: 'anthropic', model: 'claude-3-opus', temperature: 0.8, maxTokens: 2000 },
  
  tools: [
    { type: 'action', name: 'generate_email_copy', description: 'Generate email campaign copy' },
    { type: 'action', name: 'optimize_subject_line', description: 'Optimize email subject line' },
    { type: 'action', name: 'personalize_content', description: 'Personalize email content' },
  ],
  
  knowledge: {
    topics: ['email_marketing', 'brand_guidelines', 'campaign_templates'],
    indexes: ['sales_knowledge'],
  },
};

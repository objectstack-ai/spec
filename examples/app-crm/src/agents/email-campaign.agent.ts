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
    { name: 'generate_email_copy', description: 'Generate email campaign copy', parameters: { campaign_id: 'string', audience: 'string', goal: 'string' } },
    { name: 'optimize_subject_line', description: 'Optimize email subject line', parameters: { subject: 'string' } },
    { name: 'personalize_content', description: 'Personalize email content', parameters: { template: 'string', recipient_data: 'object' } },
  ],
  
  knowledge: {
    sources: [
      { type: 'object', objectName: 'campaign', fields: ['*'] },
      { type: 'document', path: '/knowledge/brand-guidelines.md' },
      { type: 'document', path: '/knowledge/email-templates/**/*.html' },
    ],
  },
};

import type { Agent } from '@objectstack/spec/ai';

export const LeadEnrichmentAgent: Agent = {
  name: 'lead_enrichment',
  label: 'Lead Enrichment Agent',
  description: 'AI agent to automatically enrich lead data from external sources',
  role: 'worker',
  
  instructions: `You are a lead enrichment AI that enhances lead records with additional data.

Your responsibilities:
1. Look up company information from external databases
2. Enrich contact details (job title, LinkedIn, etc.)
3. Add firmographic data (industry, size, revenue)
4. Research company technology stack
5. Find social media profiles
6. Validate email addresses and phone numbers

Always use reputable data sources and maintain data quality.`,

  model: { provider: 'openai', model: 'gpt-3.5-turbo', temperature: 0.3, maxTokens: 1000 },
  
  tools: [
    { type: 'action', name: 'lookup_company', description: 'Look up company information' },
    { type: 'action', name: 'enrich_contact', description: 'Enrich contact information' },
    { type: 'action', name: 'validate_email', description: 'Validate email address' },
  ],
  
  knowledge: {
    topics: ['lead_enrichment', 'company_data'],
    indexes: ['sales_knowledge'],
  },
  
  triggers: [
    { type: 'object_create', objectName: 'lead' },
  ],
  
  schedule: { type: 'cron', expression: '0 */4 * * *', timezone: 'UTC' },
};

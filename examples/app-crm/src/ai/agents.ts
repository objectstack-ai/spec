import type { Agent } from '@objectstack/spec/ai';

/**
 * CRM AI Agents
 * Define AI agents for automated business processes
 */

// Sales Assistant Agent
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

  model: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
  },
  
  tools: [
    {
      name: 'analyze_lead',
      description: 'Analyze a lead and provide qualification score',
      parameters: {
        lead_id: 'string',
      },
    },
    {
      name: 'suggest_next_action',
      description: 'Suggest next best action for an opportunity',
      parameters: {
        opportunity_id: 'string',
      },
    },
    {
      name: 'generate_email',
      description: 'Generate a personalized email template',
      parameters: {
        recipient_id: 'string',
        context: 'string',
        tone: 'string',
      },
    },
  ],
  
  knowledge: {
    sources: [
      {
        type: 'object',
        objectName: 'lead',
        fields: ['*'],
      },
      {
        type: 'object',
        objectName: 'opportunity',
        fields: ['*'],
      },
      {
        type: 'object',
        objectName: 'account',
        fields: ['*'],
      },
      {
        type: 'document',
        path: '/knowledge/sales-playbook.md',
      },
      {
        type: 'document',
        path: '/knowledge/product-catalog.md',
      },
    ],
  },
  
  triggers: [
    {
      type: 'object_create',
      objectName: 'lead',
      condition: 'rating = "hot"',
    },
    {
      type: 'object_update',
      objectName: 'opportunity',
      condition: 'ISCHANGED(stage)',
    },
  ],
};

// Customer Service Agent
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

  model: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.5,
    maxTokens: 1500,
  },
  
  tools: [
    {
      name: 'triage_case',
      description: 'Analyze case and assign priority',
      parameters: {
        case_id: 'string',
      },
    },
    {
      name: 'search_knowledge',
      description: 'Search knowledge base for solutions',
      parameters: {
        query: 'string',
      },
    },
    {
      name: 'generate_response',
      description: 'Generate customer response',
      parameters: {
        case_id: 'string',
        tone: 'string',
      },
    },
  ],
  
  knowledge: {
    sources: [
      {
        type: 'object',
        objectName: 'case',
        fields: ['*'],
      },
      {
        type: 'object',
        objectName: 'account',
        fields: ['*'],
      },
      {
        type: 'document',
        path: '/knowledge/support-kb/**/*.md',
      },
      {
        type: 'document',
        path: '/knowledge/sla-policies.md',
      },
    ],
  },
  
  triggers: [
    {
      type: 'object_create',
      objectName: 'case',
    },
    {
      type: 'object_update',
      objectName: 'case',
      condition: 'priority = "critical"',
    },
  ],
};

// Lead Enrichment Agent
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

  model: {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
    maxTokens: 1000,
  },
  
  tools: [
    {
      name: 'lookup_company',
      description: 'Look up company information',
      parameters: {
        company_name: 'string',
        domain: 'string',
      },
    },
    {
      name: 'enrich_contact',
      description: 'Enrich contact information',
      parameters: {
        email: 'string',
        linkedin_url: 'string',
      },
    },
    {
      name: 'validate_email',
      description: 'Validate email address',
      parameters: {
        email: 'string',
      },
    },
  ],
  
  knowledge: {
    sources: [
      {
        type: 'object',
        objectName: 'lead',
        fields: ['company', 'email', 'phone', 'website'],
      },
    ],
  },
  
  triggers: [
    {
      type: 'object_create',
      objectName: 'lead',
    },
  ],
  
  schedule: {
    type: 'cron',
    expression: '0 */4 * * *', // Every 4 hours
    timezone: 'UTC',
  },
};

// Revenue Intelligence Agent
export const RevenueIntelligenceAgent: Agent = {
  name: 'revenue_intelligence',
  label: 'Revenue Intelligence Agent',
  description: 'AI agent to analyze pipeline and provide revenue insights',
  
  role: 'analyst',
  
  instructions: `You are a revenue intelligence AI that analyzes sales data and provides insights.

Your responsibilities:
1. Analyze pipeline health and quality
2. Identify at-risk deals
3. Forecast revenue with confidence intervals
4. Detect anomalies and trends
5. Suggest coaching opportunities
6. Generate executive summaries

Use statistical analysis and machine learning to provide data-driven insights.`,

  model: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.2,
    maxTokens: 3000,
  },
  
  tools: [
    {
      name: 'analyze_pipeline',
      description: 'Analyze sales pipeline health',
      parameters: {
        user_id: 'string',
        time_period: 'string',
      },
    },
    {
      name: 'identify_at_risk',
      description: 'Identify at-risk opportunities',
      parameters: {
        threshold: 'number',
      },
    },
    {
      name: 'forecast_revenue',
      description: 'Generate revenue forecast',
      parameters: {
        time_period: 'string',
        method: 'string',
      },
    },
  ],
  
  knowledge: {
    sources: [
      {
        type: 'object',
        objectName: 'opportunity',
        fields: ['*'],
      },
      {
        type: 'object',
        objectName: 'account',
        fields: ['*'],
      },
      {
        type: 'analytics',
        dashboardName: 'sales_dashboard',
      },
    ],
  },
  
  schedule: {
    type: 'cron',
    expression: '0 8 * * 1', // Monday at 8am
    timezone: 'America/Los_Angeles',
  },
};

// Email Campaign Agent
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

  model: {
    provider: 'anthropic',
    model: 'claude-3-opus',
    temperature: 0.8,
    maxTokens: 2000,
  },
  
  tools: [
    {
      name: 'generate_email_copy',
      description: 'Generate email campaign copy',
      parameters: {
        campaign_id: 'string',
        audience: 'string',
        goal: 'string',
      },
    },
    {
      name: 'optimize_subject_line',
      description: 'Optimize email subject line',
      parameters: {
        subject: 'string',
      },
    },
    {
      name: 'personalize_content',
      description: 'Personalize email content',
      parameters: {
        template: 'string',
        recipient_data: 'object',
      },
    },
  ],
  
  knowledge: {
    sources: [
      {
        type: 'object',
        objectName: 'campaign',
        fields: ['*'],
      },
      {
        type: 'document',
        path: '/knowledge/brand-guidelines.md',
      },
      {
        type: 'document',
        path: '/knowledge/email-templates/**/*.html',
      },
    ],
  },
};

export const CrmAgents = {
  SalesAssistantAgent,
  ServiceAgent,
  LeadEnrichmentAgent,
  RevenueIntelligenceAgent,
  EmailCampaignAgent,
};

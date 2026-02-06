import type { Agent } from '@objectstack/spec/ai';

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

  model: { provider: 'openai', model: 'gpt-4', temperature: 0.2, maxTokens: 3000 },
  
  tools: [
    { name: 'analyze_pipeline', description: 'Analyze sales pipeline health', parameters: { user_id: 'string', time_period: 'string' } },
    { name: 'identify_at_risk', description: 'Identify at-risk opportunities', parameters: { threshold: 'number' } },
    { name: 'forecast_revenue', description: 'Generate revenue forecast', parameters: { time_period: 'string', method: 'string' } },
  ],
  
  knowledge: {
    sources: [
      { type: 'object', objectName: 'opportunity', fields: ['*'] },
      { type: 'object', objectName: 'account', fields: ['*'] },
      { type: 'analytics', dashboardName: 'sales_dashboard' },
    ],
  },
  
  schedule: { type: 'cron', expression: '0 8 * * 1', timezone: 'America/Los_Angeles' },
};

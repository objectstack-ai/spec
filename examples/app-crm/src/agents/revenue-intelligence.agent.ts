/** Revenue Intelligence Agent — analyzes pipeline and provides revenue insights */
export const RevenueIntelligenceAgent = {
  name: 'revenue_intelligence',
  label: 'Revenue Intelligence Agent',
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
    { type: 'query' as const, name: 'analyze_pipeline', description: 'Analyze sales pipeline health' },
    { type: 'query' as const, name: 'identify_at_risk', description: 'Identify at-risk opportunities' },
    { type: 'query' as const, name: 'forecast_revenue', description: 'Generate revenue forecast' },
  ],

  knowledge: {
    topics: ['pipeline_analytics', 'revenue_forecasting', 'deal_risk'],
    indexes: ['sales_knowledge'],
  },

  schedule: { type: 'cron', expression: '0 8 * * 1', timezone: 'America/Los_Angeles' },
};

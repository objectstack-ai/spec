import type { Agent, NLQModelConfig, QueryTemplate } from '@objectstack/spec';

/**
 * AI Data Analyst Agent
 */
export const DataAnalystAgent: Agent = {
  name: 'data_analyst_ai',
  label: 'AI Data Analyst',
  role: 'Business Intelligence Analyst',
  
  instructions: `You are a data analyst helping users understand their business metrics.

Skills:
- Interpret natural language questions about data
- Generate ObjectQL queries
- Create visualizations
- Provide actionable insights

Be precise, data-driven, and clear in explanations.`,
  
  model: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.3,
    maxTokens: 4096,
  },
  
  tools: [
    {
      type: 'query',
      name: 'execute_objectql',
      description: 'Execute ObjectQL queries on data',
    },
    {
      type: 'action',
      name: 'create_dashboard',
      description: 'Generate dashboard from metrics',
    },
    {
      type: 'action',
      name: 'generate_chart',
      description: 'Create charts and visualizations',
    },
    {
      type: 'query',
      name: 'get_schema',
      description: 'Get object schema information',
    },
  ],
  
  access: ['analysts', 'executives', 'managers'],
  active: true,
};

/**
 * NLQ Configuration for Business Intelligence
 */
export const AnalystNLQConfig: NLQModelConfig = {
  modelId: 'gpt-4',
  systemPrompt: `You are an expert at converting business questions into ObjectQL queries.
  
Available objects: account, opportunity, task, product, order
Be precise with field names and support timeframes like "last quarter", "this year".`,
  
  includeSchema: true,
  includeExamples: true,
  enableIntentDetection: true,
  intentThreshold: 0.75,
  enableEntityRecognition: true,
  enableFuzzyMatching: true,
  fuzzyMatchThreshold: 0.85,
  enableTimeframeDetection: true,
  defaultTimeframe: 'current_month',
  enableCaching: true,
  cacheTTL: 3600,
};

/**
 * Common Query Templates
 */
export const AnalystQueryTemplates: QueryTemplate[] = [
  {
    id: 'top-n-by-field',
    name: 'top_n_by_field',
    label: 'Top N Records by Field',
    pattern: 'top {n} {object} by {field}',
    variables: [
      { name: 'n', type: 'value', required: true },
      { name: 'object', type: 'object', required: true },
      { name: 'field', type: 'field', required: true },
    ],
    astTemplate: {
      object: '{object}',
      sort: [{ field: '{field}', order: 'desc' }],
      limit: '{n}',
    },
    category: 'ranking',
    examples: [
      'top 10 accounts by revenue',
      'top 5 products by sales',
    ],
  },
  
  {
    id: 'aggregate-by-group',
    name: 'aggregate_by_group',
    label: 'Aggregate by Group',
    pattern: 'total {field} by {group_field}',
    variables: [
      { name: 'field', type: 'field', required: true },
      { name: 'group_field', type: 'field', required: true },
    ],
    astTemplate: {
      fields: [
        '{group_field}',
        { function: 'sum', field: '{field}', alias: 'total' },
      ],
      groupBy: ['{group_field}'],
    },
    category: 'aggregation',
    examples: [
      'total revenue by region',
      'total orders by product',
    ],
  },
  
  {
    id: 'time-comparison',
    name: 'time_comparison',
    label: 'Time Period Comparison',
    pattern: 'compare {metric} for {period1} vs {period2}',
    variables: [
      { name: 'metric', type: 'field', required: true },
      { name: 'period1', type: 'timeframe', required: true },
      { name: 'period2', type: 'timeframe', required: true },
    ],
    astTemplate: {
      // Complex comparison logic
    },
    category: 'comparison',
    examples: [
      'compare revenue for this month vs last month',
      'compare sales for Q1 vs Q2',
    ],
  },
];

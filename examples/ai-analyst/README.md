# AI Data Analyst

> **Natural Language Query system for business intelligence**

## Overview

AI-powered data analyst that transforms natural language questions into ObjectQL queries and generates insights.

## Features

- **Natural Language Queries**: Ask questions in plain English
- **Auto-generate Dashboards**: Create visualizations from queries
- **Insights Generation**: AI-powered data analysis
- **Query Templates**: Pre-built query patterns

## Example Queries

- "What's our total revenue by region for Q1?"
- "Show me the top 10 customers by lifetime value"
- "Compare this month's sales to last month"
- "Which products have declining sales?"

## NLQ Configuration

```typescript
export const AnalystNLQConfig: NLQModelConfig = {
  modelId: 'gpt-4-turbo',
  includeSchema: true,
  includeExamples: true,
  enableIntentDetection: true,
  enableTimeframeDetection: true,
  enableFuzzyMatching: true,
};
```

## Agent

```typescript
export const DataAnalystAgent: Agent = {
  name: 'data_analyst_ai',
  role: 'Business Intelligence Analyst',
  tools: [
    { type: 'query', name: 'execute_sql' },
    { type: 'action', name: 'create_dashboard' },
    { type: 'action', name: 'generate_chart' },
  ],
};
```

## Use Cases

1. **Executive Dashboards**: Auto-generate KPI dashboards
2. **Ad-hoc Analysis**: Answer business questions instantly
3. **Report Generation**: Create formatted reports from queries
4. **Data Exploration**: Discover patterns and anomalies

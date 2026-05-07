// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineSkill } from '@objectstack/spec';

export const RevenueForecastingSkill = defineSkill({
  name: 'revenue_forecasting',
  label: 'Revenue Forecasting',
  description: 'Analyses pipeline health, surfaces at-risk deals, and forecasts revenue with confidence bands.',

  instructions: `When the user asks about pipeline health, forecast,
risk, or deal slippage:
1. Start with analyze_pipeline to summarise stage distribution and
   weighted value.
2. Call identify_at_risk to surface deals with deteriorating signals.
3. Use forecast_revenue for the period the user names (default: this
   quarter), reporting both expected value and the 80% confidence
   interval.
4. Be quantitative — every claim must cite numbers or a deal name.`,

  tools: ['analyze_pipeline', 'identify_at_risk', 'forecast_revenue'],

  triggerPhrases: [
    'forecast revenue',
    'pipeline health',
    'at-risk deals',
    'how is the quarter looking',
    'revenue projection',
  ],

  triggerConditions: [
    { field: 'objectName', operator: 'in', value: ['opportunity', 'dashboard'] },
  ],

  permissions: ['crm:opportunity:read'],
});

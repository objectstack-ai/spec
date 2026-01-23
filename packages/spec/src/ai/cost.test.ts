import { describe, it, expect } from 'vitest';
import {
  CostMetricTypeSchema,
  BillingPeriodSchema,
  CostEntrySchema,
  BudgetTypeSchema,
  BudgetLimitSchema,
  BudgetStatusSchema,
  CostAlertTypeSchema,
  CostAlertSchema,
  CostBreakdownDimensionSchema,
  CostBreakdownEntrySchema,
  CostAnalyticsSchema,
  CostOptimizationRecommendationSchema,
  CostReportSchema,
  CostQueryFiltersSchema,
  type CostEntry,
  type BudgetLimit,
  type CostAlert,
  type CostReport,
} from './cost.zod';

describe('CostMetricTypeSchema', () => {
  it('should accept all valid metric types', () => {
    const types = ['token', 'request', 'character', 'second', 'image', 'embedding'] as const;
    
    types.forEach(type => {
      expect(() => CostMetricTypeSchema.parse(type)).not.toThrow();
    });
  });
});

describe('BillingPeriodSchema', () => {
  it('should accept all valid billing periods', () => {
    const periods = ['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'] as const;
    
    periods.forEach(period => {
      expect(() => BillingPeriodSchema.parse(period)).not.toThrow();
    });
  });
});

describe('CostEntrySchema', () => {
  it('should accept minimal cost entry', () => {
    const entry: CostEntry = {
      id: 'cost-1',
      timestamp: '2024-01-15T10:00:00Z',
      modelId: 'gpt-4-turbo',
      provider: 'openai',
      operation: 'chat_completion',
      totalCost: 0.05,
    };
    const result = CostEntrySchema.parse(entry);
    expect(result.currency).toBe('USD');
    expect(result.requestCount).toBe(1);
  });

  it('should accept full cost entry', () => {
    const entry: CostEntry = {
      id: 'cost-1',
      timestamp: '2024-01-15T10:00:00Z',
      modelId: 'gpt-4-turbo',
      provider: 'openai',
      operation: 'chat_completion',
      promptTokens: 1500,
      completionTokens: 800,
      totalTokens: 2300,
      requestCount: 1,
      promptCost: 0.015,
      completionCost: 0.024,
      totalCost: 0.039,
      currency: 'USD',
      sessionId: 'session-123',
      userId: 'user-456',
      agentId: 'support_agent',
      object: 'case',
      recordId: 'case-789',
      tags: ['production', 'support'],
      metadata: {
        department: 'customer-service',
      },
    };
    expect(() => CostEntrySchema.parse(entry)).not.toThrow();
  });
});

describe('BudgetTypeSchema', () => {
  it('should accept all valid budget types', () => {
    const types = ['global', 'user', 'agent', 'object', 'project', 'department'] as const;
    
    types.forEach(type => {
      expect(() => BudgetTypeSchema.parse(type)).not.toThrow();
    });
  });
});

describe('BudgetLimitSchema', () => {
  it('should accept minimal budget limit', () => {
    const limit: BudgetLimit = {
      type: 'global',
      maxCost: 1000,
      period: 'monthly',
    };
    const result = BudgetLimitSchema.parse(limit);
    expect(result.currency).toBe('USD');
    expect(result.enforced).toBe(true);
    expect(result.allowRollover).toBe(false);
    expect(result.active).toBe(true);
  });

  it('should accept user budget with warnings', () => {
    const limit: BudgetLimit = {
      type: 'user',
      scope: 'user-123',
      maxCost: 100,
      currency: 'USD',
      period: 'monthly',
      softLimit: 80,
      warnThresholds: [0.5, 0.75, 0.9],
      enforced: true,
      gracePeriodSeconds: 3600,
      name: 'User Monthly Budget',
      description: 'Monthly AI usage budget for individual users',
      tags: ['user-budget'],
    };
    expect(() => BudgetLimitSchema.parse(limit)).not.toThrow();
  });

  it('should accept budget with rollover', () => {
    const limit: BudgetLimit = {
      type: 'department',
      scope: 'engineering',
      maxCost: 5000,
      period: 'monthly',
      allowRollover: true,
      maxRolloverPercentage: 0.2,
    };
    expect(() => BudgetLimitSchema.parse(limit)).not.toThrow();
  });

  it('should accept custom period budget', () => {
    const limit: BudgetLimit = {
      type: 'project',
      scope: 'project-xyz',
      maxCost: 2000,
      period: 'custom',
      customPeriodDays: 90,
    };
    expect(() => BudgetLimitSchema.parse(limit)).not.toThrow();
  });
});

describe('BudgetStatusSchema', () => {
  it('should accept budget status', () => {
    const status = {
      budgetId: 'budget-1',
      type: 'user' as const,
      scope: 'user-123',
      periodStart: '2024-01-01T00:00:00Z',
      periodEnd: '2024-01-31T23:59:59Z',
      currentCost: 75,
      maxCost: 100,
      currency: 'USD',
      percentageUsed: 0.75,
      remainingCost: 25,
      isExceeded: false,
      isWarning: true,
      projectedCost: 95,
      projectedOverage: 0,
      lastUpdated: '2024-01-15T10:00:00Z',
    };
    expect(() => BudgetStatusSchema.parse(status)).not.toThrow();
  });

  it('should accept exceeded budget', () => {
    const status = {
      budgetId: 'budget-2',
      type: 'agent' as const,
      scope: 'code_generator',
      periodStart: '2024-01-01T00:00:00Z',
      periodEnd: '2024-01-31T23:59:59Z',
      currentCost: 1200,
      maxCost: 1000,
      percentageUsed: 1.2,
      remainingCost: -200,
      isExceeded: true,
      isWarning: true,
      projectedCost: 1500,
      projectedOverage: 500,
      lastUpdated: '2024-01-15T10:00:00Z',
    };
    expect(() => BudgetStatusSchema.parse(status)).not.toThrow();
  });
});

describe('CostAlertTypeSchema', () => {
  it('should accept all valid alert types', () => {
    const types = [
      'threshold_warning',
      'threshold_critical',
      'limit_exceeded',
      'anomaly_detected',
      'projection_exceeded',
    ] as const;
    
    types.forEach(type => {
      expect(() => CostAlertTypeSchema.parse(type)).not.toThrow();
    });
  });
});

describe('CostAlertSchema', () => {
  it('should accept threshold warning alert', () => {
    const alert: CostAlert = {
      id: 'alert-1',
      timestamp: '2024-01-15T10:00:00Z',
      type: 'threshold_warning',
      severity: 'warning',
      budgetId: 'budget-1',
      budgetType: 'user',
      scope: 'user-123',
      message: 'User budget at 75% of limit',
      currentCost: 75,
      maxCost: 100,
      threshold: 0.75,
      currency: 'USD',
    };
    const result = CostAlertSchema.parse(alert);
    expect(result.acknowledged).toBe(false);
    expect(result.resolved).toBe(false);
  });

  it('should accept limit exceeded alert with recommendations', () => {
    const alert: CostAlert = {
      id: 'alert-2',
      timestamp: '2024-01-15T11:00:00Z',
      type: 'limit_exceeded',
      severity: 'critical',
      budgetId: 'budget-2',
      budgetType: 'agent',
      scope: 'code_generator',
      message: 'Agent budget exceeded by 20%',
      currentCost: 1200,
      maxCost: 1000,
      currency: 'USD',
      recommendations: [
        'Consider switching to a more cost-effective model',
        'Review token usage patterns',
        'Enable response caching',
      ],
    };
    expect(() => CostAlertSchema.parse(alert)).not.toThrow();
  });

  it('should accept acknowledged alert', () => {
    const alert: CostAlert = {
      id: 'alert-3',
      timestamp: '2024-01-15T12:00:00Z',
      type: 'anomaly_detected',
      severity: 'warning',
      message: 'Unusual spending pattern detected',
      currentCost: 500,
      acknowledged: true,
      acknowledgedBy: 'admin-user',
      acknowledgedAt: '2024-01-15T12:30:00Z',
      resolved: true,
    };
    expect(() => CostAlertSchema.parse(alert)).not.toThrow();
  });
});

describe('CostBreakdownDimensionSchema', () => {
  it('should accept all valid dimensions', () => {
    const dimensions = ['model', 'provider', 'user', 'agent', 'object', 'operation', 'date', 'hour', 'tag'] as const;
    
    dimensions.forEach(dimension => {
      expect(() => CostBreakdownDimensionSchema.parse(dimension)).not.toThrow();
    });
  });
});

describe('CostBreakdownEntrySchema', () => {
  it('should accept breakdown by model', () => {
    const entry = {
      dimension: 'model' as const,
      value: 'gpt-4-turbo',
      totalCost: 150.50,
      requestCount: 1000,
      totalTokens: 1500000,
      percentageOfTotal: 0.65,
      periodStart: '2024-01-01T00:00:00Z',
      periodEnd: '2024-01-31T23:59:59Z',
    };
    expect(() => CostBreakdownEntrySchema.parse(entry)).not.toThrow();
  });
});

describe('CostAnalyticsSchema', () => {
  it('should accept comprehensive analytics', () => {
    const analytics = {
      periodStart: '2024-01-01T00:00:00Z',
      periodEnd: '2024-01-31T23:59:59Z',
      totalCost: 2500.75,
      totalRequests: 50000,
      totalTokens: 75000000,
      currency: 'USD',
      averageCostPerRequest: 0.05,
      averageCostPerToken: 0.0000333,
      averageRequestsPerDay: 1612,
      costTrend: 'increasing' as const,
      trendPercentage: 15.5,
      byModel: [
        {
          dimension: 'model' as const,
          value: 'gpt-4-turbo',
          totalCost: 1625.50,
          requestCount: 30000,
          totalTokens: 48750000,
          percentageOfTotal: 0.65,
        },
        {
          dimension: 'model' as const,
          value: 'gpt-3.5-turbo',
          totalCost: 625.15,
          requestCount: 15000,
          totalTokens: 20625000,
          percentageOfTotal: 0.25,
        },
      ],
      byProvider: [
        {
          dimension: 'provider' as const,
          value: 'openai',
          totalCost: 2250.65,
          requestCount: 45000,
          percentageOfTotal: 0.90,
        },
      ],
      topModels: [
        {
          dimension: 'model' as const,
          value: 'gpt-4-turbo',
          totalCost: 1625.50,
          requestCount: 30000,
          percentageOfTotal: 0.65,
        },
      ],
      tokensPerDollar: 30000,
      requestsPerDollar: 20,
    };
    expect(() => CostAnalyticsSchema.parse(analytics)).not.toThrow();
  });
});

describe('CostOptimizationRecommendationSchema', () => {
  it('should accept model switch recommendation', () => {
    const recommendation = {
      id: 'rec-1',
      type: 'switch_model' as const,
      title: 'Switch to GPT-3.5-turbo for simple queries',
      description: 'Analysis shows 40% of requests could use a cheaper model without quality loss',
      estimatedSavings: 500,
      savingsPercentage: 0.20,
      priority: 'high' as const,
      effort: 'medium' as const,
      actionable: true,
      actionSteps: [
        'Identify simple query patterns',
        'Update routing logic',
        'Monitor quality metrics',
      ],
      targetModel: 'gpt-4-turbo',
      alternativeModel: 'gpt-3.5-turbo',
    };
    const result = CostOptimizationRecommendationSchema.parse(recommendation);
    expect(result.status).toBe('pending');
  });

  it('should accept implemented recommendation', () => {
    const recommendation = {
      id: 'rec-2',
      type: 'cache_results' as const,
      title: 'Enable response caching',
      description: 'Cache frequently asked questions to reduce redundant API calls',
      estimatedSavings: 300,
      savingsPercentage: 0.12,
      priority: 'medium' as const,
      effort: 'low' as const,
      actionable: true,
      status: 'implemented' as const,
      implementedAt: '2024-01-10T00:00:00Z',
    };
    expect(() => CostOptimizationRecommendationSchema.parse(recommendation)).not.toThrow();
  });
});

describe('CostReportSchema', () => {
  it('should accept summary report', () => {
    const report: CostReport = {
      id: 'report-1',
      name: 'January 2024 Cost Report',
      generatedAt: '2024-02-01T00:00:00Z',
      periodStart: '2024-01-01T00:00:00Z',
      periodEnd: '2024-01-31T23:59:59Z',
      period: 'monthly',
      analytics: {
        periodStart: '2024-01-01T00:00:00Z',
        periodEnd: '2024-01-31T23:59:59Z',
        totalCost: 2500.75,
        totalRequests: 50000,
        totalTokens: 75000000,
        currency: 'USD',
        averageCostPerRequest: 0.05,
        averageCostPerToken: 0.0000333,
        averageRequestsPerDay: 1612,
      },
    };
    const result = CostReportSchema.parse(report);
    expect(result.format).toBe('summary');
    expect(result.currency).toBe('USD');
    expect(result.activeAlertCount).toBe(0);
  });

  it('should accept detailed report with all sections', () => {
    const report: CostReport = {
      id: 'report-2',
      name: 'Q1 2024 Executive Report',
      generatedAt: '2024-04-01T00:00:00Z',
      periodStart: '2024-01-01T00:00:00Z',
      periodEnd: '2024-03-31T23:59:59Z',
      period: 'quarterly',
      analytics: {
        periodStart: '2024-01-01T00:00:00Z',
        periodEnd: '2024-03-31T23:59:59Z',
        totalCost: 7500,
        totalRequests: 150000,
        totalTokens: 225000000,
        currency: 'USD',
        averageCostPerRequest: 0.05,
        averageCostPerToken: 0.0000333,
        averageRequestsPerDay: 1666,
        costTrend: 'increasing',
        trendPercentage: 10,
      },
      budgets: [
        {
          budgetId: 'budget-global',
          type: 'global',
          periodStart: '2024-01-01T00:00:00Z',
          periodEnd: '2024-03-31T23:59:59Z',
          currentCost: 7500,
          maxCost: 10000,
          percentageUsed: 0.75,
          remainingCost: 2500,
          isExceeded: false,
          isWarning: true,
          lastUpdated: '2024-03-31T23:59:59Z',
        },
      ],
      alerts: [
        {
          id: 'alert-1',
          timestamp: '2024-03-25T10:00:00Z',
          type: 'threshold_warning',
          severity: 'warning',
          message: 'Global budget at 75%',
          currentCost: 7500,
          maxCost: 10000,
          threshold: 0.75,
        },
      ],
      activeAlertCount: 1,
      recommendations: [
        {
          id: 'rec-1',
          type: 'switch_model',
          title: 'Optimize model selection',
          description: 'Switch 30% of requests to cheaper models',
          estimatedSavings: 1500,
          savingsPercentage: 0.20,
          priority: 'high',
          effort: 'medium',
          actionable: true,
        },
      ],
      previousPeriodCost: 6800,
      costChange: 700,
      costChangePercentage: 10.29,
      forecastedCost: 8200,
      forecastedBudgetStatus: 'at',
      format: 'executive',
      currency: 'USD',
    };
    expect(() => CostReportSchema.parse(report)).not.toThrow();
  });
});

describe('CostQueryFiltersSchema', () => {
  it('should accept minimal filters', () => {
    const filters = {};
    const result = CostQueryFiltersSchema.parse(filters);
    expect(result.orderBy).toBe('timestamp');
    expect(result.orderDirection).toBe('desc');
  });

  it('should accept comprehensive filters', () => {
    const filters = {
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-31T23:59:59Z',
      modelIds: ['gpt-4-turbo', 'gpt-3.5-turbo'],
      providers: ['openai'],
      userIds: ['user-123', 'user-456'],
      agentIds: ['support_agent', 'code_generator'],
      operations: ['chat_completion', 'embedding'],
      sessionIds: ['session-1', 'session-2'],
      minCost: 0.01,
      maxCost: 1.00,
      tags: ['production', 'support'],
      groupBy: ['model' as const, 'user' as const],
      orderBy: 'cost' as const,
      orderDirection: 'desc' as const,
      limit: 100,
      offset: 0,
    };
    expect(() => CostQueryFiltersSchema.parse(filters)).not.toThrow();
  });
});

describe('Real-World Cost Tracking Examples', () => {
  it('should accept enterprise cost tracking scenario', () => {
    const costEntry: CostEntry = {
      id: 'cost-enterprise-1',
      timestamp: '2024-01-15T14:35:22Z',
      modelId: 'gpt-4-turbo',
      provider: 'azure_openai',
      operation: 'chat_completion',
      promptTokens: 2500,
      completionTokens: 1200,
      totalTokens: 3700,
      requestCount: 1,
      promptCost: 0.025,
      completionCost: 0.036,
      totalCost: 0.061,
      currency: 'USD',
      sessionId: 'support-session-12345',
      userId: 'agent-sarah',
      agentId: 'customer_support_bot',
      object: 'case',
      recordId: 'case-67890',
      tags: ['support', 'enterprise-customer', 'tier-1'],
      metadata: {
        department: 'customer-success',
        region: 'us-east',
        customer_tier: 'enterprise',
      },
    };
    
    expect(() => CostEntrySchema.parse(costEntry)).not.toThrow();
  });

  it('should accept multi-tier budget system', () => {
    const globalBudget: BudgetLimit = {
      type: 'global',
      maxCost: 50000,
      period: 'monthly',
      softLimit: 40000,
      warnThresholds: [0.7, 0.85, 0.95],
      enforced: true,
      name: 'Global Monthly Budget',
      description: 'Organization-wide AI budget',
    };

    const departmentBudget: BudgetLimit = {
      type: 'department',
      scope: 'customer-support',
      maxCost: 15000,
      period: 'monthly',
      softLimit: 12000,
      warnThresholds: [0.8, 0.9],
      enforced: true,
      allowRollover: true,
      maxRolloverPercentage: 0.1,
      name: 'Customer Support Budget',
    };

    const userBudget: BudgetLimit = {
      type: 'user',
      scope: 'power-user-123',
      maxCost: 500,
      period: 'monthly',
      warnThresholds: [0.9],
      enforced: false,
      name: 'Power User Budget',
      description: 'Budget for high-volume users',
    };

    expect(() => BudgetLimitSchema.parse(globalBudget)).not.toThrow();
    expect(() => BudgetLimitSchema.parse(departmentBudget)).not.toThrow();
    expect(() => BudgetLimitSchema.parse(userBudget)).not.toThrow();
  });

  it('should accept comprehensive monthly cost report', () => {
    const report: CostReport = {
      id: 'monthly-report-2024-01',
      name: 'January 2024 AI Cost Report',
      generatedAt: '2024-02-01T00:00:00Z',
      periodStart: '2024-01-01T00:00:00Z',
      periodEnd: '2024-01-31T23:59:59Z',
      period: 'monthly',
      analytics: {
        periodStart: '2024-01-01T00:00:00Z',
        periodEnd: '2024-01-31T23:59:59Z',
        totalCost: 42350.50,
        totalRequests: 850000,
        totalTokens: 1275000000,
        currency: 'USD',
        averageCostPerRequest: 0.0498,
        averageCostPerToken: 0.0000332,
        averageRequestsPerDay: 27419,
        costTrend: 'increasing',
        trendPercentage: 12.5,
        byModel: [
          {
            dimension: 'model',
            value: 'gpt-4-turbo',
            totalCost: 27528,
            requestCount: 340000,
            totalTokens: 765000000,
            percentageOfTotal: 0.65,
          },
          {
            dimension: 'model',
            value: 'gpt-3.5-turbo',
            totalCost: 10587.63,
            requestCount: 425000,
            totalTokens: 382500000,
            percentageOfTotal: 0.25,
          },
          {
            dimension: 'model',
            value: 'text-embedding-3-large',
            totalCost: 4234.87,
            requestCount: 85000,
            totalTokens: 127500000,
            percentageOfTotal: 0.10,
          },
        ],
        byProvider: [
          {
            dimension: 'provider',
            value: 'openai',
            totalCost: 38115.45,
            requestCount: 765000,
            percentageOfTotal: 0.90,
          },
          {
            dimension: 'provider',
            value: 'anthropic',
            totalCost: 4235.05,
            requestCount: 85000,
            percentageOfTotal: 0.10,
          },
        ],
        topModels: [
          {
            dimension: 'model',
            value: 'gpt-4-turbo',
            totalCost: 27528,
            requestCount: 340000,
            percentageOfTotal: 0.65,
          },
        ],
        topUsers: [
          {
            dimension: 'user',
            value: 'support-team',
            totalCost: 18799.73,
            requestCount: 382500,
            percentageOfTotal: 0.444,
          },
        ],
        tokensPerDollar: 30106,
        requestsPerDollar: 20,
      },
      budgets: [
        {
          budgetId: 'global-monthly',
          type: 'global',
          periodStart: '2024-01-01T00:00:00Z',
          periodEnd: '2024-01-31T23:59:59Z',
          currentCost: 42350.50,
          maxCost: 50000,
          percentageUsed: 0.847,
          remainingCost: 7649.50,
          isExceeded: false,
          isWarning: true,
          projectedCost: 46000,
          lastUpdated: '2024-01-31T23:59:59Z',
        },
      ],
      alerts: [
        {
          id: 'alert-budget-warning',
          timestamp: '2024-01-28T10:00:00Z',
          type: 'threshold_warning',
          severity: 'warning',
          budgetId: 'global-monthly',
          budgetType: 'global',
          message: 'Global budget has reached 85% of limit',
          currentCost: 42350.50,
          maxCost: 50000,
          threshold: 0.85,
          recommendations: [
            'Review high-cost operations',
            'Consider switching to more cost-effective models for routine tasks',
          ],
        },
      ],
      activeAlertCount: 1,
      recommendations: [
        {
          id: 'opt-rec-1',
          type: 'switch_model',
          title: 'Optimize support queries with GPT-3.5-turbo',
          description: 'Analysis shows 45% of support queries could use GPT-3.5-turbo instead of GPT-4-turbo with minimal quality impact',
          estimatedSavings: 8500,
          savingsPercentage: 0.20,
          priority: 'high',
          effort: 'medium',
          actionable: true,
          targetModel: 'gpt-4-turbo',
          alternativeModel: 'gpt-3.5-turbo',
          actionSteps: [
            'Identify simple support queries',
            'Update routing logic',
            'A/B test quality metrics',
            'Roll out to 50% of traffic',
          ],
        },
        {
          id: 'opt-rec-2',
          type: 'cache_results',
          title: 'Enable embedding cache',
          description: 'Cache embedding results for frequently searched content',
          estimatedSavings: 2000,
          savingsPercentage: 0.047,
          priority: 'medium',
          effort: 'low',
          actionable: true,
        },
      ],
      previousPeriodCost: 37645,
      costChange: 4705.50,
      costChangePercentage: 12.5,
      forecastedCost: 46000,
      forecastedBudgetStatus: 'at',
      format: 'detailed',
      currency: 'USD',
    };
    
    expect(() => CostReportSchema.parse(report)).not.toThrow();
  });
});

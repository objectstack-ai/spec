import { describe, it, expect } from 'vitest';
import {
  QueryIntentSchema,
  EntitySchema,
  TimeframeSchema,
  NLQFieldMappingSchema,
  QueryContextSchema,
  NLQParseResultSchema,
  NLQRequestSchema,
  NLQResponseSchema,
  NLQTrainingExampleSchema,
  NLQModelConfigSchema,
  NLQAnalyticsSchema,
  FieldSynonymConfigSchema,
  QueryTemplateSchema,
  type NLQRequest,
  type NLQResponse,
  type NLQParseResult,
} from './nlq.zod';

describe('QueryIntentSchema', () => {
  it('should accept all valid intents', () => {
    const intents = ['select', 'aggregate', 'filter', 'sort', 'compare', 'trend', 'insight', 'create', 'update', 'delete'] as const;
    
    intents.forEach(intent => {
      expect(() => QueryIntentSchema.parse(intent)).not.toThrow();
    });
  });
});

describe('EntitySchema', () => {
  it('should accept entity with all fields', () => {
    const entity = {
      type: 'object' as const,
      text: 'accounts',
      value: 'account',
      confidence: 0.95,
      span: [8, 16] as [number, number],
    };
    expect(() => EntitySchema.parse(entity)).not.toThrow();
  });

  it('should accept entity without optional fields', () => {
    const entity = {
      type: 'field' as const,
      text: 'customer name',
      value: 'account.name',
      confidence: 0.88,
    };
    expect(() => EntitySchema.parse(entity)).not.toThrow();
  });
});

describe('TimeframeSchema', () => {
  it('should accept absolute timeframe', () => {
    const timeframe = {
      type: 'absolute' as const,
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-31T23:59:59Z',
      text: 'January 2024',
    };
    expect(() => TimeframeSchema.parse(timeframe)).not.toThrow();
  });

  it('should accept relative timeframe', () => {
    const timeframe = {
      type: 'relative' as const,
      relative: {
        unit: 'month' as const,
        value: 1,
        direction: 'past' as const,
      },
      text: 'last month',
    };
    expect(() => TimeframeSchema.parse(timeframe)).not.toThrow();
  });
});

describe('NLQFieldMappingSchema', () => {
  it('should accept field mapping', () => {
    const mapping = {
      naturalLanguage: 'customer name',
      objectField: 'account.name',
      object: 'account',
      field: 'name',
      confidence: 0.92,
    };
    expect(() => NLQFieldMappingSchema.parse(mapping)).not.toThrow();
  });
});

describe('QueryContextSchema', () => {
  it('should accept minimal context', () => {
    const context = {};
    const result = QueryContextSchema.parse(context);
    expect(result.defaultLimit).toBe(100);
    expect(result.timezone).toBe('UTC');
    expect(result.locale).toBe('en-US');
  });

  it('should accept full context', () => {
    const context = {
      userId: 'user-123',
      userRole: 'sales_manager',
      currentObject: 'account',
      currentRecordId: 'acc-456',
      conversationHistory: [
        {
          query: 'show me all accounts',
          timestamp: '2024-01-15T10:00:00Z',
          intent: 'select' as const,
        },
      ],
      defaultLimit: 50,
      timezone: 'America/New_York',
      locale: 'en-US',
    };
    expect(() => QueryContextSchema.parse(context)).not.toThrow();
  });
});

describe('NLQParseResultSchema', () => {
  it('should accept parse result', () => {
    const result: NLQParseResult = {
      originalQuery: 'show me all accounts created last month',
      intent: 'select',
      intentConfidence: 0.95,
      entities: [
        {
          type: 'object',
          text: 'accounts',
          value: 'account',
          confidence: 0.98,
        },
        {
          type: 'timeframe',
          text: 'last month',
          value: { unit: 'month', value: 1 },
          confidence: 0.92,
        },
      ],
      targetObject: 'account',
      fields: [
        {
          naturalLanguage: 'accounts',
          objectField: 'account',
          object: 'account',
          field: '*',
          confidence: 0.98,
        },
      ],
      timeframe: {
        type: 'relative',
        relative: {
          unit: 'month',
          value: 1,
          direction: 'past',
        },
        text: 'last month',
      },
      ast: {
        object: 'account',
        fields: ['*'],
        filters: [['created_date', '>=', '2023-12-01']],
      },
      confidence: 0.93,
    };
    expect(() => NLQParseResultSchema.parse(result)).not.toThrow();
  });

  it('should accept parse result with ambiguities', () => {
    const result: NLQParseResult = {
      originalQuery: 'show me accounts',
      intent: 'select',
      intentConfidence: 0.85,
      entities: [],
      targetObject: 'account',
      ast: { object: 'account' },
      confidence: 0.85,
      ambiguities: [
        {
          type: 'field_selection',
          description: 'No specific fields mentioned',
          suggestions: ['All fields', 'Default view fields', 'Summary fields'],
        },
      ],
    };
    expect(() => NLQParseResultSchema.parse(result)).not.toThrow();
  });

  it('should accept parse result with alternatives', () => {
    const result: NLQParseResult = {
      originalQuery: 'show tasks',
      intent: 'select',
      intentConfidence: 0.8,
      entities: [],
      targetObject: 'task',
      ast: { object: 'task' },
      confidence: 0.8,
      alternatives: [
        {
          interpretation: 'Show all tasks',
          confidence: 0.8,
          ast: { object: 'task', fields: ['*'] },
        },
        {
          interpretation: 'Show my tasks',
          confidence: 0.7,
          ast: { object: 'task', filters: [['assigned_to', '=', 'current_user']] },
        },
      ],
    };
    expect(() => NLQParseResultSchema.parse(result)).not.toThrow();
  });
});

describe('NLQRequestSchema', () => {
  it('should accept minimal request', () => {
    const request: NLQRequest = {
      query: 'show me all accounts',
    };
    const result = NLQRequestSchema.parse(request);
    expect(result.includeAlternatives).toBe(false);
    expect(result.maxAlternatives).toBe(3);
    expect(result.minConfidence).toBe(0.5);
    expect(result.executeQuery).toBe(false);
  });

  it('should accept full request', () => {
    const request: NLQRequest = {
      query: 'what are the top 10 opportunities by value?',
      context: {
        userId: 'user-123',
        currentObject: 'opportunity',
        defaultLimit: 10,
      },
      includeAlternatives: true,
      maxAlternatives: 5,
      minConfidence: 0.7,
      executeQuery: true,
      maxResults: 10,
    };
    expect(() => NLQRequestSchema.parse(request)).not.toThrow();
  });
});

describe('NLQResponseSchema', () => {
  it('should accept response without execution', () => {
    const response: NLQResponse = {
      parseResult: {
        originalQuery: 'show accounts',
        intent: 'select',
        intentConfidence: 0.9,
        entities: [],
        targetObject: 'account',
        ast: { object: 'account' },
        confidence: 0.9,
      },
      needsClarification: false,
    };
    expect(() => NLQResponseSchema.parse(response)).not.toThrow();
  });

  it('should accept response with execution results', () => {
    const response: NLQResponse = {
      parseResult: {
        originalQuery: 'show accounts',
        intent: 'select',
        intentConfidence: 0.9,
        entities: [],
        targetObject: 'account',
        ast: { object: 'account' },
        confidence: 0.9,
      },
      results: [
        { id: '1', name: 'Acme Corp', industry: 'Technology' },
        { id: '2', name: 'Globex Inc', industry: 'Manufacturing' },
      ],
      totalCount: 2,
      executionTime: 150,
      needsClarification: false,
    };
    expect(() => NLQResponseSchema.parse(response)).not.toThrow();
  });

  it('should accept response needing clarification', () => {
    const response: NLQResponse = {
      parseResult: {
        originalQuery: 'show accounts',
        intent: 'select',
        intentConfidence: 0.6,
        entities: [],
        targetObject: 'account',
        ast: { object: 'account' },
        confidence: 0.6,
        ambiguities: [
          {
            type: 'field_selection',
            description: 'Which fields do you want to see?',
          },
        ],
      },
      needsClarification: true,
      suggestions: [
        'Show all accounts with name and industry',
        'Show active accounts only',
        'Show accounts created this month',
      ],
    };
    expect(() => NLQResponseSchema.parse(response)).not.toThrow();
  });
});

describe('NLQTrainingExampleSchema', () => {
  it('should accept training example', () => {
    const example = {
      query: 'show me all accounts created last month',
      expectedIntent: 'select' as const,
      expectedObject: 'account',
      expectedAST: {
        object: 'account',
        filters: [['created_date', '>=', '2023-12-01']],
      },
      category: 'basic_select',
      tags: ['select', 'timeframe'],
      notes: 'Basic select with relative timeframe',
    };
    expect(() => NLQTrainingExampleSchema.parse(example)).not.toThrow();
  });
});

describe('NLQModelConfigSchema', () => {
  it('should accept minimal config', () => {
    const config = {
      modelId: 'gpt-4-turbo',
    };
    const result = NLQModelConfigSchema.parse(config);
    expect(result.includeSchema).toBe(true);
    expect(result.enableIntentDetection).toBe(true);
    expect(result.enableCaching).toBe(true);
  });

  it('should accept full config', () => {
    const config = {
      modelId: 'gpt-4-turbo',
      systemPrompt: 'You are an expert at converting natural language to ObjectQL queries.',
      includeSchema: true,
      includeExamples: true,
      enableIntentDetection: true,
      intentThreshold: 0.8,
      enableEntityRecognition: true,
      entityRecognitionModel: 'ner-model-v1',
      enableFuzzyMatching: true,
      fuzzyMatchThreshold: 0.85,
      enableTimeframeDetection: true,
      defaultTimeframe: 'current_month',
      enableCaching: true,
      cacheTTL: 7200,
    };
    expect(() => NLQModelConfigSchema.parse(config)).not.toThrow();
  });
});

describe('NLQAnalyticsSchema', () => {
  it('should accept analytics data', () => {
    const analytics = {
      totalQueries: 1000,
      successfulQueries: 850,
      failedQueries: 150,
      averageConfidence: 0.87,
      intentDistribution: {
        select: 500,
        aggregate: 200,
        filter: 150,
        sort: 100,
        compare: 50,
      },
      topQueries: [
        {
          query: 'show me all accounts',
          count: 150,
          averageConfidence: 0.95,
        },
        {
          query: 'total revenue by region',
          count: 120,
          averageConfidence: 0.92,
        },
      ],
      averageParseTime: 250,
      averageExecutionTime: 500,
      lowConfidenceQueries: [
        {
          query: 'show stuff',
          confidence: 0.45,
          timestamp: '2024-01-15T10:00:00Z',
        },
      ],
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-31T23:59:59Z',
    };
    expect(() => NLQAnalyticsSchema.parse(analytics)).not.toThrow();
  });
});

describe('FieldSynonymConfigSchema', () => {
  it('should accept field synonym config', () => {
    const config = {
      object: 'account',
      field: 'name',
      synonyms: ['customer name', 'company name', 'organization name', 'account name'],
      examples: [
        'show accounts by customer name',
        'find companies with name containing Acme',
      ],
    };
    expect(() => FieldSynonymConfigSchema.parse(config)).not.toThrow();
  });
});

describe('QueryTemplateSchema', () => {
  it('should accept query template', () => {
    const template = {
      id: 'template-1',
      name: 'top_n_by_field',
      label: 'Top N Records by Field',
      pattern: 'top {n} {object} by {field}',
      variables: [
        { name: 'n', type: 'value' as const, required: true },
        { name: 'object', type: 'object' as const, required: true },
        { name: 'field', type: 'field' as const, required: true },
      ],
      astTemplate: {
        object: '{object}',
        sort: [{ field: '{field}', order: 'desc' }],
        limit: '{n}',
      },
      category: 'ranking',
      examples: [
        'top 10 accounts by revenue',
        'top 5 opportunities by amount',
      ],
      tags: ['sort', 'limit', 'ranking'],
    };
    expect(() => QueryTemplateSchema.parse(template)).not.toThrow();
  });

  it('should enforce snake_case for template name', () => {
    const validNames = ['top_n_by_field', 'filter_by_date', 'aggregate_sum'];
    validNames.forEach(name => {
      expect(() => QueryTemplateSchema.parse({
        id: 'test',
        name,
        label: 'Test',
        pattern: 'test',
        variables: [],
        astTemplate: {},
      })).not.toThrow();
    });

    const invalidNames = ['topNByField', 'Top-N-By-Field', '123template'];
    invalidNames.forEach(name => {
      expect(() => QueryTemplateSchema.parse({
        id: 'test',
        name,
        label: 'Test',
        pattern: 'test',
        variables: [],
        astTemplate: {},
      })).toThrow();
    });
  });
});

describe('Real-World NLQ Examples', () => {
  it('should accept sales query example', () => {
    const request: NLQRequest = {
      query: 'show me all opportunities worth more than $100k closed this quarter',
      context: {
        userId: 'user-123',
        userRole: 'sales_manager',
        currentObject: 'opportunity',
        timezone: 'America/New_York',
      },
      executeQuery: true,
      maxResults: 50,
    };
    
    const response: NLQResponse = {
      parseResult: {
        originalQuery: request.query,
        intent: 'select',
        intentConfidence: 0.94,
        entities: [
          { type: 'object', text: 'opportunities', value: 'opportunity', confidence: 0.98 },
          { type: 'field', text: 'worth', value: 'amount', confidence: 0.92 },
          { type: 'value', text: '$100k', value: 100000, confidence: 0.95 },
          { type: 'field', text: 'closed', value: 'stage', confidence: 0.88 },
          { type: 'timeframe', text: 'this quarter', value: { unit: 'quarter', value: 0 }, confidence: 0.96 },
        ],
        targetObject: 'opportunity',
        fields: [
          { naturalLanguage: 'opportunities', objectField: 'opportunity.*', object: 'opportunity', field: '*', confidence: 0.98 },
          { naturalLanguage: 'worth', objectField: 'opportunity.amount', object: 'opportunity', field: 'amount', confidence: 0.92 },
        ],
        timeframe: {
          type: 'relative',
          relative: { unit: 'quarter', value: 0, direction: 'current' },
          text: 'this quarter',
        },
        ast: {
          object: 'opportunity',
          fields: ['*'],
          filters: [
            ['amount', '>', 100000],
            'and',
            ['stage', '=', 'Closed Won'],
            'and',
            ['close_date', '>=', '2024-01-01'],
            'and',
            ['close_date', '<=', '2024-03-31'],
          ],
          sort: [{ field: 'amount', order: 'desc' }],
        },
        confidence: 0.93,
      },
      results: [
        { id: '1', name: 'Enterprise Deal', amount: 250000, stage: 'Closed Won', close_date: '2024-02-15' },
        { id: '2', name: 'Strategic Partnership', amount: 180000, stage: 'Closed Won', close_date: '2024-01-20' },
      ],
      totalCount: 2,
      executionTime: 320,
      needsClarification: false,
    };
    
    expect(() => NLQRequestSchema.parse(request)).not.toThrow();
    expect(() => NLQResponseSchema.parse(response)).not.toThrow();
  });

  it('should accept analytics query example', () => {
    const request: NLQRequest = {
      query: 'what is the total revenue by region for last year?',
      context: {
        userId: 'analyst-456',
        userRole: 'data_analyst',
      },
      executeQuery: true,
    };
    
    const response: NLQResponse = {
      parseResult: {
        originalQuery: request.query,
        intent: 'aggregate',
        intentConfidence: 0.97,
        entities: [
          { type: 'function', text: 'total', value: 'sum', confidence: 0.96 },
          { type: 'field', text: 'revenue', value: 'amount', confidence: 0.94 },
          { type: 'field', text: 'region', value: 'region', confidence: 0.98 },
        ],
        targetObject: 'opportunity',
        timeframe: {
          type: 'relative',
          relative: { unit: 'year', value: 1, direction: 'past' },
          text: 'last year',
        },
        ast: {
          object: 'opportunity',
          fields: ['region', { function: 'sum', field: 'amount', alias: 'total_revenue' }],
          filters: [
            ['stage', '=', 'Closed Won'],
            'and',
            ['close_date', '>=', '2023-01-01'],
            'and',
            ['close_date', '<=', '2023-12-31'],
          ],
          groupBy: ['region'],
          sort: [{ field: 'total_revenue', order: 'desc' }],
        },
        confidence: 0.95,
      },
      results: [
        { region: 'North America', total_revenue: 5000000 },
        { region: 'Europe', total_revenue: 3500000 },
        { region: 'Asia Pacific', total_revenue: 2800000 },
      ],
      totalCount: 3,
      executionTime: 450,
      needsClarification: false,
    };
    
    expect(() => NLQRequestSchema.parse(request)).not.toThrow();
    expect(() => NLQResponseSchema.parse(response)).not.toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import {
  QuerySchema,
  FilterOperator,
  LogicOperator,
  AggregationFunction,
  JoinType,
  WindowFunction,
  type QueryAST,
  type AggregationNode,
  type JoinNode,
  type WindowFunctionNode,
} from './query.zod';

describe('FilterOperator', () => {
  it('should accept valid filter operators', () => {
    const validOperators = [
      '=', '!=', '<>',
      '>', '>=', '<', '<=',
      'startswith', 'contains', 'notcontains',
      'between', 'in', 'notin',
      'is_null', 'is_not_null'
    ];

    validOperators.forEach(op => {
      expect(() => FilterOperator.parse(op)).not.toThrow();
    });
  });

  it('should reject invalid operators', () => {
    expect(() => FilterOperator.parse('LIKE')).toThrow();
    expect(() => FilterOperator.parse('equals')).toThrow();
  });
});

describe('LogicOperator', () => {
  it('should accept valid logic operators', () => {
    expect(() => LogicOperator.parse('and')).not.toThrow();
    expect(() => LogicOperator.parse('or')).not.toThrow();
    expect(() => LogicOperator.parse('not')).not.toThrow();
  });
});

describe('AggregationFunction', () => {
  it('should accept valid aggregation functions', () => {
    const validFunctions = [
      'count', 'sum', 'avg', 'min', 'max',
      'count_distinct', 'array_agg', 'string_agg'
    ];

    validFunctions.forEach(fn => {
      expect(() => AggregationFunction.parse(fn)).not.toThrow();
    });
  });

  it('should reject invalid aggregation functions', () => {
    expect(() => AggregationFunction.parse('COUNT')).toThrow();
    expect(() => AggregationFunction.parse('median')).toThrow();
  });
});

describe('JoinType', () => {
  it('should accept valid join types', () => {
    expect(() => JoinType.parse('inner')).not.toThrow();
    expect(() => JoinType.parse('left')).not.toThrow();
    expect(() => JoinType.parse('right')).not.toThrow();
    expect(() => JoinType.parse('full')).not.toThrow();
  });

  it('should reject invalid join types', () => {
    expect(() => JoinType.parse('INNER')).toThrow();
    expect(() => JoinType.parse('cross')).toThrow();
  });
});

describe('WindowFunction', () => {
  it('should accept valid window functions', () => {
    const validFunctions = [
      'row_number', 'rank', 'dense_rank', 'percent_rank',
      'lag', 'lead', 'first_value', 'last_value',
      'sum', 'avg', 'count', 'min', 'max'
    ];

    validFunctions.forEach(fn => {
      expect(() => WindowFunction.parse(fn)).not.toThrow();
    });
  });
});

describe('QuerySchema - Basic', () => {
  it('should accept simple query', () => {
    const query: QueryAST = {
      object: 'account',
      fields: ['name', 'email'],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with filters', () => {
    const query: QueryAST = {
      object: 'account',
      fields: ['name', 'email'],
      filters: ['status', '=', 'active'],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with sort', () => {
    const query: QueryAST = {
      object: 'account',
      fields: ['name', 'email'],
      sort: [
        { field: 'name', order: 'asc' },
        { field: 'created_at', order: 'desc' },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with pagination', () => {
    const query: QueryAST = {
      object: 'account',
      fields: ['name'],
      top: 10,
      skip: 20,
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with distinct', () => {
    const query: QueryAST = {
      object: 'account',
      fields: ['status'],
      distinct: true,
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });
});

describe('QuerySchema - Aggregations', () => {
  it('should accept query with simple aggregation', () => {
    const query: QueryAST = {
      object: 'order',
      aggregations: [
        { function: 'count', alias: 'total_orders' },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with field aggregation', () => {
    const query: QueryAST = {
      object: 'order',
      aggregations: [
        { function: 'sum', field: 'amount', alias: 'total_amount' },
        { function: 'avg', field: 'amount', alias: 'avg_amount' },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with group by', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id'],
      aggregations: [
        { function: 'count', alias: 'order_count' },
        { function: 'sum', field: 'amount', alias: 'total_amount' },
      ],
      groupBy: ['customer_id'],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with having clause', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id'],
      aggregations: [
        { function: 'sum', field: 'amount', alias: 'total_amount' },
      ],
      groupBy: ['customer_id'],
      having: ['total_amount', '>', 1000],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept count distinct aggregation', () => {
    const query: QueryAST = {
      object: 'order',
      aggregations: [
        { function: 'count_distinct', field: 'customer_id', alias: 'unique_customers' },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });
});

describe('QuerySchema - Joins', () => {
  it('should accept query with inner join', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['id', 'amount'],
      joins: [
        {
          type: 'inner',
          object: 'customer',
          alias: 'c',
          on: ['order.customer_id', '=', 'c.id'],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with left join', () => {
    const query: QueryAST = {
      object: 'customer',
      fields: ['name'],
      joins: [
        {
          type: 'left',
          object: 'order',
          on: ['customer.id', '=', 'order.customer_id'],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with multiple joins', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['id'],
      joins: [
        {
          type: 'inner',
          object: 'customer',
          alias: 'c',
          on: ['order.customer_id', '=', 'c.id'],
        },
        {
          type: 'left',
          object: 'product',
          alias: 'p',
          on: ['order.product_id', '=', 'p.id'],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with subquery join', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['id', 'amount'],
      joins: [
        {
          type: 'inner',
          object: 'customer',
          alias: 'high_value_customers',
          on: ['order.customer_id', '=', 'high_value_customers.id'],
          subquery: {
            object: 'customer',
            fields: ['id'],
            filters: ['total_spent', '>', 10000],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });
});

describe('QuerySchema - Window Functions', () => {
  it('should accept query with row_number window function', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['id', 'customer_id', 'amount'],
      windowFunctions: [
        {
          function: 'row_number',
          alias: 'row_num',
          over: {
            partitionBy: ['customer_id'],
            orderBy: [{ field: 'amount', order: 'desc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with rank window function', () => {
    const query: QueryAST = {
      object: 'student',
      fields: ['name', 'score'],
      windowFunctions: [
        {
          function: 'rank',
          alias: 'rank',
          over: {
            orderBy: [{ field: 'score', order: 'desc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with aggregate window function', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['id', 'amount'],
      windowFunctions: [
        {
          function: 'sum',
          field: 'amount',
          alias: 'running_total',
          over: {
            orderBy: [{ field: 'created_at', order: 'asc' }],
            frame: {
              type: 'rows',
              start: 'UNBOUNDED PRECEDING',
              end: 'CURRENT ROW',
            },
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with lag/lead window function', () => {
    const query: QueryAST = {
      object: 'sales',
      fields: ['month', 'revenue'],
      windowFunctions: [
        {
          function: 'lag',
          field: 'revenue',
          alias: 'prev_month_revenue',
          over: {
            orderBy: [{ field: 'month', order: 'asc' }],
          },
        },
        {
          function: 'lead',
          field: 'revenue',
          alias: 'next_month_revenue',
          over: {
            orderBy: [{ field: 'month', order: 'asc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });
});

describe('QuerySchema - Complex Queries', () => {
  it('should accept complex query with joins, aggregations, and window functions', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id'],
      joins: [
        {
          type: 'inner',
          object: 'customer',
          alias: 'c',
          on: ['order.customer_id', '=', 'c.id'],
        },
      ],
      aggregations: [
        { function: 'sum', field: 'amount', alias: 'total_amount' },
        { function: 'count', alias: 'order_count' },
      ],
      groupBy: ['customer_id'],
      having: ['order_count', '>', 5],
      sort: [{ field: 'total_amount', order: 'desc' }],
      top: 100,
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with all features', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['id', 'customer_id', 'amount'],
      distinct: true,
      filters: ['status', '=', 'completed'],
      joins: [
        {
          type: 'inner',
          object: 'customer',
          on: ['order.customer_id', '=', 'customer.id'],
        },
      ],
      aggregations: [
        { function: 'avg', field: 'amount', alias: 'avg_amount' },
      ],
      windowFunctions: [
        {
          function: 'rank',
          alias: 'customer_rank',
          over: {
            partitionBy: ['customer_id'],
            orderBy: [{ field: 'amount', order: 'desc' }],
          },
        },
      ],
      groupBy: ['customer_id'],
      having: ['avg_amount', '>', 500],
      sort: [{ field: 'avg_amount', order: 'desc' }],
      top: 50,
      skip: 0,
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });
});

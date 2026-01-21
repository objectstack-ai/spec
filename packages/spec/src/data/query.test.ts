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
  // ============================================================================
  // Basic Aggregation Tests
  // ============================================================================
  
  it('should accept query with simple COUNT aggregation', () => {
    const query: QueryAST = {
      object: 'order',
      aggregations: [
        { function: 'count', alias: 'total_orders' },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with SUM aggregation', () => {
    const query: QueryAST = {
      object: 'order',
      aggregations: [
        { function: 'sum', field: 'amount', alias: 'total_amount' },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with AVG aggregation', () => {
    const query: QueryAST = {
      object: 'order',
      aggregations: [
        { function: 'avg', field: 'amount', alias: 'avg_amount' },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with MIN aggregation', () => {
    const query: QueryAST = {
      object: 'product',
      aggregations: [
        { function: 'min', field: 'price', alias: 'min_price' },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with MAX aggregation', () => {
    const query: QueryAST = {
      object: 'product',
      aggregations: [
        { function: 'max', field: 'price', alias: 'max_price' },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with multiple aggregations', () => {
    const query: QueryAST = {
      object: 'order',
      aggregations: [
        { function: 'count', alias: 'total_orders' },
        { function: 'sum', field: 'amount', alias: 'total_amount' },
        { function: 'avg', field: 'amount', alias: 'avg_amount' },
        { function: 'min', field: 'amount', alias: 'min_amount' },
        { function: 'max', field: 'amount', alias: 'max_amount' },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // COUNT DISTINCT Tests
  // ============================================================================

  it('should accept COUNT DISTINCT aggregation', () => {
    const query: QueryAST = {
      object: 'order',
      aggregations: [
        { function: 'count_distinct', field: 'customer_id', alias: 'unique_customers' },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept aggregation with distinct flag', () => {
    const query: QueryAST = {
      object: 'order',
      aggregations: [
        { function: 'count', field: 'customer_id', distinct: true, alias: 'unique_customers' },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // GROUP BY Tests
  // ============================================================================

  it('should accept query with single GROUP BY field', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id'],
      aggregations: [
        { function: 'count', alias: 'order_count' },
      ],
      groupBy: ['customer_id'],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with multiple GROUP BY fields', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id', 'status'],
      aggregations: [
        { function: 'count', alias: 'order_count' },
        { function: 'sum', field: 'amount', alias: 'total_amount' },
      ],
      groupBy: ['customer_id', 'status'],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept GROUP BY with multiple aggregations', () => {
    const query: QueryAST = {
      object: 'sales',
      fields: ['region', 'product_category'],
      aggregations: [
        { function: 'sum', field: 'revenue', alias: 'total_revenue' },
        { function: 'avg', field: 'revenue', alias: 'avg_revenue' },
        { function: 'count', alias: 'num_sales' },
        { function: 'min', field: 'sale_date', alias: 'first_sale' },
        { function: 'max', field: 'sale_date', alias: 'last_sale' },
      ],
      groupBy: ['region', 'product_category'],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // HAVING Clause Tests
  // ============================================================================

  it('should accept query with HAVING clause on COUNT', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id'],
      aggregations: [
        { function: 'count', alias: 'order_count' },
      ],
      groupBy: ['customer_id'],
      having: ['order_count', '>', 5],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with HAVING clause on SUM', () => {
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

  it('should accept query with HAVING clause on AVG', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id'],
      aggregations: [
        { function: 'avg', field: 'amount', alias: 'avg_amount' },
      ],
      groupBy: ['customer_id'],
      having: ['avg_amount', '>=', 500],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with complex HAVING clause', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id'],
      aggregations: [
        { function: 'count', alias: 'order_count' },
        { function: 'sum', field: 'amount', alias: 'total_amount' },
      ],
      groupBy: ['customer_id'],
      having: [['order_count', '>', 3], 'and', ['total_amount', '>', 1000]],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with HAVING and WHERE clauses', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id'],
      filters: ['status', '=', 'completed'],
      aggregations: [
        { function: 'sum', field: 'amount', alias: 'total_amount' },
      ],
      groupBy: ['customer_id'],
      having: ['total_amount', '>', 5000],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // Complex Aggregation Scenarios
  // ============================================================================

  it('should accept query with aggregation and sorting', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id'],
      aggregations: [
        { function: 'sum', field: 'amount', alias: 'total_amount' },
      ],
      groupBy: ['customer_id'],
      sort: [{ field: 'total_amount', order: 'desc' }],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with aggregation and pagination', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id'],
      aggregations: [
        { function: 'count', alias: 'order_count' },
      ],
      groupBy: ['customer_id'],
      sort: [{ field: 'order_count', order: 'desc' }],
      top: 10,
      skip: 0,
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with ARRAY_AGG aggregation', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id'],
      aggregations: [
        { function: 'array_agg', field: 'product_id', alias: 'products' },
      ],
      groupBy: ['customer_id'],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with STRING_AGG aggregation', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id'],
      aggregations: [
        { function: 'string_agg', field: 'product_name', alias: 'product_names' },
      ],
      groupBy: ['customer_id'],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // Real-World Aggregation Examples (SQL Comparisons)
  // ============================================================================

  it('should accept sales report aggregation (SQL: SELECT region, SUM(amount) FROM sales GROUP BY region)', () => {
    const query: QueryAST = {
      object: 'sales',
      fields: ['region'],
      aggregations: [
        { function: 'sum', field: 'amount', alias: 'total_sales' },
      ],
      groupBy: ['region'],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept customer summary aggregation (SQL: Multi-metric GROUP BY)', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id'],
      aggregations: [
        { function: 'count', alias: 'num_orders' },
        { function: 'sum', field: 'amount', alias: 'lifetime_value' },
        { function: 'avg', field: 'amount', alias: 'avg_order_value' },
        { function: 'max', field: 'created_at', alias: 'last_order_date' },
      ],
      groupBy: ['customer_id'],
      having: ['num_orders', '>', 1],
      sort: [{ field: 'lifetime_value', order: 'desc' }],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept product analytics aggregation', () => {
    const query: QueryAST = {
      object: 'order_item',
      fields: ['product_id'],
      aggregations: [
        { function: 'count', alias: 'times_purchased' },
        { function: 'sum', field: 'quantity', alias: 'total_quantity' },
        { function: 'sum', field: 'line_total', alias: 'total_revenue' },
      ],
      groupBy: ['product_id'],
      sort: [{ field: 'total_revenue', order: 'desc' }],
      top: 20,
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });
});

describe('QuerySchema - Joins', () => {
  // ============================================================================
  // INNER JOIN Tests
  // ============================================================================
  
  it('should accept query with INNER JOIN', () => {
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

  it('should accept INNER JOIN without alias', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['id'],
      joins: [
        {
          type: 'inner',
          object: 'customer',
          on: ['order.customer_id', '=', 'customer.id'],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept INNER JOIN with complex ON condition', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['id'],
      joins: [
        {
          type: 'inner',
          object: 'customer',
          alias: 'c',
          on: [['order.customer_id', '=', 'c.id'], 'and', ['order.status', '=', 'active']],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // LEFT JOIN Tests
  // ============================================================================

  it('should accept query with LEFT JOIN', () => {
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

  it('should accept LEFT JOIN with alias', () => {
    const query: QueryAST = {
      object: 'customer',
      fields: ['id', 'name'],
      joins: [
        {
          type: 'left',
          object: 'order',
          alias: 'o',
          on: ['customer.id', '=', 'o.customer_id'],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept LEFT JOIN to find unmatched records', () => {
    const query: QueryAST = {
      object: 'customer',
      fields: ['id', 'name'],
      joins: [
        {
          type: 'left',
          object: 'order',
          alias: 'o',
          on: ['customer.id', '=', 'o.customer_id'],
        },
      ],
      filters: ['o.id', 'is_null', null],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // RIGHT JOIN Tests
  // ============================================================================

  it('should accept query with RIGHT JOIN', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['id'],
      joins: [
        {
          type: 'right',
          object: 'customer',
          alias: 'c',
          on: ['order.customer_id', '=', 'c.id'],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept RIGHT JOIN without alias', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['id', 'amount'],
      joins: [
        {
          type: 'right',
          object: 'customer',
          on: ['order.customer_id', '=', 'customer.id'],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // FULL OUTER JOIN Tests
  // ============================================================================

  it('should accept query with FULL OUTER JOIN', () => {
    const query: QueryAST = {
      object: 'customer',
      fields: ['id', 'name'],
      joins: [
        {
          type: 'full',
          object: 'order',
          alias: 'o',
          on: ['customer.id', '=', 'o.customer_id'],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept FULL JOIN to find all unmatched records', () => {
    const query: QueryAST = {
      object: 'customer',
      fields: ['id'],
      joins: [
        {
          type: 'full',
          object: 'order',
          alias: 'o',
          on: ['customer.id', '=', 'o.customer_id'],
        },
      ],
      filters: [['customer.id', 'is_null', null], 'or', ['o.id', 'is_null', null]],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // Multiple Joins Tests
  // ============================================================================

  it('should accept query with multiple INNER JOINs', () => {
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
          type: 'inner',
          object: 'product',
          alias: 'p',
          on: ['order.product_id', '=', 'p.id'],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with mixed join types', () => {
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
        {
          type: 'left',
          object: 'shipment',
          alias: 's',
          on: ['order.id', '=', 's.order_id'],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with 4+ table joins', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['id', 'total'],
      joins: [
        {
          type: 'inner',
          object: 'customer',
          alias: 'c',
          on: ['order.customer_id', '=', 'c.id'],
        },
        {
          type: 'inner',
          object: 'order_item',
          alias: 'oi',
          on: ['order.id', '=', 'oi.order_id'],
        },
        {
          type: 'inner',
          object: 'product',
          alias: 'p',
          on: ['oi.product_id', '=', 'p.id'],
        },
        {
          type: 'left',
          object: 'category',
          alias: 'cat',
          on: ['p.category_id', '=', 'cat.id'],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // Self-Join Tests
  // ============================================================================

  it('should accept self-join query', () => {
    const query: QueryAST = {
      object: 'employee',
      fields: ['id', 'name'],
      joins: [
        {
          type: 'left',
          object: 'employee',
          alias: 'manager',
          on: ['employee.manager_id', '=', 'manager.id'],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept hierarchical self-join', () => {
    const query: QueryAST = {
      object: 'category',
      fields: ['id', 'name'],
      joins: [
        {
          type: 'left',
          object: 'category',
          alias: 'parent',
          on: ['category.parent_id', '=', 'parent.id'],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // Join with Filters Tests
  // ============================================================================

  it('should accept join with WHERE clause on main table', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['id'],
      filters: ['order.status', '=', 'completed'],
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

  it('should accept join with ON clause containing multiple conditions', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['id'],
      joins: [
        {
          type: 'inner',
          object: 'customer',
          alias: 'c',
          on: [
            ['order.customer_id', '=', 'c.id'],
            'and',
            ['c.status', '=', 'active'],
          ],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // Join with Aggregations Tests
  // ============================================================================

  it('should accept join with GROUP BY and aggregations', () => {
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
        { function: 'count', alias: 'order_count' },
        { function: 'sum', field: 'amount', alias: 'total_amount' },
      ],
      groupBy: ['customer_id'],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // Subquery Join Tests
  // ============================================================================

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

  it('should accept LEFT JOIN with aggregated subquery', () => {
    const query: QueryAST = {
      object: 'customer',
      fields: ['id', 'name'],
      joins: [
        {
          type: 'left',
          object: 'order',
          alias: 'order_summary',
          on: ['customer.id', '=', 'order_summary.customer_id'],
          subquery: {
            object: 'order',
            fields: ['customer_id'],
            aggregations: [
              { function: 'count', alias: 'order_count' },
              { function: 'sum', field: 'amount', alias: 'total_spent' },
            ],
            groupBy: ['customer_id'],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // Real-World Join Examples (SOQL Comparisons)
  // ============================================================================

  it('should accept Salesforce-style relationship query (SOQL: SELECT Name, (SELECT Name FROM Contacts) FROM Account)', () => {
    const query: QueryAST = {
      object: 'account',
      fields: ['id', 'name'],
      joins: [
        {
          type: 'left',
          object: 'contact',
          on: ['account.id', '=', 'contact.account_id'],
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept complex multi-table join for reporting', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['id', 'order_date'],
      joins: [
        {
          type: 'inner',
          object: 'customer',
          alias: 'c',
          on: ['order.customer_id', '=', 'c.id'],
        },
        {
          type: 'inner',
          object: 'order_item',
          alias: 'oi',
          on: ['order.id', '=', 'oi.order_id'],
        },
        {
          type: 'inner',
          object: 'product',
          alias: 'p',
          on: ['oi.product_id', '=', 'p.id'],
        },
      ],
      aggregations: [
        { function: 'sum', field: 'oi.quantity', alias: 'total_quantity' },
        { function: 'sum', field: 'oi.line_total', alias: 'order_total' },
      ],
      groupBy: ['order.id', 'order.order_date'],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept customer order history join', () => {
    const query: QueryAST = {
      object: 'customer',
      fields: ['id', 'name', 'email'],
      joins: [
        {
          type: 'left',
          object: 'order',
          alias: 'o',
          on: ['customer.id', '=', 'o.customer_id'],
        },
      ],
      aggregations: [
        { function: 'count', field: 'o.id', alias: 'total_orders' },
        { function: 'sum', field: 'o.amount', alias: 'lifetime_value' },
        { function: 'max', field: 'o.created_at', alias: 'last_order_date' },
      ],
      groupBy: ['customer.id', 'customer.name', 'customer.email'],
      sort: [{ field: 'lifetime_value', order: 'desc' }],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });
});

describe('QuerySchema - Window Functions', () => {
  // ============================================================================
  // ROW_NUMBER Tests
  // ============================================================================
  
  it('should accept query with ROW_NUMBER window function', () => {
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

  it('should accept ROW_NUMBER without partition', () => {
    const query: QueryAST = {
      object: 'student',
      fields: ['name', 'score'],
      windowFunctions: [
        {
          function: 'row_number',
          alias: 'rank',
          over: {
            orderBy: [{ field: 'score', order: 'desc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept ROW_NUMBER with multiple partition fields', () => {
    const query: QueryAST = {
      object: 'sales',
      fields: ['region', 'product', 'revenue'],
      windowFunctions: [
        {
          function: 'row_number',
          alias: 'row_num',
          over: {
            partitionBy: ['region', 'product'],
            orderBy: [{ field: 'revenue', order: 'desc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // RANK and DENSE_RANK Tests
  // ============================================================================

  it('should accept query with RANK window function', () => {
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

  it('should accept query with DENSE_RANK window function', () => {
    const query: QueryAST = {
      object: 'employee',
      fields: ['name', 'salary'],
      windowFunctions: [
        {
          function: 'dense_rank',
          alias: 'salary_rank',
          over: {
            partitionBy: ['department'],
            orderBy: [{ field: 'salary', order: 'desc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with PERCENT_RANK window function', () => {
    const query: QueryAST = {
      object: 'student',
      fields: ['name', 'score'],
      windowFunctions: [
        {
          function: 'percent_rank',
          alias: 'percentile',
          over: {
            orderBy: [{ field: 'score', order: 'desc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // LAG and LEAD Tests
  // ============================================================================

  it('should accept query with LAG window function', () => {
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
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with LEAD window function', () => {
    const query: QueryAST = {
      object: 'sales',
      fields: ['month', 'revenue'],
      windowFunctions: [
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

  it('should accept LAG and LEAD together', () => {
    const query: QueryAST = {
      object: 'stock_price',
      fields: ['date', 'price'],
      windowFunctions: [
        {
          function: 'lag',
          field: 'price',
          alias: 'prev_day_price',
          over: {
            orderBy: [{ field: 'date', order: 'asc' }],
          },
        },
        {
          function: 'lead',
          field: 'price',
          alias: 'next_day_price',
          over: {
            orderBy: [{ field: 'date', order: 'asc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // FIRST_VALUE and LAST_VALUE Tests
  // ============================================================================

  it('should accept query with FIRST_VALUE window function', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id', 'order_date', 'amount'],
      windowFunctions: [
        {
          function: 'first_value',
          field: 'amount',
          alias: 'first_order_amount',
          over: {
            partitionBy: ['customer_id'],
            orderBy: [{ field: 'order_date', order: 'asc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with LAST_VALUE window function', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id', 'order_date', 'amount'],
      windowFunctions: [
        {
          function: 'last_value',
          field: 'amount',
          alias: 'last_order_amount',
          over: {
            partitionBy: ['customer_id'],
            orderBy: [{ field: 'order_date', order: 'asc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // Aggregate Window Function Tests
  // ============================================================================

  it('should accept query with SUM aggregate window function', () => {
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
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with AVG aggregate window function', () => {
    const query: QueryAST = {
      object: 'sales',
      fields: ['month', 'revenue'],
      windowFunctions: [
        {
          function: 'avg',
          field: 'revenue',
          alias: 'moving_avg',
          over: {
            orderBy: [{ field: 'month', order: 'asc' }],
            frame: {
              type: 'rows',
              start: '2 PRECEDING',
              end: 'CURRENT ROW',
            },
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with COUNT aggregate window function', () => {
    const query: QueryAST = {
      object: 'event',
      fields: ['timestamp', 'user_id'],
      windowFunctions: [
        {
          function: 'count',
          alias: 'running_count',
          over: {
            partitionBy: ['user_id'],
            orderBy: [{ field: 'timestamp', order: 'asc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with MIN/MAX aggregate window functions', () => {
    const query: QueryAST = {
      object: 'temperature',
      fields: ['date', 'value'],
      windowFunctions: [
        {
          function: 'min',
          field: 'value',
          alias: 'min_so_far',
          over: {
            orderBy: [{ field: 'date', order: 'asc' }],
          },
        },
        {
          function: 'max',
          field: 'value',
          alias: 'max_so_far',
          over: {
            orderBy: [{ field: 'date', order: 'asc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // Window Frame Specification Tests
  // ============================================================================

  it('should accept query with ROWS frame specification', () => {
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

  it('should accept query with RANGE frame specification', () => {
    const query: QueryAST = {
      object: 'sales',
      fields: ['date', 'amount'],
      windowFunctions: [
        {
          function: 'sum',
          field: 'amount',
          alias: 'total_in_range',
          over: {
            orderBy: [{ field: 'date', order: 'asc' }],
            frame: {
              type: 'range',
              start: '7 PRECEDING',
              end: 'CURRENT ROW',
            },
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept query with window frame FOLLOWING', () => {
    const query: QueryAST = {
      object: 'sales',
      fields: ['month', 'revenue'],
      windowFunctions: [
        {
          function: 'avg',
          field: 'revenue',
          alias: 'centered_avg',
          over: {
            orderBy: [{ field: 'month', order: 'asc' }],
            frame: {
              type: 'rows',
              start: '1 PRECEDING',
              end: '1 FOLLOWING',
            },
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // Multiple Window Functions Tests
  // ============================================================================

  it('should accept query with multiple window functions', () => {
    const query: QueryAST = {
      object: 'order',
      fields: ['customer_id', 'amount', 'created_at'],
      windowFunctions: [
        {
          function: 'row_number',
          alias: 'row_num',
          over: {
            partitionBy: ['customer_id'],
            orderBy: [{ field: 'created_at', order: 'desc' }],
          },
        },
        {
          function: 'rank',
          alias: 'amount_rank',
          over: {
            partitionBy: ['customer_id'],
            orderBy: [{ field: 'amount', order: 'desc' }],
          },
        },
        {
          function: 'sum',
          field: 'amount',
          alias: 'running_total',
          over: {
            partitionBy: ['customer_id'],
            orderBy: [{ field: 'created_at', order: 'asc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  // ============================================================================
  // Real-World Window Function Examples
  // ============================================================================

  it('should accept query for top N per group (SQL: ROW_NUMBER() OVER (PARTITION BY ...))  ', () => {
    const query: QueryAST = {
      object: 'product',
      fields: ['category_id', 'name', 'price'],
      windowFunctions: [
        {
          function: 'row_number',
          alias: 'rank_in_category',
          over: {
            partitionBy: ['category_id'],
            orderBy: [{ field: 'price', order: 'desc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept running total query', () => {
    const query: QueryAST = {
      object: 'transaction',
      fields: ['date', 'amount'],
      windowFunctions: [
        {
          function: 'sum',
          field: 'amount',
          alias: 'running_balance',
          over: {
            orderBy: [{ field: 'date', order: 'asc' }],
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

  it('should accept moving average query', () => {
    const query: QueryAST = {
      object: 'stock_price',
      fields: ['date', 'close_price'],
      windowFunctions: [
        {
          function: 'avg',
          field: 'close_price',
          alias: 'ma_7_day',
          over: {
            orderBy: [{ field: 'date', order: 'asc' }],
            frame: {
              type: 'rows',
              start: '6 PRECEDING',
              end: 'CURRENT ROW',
            },
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept year-over-year comparison query', () => {
    const query: QueryAST = {
      object: 'monthly_sales',
      fields: ['month', 'revenue'],
      windowFunctions: [
        {
          function: 'lag',
          field: 'revenue',
          alias: 'prev_year_revenue',
          over: {
            orderBy: [{ field: 'month', order: 'asc' }],
          },
        },
      ],
    };

    expect(() => QuerySchema.parse(query)).not.toThrow();
  });

  it('should accept employee ranking within department', () => {
    const query: QueryAST = {
      object: 'employee',
      fields: ['department', 'name', 'salary'],
      windowFunctions: [
        {
          function: 'rank',
          alias: 'salary_rank',
          over: {
            partitionBy: ['department'],
            orderBy: [{ field: 'salary', order: 'desc' }],
          },
        },
        {
          function: 'percent_rank',
          alias: 'salary_percentile',
          over: {
            partitionBy: ['department'],
            orderBy: [{ field: 'salary', order: 'desc' }],
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

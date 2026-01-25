// @ts-nocheck
import { QueryAST } from '@objectstack/spec/data';

/**
 * Query Examples - Demonstrating ObjectStack Query Protocol
 * 
 * ObjectQL is the universal query language for ObjectStack, abstracting
 * SQL, NoSQL, and SaaS APIs into a unified interface.
 * Inspired by GraphQL, Prisma, and Salesforce SOQL.
 */

// ============================================================================
// BASIC QUERIES
// ============================================================================

/**
 * Example 1: Simple Select Query
 * Retrieve specific fields from an object
 * Use Case: Basic data retrieval
 * 
 * SQL Equivalent: SELECT name, email FROM account
 */
export const SimpleSelectQuery: QueryAST = {
  object: 'account',
  fields: ['name', 'email', 'phone'],
};

/**
 * Example 2: Select All Fields
 * Omit fields to retrieve all
 * Use Case: Full record retrieval
 * 
 * SQL Equivalent: SELECT * FROM account
 */
export const SelectAllQuery: QueryAST = {
  object: 'account',
};

/**
 * Example 3: Query with Simple Filter
 * Filter records by field value
 * Use Case: Active records only
 * 
 * SQL Equivalent: SELECT * FROM account WHERE is_active = true
 */
export const SimpleFilterQuery: QueryAST = {
  object: 'account',
  where: {
    is_active: true,
  },
};

// ============================================================================
// FILTERING QUERIES
// ============================================================================

/**
 * Example 4: Query with Multiple Filters (AND)
 * Combine multiple conditions
 * Use Case: Active customers only
 * 
 * SQL Equivalent: SELECT * FROM account WHERE is_active = true AND type = 'customer'
 */
export const MultipleFiltersQuery: QueryAST = {
  object: 'account',
  where: {
    is_active: true,
    type: 'customer',
  },
};

/**
 * Example 5: Query with OR Condition
 * Match any of multiple conditions
 * Use Case: High priority or urgent items
 * 
 * SQL Equivalent: SELECT * FROM task WHERE priority = 'high' OR status = 'urgent'
 */
export const OrConditionQuery: QueryAST = {
  object: 'task',
  where: {
    $or: [
      { priority: 'high' },
      { status: 'urgent' },
    ],
  },
};

/**
 * Example 6: Query with Comparison Operators
 * Use greater than, less than operators
 * Use Case: High-value opportunities
 * 
 * SQL Equivalent: SELECT * FROM opportunity WHERE amount > 100000
 */
export const ComparisonQuery: QueryAST = {
  object: 'opportunity',
  fields: ['name', 'amount', 'close_date'],
  where: {
    amount: { $gt: 100000 },
  },
};

/**
 * Example 7: Query with Range Filter
 * Filter within a value range
 * Use Case: Orders in date range
 * 
 * SQL Equivalent: SELECT * FROM order WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31'
 */
export const RangeQuery: QueryAST = {
  object: 'order',
  where: {
    order_date: {
      $gte: new Date('2024-01-01'),
      $lte: new Date('2024-12-31'),
    },
  },
};

/**
 * Example 8: Query with IN Operator
 * Match against list of values
 * Use Case: Specific statuses
 * 
 * SQL Equivalent: SELECT * FROM lead WHERE status IN ('new', 'contacted', 'qualified')
 */
export const InOperatorQuery: QueryAST = {
  object: 'lead',
  where: {
    status: { $in: ['new', 'contacted', 'qualified'] },
  },
};

/**
 * Example 9: Query with String Pattern Matching
 * Search for text patterns
 * Use Case: Email domain search
 * 
 * SQL Equivalent: SELECT * FROM contact WHERE email LIKE '%@example.com'
 */
export const PatternMatchQuery: QueryAST = {
  object: 'contact',
  where: {
    email: { $endsWith: '@example.com' },
  },
};

/**
 * Example 10: Complex Nested Conditions
 * Combine AND/OR with multiple levels
 * Use Case: Complex business logic
 * 
 * SQL Equivalent: 
 * SELECT * FROM opportunity 
 * WHERE (stage = 'proposal' OR stage = 'negotiation')
 *   AND amount > 50000
 *   AND close_date < '2024-12-31'
 */
export const ComplexFilterQuery: QueryAST = {
  object: 'opportunity',
  where: {
    $and: [
      {
        $or: [
          { stage: 'proposal' },
          { stage: 'negotiation' },
        ],
      },
      { amount: { $gt: 50000 } },
      { close_date: { $lt: new Date('2024-12-31') } },
    ],
  },
};

// ============================================================================
// SORTING & PAGINATION
// ============================================================================

/**
 * Example 11: Query with Sorting
 * Order results by field
 * Use Case: Recent orders first
 * 
 * SQL Equivalent: SELECT * FROM order ORDER BY order_date DESC
 */
export const SortedQuery: QueryAST = {
  object: 'order',
  orderBy: [
    { field: 'order_date', order: 'desc' },
  ],
};

/**
 * Example 12: Query with Multiple Sort Fields
 * Sort by multiple criteria
 * Use Case: Sort by priority then due date
 * 
 * SQL Equivalent: SELECT * FROM task ORDER BY priority DESC, due_date ASC
 */
export const MultiSortQuery: QueryAST = {
  object: 'task',
  orderBy: [
    { field: 'priority', order: 'desc' },
    { field: 'due_date', order: 'asc' },
  ],
};

/**
 * Example 13: Query with Pagination (Limit/Offset)
 * Paginate results
 * Use Case: Display page 3 of results (20 per page)
 * 
 * SQL Equivalent: SELECT * FROM product LIMIT 20 OFFSET 40
 */
export const PaginatedQuery: QueryAST = {
  object: 'product',
  limit: 20,
  offset: 40,
  orderBy: [{ field: 'name', order: 'asc' }],
};

// ============================================================================
// AGGREGATION QUERIES
// ============================================================================

/**
 * Example 14: Count Query
 * Count total records
 * Use Case: Total number of accounts
 * 
 * SQL Equivalent: SELECT COUNT(*) as total FROM account
 */
export const CountQuery: QueryAST = {
  object: 'account',
  aggregations: [
    { function: 'count', alias: 'total' },
  ],
};

/**
 * Example 15: Sum Aggregation
 * Calculate sum of field
 * Use Case: Total revenue
 * 
 * SQL Equivalent: SELECT SUM(amount) as total_revenue FROM opportunity WHERE stage = 'closed_won'
 */
export const SumAggregationQuery: QueryAST = {
  object: 'opportunity',
  where: { stage: 'closed_won' },
  aggregations: [
    { function: 'sum', field: 'amount', alias: 'total_revenue' },
  ],
};

/**
 * Example 16: Group By with Aggregation
 * Group and aggregate data
 * Use Case: Revenue by region
 * 
 * SQL Equivalent: 
 * SELECT region, COUNT(*) as count, SUM(amount) as total
 * FROM opportunity
 * GROUP BY region
 */
export const GroupByQuery: QueryAST = {
  object: 'opportunity',
  fields: ['region'],
  aggregations: [
    { function: 'count', alias: 'count' },
    { function: 'sum', field: 'amount', alias: 'total' },
  ],
  groupBy: ['region'],
};

/**
 * Example 17: Multiple Aggregations
 * Calculate multiple metrics
 * Use Case: Sales statistics
 * 
 * SQL Equivalent:
 * SELECT 
 *   COUNT(*) as total_deals,
 *   SUM(amount) as total_value,
 *   AVG(amount) as average_value,
 *   MIN(amount) as min_value,
 *   MAX(amount) as max_value
 * FROM opportunity
 * WHERE stage = 'closed_won'
 */
export const MultiAggregationQuery: QueryAST = {
  object: 'opportunity',
  where: { stage: 'closed_won' },
  aggregations: [
    { function: 'count', alias: 'total_deals' },
    { function: 'sum', field: 'amount', alias: 'total_value' },
    { function: 'avg', field: 'amount', alias: 'average_value' },
    { function: 'min', field: 'amount', alias: 'min_value' },
    { function: 'max', field: 'amount', alias: 'max_value' },
  ],
};

/**
 * Example 18: Group By with Having Clause
 * Filter aggregated results
 * Use Case: Customers with more than 10 orders
 * 
 * SQL Equivalent:
 * SELECT customer_id, COUNT(*) as order_count
 * FROM order
 * GROUP BY customer_id
 * HAVING COUNT(*) > 10
 */
export const HavingClauseQuery: QueryAST = {
  object: 'order',
  fields: ['customer_id'],
  aggregations: [
    { function: 'count', alias: 'order_count' },
  ],
  groupBy: ['customer_id'],
  having: {
    order_count: { $gt: 10 },
  },
};

// ============================================================================
// JOIN QUERIES
// ============================================================================

/**
 * Example 19: Simple Join Query
 * Join two objects
 * Use Case: Orders with customer information
 * 
 * SQL Equivalent:
 * SELECT o.*, c.name as customer_name
 * FROM order o
 * INNER JOIN customer c ON o.customer_id = c.id
 */
export const SimpleJoinQuery: QueryAST = {
  object: 'order',
  fields: ['order_number', 'amount', 'order_date'],
  joins: [
    {
      type: 'inner',
      object: 'customer',
      alias: 'c',
      on: {
        customer_id: { $eq: { $field: 'c.id' } },
      },
    },
  ],
};

/**
 * Example 20: Left Join Query
 * Join with optional related records
 * Use Case: Accounts with optional contacts
 * 
 * SQL Equivalent:
 * SELECT a.*, c.name as contact_name
 * FROM account a
 * LEFT JOIN contact c ON a.id = c.account_id
 */
export const LeftJoinQuery: QueryAST = {
  object: 'account',
  fields: ['name', 'type'],
  joins: [
    {
      type: 'left',
      object: 'contact',
      alias: 'c',
      on: {
        id: { $eq: { $field: 'c.account_id' } },
      },
    },
  ],
};

/**
 * Example 21: Multiple Joins
 * Join multiple objects
 * Use Case: Order with customer and shipping info
 * 
 * SQL Equivalent:
 * SELECT o.*, c.name, s.tracking_number
 * FROM order o
 * INNER JOIN customer c ON o.customer_id = c.id
 * LEFT JOIN shipment s ON o.id = s.order_id
 */
export const MultiJoinQuery: QueryAST = {
  object: 'order',
  fields: ['order_number', 'amount'],
  joins: [
    {
      type: 'inner',
      object: 'customer',
      alias: 'c',
      on: {
        customer_id: { $eq: { $field: 'c.id' } },
      },
    },
    {
      type: 'left',
      object: 'shipment',
      alias: 's',
      on: {
        id: { $eq: { $field: 's.order_id' } },
      },
    },
  ],
};

// ============================================================================
// WINDOW FUNCTION QUERIES
// ============================================================================

/**
 * Example 22: Row Number Window Function
 * Assign sequential numbers within groups
 * Use Case: Rank products by sales within category
 * 
 * SQL Equivalent:
 * SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY sales DESC) as rank
 * FROM product
 */
export const RowNumberQuery: QueryAST = {
  object: 'product',
  fields: ['name', 'category', 'sales'],
  windowFunctions: [
    {
      function: 'row_number',
      alias: 'rank',
      over: {
        partitionBy: ['category'],
        orderBy: [{ field: 'sales', order: 'desc' }],
      },
    },
  ],
};

/**
 * Example 23: Running Total with Window Function
 * Calculate cumulative sum
 * Use Case: Running total of sales over time
 * 
 * SQL Equivalent:
 * SELECT date, amount,
 *   SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as running_total
 * FROM transaction
 */
export const RunningTotalQuery: QueryAST = {
  object: 'transaction',
  fields: ['date', 'amount'],
  windowFunctions: [
    {
      function: 'sum',
      field: 'amount',
      alias: 'running_total',
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

// ============================================================================
// ADVANCED QUERIES
// ============================================================================

/**
 * Example 24: Distinct Query
 * Remove duplicate rows
 * Use Case: Unique customer cities
 * 
 * SQL Equivalent: SELECT DISTINCT city FROM customer
 */
export const DistinctQuery: QueryAST = {
  object: 'customer',
  fields: ['city'],
  distinct: true,
};

/**
 * Example 25: Complex Business Query
 * Real-world complex query
 * Use Case: Sales pipeline analysis
 * 
 * Get open opportunities > $50k, sorted by close date, with account info
 */
export const ComplexBusinessQuery: QueryAST = {
  object: 'opportunity',
  fields: ['name', 'amount', 'close_date', 'stage', 'probability'],
  where: {
    $and: [
      { stage: { $in: ['qualification', 'proposal', 'negotiation'] } },
      { amount: { $gte: 50000 } },
      { close_date: { $gte: new Date() } },
    ],
  },
  joins: [
    {
      type: 'inner',
      object: 'account',
      alias: 'a',
      on: {
        account_id: { $eq: { $field: 'a.id' } },
      },
    },
  ],
  orderBy: [
    { field: 'close_date', order: 'asc' },
    { field: 'amount', order: 'desc' },
  ],
  limit: 50,
};

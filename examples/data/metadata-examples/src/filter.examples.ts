// @ts-nocheck
import { FilterCondition } from '@objectstack/spec/data';

/**
 * Filter Examples - Demonstrating ObjectStack Filter Protocol
 * 
 * Filters provide a unified query DSL for data filtering across all data sources.
 * Inspired by MongoDB query language, Prisma filters, and SQL WHERE clauses.
 */

// ============================================================================
// SIMPLE FIELD FILTERS
// ============================================================================

/**
 * Example 1: Equality Filter
 * Simple field equals value
 * Use Case: Filter by status
 * 
 * SQL: WHERE status = 'active'
 * MongoDB: { status: 'active' }
 */
export const EqualityFilter: FilterCondition = {
  status: 'active',
};

/**
 * Example 2: Explicit Equality Operator
 * Using $eq operator
 * Use Case: Same as Example 1, explicit syntax
 * 
 * SQL: WHERE status = 'active'
 */
export const ExplicitEqualityFilter: FilterCondition = {
  status: { $eq: 'active' },
};

/**
 * Example 3: Not Equal Filter
 * Field not equals value
 * Use Case: Exclude cancelled items
 * 
 * SQL: WHERE status != 'cancelled'
 * MongoDB: { status: { $ne: 'cancelled' } }
 */
export const NotEqualFilter: FilterCondition = {
  status: { $ne: 'cancelled' },
};

/**
 * Example 4: Greater Than Filter
 * Numeric comparison
 * Use Case: High-value orders
 * 
 * SQL: WHERE amount > 1000
 * MongoDB: { amount: { $gt: 1000 } }
 */
export const GreaterThanFilter: FilterCondition = {
  amount: { $gt: 1000 },
};

/**
 * Example 5: Less Than or Equal Filter
 * Date comparison
 * Use Case: Past due items
 * 
 * SQL: WHERE due_date <= '2024-01-31'
 * MongoDB: { due_date: { $lte: ISODate('2024-01-31') } }
 */
export const LessThanEqualFilter: FilterCondition = {
  due_date: { $lte: new Date('2024-01-31') },
};

/**
 * Example 6: Range Filter (Between)
 * Value within range
 * Use Case: Orders in Q1 2024
 * 
 * SQL: WHERE order_date BETWEEN '2024-01-01' AND '2024-03-31'
 * MongoDB: { order_date: { $gte: ..., $lte: ... } }
 */
export const RangeFilter: FilterCondition = {
  order_date: {
    $gte: new Date('2024-01-01'),
    $lte: new Date('2024-03-31'),
  },
};

/**
 * Example 7: Between Operator
 * Using explicit $between
 * Use Case: Price range filter
 * 
 * SQL: WHERE price BETWEEN 100 AND 500
 */
export const BetweenFilter: FilterCondition = {
  price: { $between: [100, 500] },
};

// ============================================================================
// ARRAY/SET FILTERS
// ============================================================================

/**
 * Example 8: IN Filter
 * Value in list
 * Use Case: Multiple status values
 * 
 * SQL: WHERE status IN ('new', 'in_progress', 'review')
 * MongoDB: { status: { $in: ['new', 'in_progress', 'review'] } }
 */
export const InFilter: FilterCondition = {
  status: { $in: ['new', 'in_progress', 'review'] },
};

/**
 * Example 9: NOT IN Filter
 * Value not in list
 * Use Case: Exclude certain types
 * 
 * SQL: WHERE type NOT IN ('archived', 'deleted')
 * MongoDB: { type: { $nin: ['archived', 'deleted'] } }
 */
export const NotInFilter: FilterCondition = {
  type: { $nin: ['archived', 'deleted'] },
};

// ============================================================================
// STRING FILTERS
// ============================================================================

/**
 * Example 10: Contains Filter
 * Substring search
 * Use Case: Search in description
 * 
 * SQL: WHERE description LIKE '%urgent%'
 * MongoDB: { description: { $regex: 'urgent', $options: 'i' } }
 */
export const ContainsFilter: FilterCondition = {
  description: { $contains: 'urgent' },
};

/**
 * Example 11: Starts With Filter
 * Prefix matching
 * Use Case: Find IDs starting with prefix
 * 
 * SQL: WHERE customer_id LIKE 'CUST%'
 * MongoDB: { customer_id: { $regex: '^CUST' } }
 */
export const StartsWithFilter: FilterCondition = {
  customer_id: { $startsWith: 'CUST' },
};

/**
 * Example 12: Ends With Filter
 * Suffix matching
 * Use Case: Email domain filter
 * 
 * SQL: WHERE email LIKE '%@company.com'
 * MongoDB: { email: { $regex: '@company\\.com$' } }
 */
export const EndsWithFilter: FilterCondition = {
  email: { $endsWith: '@company.com' },
};

// ============================================================================
// NULL/EXISTENCE FILTERS
// ============================================================================

/**
 * Example 13: Is Null Filter
 * Check for null values
 * Use Case: Missing email addresses
 * 
 * SQL: WHERE email IS NULL
 * MongoDB: { email: null }
 */
export const IsNullFilter: FilterCondition = {
  email: { $null: true },
};

/**
 * Example 14: Is Not Null Filter
 * Check for non-null values
 * Use Case: Has assigned owner
 * 
 * SQL: WHERE owner_id IS NOT NULL
 * MongoDB: { owner_id: { $ne: null } }
 */
export const IsNotNullFilter: FilterCondition = {
  owner_id: { $null: false },
};

/**
 * Example 15: Field Exists Filter
 * Check if field exists (NoSQL)
 * Use Case: Documents with specific field
 * 
 * MongoDB: { optional_field: { $exists: true } }
 */
export const FieldExistsFilter: FilterCondition = {
  optional_field: { $exist: true },
};

// ============================================================================
// LOGICAL OPERATORS
// ============================================================================

/**
 * Example 16: AND Filter (Implicit)
 * Multiple conditions (all must match)
 * Use Case: Active customers only
 * 
 * SQL: WHERE is_active = true AND type = 'customer'
 * MongoDB: { is_active: true, type: 'customer' }
 */
export const ImplicitAndFilter: FilterCondition = {
  is_active: true,
  type: 'customer',
};

/**
 * Example 17: AND Filter (Explicit)
 * Using $and operator
 * Use Case: Complex conditions requiring explicit AND
 * 
 * SQL: WHERE (amount > 1000) AND (status = 'pending')
 */
export const ExplicitAndFilter: FilterCondition = {
  $and: [
    { amount: { $gt: 1000 } },
    { status: 'pending' },
  ],
};

/**
 * Example 18: OR Filter
 * Any condition matches
 * Use Case: Urgent or high priority
 * 
 * SQL: WHERE priority = 'high' OR is_urgent = true
 * MongoDB: { $or: [{ priority: 'high' }, { is_urgent: true }] }
 */
export const OrFilter: FilterCondition = {
  $or: [
    { priority: 'high' },
    { is_urgent: true },
  ],
};

/**
 * Example 19: NOT Filter
 * Negation
 * Use Case: Not archived
 * 
 * SQL: WHERE NOT (status = 'archived')
 * MongoDB: { $not: { status: 'archived' } }
 */
export const NotFilter: FilterCondition = {
  $not: {
    status: 'archived',
  },
};

// ============================================================================
// NESTED COMPLEX FILTERS
// ============================================================================

/**
 * Example 20: Nested AND/OR Filter
 * Complex business logic
 * Use Case: (High priority OR urgent) AND (not completed)
 * 
 * SQL: WHERE (priority = 'high' OR is_urgent = true) AND status != 'completed'
 */
export const NestedAndOrFilter: FilterCondition = {
  $and: [
    {
      $or: [
        { priority: 'high' },
        { is_urgent: true },
      ],
    },
    { status: { $ne: 'completed' } },
  ],
};

/**
 * Example 21: Multiple OR Groups
 * Complex filter with multiple OR conditions
 * Use Case: (Status A or B) OR (Amount > X and Date < Y)
 * 
 * SQL: 
 * WHERE (status IN ('new', 'pending'))
 *    OR (amount > 5000 AND created_at < '2024-01-01')
 */
export const MultipleOrGroupsFilter: FilterCondition = {
  $or: [
    { status: { $in: ['new', 'pending'] } },
    {
      $and: [
        { amount: { $gt: 5000 } },
        { created_at: { $lt: new Date('2024-01-01') } },
      ],
    },
  ],
};

/**
 * Example 22: Deep Nested Filter
 * Three levels of nesting
 * Use Case: Complex eligibility criteria
 * 
 * SQL:
 * WHERE (
 *   (type = 'enterprise' AND revenue > 1000000)
 *   OR (type = 'growth' AND revenue > 100000)
 * )
 * AND is_active = true
 * AND NOT (status = 'suspended')
 */
export const DeepNestedFilter: FilterCondition = {
  $and: [
    {
      $or: [
        {
          $and: [
            { type: 'enterprise' },
            { revenue: { $gt: 1000000 } },
          ],
        },
        {
          $and: [
            { type: 'growth' },
            { revenue: { $gt: 100000 } },
          ],
        },
      ],
    },
    { is_active: true },
    { $not: { status: 'suspended' } },
  ],
};

/**
 * Example 23: Combined Operators Filter
 * Using multiple operator types
 * Use Case: Product search with multiple criteria
 * 
 * SQL:
 * WHERE name LIKE '%widget%'
 *   AND price BETWEEN 10 AND 100
 *   AND category_id IN (1, 2, 3)
 *   AND stock_quantity > 0
 *   AND is_active = true
 */
export const CombinedOperatorsFilter: FilterCondition = {
  name: { $contains: 'widget' },
  price: { $between: [10, 100] },
  category_id: { $in: [1, 2, 3] },
  stock_quantity: { $gt: 0 },
  is_active: true,
};

/**
 * Example 24: Date Range with Status Filter
 * Common report filter
 * Use Case: Completed orders in last quarter
 * 
 * SQL:
 * WHERE status = 'completed'
 *   AND order_date >= '2024-10-01'
 *   AND order_date < '2025-01-01'
 */
export const DateRangeStatusFilter: FilterCondition = {
  status: 'completed',
  order_date: {
    $gte: new Date('2024-10-01'),
    $lt: new Date('2025-01-01'),
  },
};

/**
 * Example 25: Real-World CRM Filter
 * Complex sales pipeline filter
 * Use Case: Qualified leads with recent activity
 * 
 * SQL:
 * WHERE (
 *   (lead_source IN ('website', 'referral') AND rating = 'hot')
 *   OR (lead_source = 'trade_show' AND rating IN ('hot', 'warm'))
 * )
 * AND status = 'qualified'
 * AND last_activity_date > '2024-01-01'
 * AND owner_id IS NOT NULL
 */
export const CrmPipelineFilter: FilterCondition = {
  $and: [
    {
      $or: [
        {
          $and: [
            { lead_source: { $in: ['website', 'referral'] } },
            { rating: 'hot' },
          ],
        },
        {
          $and: [
            { lead_source: 'trade_show' },
            { rating: { $in: ['hot', 'warm'] } },
          ],
        },
      ],
    },
    { status: 'qualified' },
    { last_activity_date: { $gt: new Date('2024-01-01') } },
    { owner_id: { $null: false } },
  ],
};

/**
 * Example 26: E-commerce Product Filter
 * Multi-criteria product search
 * Use Case: Available products in category with price range
 * 
 * SQL:
 * WHERE category_id = 'electronics'
 *   AND (
 *     (price >= 100 AND price <= 500)
 *     OR on_sale = true
 *   )
 *   AND stock_quantity > 0
 *   AND is_active = true
 *   AND NOT (tags LIKE '%discontinued%')
 */
export const EcommerceProductFilter: FilterCondition = {
  category_id: 'electronics',
  $or: [
    {
      price: {
        $gte: 100,
        $lte: 500,
      },
    },
    { on_sale: true },
  ],
  stock_quantity: { $gt: 0 },
  is_active: true,
  $not: {
    tags: { $contains: 'discontinued' },
  },
};

/**
 * Example 27: User Permission Filter
 * Complex permission-based filtering
 * Use Case: Records user can access
 * 
 * SQL:
 * WHERE (
 *   owner_id = 'user123'
 *   OR team_id IN ('team1', 'team2')
 *   OR is_public = true
 * )
 * AND status != 'deleted'
 */
export const PermissionFilter: FilterCondition = {
  $and: [
    {
      $or: [
        { owner_id: 'user123' },
        { team_id: { $in: ['team1', 'team2'] } },
        { is_public: true },
      ],
    },
    { status: { $ne: 'deleted' } },
  ],
};

# ObjectQL Query Protocol - Complete Guide

## Overview

ObjectQL is a universal query language that provides a unified interface for querying data across SQL databases, NoSQL stores, and SaaS APIs. This guide covers the complete query protocol including aggregations, joins, window functions, and subqueries.

## Table of Contents

1. [Basic Queries](#basic-queries)
2. [Aggregations](#aggregations)
3. [Joins](#joins)
4. [Window Functions](#window-functions)
5. [Subqueries](#subqueries)
6. [SQL Comparison](#sql-comparison)
7. [Salesforce SOQL Comparison](#salesforce-soql-comparison)

---

## Basic Queries

### Simple SELECT

```typescript
// ObjectQL
{
  object: 'account',
  fields: ['name', 'email'],
  filters: ['status', '=', 'active']
}

// Equivalent SQL
SELECT name, email FROM account WHERE status = 'active'
```

### Sorting and Pagination

```typescript
// ObjectQL
{
  object: 'product',
  fields: ['name', 'price'],
  sort: [
    { field: 'price', order: 'desc' },
    { field: 'name', order: 'asc' }
  ],
  top: 10,
  skip: 20
}

// Equivalent SQL
SELECT name, price FROM product 
ORDER BY price DESC, name ASC 
LIMIT 10 OFFSET 20
```

---

## Aggregations

### COUNT, SUM, AVG, MIN, MAX

```typescript
// ObjectQL: Customer order summary
{
  object: 'order',
  fields: ['customer_id'],
  aggregations: [
    { function: 'count', alias: 'order_count' },
    { function: 'sum', field: 'amount', alias: 'total_amount' },
    { function: 'avg', field: 'amount', alias: 'avg_amount' },
    { function: 'min', field: 'amount', alias: 'min_amount' },
    { function: 'max', field: 'amount', alias: 'max_amount' }
  ],
  groupBy: ['customer_id']
}

// Equivalent SQL
SELECT 
  customer_id,
  COUNT(*) as order_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount,
  MIN(amount) as min_amount,
  MAX(amount) as max_amount
FROM order
GROUP BY customer_id
```

### COUNT DISTINCT

```typescript
// ObjectQL
{
  object: 'order',
  aggregations: [
    { function: 'count_distinct', field: 'customer_id', alias: 'unique_customers' }
  ]
}

// Equivalent SQL
SELECT COUNT(DISTINCT customer_id) as unique_customers FROM order
```

### GROUP BY with Multiple Fields

```typescript
// ObjectQL: Sales by region and product category
{
  object: 'sales',
  fields: ['region', 'product_category'],
  aggregations: [
    { function: 'sum', field: 'revenue', alias: 'total_revenue' },
    { function: 'count', alias: 'num_sales' }
  ],
  groupBy: ['region', 'product_category'],
  sort: [{ field: 'total_revenue', order: 'desc' }]
}

// Equivalent SQL
SELECT 
  region, 
  product_category,
  SUM(revenue) as total_revenue,
  COUNT(*) as num_sales
FROM sales
GROUP BY region, product_category
ORDER BY total_revenue DESC
```

### HAVING Clause

```typescript
// ObjectQL: High-value customers
{
  object: 'order',
  fields: ['customer_id'],
  aggregations: [
    { function: 'count', alias: 'order_count' },
    { function: 'sum', field: 'amount', alias: 'total_spent' }
  ],
  groupBy: ['customer_id'],
  having: [['order_count', '>', 5], 'and', ['total_spent', '>', 1000]],
  sort: [{ field: 'total_spent', order: 'desc' }]
}

// Equivalent SQL
SELECT 
  customer_id,
  COUNT(*) as order_count,
  SUM(amount) as total_spent
FROM order
GROUP BY customer_id
HAVING COUNT(*) > 5 AND SUM(amount) > 1000
ORDER BY total_spent DESC
```

---

## Joins

### INNER JOIN

```typescript
// ObjectQL
{
  object: 'order',
  fields: ['id', 'amount'],
  joins: [
    {
      type: 'inner',
      object: 'customer',
      alias: 'c',
      on: ['order.customer_id', '=', 'c.id']
    }
  ]
}

// Equivalent SQL
SELECT o.id, o.amount
FROM order o
INNER JOIN customer c ON o.customer_id = c.id
```

### LEFT JOIN

```typescript
// ObjectQL: All customers with their orders (if any)
{
  object: 'customer',
  fields: ['id', 'name'],
  joins: [
    {
      type: 'left',
      object: 'order',
      alias: 'o',
      on: ['customer.id', '=', 'o.customer_id']
    }
  ]
}

// Equivalent SQL
SELECT c.id, c.name
FROM customer c
LEFT JOIN order o ON c.id = o.customer_id
```

### Multiple Joins

```typescript
// ObjectQL: Order details with customer and product info
{
  object: 'order',
  fields: ['id', 'order_date', 'total'],
  joins: [
    {
      type: 'inner',
      object: 'customer',
      alias: 'c',
      on: ['order.customer_id', '=', 'c.id']
    },
    {
      type: 'inner',
      object: 'order_item',
      alias: 'oi',
      on: ['order.id', '=', 'oi.order_id']
    },
    {
      type: 'inner',
      object: 'product',
      alias: 'p',
      on: ['oi.product_id', '=', 'p.id']
    }
  ]
}

// Equivalent SQL
SELECT o.id, o.order_date, o.total
FROM order o
INNER JOIN customer c ON o.customer_id = c.id
INNER JOIN order_item oi ON o.id = oi.order_id
INNER JOIN product p ON oi.product_id = p.id
```

### Self-Join

```typescript
// ObjectQL: Employees and their managers
{
  object: 'employee',
  fields: ['id', 'name'],
  joins: [
    {
      type: 'left',
      object: 'employee',
      alias: 'manager',
      on: ['employee.manager_id', '=', 'manager.id']
    }
  ]
}

// Equivalent SQL
SELECT e.id, e.name
FROM employee e
LEFT JOIN employee manager ON e.manager_id = manager.id
```

### Join with Aggregation

```typescript
// ObjectQL: Customer lifetime value
{
  object: 'customer',
  fields: ['id', 'name', 'email'],
  joins: [
    {
      type: 'left',
      object: 'order',
      alias: 'o',
      on: ['customer.id', '=', 'o.customer_id']
    }
  ],
  aggregations: [
    { function: 'count', field: 'o.id', alias: 'total_orders' },
    { function: 'sum', field: 'o.amount', alias: 'lifetime_value' },
    { function: 'max', field: 'o.created_at', alias: 'last_order_date' }
  ],
  groupBy: ['customer.id', 'customer.name', 'customer.email'],
  sort: [{ field: 'lifetime_value', order: 'desc' }]
}

// Equivalent SQL
SELECT 
  c.id, 
  c.name, 
  c.email,
  COUNT(o.id) as total_orders,
  SUM(o.amount) as lifetime_value,
  MAX(o.created_at) as last_order_date
FROM customer c
LEFT JOIN order o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email
ORDER BY lifetime_value DESC
```

---

## Window Functions

### ROW_NUMBER - Ranking within Groups

```typescript
// ObjectQL: Top 5 products per category by sales
{
  object: 'product',
  fields: ['category_id', 'name', 'price', 'sales'],
  windowFunctions: [
    {
      function: 'row_number',
      alias: 'category_rank',
      over: {
        partitionBy: ['category_id'],
        orderBy: [{ field: 'sales', order: 'desc' }]
      }
    }
  ]
}

// Equivalent SQL
SELECT 
  category_id,
  name,
  price,
  sales,
  ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY sales DESC) as category_rank
FROM product
```

### RANK and DENSE_RANK

```typescript
// ObjectQL: Student rankings
{
  object: 'student',
  fields: ['name', 'score'],
  windowFunctions: [
    {
      function: 'rank',
      alias: 'rank',
      over: {
        orderBy: [{ field: 'score', order: 'desc' }]
      }
    },
    {
      function: 'dense_rank',
      alias: 'dense_rank',
      over: {
        orderBy: [{ field: 'score', order: 'desc' }]
      }
    }
  ]
}

// Equivalent SQL
SELECT 
  name,
  score,
  RANK() OVER (ORDER BY score DESC) as rank,
  DENSE_RANK() OVER (ORDER BY score DESC) as dense_rank
FROM student
```

### LAG and LEAD - Time Series Analysis

```typescript
// ObjectQL: Month-over-month revenue comparison
{
  object: 'monthly_sales',
  fields: ['month', 'revenue'],
  windowFunctions: [
    {
      function: 'lag',
      field: 'revenue',
      alias: 'prev_month_revenue',
      over: {
        orderBy: [{ field: 'month', order: 'asc' }]
      }
    },
    {
      function: 'lead',
      field: 'revenue',
      alias: 'next_month_revenue',
      over: {
        orderBy: [{ field: 'month', order: 'asc' }]
      }
    }
  ]
}

// Equivalent SQL
SELECT 
  month,
  revenue,
  LAG(revenue) OVER (ORDER BY month ASC) as prev_month_revenue,
  LEAD(revenue) OVER (ORDER BY month ASC) as next_month_revenue
FROM monthly_sales
```

### Running Total

```typescript
// ObjectQL: Account balance with running total
{
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
          end: 'CURRENT ROW'
        }
      }
    }
  ]
}

// Equivalent SQL
SELECT 
  date,
  amount,
  SUM(amount) OVER (
    ORDER BY date ASC 
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) as running_balance
FROM transaction
```

### Moving Average

```typescript
// ObjectQL: 7-day moving average of stock prices
{
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
          end: 'CURRENT ROW'
        }
      }
    }
  ]
}

// Equivalent SQL
SELECT 
  date,
  close_price,
  AVG(close_price) OVER (
    ORDER BY date ASC 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as ma_7_day
FROM stock_price
```

---

## Subqueries

### Subquery in JOIN

```typescript
// ObjectQL: Join with high-value customers
{
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
        filters: ['total_spent', '>', 10000]
      }
    }
  ]
}

// Equivalent SQL
SELECT o.id, o.amount
FROM order o
INNER JOIN (
  SELECT id FROM customer WHERE total_spent > 10000
) high_value_customers ON o.customer_id = high_value_customers.id
```

### Subquery with Aggregation

```typescript
// ObjectQL: Customer order summary as subquery
{
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
          { function: 'sum', field: 'amount', alias: 'total_spent' }
        ],
        groupBy: ['customer_id']
      }
    }
  ]
}

// Equivalent SQL
SELECT c.id, c.name
FROM customer c
LEFT JOIN (
  SELECT 
    customer_id,
    COUNT(*) as order_count,
    SUM(amount) as total_spent
  FROM order
  GROUP BY customer_id
) order_summary ON c.id = order_summary.customer_id
```

---

## SQL Comparison

### Standard SQL Features

| Feature | ObjectQL | SQL Equivalent |
|---------|----------|----------------|
| **SELECT** | `fields: ['name', 'email']` | `SELECT name, email` |
| **WHERE** | `filters: ['status', '=', 'active']` | `WHERE status = 'active'` |
| **AND/OR** | `[['a', '=', 1], 'and', ['b', '>', 2]]` | `WHERE a = 1 AND b > 2` |
| **ORDER BY** | `sort: [{ field: 'name', order: 'asc' }]` | `ORDER BY name ASC` |
| **LIMIT** | `top: 10` | `LIMIT 10` |
| **OFFSET** | `skip: 20` | `OFFSET 20` |
| **COUNT** | `{ function: 'count', alias: 'total' }` | `COUNT(*) as total` |
| **SUM** | `{ function: 'sum', field: 'amount', alias: 'total' }` | `SUM(amount) as total` |
| **GROUP BY** | `groupBy: ['region']` | `GROUP BY region` |
| **HAVING** | `having: ['count', '>', 5]` | `HAVING COUNT(*) > 5` |
| **INNER JOIN** | `{ type: 'inner', object: 'customer', ... }` | `INNER JOIN customer ON ...` |
| **LEFT JOIN** | `{ type: 'left', object: 'order', ... }` | `LEFT JOIN order ON ...` |

### Complex SQL Examples

#### 1. Sales Report with Rankings

```typescript
// ObjectQL
{
  object: 'sales',
  fields: ['region', 'product', 'revenue'],
  windowFunctions: [
    {
      function: 'rank',
      alias: 'regional_rank',
      over: {
        partitionBy: ['region'],
        orderBy: [{ field: 'revenue', order: 'desc' }]
      }
    }
  ],
  filters: ['year', '=', 2024]
}

// SQL
SELECT 
  region,
  product,
  revenue,
  RANK() OVER (PARTITION BY region ORDER BY revenue DESC) as regional_rank
FROM sales
WHERE year = 2024
```

#### 2. Customer Segmentation

```typescript
// ObjectQL
{
  object: 'customer',
  fields: ['segment'],
  aggregations: [
    { function: 'count', alias: 'customer_count' },
    { function: 'avg', field: 'lifetime_value', alias: 'avg_ltv' }
  ],
  groupBy: ['segment'],
  having: ['customer_count', '>', 100],
  sort: [{ field: 'avg_ltv', order: 'desc' }]
}

// SQL
SELECT 
  segment,
  COUNT(*) as customer_count,
  AVG(lifetime_value) as avg_ltv
FROM customer
GROUP BY segment
HAVING COUNT(*) > 100
ORDER BY avg_ltv DESC
```

---

## Salesforce SOQL Comparison

### Basic SOQL Queries

```typescript
// SOQL: SELECT Name, Email FROM Account WHERE Status__c = 'Active'
// ObjectQL
{
  object: 'account',
  fields: ['name', 'email'],
  filters: ['status', '=', 'Active']
}
```

### Relationship Queries

```typescript
// SOQL: SELECT Name, (SELECT LastName FROM Contacts) FROM Account
// ObjectQL
{
  object: 'account',
  fields: ['name'],
  joins: [
    {
      type: 'left',
      object: 'contact',
      on: ['account.id', '=', 'contact.account_id']
    }
  ]
}
```

### Aggregate Queries

```typescript
// SOQL: SELECT LeadSource, COUNT(Id) FROM Lead GROUP BY LeadSource
// ObjectQL
{
  object: 'lead',
  fields: ['lead_source'],
  aggregations: [
    { function: 'count', alias: 'lead_count' }
  ],
  groupBy: ['lead_source']
}
```

### Parent-to-Child Relationships

```typescript
// SOQL: SELECT Account.Name, (SELECT Amount FROM Opportunities) FROM Account
// ObjectQL
{
  object: 'account',
  fields: ['name'],
  joins: [
    {
      type: 'left',
      object: 'opportunity',
      on: ['account.id', '=', 'opportunity.account_id']
    }
  ]
}
```

---

## Best Practices

### 1. Use Appropriate Join Types
- **INNER JOIN**: When you only want matching records
- **LEFT JOIN**: When you want all records from the left table
- **RIGHT JOIN**: When you want all records from the right table
- **FULL JOIN**: When you want all records from both tables

### 2. Optimize Aggregations
- Always specify `groupBy` fields when using aggregations
- Use `having` to filter aggregated results
- Consider using window functions instead of subqueries for better performance

### 3. Window Function Guidelines
- Use `partitionBy` to create logical groups
- Specify `orderBy` for ranking and offset functions
- Define frame specifications for moving calculations
- Combine multiple window functions in a single query for efficiency

### 4. Subquery Performance
- Use subqueries in joins for complex filtering
- Prefer window functions over correlated subqueries
- Limit subquery result sets with filters

---

## Feature Support Matrix

| Feature | SQL Databases | NoSQL | SaaS APIs | ObjectQL |
|---------|--------------|-------|-----------|----------|
| Basic Queries | ✅ | ✅ | ✅ | ✅ |
| Aggregations | ✅ | Partial | Partial | ✅ |
| Joins | ✅ | Limited | Limited | ✅ |
| Window Functions | ✅ (SQL:2003+) | ❌ | ❌ | ✅ |
| Subqueries | ✅ | Limited | ❌ | ✅ |

ObjectQL abstracts these differences and provides a consistent interface across all data sources.

---

## Conclusion

The ObjectQL Query Protocol provides a powerful, unified interface for querying data across different storage systems. It supports:

- ✅ **24+ Aggregation Tests**: Complete coverage of COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING
- ✅ **27+ Join Tests**: All join types with complex scenarios
- ✅ **25+ Window Function Tests**: ROW_NUMBER, RANK, LAG, LEAD, running totals, moving averages
- ✅ **85 Total Tests**: Comprehensive validation of all query features

For implementation details, see `packages/spec/src/data/query.zod.ts`.
For test examples, see `packages/spec/src/data/query.test.ts`.

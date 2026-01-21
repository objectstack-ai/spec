import { describe, it, expect } from 'vitest';
import {
  FilterConditionSchema,
  QueryFilterSchema,
  FieldOperatorsSchema,
  EqualityOperatorSchema,
  ComparisonOperatorSchema,
  SetOperatorSchema,
  RangeOperatorSchema,
  StringOperatorSchema,
  SpecialOperatorSchema,
  FILTER_OPERATORS,
  LOGICAL_OPERATORS,
  ALL_OPERATORS,
  type Filter,
  type QueryFilter,
  type FieldOperators,
} from './filter.zod';

// ============================================================================
// 3.1 Comparison Operators Tests
// ============================================================================

describe('EqualityOperatorSchema', () => {
  it('should accept $eq operator', () => {
    const filter = { $eq: 'active' };
    expect(() => EqualityOperatorSchema.parse(filter)).not.toThrow();
  });

  it('should accept $ne operator', () => {
    const filter = { $ne: 'inactive' };
    expect(() => EqualityOperatorSchema.parse(filter)).not.toThrow();
  });

  it('should accept any data type', () => {
    expect(() => EqualityOperatorSchema.parse({ $eq: 'string' })).not.toThrow();
    expect(() => EqualityOperatorSchema.parse({ $eq: 123 })).not.toThrow();
    expect(() => EqualityOperatorSchema.parse({ $eq: true })).not.toThrow();
    expect(() => EqualityOperatorSchema.parse({ $eq: null })).not.toThrow();
  });
});

describe('ComparisonOperatorSchema', () => {
  it('should accept numeric comparisons', () => {
    expect(() => ComparisonOperatorSchema.parse({ $gt: 18 })).not.toThrow();
    expect(() => ComparisonOperatorSchema.parse({ $gte: 21 })).not.toThrow();
    expect(() => ComparisonOperatorSchema.parse({ $lt: 100 })).not.toThrow();
    expect(() => ComparisonOperatorSchema.parse({ $lte: 99 })).not.toThrow();
  });

  it('should accept date comparisons', () => {
    const date = new Date('2024-01-01');
    expect(() => ComparisonOperatorSchema.parse({ $gt: date })).not.toThrow();
    expect(() => ComparisonOperatorSchema.parse({ $gte: date })).not.toThrow();
    expect(() => ComparisonOperatorSchema.parse({ $lt: date })).not.toThrow();
    expect(() => ComparisonOperatorSchema.parse({ $lte: date })).not.toThrow();
  });
});

// ============================================================================
// 3.2 Set & Range Operators Tests
// ============================================================================

describe('SetOperatorSchema', () => {
  it('should accept $in operator with array', () => {
    const filter = { $in: ['admin', 'editor', 'viewer'] };
    expect(() => SetOperatorSchema.parse(filter)).not.toThrow();
  });

  it('should accept $nin operator with array', () => {
    const filter = { $nin: ['guest', 'anonymous'] };
    expect(() => SetOperatorSchema.parse(filter)).not.toThrow();
  });

  it('should accept arrays of different types', () => {
    expect(() => SetOperatorSchema.parse({ $in: [1, 2, 3] })).not.toThrow();
    expect(() => SetOperatorSchema.parse({ $in: ['a', 'b', 'c'] })).not.toThrow();
  });
});

describe('RangeOperatorSchema', () => {
  it('should accept $between with numeric range', () => {
    const filter = { $between: [18, 65] as [number, number] };
    expect(() => RangeOperatorSchema.parse(filter)).not.toThrow();
  });

  it('should accept $between with date range', () => {
    const filter = { 
      $between: [new Date('2024-01-01'), new Date('2024-12-31')] as [Date, Date]
    };
    expect(() => RangeOperatorSchema.parse(filter)).not.toThrow();
  });
});

// ============================================================================
// 3.3 String-Specific Operators Tests
// ============================================================================

describe('StringOperatorSchema', () => {
  it('should accept $contains operator', () => {
    const filter = { $contains: '@company.com' };
    expect(() => StringOperatorSchema.parse(filter)).not.toThrow();
  });

  it('should accept $startsWith operator', () => {
    const filter = { $startsWith: 'admin_' };
    expect(() => StringOperatorSchema.parse(filter)).not.toThrow();
  });

  it('should accept $endsWith operator', () => {
    const filter = { $endsWith: '.pdf' };
    expect(() => StringOperatorSchema.parse(filter)).not.toThrow();
  });
});

// ============================================================================
// 3.5 Special Operators Tests
// ============================================================================

describe('SpecialOperatorSchema', () => {
  it('should accept $null operator', () => {
    expect(() => SpecialOperatorSchema.parse({ $null: true })).not.toThrow();
    expect(() => SpecialOperatorSchema.parse({ $null: false })).not.toThrow();
  });

  it('should accept $exist operator', () => {
    expect(() => SpecialOperatorSchema.parse({ $exist: true })).not.toThrow();
    expect(() => SpecialOperatorSchema.parse({ $exist: false })).not.toThrow();
  });
});

// ============================================================================
// Combined Field Operators Tests
// ============================================================================

describe('FieldOperatorsSchema', () => {
  it('should accept multiple operators combined', () => {
    const filter: FieldOperators = {
      $gte: 18,
      $lte: 65,
    };
    expect(() => FieldOperatorsSchema.parse(filter)).not.toThrow();
  });

  it('should accept all operator types', () => {
    const filter: FieldOperators = {
      $eq: 'value',
      $ne: 'other',
      $gt: 10,
      $gte: 10,
      $lt: 100,
      $lte: 100,
      $in: ['a', 'b'],
      $nin: ['c', 'd'],
      $between: [1, 10] as [number, number],
      $contains: 'test',
      $startsWith: 'prefix',
      $endsWith: 'suffix',
      $null: false,
      $exist: true,
    };
    expect(() => FieldOperatorsSchema.parse(filter)).not.toThrow();
  });
});

// ============================================================================
// Filter Condition Tests - Basic
// ============================================================================

describe('FilterConditionSchema - Implicit Equality', () => {
  it('should accept simple implicit equality', () => {
    const filter = { status: 'active' };
    expect(() => FilterConditionSchema.parse(filter)).not.toThrow();
  });

  it('should accept multiple implicit equalities', () => {
    const filter = {
      status: 'active',
      role: 'admin',
      verified: true,
    };
    expect(() => FilterConditionSchema.parse(filter)).not.toThrow();
  });
});

describe('FilterConditionSchema - Explicit Operators', () => {
  it('should accept explicit comparison operators', () => {
    const filter = {
      age: { $gte: 18 },
      score: { $lt: 100 },
    };
    expect(() => FilterConditionSchema.parse(filter)).not.toThrow();
  });

  it('should accept explicit string operators', () => {
    const filter = {
      email: { $contains: '@company.com' },
      username: { $startsWith: 'admin_' },
    };
    expect(() => FilterConditionSchema.parse(filter)).not.toThrow();
  });

  it('should accept explicit set operators', () => {
    const filter = {
      status: { $in: ['active', 'pending'] },
      role: { $nin: ['guest', 'anonymous'] },
    };
    expect(() => FilterConditionSchema.parse(filter)).not.toThrow();
  });
});

// ============================================================================
// Filter Condition Tests - Logical Operators
// ============================================================================

describe('FilterConditionSchema - Logical Operators', () => {
  it('should accept $and operator', () => {
    const filter = {
      $and: [
        { status: 'active' },
        { age: { $gte: 18 } },
      ],
    };
    expect(() => FilterConditionSchema.parse(filter)).not.toThrow();
  });

  it('should accept $or operator', () => {
    const filter = {
      $or: [
        { role: 'admin' },
        { role: 'editor' },
      ],
    };
    expect(() => FilterConditionSchema.parse(filter)).not.toThrow();
  });

  it('should accept $not operator', () => {
    const filter = {
      $not: { status: 'deleted' },
    };
    expect(() => FilterConditionSchema.parse(filter)).not.toThrow();
  });

  it('should accept nested logical operators', () => {
    const filter = {
      $and: [
        { status: 'active' },
        {
          $or: [
            { role: 'admin' },
            { permissions: { $contains: 'edit' } },
          ],
        },
      ],
    };
    expect(() => FilterConditionSchema.parse(filter)).not.toThrow();
  });
});

// ============================================================================
// Filter Condition Tests - Relation Queries
// ============================================================================

describe('FilterConditionSchema - Nested Relations', () => {
  it('should accept nested object filters', () => {
    const filter = {
      profile: {
        verified: true,
      },
    };
    expect(() => FilterConditionSchema.parse(filter)).not.toThrow();
  });

  it('should accept deeply nested relations', () => {
    const filter = {
      department: {
        company: {
          country: 'USA',
        },
      },
    };
    expect(() => FilterConditionSchema.parse(filter)).not.toThrow();
  });

  it('should accept nested relations with operators', () => {
    const filter = {
      department: {
        name: { $eq: 'IT' },
        employeeCount: { $gt: 10 },
      },
    };
    expect(() => FilterConditionSchema.parse(filter)).not.toThrow();
  });
});

// ============================================================================
// Query Filter Tests - Complete Examples
// ============================================================================

describe('QueryFilterSchema - Complete Examples', () => {
  it('should accept the example from specification', () => {
    const filter: QueryFilter = {
      where: {
        status: 'active',                     // Implicit equality (AND)
        age: { $gte: 18 },                    // Explicit comparison (AND)
        $or: [                                // Logical branch
          { role: 'admin' },
          { email: { $contains: '@company.com' } },
        ],
        profile: {                            // Relation query
          verified: true,
        },
      },
    };
    expect(() => QueryFilterSchema.parse(filter)).not.toThrow();
  });

  it('should accept complex nested query', () => {
    const filter: QueryFilter = {
      where: {
        $and: [
          { status: { $in: ['active', 'pending'] } },
          { createdAt: { $gte: new Date('2024-01-01') } },
          {
            $or: [
              { priority: 'high' },
              { assignee: { $null: false } },
            ],
          },
        ],
        tags: {
          name: { $contains: 'urgent' },
        },
      },
    };
    expect(() => QueryFilterSchema.parse(filter)).not.toThrow();
  });

  it('should accept query with all operator types', () => {
    const filter: QueryFilter = {
      where: {
        // Equality
        status: 'active',
        archived: { $ne: true },
        
        // Comparison
        age: { $gte: 18, $lte: 65 },
        score: { $gt: 80 },
        
        // Set
        role: { $in: ['admin', 'editor'] },
        category: { $nin: ['spam', 'deleted'] },
        
        // Range
        createdAt: { 
          $between: [
            new Date('2024-01-01'), 
            new Date('2024-12-31')
          ] as [Date, Date]
        },
        
        // String
        email: { $contains: '@example.com' },
        username: { $startsWith: 'user_' },
        filename: { $endsWith: '.pdf' },
        
        // Special
        deletedAt: { $null: true },
        metadata: { $exist: true },
        
        // Logical
        $or: [
          { priority: 'high' },
          { urgent: true },
        ],
        
        // Nested relation
        owner: {
          department: {
            name: 'Engineering',
          },
        },
      },
    };
    expect(() => QueryFilterSchema.parse(filter)).not.toThrow();
  });
});

// ============================================================================
// TypeScript Type Tests
// ============================================================================

describe('TypeScript Type System', () => {
  it('should infer correct types for simple filter', () => {
    interface User {
      id: number;
      name: string;
      age: number;
      email: string;
      active: boolean;
    }

    const filter: Filter<User> = {
      age: { $gte: 18 },
      email: { $contains: '@example.com' },
      active: true,
    };

    expect(filter).toBeDefined();
  });

  it('should infer correct types for nested relations', () => {
    interface User {
      id: number;
      name: string;
      profile: {
        verified: boolean;
        bio: string;
      };
    }

    const filter: Filter<User> = {
      name: { $startsWith: 'John' },
      profile: {
        verified: true,
        bio: { $contains: 'developer' },
      },
    };

    expect(filter).toBeDefined();
  });

  it('should support logical operators', () => {
    interface Task {
      title: string;
      status: string;
      priority: number;
    }

    const filter: Filter<Task> = {
      $or: [
        { status: 'urgent' },
        { priority: { $gt: 8 } },
      ],
      $and: [
        { title: { $contains: 'bug' } },
        { status: { $ne: 'closed' } },
      ],
    };

    expect(filter).toBeDefined();
  });
});

// ============================================================================
// Constants Tests
// ============================================================================

describe('Filter Operator Constants', () => {
  it('should export all filter operators', () => {
    expect(FILTER_OPERATORS).toContain('$eq');
    expect(FILTER_OPERATORS).toContain('$ne');
    expect(FILTER_OPERATORS).toContain('$gt');
    expect(FILTER_OPERATORS).toContain('$gte');
    expect(FILTER_OPERATORS).toContain('$lt');
    expect(FILTER_OPERATORS).toContain('$lte');
    expect(FILTER_OPERATORS).toContain('$in');
    expect(FILTER_OPERATORS).toContain('$nin');
    expect(FILTER_OPERATORS).toContain('$between');
    expect(FILTER_OPERATORS).toContain('$contains');
    expect(FILTER_OPERATORS).toContain('$startsWith');
    expect(FILTER_OPERATORS).toContain('$endsWith');
    expect(FILTER_OPERATORS).toContain('$null');
    expect(FILTER_OPERATORS).toContain('$exist');
  });

  it('should export all logical operators', () => {
    expect(LOGICAL_OPERATORS).toContain('$and');
    expect(LOGICAL_OPERATORS).toContain('$or');
    expect(LOGICAL_OPERATORS).toContain('$not');
  });

  it('should export all operators combined', () => {
    expect(ALL_OPERATORS.length).toBe(FILTER_OPERATORS.length + LOGICAL_OPERATORS.length);
  });
});

// ============================================================================
// Edge Cases & Validation
// ============================================================================

describe('FilterConditionSchema - Edge Cases', () => {
  it('should accept empty where clause', () => {
    const filter: QueryFilter = { where: {} };
    expect(() => QueryFilterSchema.parse(filter)).not.toThrow();
  });

  it('should accept undefined where clause', () => {
    const filter: QueryFilter = {};
    expect(() => QueryFilterSchema.parse(filter)).not.toThrow();
  });

  it('should accept empty logical arrays', () => {
    const filter = {
      $and: [],
      $or: [],
    };
    expect(() => FilterConditionSchema.parse(filter)).not.toThrow();
  });

  it('should accept complex deeply nested structure', () => {
    const filter = {
      $and: [
        {
          $or: [
            { status: 'active' },
            {
              $and: [
                { archived: false },
                { deletedAt: { $null: true } },
              ],
            },
          ],
        },
        {
          $not: {
            role: { $in: ['banned', 'suspended'] },
          },
        },
      ],
    };
    expect(() => FilterConditionSchema.parse(filter)).not.toThrow();
  });
});

// ============================================================================
// Real-World Use Case Examples
// ============================================================================

describe('Real-World Use Cases', () => {
  it('should support user search query', () => {
    const filter: QueryFilter = {
      where: {
        $or: [
          { name: { $contains: 'john' } },
          { email: { $contains: 'john' } },
          { username: { $contains: 'john' } },
        ],
        status: 'active',
        role: { $in: ['user', 'admin'] },
      },
    };
    expect(() => QueryFilterSchema.parse(filter)).not.toThrow();
  });

  it('should support e-commerce order filtering', () => {
    const filter: QueryFilter = {
      where: {
        status: { $in: ['pending', 'processing', 'shipped'] },
        totalAmount: { $gte: 100 },
        createdAt: {
          $between: [
            new Date('2024-01-01'),
            new Date('2024-12-31'),
          ] as [Date, Date],
        },
        customer: {
          tier: 'premium',
          country: { $in: ['US', 'CA', 'UK'] },
        },
      },
    };
    expect(() => QueryFilterSchema.parse(filter)).not.toThrow();
  });

  it('should support project task filtering', () => {
    const filter: QueryFilter = {
      where: {
        $and: [
          {
            $or: [
              { priority: 'high' },
              { dueDate: { $lt: new Date() } },
            ],
          },
          { status: { $ne: 'completed' } },
          { assignee: { $null: false } },
        ],
        project: {
          status: 'active',
          team: {
            department: 'Engineering',
          },
        },
      },
    };
    expect(() => QueryFilterSchema.parse(filter)).not.toThrow();
  });

  it('should support content management filtering', () => {
    const filter: QueryFilter = {
      where: {
        $and: [
          { published: true },
          { deletedAt: { $null: true } },
        ],
        $or: [
          { title: { $contains: 'tutorial' } },
          { tags: { name: { $in: ['tutorial', 'guide', 'howto'] } } },
        ],
        author: {
          verified: true,
          role: { $in: ['editor', 'admin'] },
        },
        publishedAt: {
          $gte: new Date('2024-01-01'),
        },
      },
    };
    expect(() => QueryFilterSchema.parse(filter)).not.toThrow();
  });
});

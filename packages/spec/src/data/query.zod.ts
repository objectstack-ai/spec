import { z } from 'zod';

/**
 * Filter Operator Enum
 * Standard SQL/NoSQL operators supported by the engine.
 */
export const FilterOperator = z.enum([
  '=', '!=', '<>', 
  '>', '>=', '<', '<=', 
  'startswith', 'contains', 'notcontains', 
  'between', 'in', 'notin', 
  'is_null', 'is_not_null'
]);

/**
 * Filter Logic Operator
 */
export const LogicOperator = z.enum(['and', 'or', 'not']);

/**
 * Recursive Filter Node
 * Represents the "Where" clause.
 * 
 * Structure: [Field, Operator, Value] OR [Logic, Filter, Filter...]
 * Examples:
 * - Simple: ["amount", ">", 1000]
 * - Logic: [["status", "=", "closed"], "or", ["amount", ">", 1000]]
 */
export const FilterNodeSchema: z.ZodType<any> = z.lazy(() => 
  z.union([
    // Leaf Node: [Field, Operator, Value]
    z.tuple([z.string(), FilterOperator, z.any()]),
    
    // Logic Node: [Expression, "or", Expression]
    z.array(z.union([z.string(), FilterNodeSchema]))
  ])
);

/**
 * Sort Node
 * Represents "Order By".
 */
export const SortNodeSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('asc')
});

/**
 * Aggregation Function Enum
 * Standard aggregation functions.
 */
export const AggregationFunction = z.enum([
  'count', 'sum', 'avg', 'min', 'max',
  'count_distinct', 'array_agg', 'string_agg'
]);

/**
 * Aggregation Node
 * Represents aggregated field with function.
 */
export const AggregationNodeSchema = z.object({
  function: AggregationFunction.describe('Aggregation function'),
  field: z.string().optional().describe('Field to aggregate (optional for COUNT(*))'),
  alias: z.string().describe('Result column alias'),
  distinct: z.boolean().optional().describe('Apply DISTINCT before aggregation'),
});

/**
 * Join Type Enum
 */
export const JoinType = z.enum(['inner', 'left', 'right', 'full']);

/**
 * Join Node
 * Represents table joins.
 */
export const JoinNodeSchema: z.ZodType<any> = z.lazy(() => 
  z.object({
    type: JoinType.describe('Join type'),
    object: z.string().describe('Object/table to join'),
    alias: z.string().optional().describe('Table alias'),
    on: FilterNodeSchema.describe('Join condition'),
    subquery: z.lazy(() => QuerySchema).optional().describe('Subquery instead of object'),
  })
);

/**
 * Window Function Enum
 */
export const WindowFunction = z.enum([
  'row_number', 'rank', 'dense_rank', 'percent_rank',
  'lag', 'lead', 'first_value', 'last_value',
  'sum', 'avg', 'count', 'min', 'max'
]);

/**
 * Window Specification
 * Defines PARTITION BY and ORDER BY for window functions.
 */
export const WindowSpecSchema = z.object({
  partitionBy: z.array(z.string()).optional().describe('PARTITION BY fields'),
  orderBy: z.array(SortNodeSchema).optional().describe('ORDER BY specification'),
  frame: z.object({
    type: z.enum(['rows', 'range']).optional(),
    start: z.string().optional().describe('Frame start (e.g., "UNBOUNDED PRECEDING", "1 PRECEDING")'),
    end: z.string().optional().describe('Frame end (e.g., "CURRENT ROW", "1 FOLLOWING")'),
  }).optional().describe('Window frame specification'),
});

/**
 * Window Function Node
 * Represents window function with OVER clause.
 */
export const WindowFunctionNodeSchema = z.object({
  function: WindowFunction.describe('Window function name'),
  field: z.string().optional().describe('Field to operate on (for aggregate window functions)'),
  alias: z.string().describe('Result column alias'),
  over: WindowSpecSchema.describe('Window specification (OVER clause)'),
});

/**
 * Field Selection Node
 * Represents "Select" attributes, including joins.
 */
export const FieldNodeSchema: z.ZodType<any> = z.lazy(() => 
  z.union([
    z.string(), // Primitive field: "name"
    z.object({
      field: z.string(), // Relationship field: "owner"
      fields: z.array(FieldNodeSchema).optional(), // Nested select: ["name", "email"]
      alias: z.string().optional()
    })
  ])
);

/**
 * Query AST Schema
 * The universal data retrieval contract defined in `ast-structure.mdx`.
 */
export const QuerySchema = z.object({
  /** Target Entity */
  object: z.string().describe('Object name (e.g. account)'),
  
  /** Select Clause */
  fields: z.array(FieldNodeSchema).optional().describe('Fields to retrieve'),
  
  /** Aggregations */
  aggregations: z.array(AggregationNodeSchema).optional().describe('Aggregation functions (GROUP BY)'),
  
  /** Window Functions */
  windowFunctions: z.array(WindowFunctionNodeSchema).optional().describe('Window functions with OVER clause'),
  
  /** Where Clause */
  filters: FilterNodeSchema.optional().describe('Filtering criteria'),
  
  /** Joins */
  joins: z.array(JoinNodeSchema).optional().describe('Table joins'),
  
  /** Group By Clause */
  groupBy: z.array(z.string()).optional().describe('GROUP BY fields'),
  
  /** Having Clause */
  having: FilterNodeSchema.optional().describe('HAVING clause for aggregation filtering'),
  
  /** Order By Clause */
  sort: z.array(SortNodeSchema).optional().describe('Sorting instructions'),
  
  /** Pagination */
  top: z.number().optional().describe('Limit results'),
  skip: z.number().optional().describe('Offset results'),
  
  /** Subquery flag */
  distinct: z.boolean().optional().describe('SELECT DISTINCT flag'),
});

export type QueryAST = z.infer<typeof QuerySchema>;
export type FilterNode = z.infer<typeof FilterNodeSchema>;
export type SortNode = z.infer<typeof SortNodeSchema>;
export type AggregationNode = z.infer<typeof AggregationNodeSchema>;
export type JoinNode = z.infer<typeof JoinNodeSchema>;
export type WindowFunctionNode = z.infer<typeof WindowFunctionNodeSchema>;
export type WindowSpec = z.infer<typeof WindowSpecSchema>;

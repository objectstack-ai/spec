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
  
  /** Where Clause */
  filters: FilterNodeSchema.optional().describe('Filtering criteria'),
  
  /** Order By Clause */
  sort: z.array(SortNodeSchema).optional().describe('Sorting instructions'),
  
  /** Pagination */
  top: z.number().optional().describe('Limit results'),
  skip: z.number().optional().describe('Offset results'),
});

export type QueryAST = z.infer<typeof QuerySchema>;
export type FilterNode = z.infer<typeof FilterNodeSchema>;
export type SortNode = z.infer<typeof SortNodeSchema>;

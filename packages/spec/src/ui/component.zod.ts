import { z } from 'zod';

/**
 * Component Schema
 * 
 * Defines a generic, implementation-agnostic structure for describing UI component trees.
 * 
 * **Design Philosophy:**
 * The protocol layer defines "how to describe a UI tree", not "what properties a Button has".
 * This allows UI implementations to evolve independently while maintaining structural compatibility.
 * 
 * **Core Properties:**
 * - `type`: Component type identifier (extensible string)
 * - `props`: Arbitrary component properties (implementation-defined)
 * - `children`: Recursive nesting of child components
 * - `events`: Event handler bindings
 * - `style`: Custom CSS styling
 * 
 * @example
 * ```typescript
 * const component: Component = {
 *   type: 'card',
 *   props: {
 *     title: 'User Profile',
 *     subtitle: 'Account Details',
 *     customProp: 'value'
 *   },
 *   children: [
 *     {
 *       type: 'badge',
 *       props: { label: 'Premium', variant: 'success' }
 *     }
 *   ],
 *   style: {
 *     padding: '16px',
 *     borderRadius: '8px'
 *   },
 *   events: {
 *     onClick: () => {}
 *   }
 * }
 * ```
 */
export const ComponentSchema: z.ZodType<{
  type: string;
  props?: Record<string, unknown>;
  children?: Array<any>;
  events?: Record<string, Function>;
  style?: Record<string, string>;
}> = z.object({
  /** Component type identifier - extensible string to allow custom components */
  type: z.string().describe('Component type identifier'),
  
  /** Component-specific properties - implementation-defined */
  props: z.record(z.unknown()).optional().describe('Component properties'),
  
  /** Nested child components - recursive structure */
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
  
  /** Event handler bindings */
  events: z.record(z.function()).optional().describe('Event handlers'),
  
  /** Custom CSS styles */
  style: z.record(z.string()).optional().describe('Custom styles'),
});

/**
 * TypeScript Type Exports
 */
export type Component = z.infer<typeof ComponentSchema>;

/**
 * Component Factory Helper
 * 
 * Provides a convenient way to create validated component instances.
 * 
 * @example
 * ```typescript
 * const card = Component.create({
 *   type: 'card',
 *   props: { title: 'Hello World' }
 * });
 * ```
 */
export const Component = {
  create: (config: z.input<typeof ComponentSchema>): Component => ComponentSchema.parse(config),
} as const;

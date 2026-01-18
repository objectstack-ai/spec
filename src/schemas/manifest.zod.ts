import { z } from 'zod';

/**
 * Schema for menu items in ObjectStack packages.
 * Defines navigation structure that can be injected into the UI.
 */
export const MenuItemSchema = z.object({
  /** Display label for the menu item */
  label: z.string().describe('Display label for the menu item'),
  /** Navigation path (route) for the menu item */
  path: z.string().describe('Navigation path (route) for the menu item'),
  /** Optional icon identifier for the menu item */
  icon: z.string().optional().describe('Optional icon identifier for the menu item'),
});

/**
 * Schema for the ObjectStack Manifest.
 * This defines the structure of a package configuration in the ObjectStack ecosystem.
 * All packages (apps, plugins, drivers, modules) must conform to this schema.
 */
export const ManifestSchema = z.object({
  /** 
   * Unique package identifier using reverse domain notation.
   * Example: "com.example.crm"
   */
  id: z.string().describe('Unique package identifier (reverse domain style)'),
  
  /** 
   * Package version following semantic versioning (major.minor.patch).
   * Example: "1.0.0"
   */
  version: z.string().regex(/^\d+\.\d+\.\d+$/).describe('Package version (semantic versioning)'),
  
  /** 
   * Type of the package in the ObjectStack ecosystem.
   * - app: Standalone application
   * - plugin: Extension to ObjectOS
   * - driver: Low-level integration driver
   * - module: Reusable code module
   */
  type: z.enum(['app', 'plugin', 'driver', 'module']).describe('Type of package'),
  
  /** 
   * Human-readable name of the package.
   */
  name: z.string().describe('Human-readable package name'),
  
  /** 
   * Brief description of the package functionality.
   */
  description: z.string().optional().describe('Package description'),
  
  /** 
   * Array of permission strings that the package requires.
   * Example: ["system.user.read", "system.data.write"]
   */
  permissions: z.array(z.string()).optional().describe('Array of required permission strings'),
  
  /** 
   * Navigation menu structure that the package contributes to the UI.
   */
  menus: z.array(MenuItemSchema).optional().describe('Navigation menu structure'),
  
  /** 
   * Glob patterns specifying ObjectQL schema files.
   * Example: ["./src/schema/*.gql", "./schema/ ** /*.graphql"]
   */
  entities: z.array(z.string()).optional().describe('Glob patterns for ObjectQL schema files'),
  
  /** 
   * Extension points contributed by this package.
   * Allows packages to extend UI components, add functionality, etc.
   */
  extensions: z.record(z.any()).optional().describe('Extension points and contributions'),
});

/**
 * TypeScript type inferred from the ManifestSchema.
 * Use this type for type-safe manifest handling in TypeScript code.
 */
export type ObjectStackManifest = z.infer<typeof ManifestSchema>;

/**
 * TypeScript type for menu items.
 */
export type MenuItem = z.infer<typeof MenuItemSchema>;

import { z } from 'zod';

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
   * Glob patterns specifying ObjectQL schemas files (typically *.object.yml or *.object.ts).
   * Example: `["./src/objects/*.object.yml"]`
   */
  objects: z.array(z.string()).optional().describe('Glob patterns for ObjectQL schemas files'),
  
  /**
   * Defines system level DataSources.
   */
  datasources: z.array(z.string()).optional().describe('Glob patterns for Datasource definitions'),

  /**
   * Package Dependencies.
   * Map of package IDs to version requirements.
   */
  dependencies: z.record(z.string()).optional().describe('Package dependencies'),

  /**
   * Plugin Configuration Schema.
   * Defines the settings this plugin exposes to the user.
   * Uses a simplified JSON Schema format.
   */
  configuration: z.object({
    title: z.string().optional(),
    properties: z.record(z.object({
       type: z.enum(['string', 'number', 'boolean', 'array', 'object']).describe('Data type of the setting'),
       default: z.any().optional().describe('Default value'),
       description: z.string().optional().describe('Tooltip description'),
       required: z.boolean().optional().describe('Is this setting required?'),
       secret: z.boolean().optional().describe('If true, value is encrypted/masked (e.g. API Keys)'),
       enum: z.array(z.string()).optional().describe('Allowed values for select inputs'),
    })).describe('Map of configuration keys to their definitions')
  }).optional().describe('Plugin configuration settings'),

  /**
   * Contribution Points (VS Code Style).
   * formalized way to extend the platform capabilities.
   */
  contributes: z.object({
    /**
     * Register new Metadata Kinds (CRDs).
     * Enables the system to parse and validate new file types.
     * Example: Registering a BI plugin to handle *.report.ts
     */
    kinds: z.array(z.object({
      id: z.string().describe('The generic identifier of the kind (e.g., "sys.bi.report")'),
      globs: z.array(z.string()).describe('File patterns to watch (e.g., ["**/*.report.ts"])'),
      description: z.string().optional().describe('Description of what this kind represents'),
    })).optional().describe('New Metadata Types to recognize'),

    /**
     * Register System Hooks.
     * Declares that this plugin listens to specific system events.
     */
    events: z.array(z.string()).optional().describe('Events this plugin listens to'),

    /**
     * Register UI Menus.
     */
    menus: z.record(z.array(z.object({
       id: z.string(),
       label: z.string(),
       command: z.string().optional(),
    }))).optional().describe('UI Menu contributions'),

    /**
     * Register Custom Themes.
     */
    themes: z.array(z.object({
      id: z.string(),
      label: z.string(),
      path: z.string(),
    })).optional().describe('Theme contributions'),

    /**
     * Register Translations.
     * Path to translation files (e.g. "locales/en.json").
     */
    translations: z.array(z.object({
      locale: z.string(),
      path: z.string(),
    })).optional().describe('Translation resources'),

    /**
     * Register Server Actions.
     * Invocable functions exposed to Flows or API.
     */
    actions: z.array(z.object({
       name: z.string().describe('Unique action name'),
       label: z.string().optional(),
       description: z.string().optional(),
       input: z.any().optional().describe('Input validation schema'),
       output: z.any().optional().describe('Output schema'),
    })).optional().describe('Exposed server actions'),
  }).optional().describe('Platform contributions'),

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


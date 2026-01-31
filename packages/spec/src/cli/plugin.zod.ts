import { z } from 'zod';

/**
 * # CLI Plugin Protocol
 * 
 * Defines the standard interface for CLI plugins that extend the ObjectStack CLI
 * with additional commands and functionality.
 * 
 * ## Design Philosophy
 * - **Command-Oriented**: Each plugin registers one or more commands
 * - **Type-Safe**: Full Zod validation for plugin manifests
 * - **Hot-Loadable**: Plugins can be discovered and loaded at runtime
 * - **Isolated**: Each plugin runs in its own context
 */

/**
 * CLI Command Argument Schema
 * Defines command line arguments for a CLI command
 */
export const CLICommandArgumentSchema = z.object({
  name: z.string().describe('Argument name'),
  description: z.string().optional().describe('Argument description'),
  required: z.boolean().optional().default(true).describe('Whether argument is required'),
  defaultValue: z.string().optional().describe('Default value if not provided'),
  variadic: z.boolean().optional().default(false).describe('Whether argument accepts multiple values'),
});

/**
 * CLI Command Option Schema
 * Defines command line options/flags for a CLI command
 */
export const CLICommandOptionSchema = z.object({
  flags: z.string().describe('Option flags (e.g., "-p, --port <number>")'),
  description: z.string().optional().describe('Option description'),
  defaultValue: z.any().optional().describe('Default value'),
  required: z.boolean().optional().default(false).describe('Whether option is required'),
  choices: z.array(z.string()).optional().describe('Allowed values'),
});

/**
 * CLI Command Definition Schema
 * Defines a single CLI command that a plugin provides
 * 
 * Note: We use z.ZodType<any> for the recursive subcommands reference.
 * This is necessary because Zod's lazy() function requires explicit typing
 * for recursive schemas. The actual validation still works correctly at runtime.
 */
export const CLICommandDefinitionSchema: z.ZodType<any> = z.object({
  name: z.string()
    .regex(/^[a-z][a-z0-9-]*$/)
    .describe('Command name (e.g., "init", "generate")'),
  
  description: z.string().describe('Command description'),
  
  alias: z.string().optional().describe('Short alias for the command'),
  
  arguments: z.array(CLICommandArgumentSchema).optional()
    .describe('Positional arguments'),
  
  options: z.array(CLICommandOptionSchema).optional()
    .describe('Command options/flags'),
  
  examples: z.array(z.object({
    command: z.string().describe('Example command'),
    description: z.string().describe('What the example does'),
  })).optional().describe('Usage examples'),
  
  subcommands: z.array(z.lazy((): z.ZodType<any> => CLICommandDefinitionSchema)).optional()
    .describe('Nested subcommands'),
  
  /**
   * Handler function is not validated by Zod (runtime function)
   * It will be provided during plugin implementation
   */
  hidden: z.boolean().optional().default(false).describe('Hide from help output'),
});

/**
 * CLI Plugin Context Schema
 * Runtime context provided to plugin commands
 */
export const CLIPluginContextSchema = z.object({
  cwd: z.string().describe('Current working directory'),
  
  logger: z.object({
    log: z.function().returns(z.void()),
    info: z.function().returns(z.void()),
    warn: z.function().returns(z.void()),
    error: z.function().returns(z.void()),
    debug: z.function().returns(z.void()),
    success: z.function().returns(z.void()),
  }).passthrough().describe('Logger interface'),
  
  config: z.object({
    get: z.function().returns(z.any()),
    set: z.function().returns(z.promise(z.void())),
    has: z.function().returns(z.boolean()),
  }).passthrough().describe('Configuration interface'),
  
  packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']).optional()
    .describe('Detected package manager'),
  
  utils: z.object({
    spawn: z.function().returns(z.promise(z.any())),
    exec: z.function().returns(z.promise(z.string())),
    readFile: z.function().returns(z.promise(z.string())),
    writeFile: z.function().returns(z.promise(z.void())),
    fileExists: z.function().returns(z.promise(z.boolean())),
    mkdir: z.function().returns(z.promise(z.void())),
  }).passthrough().describe('Utility functions'),
});

/**
 * CLI Plugin Metadata Schema
 * Defines metadata for a CLI plugin
 */
export const CLIPluginMetadataSchema = z.object({
  id: z.string()
    .regex(/^@?[a-z0-9-]+\/[a-z0-9-]+$/)
    .describe('Plugin ID (e.g., "@objectstack/cli-plugin-scaffold")'),
  
  name: z.string().describe('Human-readable plugin name'),
  
  version: z.string()
    .regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/)
    .describe('Semantic version'),
  
  description: z.string().optional().describe('Plugin description'),
  
  author: z.string().optional().describe('Plugin author'),
  
  homepage: z.string().url().optional().describe('Plugin homepage URL'),
  
  repository: z.string().optional().describe('Repository URL'),
  
  keywords: z.array(z.string()).optional().describe('Search keywords'),
  
  license: z.string().optional().default('MIT').describe('License type'),
  
  engines: z.object({
    node: z.string().optional().describe('Required Node.js version'),
    objectstack: z.string().optional().describe('Required ObjectStack CLI version'),
  }).optional(),
});

/**
 * CLI Plugin Schema
 * Complete definition of a CLI plugin
 */
export const CLIPluginSchema = z.object({
  /**
   * Plugin metadata
   */
  metadata: CLIPluginMetadataSchema,
  
  /**
   * Commands provided by this plugin
   */
  commands: z.array(CLICommandDefinitionSchema)
    .min(1)
    .describe('CLI commands provided by this plugin'),
  
  /**
   * Plugin dependencies
   */
  dependencies: z.array(z.string()).optional()
    .describe('Other plugins this plugin depends on'),
  
  /**
   * Configuration schema for the plugin
   */
  configSchema: z.any().optional()
    .describe('Zod schema for plugin configuration'),
  
  /**
   * Lifecycle hooks
   */
  hooks: z.object({
    onLoad: z.function()
      .args(CLIPluginContextSchema)
      .returns(z.promise(z.void()))
      .optional()
      .describe('Called when plugin is loaded'),
    
    onUnload: z.function()
      .args(CLIPluginContextSchema)
      .returns(z.promise(z.void()))
      .optional()
      .describe('Called when plugin is unloaded'),
  }).optional(),
});

/**
 * CLI Plugin Registry Entry Schema
 * Represents a registered plugin in the CLI plugin registry
 */
export const CLIPluginRegistryEntrySchema = z.object({
  id: z.string().describe('Plugin ID'),
  version: z.string().describe('Installed version'),
  path: z.string().describe('Installation path'),
  enabled: z.boolean().optional().default(true).describe('Whether plugin is enabled'),
  installedAt: z.string().datetime().describe('Installation timestamp'),
  updatedAt: z.string().datetime().optional().describe('Last update timestamp'),
});

/**
 * CLI Plugin Discovery Result Schema
 * Result of plugin discovery process
 */
export const CLIPluginDiscoveryResultSchema = z.object({
  found: z.array(z.object({
    id: z.string(),
    path: z.string(),
    metadata: CLIPluginMetadataSchema.optional(),
  })),
  errors: z.array(z.object({
    path: z.string(),
    error: z.string(),
  })).optional(),
});

// Export TypeScript types
export type CLICommandArgument = z.infer<typeof CLICommandArgumentSchema>;
export type CLICommandOption = z.infer<typeof CLICommandOptionSchema>;
export type CLICommandDefinition = z.infer<typeof CLICommandDefinitionSchema>;
export type CLIPluginContext = z.infer<typeof CLIPluginContextSchema>;
export type CLIPluginMetadata = z.infer<typeof CLIPluginMetadataSchema>;
export type CLIPlugin = z.infer<typeof CLIPluginSchema>;
export type CLIPluginRegistryEntry = z.infer<typeof CLIPluginRegistryEntrySchema>;
export type CLIPluginDiscoveryResult = z.infer<typeof CLIPluginDiscoveryResultSchema>;

// Export input types for configuration
export type CLICommandArgumentInput = z.input<typeof CLICommandArgumentSchema>;
export type CLICommandOptionInput = z.input<typeof CLICommandOptionSchema>;
export type CLICommandDefinitionInput = z.input<typeof CLICommandDefinitionSchema>;
export type CLIPluginInput = z.input<typeof CLIPluginSchema>;

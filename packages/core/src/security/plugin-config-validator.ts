// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import type { Logger } from '@objectstack/spec/contracts';
import type { PluginMetadata } from '../plugin-loader.js';

/**
 * Plugin Configuration Validator
 * 
 * Validates plugin configurations against Zod schemas to ensure:
 * 1. Type safety - all config values have correct types
 * 2. Business rules - values meet constraints (min/max, regex, etc.)
 * 3. Required fields - all mandatory configuration is provided
 * 4. Default values - missing optional fields get defaults
 * 
 * Architecture:
 * - Uses Zod for runtime validation
 * - Provides detailed error messages with field paths
 * - Supports nested configuration objects
 * - Allows partial validation for incremental updates
 * 
 * Usage:
 * ```typescript
 * const validator = new PluginConfigValidator(logger);
 * const validConfig = validator.validatePluginConfig(plugin, userConfig);
 * ```
 */
export class PluginConfigValidator {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  /**
   * Validate plugin configuration against its Zod schema
   * 
   * @param plugin - Plugin metadata with configSchema
   * @param config - User-provided configuration
   * @returns Validated and typed configuration
   * @throws Error with detailed validation errors
   */
  validatePluginConfig<T = any>(plugin: PluginMetadata, config: any): T {
    if (!plugin.configSchema) {
      this.logger.debug(`Plugin ${plugin.name} has no config schema - skipping validation`);
      return config as T;
    }
    
    try {
      // Use Zod to parse and validate
      const validatedConfig = plugin.configSchema.parse(config);
      
      this.logger.debug(`✅ Plugin config validated: ${plugin.name}`, {
        plugin: plugin.name,
        configKeys: Object.keys(config || {}).length,
      });
      
      return validatedConfig as T;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = this.formatZodErrors(error);
        const errorMessage = [
          `Plugin ${plugin.name} configuration validation failed:`,
          ...formattedErrors.map(e => `  - ${e.path}: ${e.message}`),
        ].join('\n');
        
        this.logger.error(errorMessage, undefined, {
          plugin: plugin.name,
          errors: formattedErrors,
        });
        
        throw new Error(errorMessage);
      }
      
      // Re-throw other errors
      throw error;
    }
  }
  
  /**
   * Validate partial configuration (for incremental updates)
   * 
   * @param plugin - Plugin metadata
   * @param partialConfig - Partial configuration to validate
   * @returns Validated partial configuration
   */
  validatePartialConfig<T = any>(plugin: PluginMetadata, partialConfig: any): Partial<T> {
    if (!plugin.configSchema) {
      return partialConfig as Partial<T>;
    }
    
    try {
      // Use Zod's partial() method for partial validation
      // Cast to ZodObject to access partial() method
      const partialSchema = (plugin.configSchema as any).partial();
      const validatedConfig = partialSchema.parse(partialConfig);
      
      this.logger.debug(`✅ Partial config validated: ${plugin.name}`);
      return validatedConfig as Partial<T>;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = this.formatZodErrors(error);
        const errorMessage = [
          `Plugin ${plugin.name} partial configuration validation failed:`,
          ...formattedErrors.map(e => `  - ${e.path}: ${e.message}`),
        ].join('\n');
        
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  }
  
  /**
   * Get default configuration from schema
   * 
   * @param plugin - Plugin metadata
   * @returns Default configuration object
   */
  getDefaultConfig<T = any>(plugin: PluginMetadata): T | undefined {
    if (!plugin.configSchema) {
      return undefined;
    }
    
    try {
      // Parse empty object to get defaults
      const defaults = plugin.configSchema.parse({});
      this.logger.debug(`Default config extracted: ${plugin.name}`);
      return defaults as T;
    } catch (error) {
      // Schema may require some fields - return undefined
      this.logger.debug(`No default config available: ${plugin.name}`);
      return undefined;
    }
  }
  
  /**
   * Check if configuration is valid without throwing
   * 
   * @param plugin - Plugin metadata
   * @param config - Configuration to check
   * @returns True if valid, false otherwise
   */
  isConfigValid(plugin: PluginMetadata, config: any): boolean {
    if (!plugin.configSchema) {
      return true;
    }
    
    const result = plugin.configSchema.safeParse(config);
    return result.success;
  }
  
  /**
   * Get configuration errors without throwing
   * 
   * @param plugin - Plugin metadata
   * @param config - Configuration to check
   * @returns Array of validation errors, or empty array if valid
   */
  getConfigErrors(plugin: PluginMetadata, config: any): Array<{path: string; message: string}> {
    if (!plugin.configSchema) {
      return [];
    }
    
    const result = plugin.configSchema.safeParse(config);
    
    if (result.success) {
      return [];
    }
    
    return this.formatZodErrors(result.error);
  }
  
  // Private methods
  
  private formatZodErrors(error: z.ZodError<any>): Array<{path: string; message: string}> {
    return error.issues.map((e: z.ZodIssue) => ({
      path: e.path.join('.') || 'root',
      message: e.message,
    }));
  }
}

/**
 * Create a plugin config validator
 * 
 * @param logger - Logger instance
 * @returns Plugin config validator
 */
export function createPluginConfigValidator(logger: Logger): PluginConfigValidator {
  return new PluginConfigValidator(logger);
}

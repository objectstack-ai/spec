import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { PluginConfigValidator } from '../plugin-config-validator.js';
import { createLogger } from '../../logger.js';
import type { PluginMetadata } from '../../plugin-loader.js';

describe('PluginConfigValidator', () => {
  let validator: PluginConfigValidator;
  let logger: ReturnType<typeof createLogger>;
  
  beforeEach(() => {
    logger = createLogger({ level: 'silent' });
    validator = new PluginConfigValidator(logger);
  });
  
  describe('validatePluginConfig', () => {
    it('should validate valid configuration', () => {
      const configSchema = z.object({
        port: z.number().min(1000).max(65535),
        host: z.string(),
        debug: z.boolean().default(false),
      });
      
      const plugin: PluginMetadata = {
        name: 'com.test.plugin',
        version: '1.0.0',
        configSchema,
        init: async () => {},
      };
      
      const config = {
        port: 3000,
        host: 'localhost',
        debug: true,
      };
      
      const validatedConfig = validator.validatePluginConfig(plugin, config);
      
      expect(validatedConfig).toEqual(config);
    });
    
    it('should apply defaults for missing optional fields', () => {
      const configSchema = z.object({
        port: z.number().default(3000),
        host: z.string().default('localhost'),
        debug: z.boolean().default(false),
      });
      
      const plugin: PluginMetadata = {
        name: 'com.test.plugin',
        version: '1.0.0',
        configSchema,
        init: async () => {},
      };
      
      const config = {
        port: 8080,
      };
      
      const validatedConfig = validator.validatePluginConfig(plugin, config);
      
      expect(validatedConfig).toEqual({
        port: 8080,
        host: 'localhost',
        debug: false,
      });
    });
    
    it('should throw error for invalid configuration', () => {
      const configSchema = z.object({
        port: z.number().min(1000).max(65535),
        host: z.string(),
      });
      
      const plugin: PluginMetadata = {
        name: 'com.test.plugin',
        version: '1.0.0',
        configSchema,
        init: async () => {},
      };
      
      const config = {
        port: 100, // Invalid: < 1000
        host: 'localhost',
      };
      
      expect(() => validator.validatePluginConfig(plugin, config)).toThrow();
    });
    
    it('should provide detailed error messages', () => {
      const configSchema = z.object({
        port: z.number().min(1000),
        host: z.string().min(1),
      });
      
      const plugin: PluginMetadata = {
        name: 'com.test.plugin',
        version: '1.0.0',
        configSchema,
        init: async () => {},
      };
      
      const config = {
        port: 100,
        host: '',
      };
      
      try {
        validator.validatePluginConfig(plugin, config);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain('com.test.plugin');
        expect(errorMessage).toContain('port');
        expect(errorMessage).toContain('host');
      }
    });
    
    it('should skip validation when no schema is provided', () => {
      const plugin: PluginMetadata = {
        name: 'com.test.plugin',
        version: '1.0.0',
        init: async () => {},
      };
      
      const config = { anything: 'goes' };
      
      const validatedConfig = validator.validatePluginConfig(plugin, config);
      
      expect(validatedConfig).toEqual(config);
    });
  });
  
  describe('validatePartialConfig', () => {
    it('should validate partial configuration', () => {
      const configSchema = z.object({
        port: z.number().min(1000),
        host: z.string(),
        debug: z.boolean(),
      });
      
      const plugin: PluginMetadata = {
        name: 'com.test.plugin',
        version: '1.0.0',
        configSchema,
        init: async () => {},
      };
      
      const partialConfig = {
        port: 8080,
      };
      
      const validatedConfig = validator.validatePartialConfig(plugin, partialConfig);
      
      expect(validatedConfig).toEqual({ port: 8080 });
    });
  });
  
  describe('getDefaultConfig', () => {
    it('should extract default configuration', () => {
      const configSchema = z.object({
        port: z.number().default(3000),
        host: z.string().default('localhost'),
        debug: z.boolean().default(false),
      });
      
      const plugin: PluginMetadata = {
        name: 'com.test.plugin',
        version: '1.0.0',
        configSchema,
        init: async () => {},
      };
      
      const defaults = validator.getDefaultConfig(plugin);
      
      expect(defaults).toEqual({
        port: 3000,
        host: 'localhost',
        debug: false,
      });
    });
    
    it('should return undefined when schema requires fields', () => {
      const configSchema = z.object({
        port: z.number(),
        host: z.string(),
      });
      
      const plugin: PluginMetadata = {
        name: 'com.test.plugin',
        version: '1.0.0',
        configSchema,
        init: async () => {},
      };
      
      const defaults = validator.getDefaultConfig(plugin);
      
      expect(defaults).toBeUndefined();
    });
  });
  
  describe('isConfigValid', () => {
    it('should return true for valid config', () => {
      const configSchema = z.object({
        port: z.number(),
      });
      
      const plugin: PluginMetadata = {
        name: 'com.test.plugin',
        version: '1.0.0',
        configSchema,
        init: async () => {},
      };
      
      const isValid = validator.isConfigValid(plugin, { port: 3000 });
      
      expect(isValid).toBe(true);
    });
    
    it('should return false for invalid config', () => {
      const configSchema = z.object({
        port: z.number(),
      });
      
      const plugin: PluginMetadata = {
        name: 'com.test.plugin',
        version: '1.0.0',
        configSchema,
        init: async () => {},
      };
      
      const isValid = validator.isConfigValid(plugin, { port: 'invalid' });
      
      expect(isValid).toBe(false);
    });
  });
  
  describe('getConfigErrors', () => {
    it('should return errors for invalid config', () => {
      const configSchema = z.object({
        port: z.number().min(1000),
        host: z.string().min(1),
      });
      
      const plugin: PluginMetadata = {
        name: 'com.test.plugin',
        version: '1.0.0',
        configSchema,
        init: async () => {},
      };
      
      const errors = validator.getConfigErrors(plugin, { port: 100, host: '' });
      
      expect(errors).toHaveLength(2);
      expect(errors[0].path).toBe('port');
      expect(errors[1].path).toBe('host');
    });
    
    it('should return empty array for valid config', () => {
      const configSchema = z.object({
        port: z.number(),
      });
      
      const plugin: PluginMetadata = {
        name: 'com.test.plugin',
        version: '1.0.0',
        configSchema,
        init: async () => {},
      };
      
      const errors = validator.getConfigErrors(plugin, { port: 3000 });
      
      expect(errors).toEqual([]);
    });
  });
});

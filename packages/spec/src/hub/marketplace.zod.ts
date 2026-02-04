import { z } from 'zod';
import { PluginVendorSchema } from './plugin-registry.zod';

/**
 * # Marketplace Protocol
 * 
 * Defines the schema for the ObjectStack Plugin Marketplace.
 * This is the catalog of available extensions sourced from NPM or private registries.
 */

export const PluginAuthorSchema = PluginVendorSchema;

/**
 * Plugin Pricing Model Schema
 */
export const PluginPricingSchema = z.object({
  type: z.enum(['free', 'one_time', 'recurring']),
  currency: z.string().default('USD'),
  amount: z.number().min(0),
  interval: z.enum(['month', 'year']).optional().describe('Required if type is recurring'),
  trialDays: z.number().int().optional(),
});

/**
 * Plugin Version Schema
 * Specific release version details
 */
export const PluginVersionSchema = z.object({
  version: z.string().describe('SemVer string (e.g. 1.0.0)'),
  publishedAt: z.string().datetime().describe('Publication date'),
  downloadUrl: z.string().url().describe('Archive download URL'),
  checksum: z.string().optional().describe('Integrity checksum (shasum)'),
  engine: z.object({
    node: z.string().optional(),
    objectstack: z.string().describe('Required ObjectStack kernel version range'),
  }).optional().describe('Engine compatibility'),
  dependencies: z.record(z.string(), z.string()).optional().describe('Runtime plugin dependencies'),
  changeLog: z.string().optional().describe('Release notes'),
});

/**
 * Plugin Registry Entry Schema
 * Represents a listing in the Marketplace.
 */
export const MarketplacePluginSchema = z.object({
  /**
   * Package Identifier
   * Usually the NPM package name (e.g. "@steedos/plugin-crm")
   */
  id: z.string(),
  
  /**
   * Version History
   * Registry of all available versions
   */
  versions: z.record(z.string(), PluginVersionSchema).optional().describe('Map of versions (1.0.0) -> Details'),

  /**
   * Display Name
   */
  label: z.string(),
  
  /**
   * Short Description
   */
  description: z.string().optional(),
  
  /**
   * Detailed README / Documentation content
   */
  readme: z.string().optional(),
  
  /**
   * Latest Version
   */
  version: z.string(),
  
  /**
   * Vendor / Publisher
   */
  vendor: PluginVendorSchema.optional(),
  
  /**
   * Categorization
   */
  tags: z.array(z.string()).optional(),
  category: z.enum([
    'app', 
    'integration', 
    'theme', 
    'utility', 
    'driver',
    'analytics',
    'security',
    'automation',
    'ai',
    'data'
  ]).optional(),
  
  /**
   * Assets
   */
  icon: z.string().url().optional(),
  screenshots: z.array(z.string().url()).optional(),
  
  /**
   * Links
   */
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  bugs: z.string().url().optional(),
  
  /**
   * Statistics
   */
  downloads: z.number().int().optional(),
  rating: z.number().min(0).max(5).optional(),

  /**
   * Commercial Information
   */
  pricing: PluginPricingSchema.optional(),

  verified: z.boolean().default(false).describe('Is verified maintaned by ObjectStack'),
});

export type PluginAuthor = z.infer<typeof PluginAuthorSchema>;
export type MarketplacePlugin = z.infer<typeof MarketplacePluginSchema>;
export type MarketplaceListing = MarketplacePlugin; // Alias for backwards compatibility

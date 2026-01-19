import { z } from 'zod';

/**
 * Driver Type Enum (Built-in)
 * Standard drivers supported by the core platform.
 * Plugins can register additional drivers using different identifiers.
 */
export const BuiltInDrivers = [
  'postgres', 'mysql', 'sqlserver', 'oracle', 'sqlite', // SQL
  'mongo', 'redis', // NoSQL
  'excel', 'csv', 'airtable', // Spreadsheet / Low-code
  'rest_api', 'graphql', 'odata', // Web Services
  'salesforce', 'sap', 'workday' // Enterprise SaaS
] as const;

/**
 * Driver Identifier
 * Can be a built-in driver or a plugin-contributed driver (e.g., "com.vendor.snowflake").
 */
export const DriverType = z.string().describe('Underlying driver identifier');

/**
 * Driver Definition Schema
 * Metadata describing a Database Driver.
 * Plugins use this to register new connectivity options.
 */
export const DriverDefinitionSchema = z.object({
  id: z.string().describe('Unique driver identifier (e.g. "postgres")'),
  label: z.string().describe('Display label (e.g. "PostgreSQL")'),
  description: z.string().optional(),
  icon: z.string().optional(),
  
  /**
   * Configuration Schema (JSON Schema)
   * Describes the structure of the `config` object needed for this driver.
   * Used by the UI to generate the connection form.
   */
  configSchema: z.record(z.any()).describe('JSON Schema for connection configuration'),
  
  /**
   * Default Capabilities
   * What this driver supports out-of-the-box.
   */
  capabilities: z.lazy(() => DatasourceCapabilities).optional(),
});

/**
 * Datasource Capabilities Schema
 * Declares what this datasource naturally supports.
 * The ObjectQL engine uses this to determine what logic to push down
 * and what to compute in memory.
 */
export const DatasourceCapabilities = z.object({
  /** Can execute SQL-like joins natively? */
  joins: z.boolean().default(false),
  /** Can handle ACID transactions? */
  transactions: z.boolean().default(false),
  /** Can perform full-text search? */
  fullTextSearch: z.boolean().default(false),
  /** Can perform aggregation (group by, sum, avg)? */
  aggregation: z.boolean().default(false),
  /** Is scheme-less (needs schema inference)? */
  dynamicSchema: z.boolean().default(false),
  /** Is read-only? */
  readOnly: z.boolean().default(false),
});

/**
 * Datasource Schema
 * Represents a connection to an external data store.
 */
export const DatasourceSchema = z.object({
  /** Machine Name */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Unique datasource identifier'),
  
  /** Human Label */
  label: z.string().optional().describe('Display label'),
  
  /** Driver */
  driver: DriverType.describe('Underlying driver type'),
  
  /** 
   * Connection Configuration 
   * Specific to the driver (e.g., host, port, user, password, bucket, etc.)
   * Stored securely (passwords usually interpolated from ENV).
   */
  config: z.record(z.any()).describe('Driver specific configuration'),
  
  /**
   * Capability Overrides
   * Manually override what the driver claims to support.
   */
  capabilities: DatasourceCapabilities.optional().describe('Capability overrides'),
  
  /** Description */
  description: z.string().optional().describe('Internal description'),
  
  /** Is enabled? */
  active: z.boolean().default(true).describe('Is datasource enabled'),
});

export type Datasource = z.infer<typeof DatasourceSchema>;
export type DatasourceConfig = z.infer<typeof DatasourceCapabilities>;

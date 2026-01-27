import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';

/**
 * Datasource Type Enum
 * Supported external data connection types.
 */
export const DatasourceTypeSchema = z.enum([
  'postgres',
  'mysql',
  'sqlserver',
  'oracle',
  'mongodb',
  'redis',
  'elasticsearch',
  'salesforce',
  'sap',
  'http',
  'other'
]);

/**
 * Datasource Protocol
 * 
 * Defines external data connections for the ObjectStack Runtime.
 * Used to virtualize data from SQL, NoSQL, and SaaS providers.
 */
export const DatasourceSchema = z.object({
  /** 
   * Unique machine identifier for the datasource.
   * Used in object definitions to reference this source.
   */
  name: SnakeCaseIdentifierSchema.describe('Unique machine identifier (snake_case)'),

  /** Display label for the datasource */
  label: z.string().optional().describe('Display label'),

  /** Description */
  description: z.string().optional().describe('Description of the data source'),

  /** Connection Type */
  type: DatasourceTypeSchema.describe('Type of data source'),

  /** 
   * Connection Configuration
   * Driver-specific settings (host, port, credentials, connection string).
   * Note: Secrets should be referenced via ENV variables, not hardcoded.
   */
  config: z.record(z.any()).default({}).describe('Driver specific configuration'),

  /** Enable/Disable this datasource */
  enable: z.boolean().default(true).describe('Enable this datasource'),

  /** Read-only mode */
  readOnly: z.boolean().default(false).describe('If true, writes are disabled'),
});

export const Datasource = Object.assign(DatasourceSchema, {
  create: <T extends z.input<typeof DatasourceSchema>>(config: T) => config,
});

export type DatasourceType = z.infer<typeof DatasourceTypeSchema>;
export type Datasource = z.infer<typeof DatasourceSchema>;

import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';
import { DatasourceSchema } from './datasource.zod';
import { AppSchema } from '../ui/app.zod';

/**
 * ObjectStack Manifest Protocol
 * 
 * The root configuration for an ObjectStack Package or Project.
 * Typically defined in `objectstack.config.ts`.
 * 
 * Acts as the entry point for the runtime to discover:
 * - Apps
 * - Datasources
 * - Objects (often referenced within Apps, but can be top-level)
 * - Policies & Permissions
 */
export const ManifestSchema = z.object({
  /** Package Name */
  name: SnakeCaseIdentifierSchema.describe('Package machine name'),

  /** Semantic Version */
  version: z.string().regex(/^\d+\.\d+\.\d+$/).describe('Semantic version (x.y.z)'),

  /** Display Label */
  label: z.string().optional().describe('Package display label'),

  /** Package Description */
  description: z.string().optional().describe('Package description'),

  /** 
   * Included Apps
   * Applications provide the UI and navigation structure.
   */
  apps: z.array(AppSchema).optional().describe('Applications included in this package'),

  /**
   * System Datasources
   * External connections utilized by objects in this package.
   */
  datasources: z.array(DatasourceSchema).optional().describe('Datasources defined in this package'),

  /**
   * Global Configuration
   */
  config: z.record(z.any()).optional().describe('Global package configuration'),
  
  /**
   * Plugins
   * List of plugins to load.
   */
  plugins: z.array(z.string()).optional().describe('List of plugin names (npm packages)'),
});

export const Manifest = Object.assign(ManifestSchema, {
  create: <T extends z.input<typeof ManifestSchema>>(config: T) => config,
});

export type Manifest = z.infer<typeof ManifestSchema>;

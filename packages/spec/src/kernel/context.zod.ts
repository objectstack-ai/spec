import { z } from 'zod';

/**
 * Runtime Mode Enum
 * Defines the operating mode of the kernel
 */
export const RuntimeMode = z.enum([
  'development', // Hot-reload, verbose logging
  'production',  // Optimized, strict security
  'test',        // Mocked interfaces
  'provisioning' // Setup/Migration mode
]).describe('Kernel operating mode');

export type RuntimeMode = z.infer<typeof RuntimeMode>;

/**
 * Kernel Context Schema
 * Defines the static environment information available to the Kernel at boot.
 */
export const KernelContextSchema = z.object({
  /**
   * Instance Identity
   */
  instanceId: z.string().uuid().describe('Unique UUID for this running kernel process'),
  
  /**
   * Environment Metadata
   */
  mode: RuntimeMode.default('production'),
  version: z.string().describe('Kernel version'),
  appName: z.string().optional().describe('Host application name'),
  
  /**
   * Paths
   */
  cwd: z.string().describe('Current working directory'),
  workspaceRoot: z.string().optional().describe('Workspace root if different from cwd'),
  
  /**
   * Telemetry
   */
  startTime: z.number().int().describe('Boot timestamp (ms)'),
  
  /**
   * Feature Flags (Global)
   */
  features: z.record(z.boolean()).default({}).describe('Global feature toggles')
});

export type KernelContext = z.infer<typeof KernelContextSchema>;

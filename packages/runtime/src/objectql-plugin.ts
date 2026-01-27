import { ObjectQL } from '@objectstack/objectql';
import { RuntimePlugin, RuntimeContext } from '@objectstack/types';

/**
 * Symbol to identify ObjectQL plugins
 */
export const OBJECTQL_PLUGIN_MARKER = Symbol('objectql-plugin');

/**
 * ObjectQL Engine Plugin
 * 
 * Registers the ObjectQL engine instance with the kernel.
 * This allows users to provide their own ObjectQL implementation or configuration.
 * 
 * Usage:
 * - new ObjectQLPlugin() - Creates new ObjectQL with default settings
 * - new ObjectQLPlugin(existingQL) - Uses existing ObjectQL instance
 * - new ObjectQLPlugin(undefined, { custom: 'context' }) - Creates new ObjectQL with custom context
 */
export class ObjectQLPlugin implements RuntimePlugin {
  name = 'com.objectstack.engine.objectql';
  
  // Mark this as an ObjectQL plugin for reliable detection
  readonly [OBJECTQL_PLUGIN_MARKER] = true;
  
  private ql: ObjectQL;

  /**
   * @param ql - Existing ObjectQL instance to use (optional)
   * @param hostContext - Host context for new ObjectQL instance (ignored if ql is provided)
   */
  constructor(ql?: ObjectQL, hostContext?: Record<string, any>) {
    if (ql && hostContext) {
      console.warn('[ObjectQLPlugin] Both ql and hostContext provided. hostContext will be ignored.');
    }
    
    if (ql) {
      this.ql = ql;
    } else {
      this.ql = new ObjectQL(hostContext || {
        env: process.env.NODE_ENV || 'development'
      });
    }
  }

  /**
   * Install the ObjectQL engine into the kernel
   */
  async install(ctx: RuntimeContext) {
    // Attach the ObjectQL engine to the kernel
    ctx.engine.ql = this.ql;
    console.log('[ObjectQLPlugin] ObjectQL engine registered');
  }
}

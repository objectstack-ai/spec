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
 */
export class ObjectQLPlugin implements RuntimePlugin {
  name = 'com.objectstack.engine.objectql';
  
  // Mark this as an ObjectQL plugin for reliable detection
  readonly [OBJECTQL_PLUGIN_MARKER] = true;
  
  private ql: ObjectQL;

  constructor(ql?: ObjectQL, hostContext?: Record<string, any>) {
    // Allow passing existing ObjectQL instance or create a new one
    // Note: If 'ql' is provided, 'hostContext' is ignored
    // To create a new instance with custom context, pass only hostContext
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

import { ObjectQL } from '@objectstack/objectql';
import { RuntimePlugin, RuntimeContext } from '@objectstack/types';

/**
 * ObjectQL Engine Plugin
 * 
 * Registers the ObjectQL engine instance with the kernel.
 * This allows users to provide their own ObjectQL implementation or configuration.
 */
export class ObjectQLPlugin implements RuntimePlugin {
  name = 'com.objectstack.engine.objectql';
  
  private ql: ObjectQL;

  constructor(ql?: ObjectQL, hostContext?: Record<string, any>) {
    // Allow passing existing ObjectQL instance or create a new one
    this.ql = ql || new ObjectQL(hostContext || {
      env: process.env.NODE_ENV || 'development'
    });
  }

  /**
   * Install the ObjectQL engine into the kernel
   */
  async install(ctx: RuntimeContext) {
    // Attach the ObjectQL engine to the kernel
    (ctx.engine as any).ql = this.ql;
    console.log('[ObjectQLPlugin] ObjectQL engine registered');
  }
}

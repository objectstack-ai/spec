import { ObjectQL } from '@objectstack/objectql';
import { Plugin, PluginContext, RuntimePlugin, RuntimeContext } from './types';

/**
 * ObjectQL Engine Plugin
 * 
 * Registers the ObjectQL engine instance with the kernel as a service.
 * This allows other plugins to access ObjectQL via context.getService('objectql').
 * 
 * Usage:
 * - new ObjectQLPlugin() - Creates new ObjectQL with default settings
 * - new ObjectQLPlugin(existingQL) - Uses existing ObjectQL instance
 * - new ObjectQLPlugin(undefined, { custom: 'context' }) - Creates new ObjectQL with custom context
 * 
 * Services registered:
 * - 'objectql': ObjectQL engine instance
 */
export class ObjectQLPlugin implements Plugin, RuntimePlugin {
  name = 'com.objectstack.engine.objectql';
  type = 'objectql' as const;
  version = '1.0.0';
  
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
   * Init phase - Register ObjectQL as a service
   */
  async init(ctx: PluginContext) {
    // Register ObjectQL engine as a service
    ctx.registerService('objectql', this.ql);
    ctx.logger.log('[ObjectQLPlugin] ObjectQL engine registered as service');
  }

  /**
   * Start phase - Initialize ObjectQL engine
   */
  async start(ctx: PluginContext) {
    // Initialize the ObjectQL engine
    await this.ql.init();
    ctx.logger.log('[ObjectQLPlugin] ObjectQL engine initialized');
  }

  /**
   * Destroy phase - Cleanup
   */
  async destroy() {
    // ObjectQL doesn't have cleanup yet, but we provide the hook
    console.log('[ObjectQLPlugin] ObjectQL engine destroyed');
  }

  /**
   * Legacy install method for backward compatibility
   * @deprecated Use init/start lifecycle hooks instead
   */
  async install(ctx: RuntimeContext) {
    // Attach the ObjectQL engine to the kernel for backward compatibility
    ctx.engine.ql = this.ql;
    console.log('[ObjectQLPlugin] ObjectQL engine registered (legacy mode)');
  }

  /**
   * Get the ObjectQL instance
   * @returns ObjectQL instance
   */
  getQL(): ObjectQL {
    return this.ql;
  }
}

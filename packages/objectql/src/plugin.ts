import { ObjectQL } from './engine';
import { ObjectStackProtocolImplementation } from './protocol';
import { Plugin, PluginContext } from '@objectstack/core';

export type { Plugin, PluginContext };

export class ObjectQLPlugin implements Plugin {
  name = 'com.objectstack.engine.objectql';
  type = 'objectql' as const;
  version = '1.0.0';
  
  private ql: ObjectQL | undefined;
  private hostContext?: Record<string, any>;

  constructor(ql?: ObjectQL, hostContext?: Record<string, any>) {
    if (ql) {
        this.ql = ql;
    } else {
        this.hostContext = hostContext;
        // Lazily created in init
    }
  }

  async init(ctx: PluginContext) {
    if (!this.ql) {
        this.ql = new ObjectQL(this.hostContext);
    }
    
    ctx.registerService('objectql', this.ql);
    ctx.logger.info('ObjectQL engine registered as service');

    // Register Protocol Implementation
    if (!this.ql) {
        throw new Error('ObjectQL engine not initialized');
    }
    const protocolShim = new ObjectStackProtocolImplementation(this.ql);

    ctx.registerService('protocol', protocolShim);
    ctx.logger.info('Protocol service registered');
  }

  async start(ctx: PluginContext) {
    ctx.logger.info('ObjectQL engine initialized');
    
    // Discover features from Kernel Services
    if (ctx.getServices && this.ql) {
        const services = ctx.getServices();
        for (const [name, service] of services.entries()) {
            if (name.startsWith('driver.')) {
                 // Register Driver
                 this.ql.registerDriver(service);
                 ctx.logger.debug('Discovered and registered driver service', { serviceName: name });
            }
            if (name.startsWith('app.')) {
                // Register App
                this.ql.registerApp(service); // service is Manifest
                ctx.logger.debug('Discovered and registered app service', { serviceName: name });
            }
        }
    }
  }
}

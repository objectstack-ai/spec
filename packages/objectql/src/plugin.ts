import { ObjectQL } from './engine.js';
import { ObjectStackProtocolImplementation } from './protocol.js';
import { Plugin, PluginContext } from '@objectstack/core';

export type { Plugin, PluginContext };

export class ObjectQLPlugin implements Plugin {
  name = 'com.objectstack.engine.objectql';
  type = 'standard';
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

  init = async (ctx: PluginContext) => {
    if (!this.ql) {
        this.ql = new ObjectQL(this.hostContext);
    }
    
    // Register as provider for Core Kernel Services
    ctx.registerService('objectql', this.ql);
    ctx.registerService('metadata', this.ql);
    ctx.registerService('data', this.ql); // ObjectQL implements IDataEngine
    ctx.registerService('auth', this.ql);
    
    ctx.logger.info('ObjectQL engine registered as service', { 
        provides: ['objectql', 'metadata', 'data', 'auth'] 
    });

    // Register Protocol Implementation
    const protocolShim = new ObjectStackProtocolImplementation(this.ql);

    ctx.registerService('protocol', protocolShim);
    ctx.logger.info('Protocol service registered');
  }

  start = async (ctx: PluginContext) => {
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

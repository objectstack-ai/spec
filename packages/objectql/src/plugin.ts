import { ObjectQL } from './engine.js';
import { ObjectStackProtocolImplementation } from './protocol.js';
import { Plugin, PluginContext } from '@objectstack/core';

export type { Plugin, PluginContext };

export class ObjectQLPlugin implements Plugin {
  name = 'com.objectstack.engine.objectql';
  type = 'objectql';
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
        // Pass kernel logger to engine to avoid creating a separate pino instance
        const hostCtx = { ...this.hostContext, logger: ctx.logger };
        this.ql = new ObjectQL(hostCtx);
    }
    
    // Register as provider for Core Kernel Services
    ctx.registerService('objectql', this.ql);
    
    // Respect existing metadata service (e.g. from MetadataPlugin)
    let hasMetadata = false;
    try {
        if (ctx.getService('metadata')) {
            hasMetadata = true;
        }
    } catch (e: any) {
        // Ignore errors during check (e.g. "Service is async")
    }

    if (!hasMetadata) {
        try {
            ctx.registerService('metadata', this.ql);
        } catch (e: any) {
             // Ignore if already registered (race condition or async mis-detection)
             if (!e.message?.includes('already registered')) {
                 throw e;
             }
        }
    }
    
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

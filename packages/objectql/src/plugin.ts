// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

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
    let metadataProvider = 'objectql';
    try {
        if (ctx.getService('metadata')) {
            hasMetadata = true;
            metadataProvider = 'external';
        }
    } catch (e: any) {
        // Ignore errors during check (e.g. "Service is async")
    }

    if (!hasMetadata) {
        try {
            ctx.registerService('metadata', this.ql);
            ctx.logger.info('ObjectQL providing metadata service (fallback mode)', {
                mode: 'in-memory',
                features: ['registry', 'fast-lookup']
            });
        } catch (e: any) {
             // Ignore if already registered (race condition or async mis-detection)
             if (!e.message?.includes('already registered')) {
                 throw e;
             }
        }
    } else {
        ctx.logger.info('External metadata service detected', {
            provider: metadataProvider,
            mode: 'will-sync-in-start-phase'
        });
    }
    
    ctx.registerService('data', this.ql); // ObjectQL implements IDataEngine
    
    ctx.logger.info('ObjectQL engine registered', { 
        services: ['objectql', 'data'],
        metadataProvider: metadataProvider
    });

    // Register Protocol Implementation
    const protocolShim = new ObjectStackProtocolImplementation(
      this.ql, 
      () => ctx.getServices ? ctx.getServices() : new Map()
    );

    ctx.registerService('protocol', protocolShim);
    ctx.logger.info('Protocol service registered');
  }

  start = async (ctx: PluginContext) => {
    ctx.logger.info('ObjectQL engine starting...');
    
    // Check if we should load from external metadata service
    try {
        const metadataService = ctx.getService('metadata') as any;
        if (metadataService && metadataService !== this.ql && this.ql) {
            await this.loadMetadataFromService(metadataService, ctx);
        }
    } catch (e: any) {
        // No external metadata service or error accessing it
        ctx.logger.debug('No external metadata service to sync from');
    }
    
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
    
    ctx.logger.info('ObjectQL engine started', {
        driversRegistered: this.ql?.['drivers']?.size || 0,
        objectsRegistered: this.ql?.registry?.listObjects?.()?.length || 0
    });
  }

  /**
   * Load metadata from external metadata service into ObjectQL registry
   * This enables ObjectQL to use file-based or remote metadata
   */
  private async loadMetadataFromService(metadataService: any, ctx: PluginContext) {
    ctx.logger.info('Syncing metadata from external service into ObjectQL registry...');
    
    // Metadata types to sync
    const metadataTypes = ['object', 'view', 'app', 'flow', 'workflow', 'function'];
    let totalLoaded = 0;
    
    for (const type of metadataTypes) {
        try {
            // Check if service has loadMany method
            if (typeof metadataService.loadMany === 'function') {
                const items = await metadataService.loadMany(type);
                
                if (items && items.length > 0) {
                    items.forEach((item: any) => {
                        // Determine key field (usually 'name' or 'id')
                        const keyField = item.id ? 'id' : 'name';
                        
                        // For objects, use the ownership-aware registration
                        if (type === 'object' && this.ql) {
                            // Objects are registered differently (ownership model)
                            // Skip for now - handled by app registration
                            return;
                        }
                        
                        // Register other types in the registry
                        if (this.ql?.registry?.registerItem) {
                            this.ql.registry.registerItem(type, item, keyField);
                        }
                    });
                    
                    totalLoaded += items.length;
                    ctx.logger.info(`Synced ${items.length} ${type}(s) from metadata service`);
                }
            }
        } catch (e: any) {
            // Type might not exist in metadata service - that's ok
            ctx.logger.debug(`No ${type} metadata found or error loading`, { 
                error: e.message 
            });
        }
    }
    
    if (totalLoaded > 0) {
        ctx.logger.info(`Metadata sync complete: ${totalLoaded} items loaded into ObjectQL registry`);
    }
  }
}

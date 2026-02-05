import { Plugin, PluginContext } from '@objectstack/core';

/**
 * AppPlugin
 * 
 * Adapts a generic App Bundle (Manifest + Runtime Code) into a Kernel Plugin.
 * 
 * Responsibilities:
 * 1. Register App Manifest as a service (for ObjectQL discovery)
 * 2. Execute Runtime `onEnable` hook (for code logic)
 */
export class AppPlugin implements Plugin {
    name: string;
    type = 'app';
    version?: string;
    
    private bundle: any;

    constructor(bundle: any) {
        this.bundle = bundle;
        // Support both direct manifest (legacy) and Stack Definition (nested manifest)
        const sys = bundle.manifest || bundle;
        const appId = sys.id || sys.name || 'unnamed-app';
        
        this.name = `plugin.app.${appId}`;
        this.version = sys.version;
    }

    init = async (ctx: PluginContext) => {
        const sys = this.bundle.manifest || this.bundle;
        const appId = sys.id || sys.name;

        ctx.logger.info('Registering App Service', { 
            appId, 
            pluginName: this.name,
            version: this.version 
        });
        
        // Register the app manifest as a service
        // ObjectQLPlugin will discover this and call ql.registerApp()
        const serviceName = `app.${appId}`;

        // Merge manifest with the bundle to ensure objects/apps are accessible at root
        // This supports both Legacy Manifests and new Stack Definitions
        const servicePayload = this.bundle.manifest 
            ? { ...this.bundle.manifest, ...this.bundle }
            : this.bundle;

        ctx.registerService(serviceName, servicePayload);
    }

    start = async (ctx: PluginContext) => {
        const sys = this.bundle.manifest || this.bundle;
        const appId = sys.id || sys.name;
        
        // Execute Runtime Step
        // Retrieve ObjectQL engine from services
        // We cast to any/ObjectQL because ctx.getService returns unknown
        const ql = ctx.getService('objectql') as any;
        
        if (!ql) {
            ctx.logger.warn('ObjectQL engine service not found', { 
                appName: this.name,
                appId 
            });
            return;
        }

        ctx.logger.debug('Retrieved ObjectQL engine service', { appId });

        const runtime = this.bundle.default || this.bundle;
        
        if (runtime && typeof runtime.onEnable === 'function') {
             ctx.logger.info('Executing runtime.onEnable', { 
                 appName: this.name,
                 appId 
             });
             
             // Construct the Host Context (mirroring old ObjectQL.use logic)
             const hostContext = {
                ...ctx,
                ql,
                logger: ctx.logger,
                drivers: {
                    register: (driver: any) => {
                        ctx.logger.debug('Registering driver via app runtime', { 
                            driverName: driver.name,
                            appId 
                        });
                        ql.registerDriver(driver);
                    }
                },
             };
             
             await runtime.onEnable(hostContext);
             ctx.logger.debug('Runtime.onEnable completed', { appId });
        } else {
             ctx.logger.debug('No runtime.onEnable function found', { appId });
        }
    }
}

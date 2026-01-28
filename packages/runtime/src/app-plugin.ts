import { Plugin, PluginContext } from '@objectstack/core';
import { ObjectQL, ObjectQLHostContext } from '@objectstack/objectql';

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

    async init(ctx: PluginContext) {
        const sys = this.bundle.manifest || this.bundle;
        const appId = sys.id || sys.name;

        ctx.logger?.log(`[AppPlugin] Registering App Service: ${appId}`);
        
        // Register the app manifest as a service
        // ObjectQLPlugin will discover this and call ql.registerApp()
        const serviceName = `app.${appId}`;
        ctx.registerService(serviceName, this.bundle.manifest || this.bundle);
    }

    async start(ctx: PluginContext) {
        // Execute Runtime Step
        // Retrieve ObjectQL engine from services
        // We cast to any/ObjectQL because ctx.getService returns unknown
        const ql = ctx.getService('objectql') as ObjectQL;
        
        if (!ql) {
            ctx.logger?.warn(`[AppPlugin] ObjectQL engine service not found for app: ${this.name}`);
            return;
        }

        const runtime = this.bundle.default || this.bundle;
        
        if (runtime && typeof runtime.onEnable === 'function') {
             ctx.logger?.log(`[AppPlugin] Executing runtime.onEnable for: ${this.name}`);
             
             // Construct the Host Context (mirroring old ObjectQL.use logic)
             const hostContext: ObjectQLHostContext = {
                ql,
                logger: ctx.logger || console,
                drivers: {
                    register: (driver: any) => ql.registerDriver(driver)
                },
                ...ctx
             };
             
             await runtime.onEnable(hostContext);
        }
    }
}

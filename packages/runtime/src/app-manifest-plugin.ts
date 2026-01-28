import { Plugin, PluginContext } from '@objectstack/core';

/**
 * AppManifestPlugin
 * 
 * Adapts a static Manifest JSON into a dynamic Kernel Service.
 * This allows the ObjectQL Engine to "discover" this app during its start phase.
 * 
 * Flow:
 * 1. AppPlugin registers `app.<id>` service (init phase)
 * 2. ObjectQL Engine discovers `app.*` services (start phase)
 */
export class AppManifestPlugin implements Plugin {
    name: string;
    version?: string;
    
    // Dependencies removed: This plugin produces data. It doesn't need to consume the engine to register itself.
    // Making it dependency-free allows it to initialize BEFORE the engine if needed.
    
    private manifest: any;

    constructor(manifest: any) {
        this.manifest = manifest;
        // Support both direct manifest (legacy) and Stack Definition (nested manifest)
        const sys = manifest.manifest || manifest;
        const appId = sys.id || sys.name || 'unnamed-app';
        
        this.name = `plugin.app.${appId}`; // Unique plugin name
        this.version = sys.version;
    }

    async init(ctx: PluginContext) {
        // Support both direct manifest (legacy) and Stack Definition (nested manifest)
        const sys = this.manifest.manifest || this.manifest;
        const appId = sys.id || sys.name;

        ctx.logger.log(`[AppManifestPlugin] Registering App Service: ${appId}`);
        
        // Register the app manifest as a service
        const serviceName = `app.${appId}`;
        ctx.registerService(serviceName, this.manifest);
    }

    async start(ctx: PluginContext) {
        // No logic needed here. 
        // Logic is inverted: The Engine will pull data from this service.
    }
}

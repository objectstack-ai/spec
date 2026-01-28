import { Plugin, PluginContext } from '@objectstack/core';
import { SchemaRegistry, ObjectQL } from './index';

/**
 * AppManifestPlugin
 * 
 * Wraps an ObjectStack app manifest (objectstack.config.ts export) 
 * as a Plugin so it can be loaded in the MiniKernel architecture.
 * 
 * Handles:
 * - Registering the app/plugin in SchemaRegistry
 * - Registering all objects defined in the manifest
 * - Seeding data if provided
 * 
 * Dependencies: ['com.objectstack.engine.objectql']
 */
export class AppManifestPlugin implements Plugin {
    name: string;
    version?: string;
    dependencies = ['com.objectstack.engine.objectql'];
    
    private manifest: any;

    constructor(manifest: any) {
        this.manifest = manifest;
        // Support both direct manifest (legacy) and Stack Definition (nested manifest)
        const sys = manifest.manifest || manifest;
        this.name = sys.id || sys.name || 'unnamed-app';
        this.version = sys.version;
    }

    async init(ctx: PluginContext) {
        // Support both direct manifest (legacy) and Stack Definition (nested manifest)
        const sys = this.manifest.manifest || this.manifest;
        ctx.logger.log(`[AppManifestPlugin] Loading App Manifest: ${sys.id || sys.name}`);
        
        // Register the app manifest as a service
        const serviceName = `app.${sys.id || sys.name}`;
        ctx.registerService(serviceName, this.manifest);
        ctx.logger.log(`[AppManifestPlugin] Registered App service: ${serviceName}`);
    }

    async start(ctx: PluginContext) {
        // Data seeding logic will be handled by the engine when it detects the app
    }
}

import { Plugin, PluginContext } from './plugin'; // Import local minimal context or from core if available?
// Actually ObjectQL probably hasn't added @objectstack/core as dependency yet properly or local imports are preferred.
// Let's use internal types where possible if they exist, OR ensure @objectstack/core is in package.json
// But wait, objectql/src/plugin.ts defines PluginContext locally to avoid circular dep?
// Let's check objectql/package.json
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
        
        // Register the app/plugin in the schema registry
        SchemaRegistry.registerPlugin(sys);
        
        // Register all objects defined in the manifest
        if (this.manifest.objects) {
            for (const obj of this.manifest.objects) {
                SchemaRegistry.registerObject(obj);
                ctx.logger.log(`[AppManifestPlugin] Registered Object: ${obj.name}`);
            }
        }
    }

    async start(ctx: PluginContext) {
        // Seed data if provided
        if (this.manifest.data && Array.isArray(this.manifest.data)) {
            const sys = this.manifest.manifest || this.manifest;
            ctx.logger.log(`[AppManifestPlugin] Seeding data for ${sys.name || sys.id}...`);
            
            const objectql = ctx.getService<ObjectQL>('objectql');
            
            for (const seed of this.manifest.data) {
                try {
                    // Check if data already exists
                    const existing = await objectql.find(seed.object, { top: 1 });
                    if (existing.length === 0) {
                        ctx.logger.log(`[AppManifestPlugin] Inserting ${seed.records.length} records into ${seed.object}`);
                        for (const record of seed.records) {
                            await objectql.insert(seed.object, record);
                        }
                    }
                } catch (e) {
                    ctx.logger.warn(`[AppManifestPlugin] Failed to seed ${seed.object}`, e);
                }
            }
        }
    }
}

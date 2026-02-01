import { Plugin, PluginContext } from '@objectstack/core';
import { MetadataManager } from '@objectstack/metadata';
import { ObjectStackDefinitionSchema } from '@objectstack/spec';
import path from 'path';

export class MetadataPlugin implements Plugin {
    name = 'metadata-loader';
    private manager: MetadataManager;

    constructor(private rootDir: string) {
        this.manager = new MetadataManager({ 
            rootDir: this.rootDir,
            watch: true,
            formats: ['yaml', 'json', 'typescript'] 
        });
    }

    async init(ctx: PluginContext) {
        ctx.logger.info('Initializing Metadata Manager', { root: this.rootDir });
        
        // Register Metadata Manager as a service
        // This allows other plugins to query raw metadata or listen to changes
        ctx.registerService('metadata', this.manager);
    }

    async start(ctx: PluginContext) {
        ctx.logger.info('Loading metadata...');
        
        // Define metadata types directly from the Protocol Definition
        // This ensures the loader is always in sync with the Spec
        const metadataTypes = Object.keys(ObjectStackDefinitionSchema.shape)
            .filter(key => key !== 'manifest'); // Manifest is handled separately

        for (const type of metadataTypes) {
            try {
                // Try to load metadata of this type
                const items = await this.manager.loadMany(type, {
                    recursive: true
                });

                if (items.length > 0) {
                     ctx.logger.info(`Loaded ${items.length} ${type}`);
                     
                     // Helper: Register with ObjectQL if it is an Object
                     if (type === 'objects') {
                        const ql = ctx.getService('objectql');
                        if (ql) {
                            items.forEach((obj: any) => {
                                ql.registry.registerObject(obj.name, obj);
                            });
                        }
                     }
                }
            } catch (e: any) {
                // Ignore missing directories or errors
                ctx.logger.debug(`No metadata found for type: ${type}`);
            }
        }
    }
}

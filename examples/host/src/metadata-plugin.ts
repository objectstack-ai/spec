import { Plugin, PluginContext } from '@objectstack/core';
import { MetadataManager } from '@objectstack/metadata';
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
        
        // Example: Load all objects from the 'objects' directory
        // and register them with the App or ObjectQL service
        // Note: In a real implementation, we would recursively load all supported types
        
        // We can access the ObjectQL service if it's registered
        // const ql = ctx.getService('objectql'); 
    }
}

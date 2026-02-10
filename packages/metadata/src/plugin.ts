// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Plugin, PluginContext } from '@objectstack/core';
import { NodeMetadataManager } from './node-metadata-manager.js';
import { ObjectStackDefinitionSchema } from '@objectstack/spec';

export interface MetadataPluginOptions {
    rootDir?: string;
    watch?: boolean;
}

export class MetadataPlugin implements Plugin {
    name = 'com.objectstack.metadata';
    type = 'standard';
    version = '1.0.0';
    
    private manager: NodeMetadataManager;
    private options: MetadataPluginOptions;

    constructor(options: MetadataPluginOptions = {}) {
        this.options = {
            watch: true,
            ...options
        };

        const rootDir = this.options.rootDir || process.cwd();

        this.manager = new NodeMetadataManager({ 
            rootDir,
            watch: this.options.watch ?? true,
            formats: ['yaml', 'json', 'typescript', 'javascript'] 
        });
    }

    init = async (ctx: PluginContext) => {
        ctx.logger.info('Initializing Metadata Manager', { 
            root: this.options.rootDir || process.cwd(),
            watch: this.options.watch
        });
        
        // Register Metadata Manager as primary metadata service provider
        // This takes precedence over ObjectQL's fallback metadata service
        ctx.registerService('metadata', this.manager);
        ctx.logger.info('MetadataPlugin providing metadata service (primary mode)', {
            mode: 'file-system',
            features: ['watch', 'persistence', 'multi-format']
        });
    }

    start = async (ctx: PluginContext) => {
        ctx.logger.info('Loading metadata from file system...');
        
        // Define metadata types directly from the Protocol Definition
        // This ensures the loader is always in sync with the Spec
        const metadataTypes = Object.keys(ObjectStackDefinitionSchema.shape)
            .filter(key => key !== 'manifest'); // Manifest is handled separately

        let totalLoaded = 0;
        for (const type of metadataTypes) {
            try {
                // Try to load metadata of this type
                const items = await this.manager.loadMany(type, {
                    recursive: true
                });

                if (items.length > 0) {
                     ctx.logger.info(`Loaded ${items.length} ${type} from file system`);
                     totalLoaded += items.length;
                }
            } catch (e: any) {
                // Ignore missing directories or errors
                ctx.logger.debug(`No ${type} metadata found`, { error: e.message });
            }
        }
        
        ctx.logger.info('Metadata loading complete', { 
            totalItems: totalLoaded,
            note: 'ObjectQL will sync these into its registry during its start phase'
        });
    }
}

// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Basic Example: Metadata Service Operations
 * 
 * This example shows the simplest way to use ObjectQL's metadata service
 * to load and save metadata using the IMetadataService interface.
 */

import { ObjectKernel } from '@objectstack/core';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { MetadataPlugin } from '@objectstack/metadata';
import type { View } from '@objectstack/spec/ui';

/**
 * Example 1: Using MetadataPlugin (File-based)
 * 
 * In this mode, metadata is loaded from files and ObjectQL
 * syncs it into its registry.
 */
async function exampleFileBasedMetadata() {
  console.log('\n📁 Example 1: File-based Metadata Service\n');
  
  const kernel = new ObjectKernel({
    appId: 'file-metadata-example',
    name: 'File Metadata Example'
  });
  
  // Register MetadataPlugin BEFORE ObjectQLPlugin
  // This ensures MetadataPlugin provides the metadata service
  kernel.use(new MetadataPlugin({
    rootDir: process.cwd(),
    watch: false,
    formats: ['typescript', 'json', 'yaml']
  }));
  
  kernel.use(new ObjectQLPlugin());
  
  await kernel.bootstrap();
  
  // Get the metadata service (provided by MetadataPlugin)
  const metadataService = kernel.getService('metadata');
  
  console.log('✅ Metadata service initialized (file-based)');
  
  // Load a view definition
  try {
    const viewDef = await metadataService.load<View>('view', 'account_list');
    
    if (viewDef) {
      console.log(`✅ Loaded view: account_list`);
      console.log(`   - List type: ${viewDef.list?.type}`);
      console.log(`   - Columns: ${viewDef.list?.columns?.length || 0}`);
    } else {
      console.log('⚠️  View not found (file may not exist)');
    }
  } catch (error) {
    console.log('⚠️  Error loading view:', (error as Error).message);
  }
  
  // List all available views
  try {
    const viewNames = await metadataService.list('view');
    console.log(`\n📋 Available views: ${viewNames.length}`);
    viewNames.forEach(name => console.log(`   - ${name}`));
  } catch (error) {
    console.log('⚠️  No views directory found');
  }
  
  // Save a new view
  const newView: View = {
    list: {
      type: 'grid',
      columns: ['name', 'status', 'owner'],
      filter: [],
      sort: [{ field: 'name', order: 'asc' }]
    }
  };
  
  try {
    const result = await metadataService.save('view', 'my_custom_view', newView, {
      format: 'json',
      prettify: true
    });
    
    console.log(`\n✅ View saved to: ${result.path}`);
  } catch (error) {
    console.log('⚠️  Error saving view:', (error as Error).message);
  }
}

/**
 * Example 2: Using ObjectQL Only (In-memory)
 * 
 * In this mode, ObjectQL provides the metadata service
 * with in-memory storage (no file persistence).
 */
async function exampleInMemoryMetadata() {
  console.log('\n💾 Example 2: In-memory Metadata Service\n');
  
  const kernel = new ObjectKernel({
    appId: 'memory-metadata-example',
    name: 'Memory Metadata Example'
  });
  
  // Only register ObjectQLPlugin
  // ObjectQL will provide the metadata service (fallback mode)
  kernel.use(new ObjectQLPlugin());
  
  await kernel.bootstrap();
  
  // Get the metadata service (provided by ObjectQL)
  const metadataService = kernel.getService('metadata');
  const objectql = kernel.getService('objectql');
  
  console.log('✅ Metadata service initialized (in-memory)');
  
  // Register metadata programmatically using ObjectQL registry
  const viewDefinition: View = {
    list: {
      type: 'grid',
      columns: ['id', 'name', 'email'],
      filter: [],
      sort: [{ field: 'name', order: 'asc' }]
    }
  };
  
  // Register directly in the registry
  objectql.registry.registerItem('view', {
    name: 'user_list',
    ...viewDefinition
  }, 'name');
  
  console.log('✅ View registered in memory: user_list');
  
  // Load from registry
  const loaded = objectql.registry.getItem('view', 'user_list');
  
  if (loaded) {
    console.log(`✅ Loaded view from registry: user_list`);
    console.log(`   - Type: ${loaded.list?.type}`);
    console.log(`   - Columns: ${loaded.list?.columns?.join(', ')}`);
  }
  
  // List all views in registry
  const allViews = objectql.registry.listItems('view');
  console.log(`\n📋 Views in registry: ${allViews.length}`);
  allViews.forEach((view: any) => console.log(`   - ${view.name}`));
}

/**
 * Example 3: Accessing Metadata via Service Interface
 * 
 * Shows the standard IMetadataService interface that works
 * with both file-based and in-memory modes.
 */
async function exampleMetadataServiceInterface() {
  console.log('\n🔌 Example 3: Metadata Service Interface\n');
  
  const kernel = new ObjectKernel({
    appId: 'interface-example',
    name: 'Interface Example'
  });
  
  kernel.use(new ObjectQLPlugin());
  await kernel.bootstrap();
  
  const metadataService = kernel.getService('metadata');
  
  console.log('📋 IMetadataService Interface Methods:');
  console.log('   - load<T>(type, name): Load single item');
  console.log('   - loadMany<T>(type): Load all items of type');
  console.log('   - save<T>(type, name, data): Save item');
  console.log('   - exists(type, name): Check existence');
  console.log('   - list(type): List all names');
  
  // Example: Check if a view exists
  const exists = await metadataService.exists('view', 'account_list');
  console.log(`\n✅ View 'account_list' exists: ${exists}`);
  
  // Example: Load multiple views
  try {
    const views = await metadataService.loadMany<View>('view');
    console.log(`✅ Loaded ${views.length} views`);
  } catch (error) {
    console.log('⚠️  No views available');
  }
}

/**
 * Main entry point
 */
async function main() {
  console.log('🚀 ObjectQL Metadata Service - Basic Examples\n');
  console.log('='.repeat(60));
  
  try {
    await exampleFileBasedMetadata();
  } catch (error) {
    console.error('Error in file-based example:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  
  try {
    await exampleInMemoryMetadata();
  } catch (error) {
    console.error('Error in in-memory example:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  
  try {
    await exampleMetadataServiceInterface();
  } catch (error) {
    console.error('Error in interface example:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ All examples complete!\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export {
  exampleFileBasedMetadata,
  exampleInMemoryMetadata,
  exampleMetadataServiceInterface
};

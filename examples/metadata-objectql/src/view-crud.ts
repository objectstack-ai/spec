// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Example: Using ObjectQL to Load and Save View Metadata
 * 
 * This example demonstrates how to use ObjectQL's metadata service
 * to perform CRUD operations on view definitions stored in a database.
 */

import { ObjectKernel } from '@objectstack/core';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { ListView, ViewSchema } from '@objectstack/spec/ui';
import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * Step 1: Setup ObjectQL with Database Driver
 * 
 * ObjectQL needs a database driver to persist metadata.
 * In this example, we use InMemoryDriver for simplicity.
 * In production, you'd use PostgresDriver, MySQLDriver, etc.
 */
async function setupObjectQL() {
  const kernel = new ObjectKernel({
    appId: 'metadata-example',
    name: 'Metadata Example'
  });
  
  // Register ObjectQL plugin
  kernel.use(new ObjectQLPlugin());
  
  // Bootstrap kernel to initialize all plugins
  await kernel.bootstrap();
  
  // Get ObjectQL engine instance
  const objectql = kernel.getService('objectql');
  
  // Register database driver
  const driver = new InMemoryDriver();
  objectql.registerDriver(driver);
  objectql.setDefaultDriver('memory');
  
  console.log('✅ ObjectQL setup complete');
  
  return { kernel, objectql, metadataService: objectql };
}

/**
 * Step 2: Define Metadata Storage Objects
 * 
 * To store metadata in the database, we need to define
 * the metadata storage objects (tables).
 */
function defineMetadataObjects(objectql: any) {
  // Define the sys_view object to store view metadata
  const SysView = ObjectSchema.create({
    name: 'sys_view',
    label: 'View Metadata',
    description: 'Stores UI view definitions',
    
    fields: {
      name: Field.text({
        label: 'View Name',
        required: true,
        unique: true,
        description: 'Unique identifier for the view (snake_case)'
      }),
      
      object_name: Field.text({
        label: 'Object Name',
        required: true,
        description: 'The object this view is for'
      }),
      
      label: Field.text({
        label: 'Label',
        description: 'Display label for the view'
      }),
      
      type: Field.select(['grid', 'kanban', 'calendar', 'timeline', 'gantt'], {
        label: 'View Type',
        required: true,
        defaultValue: 'grid'
      }),
      
      definition: Field.json({
        label: 'View Definition',
        required: true,
        description: 'Full view configuration as JSON'
      }),
      
      is_default: Field.boolean({
        label: 'Is Default',
        defaultValue: false,
        description: 'Whether this is the default view for the object'
      }),
      
      owner: Field.lookup('user', {
        label: 'Owner',
        description: 'User who created this view'
      }),
      
      is_public: Field.boolean({
        label: 'Is Public',
        defaultValue: true,
        description: 'Whether this view is visible to all users'
      }),
    },
    
    indexes: [
      { fields: ['name'], unique: true },
      { fields: ['object_name'], unique: false },
    ],
    
    enable: {
      trackHistory: true,
      apiEnabled: true,
    }
  });
  
  // Register the metadata object
  objectql.registerObject(SysView);
  
  console.log('✅ Metadata storage objects defined');
}

/**
 * Step 3: Save View Metadata to Database
 * 
 * Demonstrates how to persist a view definition to the database
 * using ObjectQL's data engine.
 */
async function saveViewMetadata(objectql: any, viewName: string, objectName: string, viewDefinition: ListView) {
  console.log(`\n📝 Saving view metadata: ${viewName}`);
  
  // Validate the view definition against the schema
  const validatedView = ViewSchema.parse({ list: viewDefinition });
  
  // Prepare the metadata record
  const viewRecord = {
    name: viewName,
    object_name: objectName,
    label: viewDefinition.label || viewName,
    type: viewDefinition.type || 'grid',
    definition: viewDefinition, // Store full definition as JSON
    is_default: false,
    is_public: true,
  };
  
  try {
    // Check if view already exists
    const existing = await objectql.findOne('sys_view', {
      filters: [['name', '=', viewName]]
    });
    
    if (existing) {
      // Update existing view
      const result = await objectql.update('sys_view', existing._id, viewRecord);
      console.log(`✅ View updated: ${viewName} (ID: ${result._id})`);
      return result;
    } else {
      // Insert new view
      const result = await objectql.insert('sys_view', viewRecord);
      console.log(`✅ View created: ${viewName} (ID: ${result._id})`);
      return result;
    }
  } catch (error) {
    console.error(`❌ Error saving view: ${error}`);
    throw error;
  }
}

/**
 * Step 4: Load View Metadata from Database
 * 
 * Demonstrates how to retrieve a view definition from the database.
 */
async function loadViewMetadata(objectql: any, viewName: string): Promise<ListView | null> {
  console.log(`\n📖 Loading view metadata: ${viewName}`);
  
  try {
    const result = await objectql.findOne('sys_view', {
      filters: [['name', '=', viewName]]
    });
    
    if (!result) {
      console.log(`⚠️  View not found: ${viewName}`);
      return null;
    }
    
    console.log(`✅ View loaded: ${viewName}`);
    
    // Extract and validate the view definition
    const viewDefinition = result.definition;
    
    // Optionally validate against schema
    const validated = ViewSchema.parse({ list: viewDefinition });
    
    return validated.list!;
  } catch (error) {
    console.error(`❌ Error loading view: ${error}`);
    throw error;
  }
}

/**
 * Step 5: List All Views for an Object
 * 
 * Query all views associated with a specific object.
 */
async function listViewsForObject(objectql: any, objectName: string): Promise<any[]> {
  console.log(`\n📋 Listing views for object: ${objectName}`);
  
  try {
    const results = await objectql.find('sys_view', {
      filters: [['object_name', '=', objectName]],
      sort: [{ field: 'name', order: 'asc' }]
    });
    
    console.log(`✅ Found ${results.length} views for ${objectName}`);
    
    return results;
  } catch (error) {
    console.error(`❌ Error listing views: ${error}`);
    throw error;
  }
}

/**
 * Step 6: Delete View Metadata
 * 
 * Remove a view definition from the database.
 */
async function deleteViewMetadata(objectql: any, viewName: string): Promise<boolean> {
  console.log(`\n🗑️  Deleting view metadata: ${viewName}`);
  
  try {
    const existing = await objectql.findOne('sys_view', {
      filters: [['name', '=', viewName]]
    });
    
    if (!existing) {
      console.log(`⚠️  View not found: ${viewName}`);
      return false;
    }
    
    await objectql.delete('sys_view', existing._id);
    console.log(`✅ View deleted: ${viewName}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error deleting view: ${error}`);
    throw error;
  }
}

/**
 * Main Example
 * 
 * Demonstrates the complete workflow of managing view metadata with ObjectQL.
 */
async function main() {
  console.log('🚀 ObjectQL View Metadata Example\n');
  
  // Step 1: Setup ObjectQL
  const { objectql } = await setupObjectQL();
  
  // Step 2: Define metadata storage objects
  defineMetadataObjects(objectql);
  
  // Step 3: Create sample view definitions
  const accountListView: ListView = {
    name: 'all_accounts',
    label: 'All Accounts',
    type: 'grid',
    columns: ['name', 'industry', 'annual_revenue', 'owner', 'created_at'],
    filter: [],
    sort: [{ field: 'name', order: 'asc' }],
    searchableFields: ['name', 'industry'],
    pagination: {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100]
    },
    selection: {
      type: 'multiple'
    }
  };
  
  const accountKanbanView: ListView = {
    name: 'accounts_by_stage',
    label: 'Accounts by Stage',
    type: 'kanban',
    columns: ['name', 'annual_revenue'],
    kanban: {
      groupByField: 'stage',
      summarizeField: 'annual_revenue',
      columns: ['name', 'owner', 'annual_revenue']
    }
  };
  
  // Step 4: Save views to database
  await saveViewMetadata(objectql, 'all_accounts', 'account', accountListView);
  await saveViewMetadata(objectql, 'accounts_by_stage', 'account', accountKanbanView);
  
  // Step 5: Load a view from database
  const loadedView = await loadViewMetadata(objectql, 'all_accounts');
  if (loadedView) {
    console.log('\n📄 Loaded View Definition:', JSON.stringify(loadedView, null, 2));
  }
  
  // Step 6: List all views for an object
  const accountViews = await listViewsForObject(objectql, 'account');
  console.log('\n📊 Account Views:');
  accountViews.forEach((view, index) => {
    console.log(`  ${index + 1}. ${view.name} (${view.type}): ${view.label}`);
  });
  
  // Step 7: Update a view
  const updatedView: ListView = {
    ...accountListView,
    label: 'All Accounts (Updated)',
    columns: ['name', 'industry', 'annual_revenue', 'owner', 'created_at', 'updated_at'],
  };
  await saveViewMetadata(objectql, 'all_accounts', 'account', updatedView);
  
  // Step 8: Delete a view
  await deleteViewMetadata(objectql, 'accounts_by_stage');
  
  // Verify deletion
  const remainingViews = await listViewsForObject(objectql, 'account');
  console.log(`\n✅ Remaining views after deletion: ${remainingViews.length}`);
  
  console.log('\n✅ Example complete!');
}

// Run the example
if (require.main === module) {
  main().catch(error => {
    console.error('Error running example:', error);
    process.exit(1);
  });
}

export {
  setupObjectQL,
  defineMetadataObjects,
  saveViewMetadata,
  loadViewMetadata,
  listViewsForObject,
  deleteViewMetadata
};

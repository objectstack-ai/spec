// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Migration Example: From File-based to Database-driven Metadata
 * 
 * This example demonstrates how to migrate metadata from filesystem
 * to a database-driven approach while maintaining compatibility.
 */

import { ObjectKernel } from '@objectstack/core';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { MetadataPlugin } from '@objectstack/metadata';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { ObjectSchema, Field } from '@objectstack/spec/data';
import type { View } from '@objectstack/spec/ui';

/**
 * Step 1: Define metadata storage schema
 */
function defineMetadataSchema(objectql: any) {
  // Generic metadata table that can store any type
  const SysMetadata = ObjectSchema.create({
    name: 'sys_metadata',
    label: 'System Metadata',
    description: 'Generic metadata storage for all types',
    
    fields: {
      type: Field.text({
        label: 'Metadata Type',
        required: true,
        description: 'Type of metadata (object, view, app, etc.)'
      }),
      
      name: Field.text({
        label: 'Name',
        required: true,
        description: 'Unique name within the type'
      }),
      
      data: Field.json({
        label: 'Data',
        required: true,
        description: 'Full metadata definition as JSON'
      }),
      
      version: Field.number({
        label: 'Version',
        defaultValue: 1,
        description: 'Version number for tracking changes'
      }),
      
      source: Field.select(['filesystem', 'database', 'api', 'migration'], {
        label: 'Source',
        defaultValue: 'database',
        description: 'Where this metadata originated'
      }),
      
      checksum: Field.text({
        label: 'Checksum',
        description: 'MD5 hash of data for change detection'
      }),
      
      is_active: Field.boolean({
        label: 'Is Active',
        defaultValue: true,
        description: 'Whether this metadata is currently active'
      }),
      
      tags: Field.multiSelect(['system', 'custom', 'app', 'shared'], {
        label: 'Tags',
        description: 'Classification tags'
      }),
    },
    
    indexes: [
      { fields: ['type', 'name'], unique: true },
      { fields: ['type', 'is_active'], unique: false },
    ],
    
    enable: {
      trackHistory: true,
      apiEnabled: true,
    }
  });
  
  objectql.registerObject(SysMetadata);
  console.log('✅ Metadata storage schema defined');
}

/**
 * Step 2: Load metadata from filesystem
 */
async function loadFromFilesystem(rootDir: string): Promise<Map<string, any[]>> {
  console.log('\n📁 Loading metadata from filesystem...');
  
  const kernel = new ObjectKernel({
    appId: 'migration-loader',
    name: 'Migration Loader'
  });
  
  // Use MetadataPlugin to load from files
  kernel.use(new MetadataPlugin({
    rootDir,
    watch: false,
    formats: ['typescript', 'json', 'yaml']
  }));
  
  await kernel.bootstrap();
  
  const metadataService = kernel.getService('metadata');
  
  // Metadata types to migrate
  const types = ['object', 'view', 'app', 'flow', 'dashboard'];
  const metadata = new Map<string, any[]>();
  
  for (const type of types) {
    try {
      const items = await metadataService.loadMany(type);
      if (items && items.length > 0) {
        metadata.set(type, items);
        console.log(`   ✅ Loaded ${items.length} ${type}(s)`);
      }
    } catch (error) {
      console.log(`   ⚠️  No ${type} metadata found`);
    }
  }
  
  return metadata;
}

/**
 * Step 3: Save metadata to database
 */
async function saveToDatabase(objectql: any, metadata: Map<string, any[]>) {
  console.log('\n💾 Saving metadata to database...');
  
  let totalSaved = 0;
  
  for (const [type, items] of metadata.entries()) {
    console.log(`\n   Processing ${type}...`);
    
    for (const item of items) {
      // Calculate checksum for change detection
      const dataStr = JSON.stringify(item);
      const checksum = require('crypto')
        .createHash('md5')
        .update(dataStr)
        .digest('hex');
      
      const record = {
        type,
        name: item.name || item.id,
        data: item,
        version: 1,
        source: 'migration' as const,
        checksum,
        is_active: true,
        tags: ['migrated'],
      };
      
      try {
        // Check if already exists
        const existing = await objectql.findOne('sys_metadata', {
          filters: [
            ['type', '=', type],
            ['name', '=', record.name]
          ]
        });
        
        if (existing) {
          // Update if checksum different
          if (existing.checksum !== checksum) {
            await objectql.update('sys_metadata', existing._id, {
              ...record,
              version: existing.version + 1
            });
            console.log(`      ↻ Updated: ${record.name}`);
          } else {
            console.log(`      ✓ Skipped: ${record.name} (unchanged)`);
          }
        } else {
          // Insert new
          await objectql.insert('sys_metadata', record);
          console.log(`      ✓ Inserted: ${record.name}`);
        }
        
        totalSaved++;
      } catch (error) {
        console.error(`      ✗ Error saving ${record.name}:`, (error as Error).message);
      }
    }
  }
  
  console.log(`\n✅ Migration complete: ${totalSaved} items processed`);
}

/**
 * Step 4: Create hybrid metadata service
 * 
 * This service can read from database but fall back to filesystem
 */
class HybridMetadataService {
  constructor(
    private objectql: any,
    private fileService: any
  ) {}
  
  async load<T>(type: string, name: string): Promise<T | null> {
    // Try database first
    try {
      const result = await this.objectql.findOne('sys_metadata', {
        filters: [
          ['type', '=', type],
          ['name', '=', name],
          ['is_active', '=', true]
        ]
      });
      
      if (result) {
        console.log(`   ✅ Loaded ${type}:${name} from database`);
        return result.data as T;
      }
    } catch (error) {
      console.log(`   ⚠️  Database lookup failed, trying filesystem...`);
    }
    
    // Fall back to filesystem
    const item = await this.fileService.load<T>(type, name);
    if (item) {
      console.log(`   ✅ Loaded ${type}:${name} from filesystem`);
    }
    
    return item;
  }
  
  async loadMany<T>(type: string): Promise<T[]> {
    const results: T[] = [];
    
    // Load from database
    try {
      const dbResults = await this.objectql.find('sys_metadata', {
        filters: [
          ['type', '=', type],
          ['is_active', '=', true]
        ]
      });
      
      results.push(...dbResults.map((r: any) => r.data));
      console.log(`   ✅ Loaded ${dbResults.length} ${type}(s) from database`);
    } catch (error) {
      console.log(`   ⚠️  Database query failed`);
    }
    
    // Merge with filesystem (deduplicating by name)
    try {
      const fileResults = await this.fileService.loadMany<T>(type);
      const existingNames = new Set(results.map((r: any) => r.name || r.id));
      
      for (const item of fileResults) {
        const itemName = (item as any).name || (item as any).id;
        if (!existingNames.has(itemName)) {
          results.push(item);
        }
      }
    } catch (error) {
      // Ignore filesystem errors
    }
    
    return results;
  }
  
  async save<T>(type: string, name: string, data: T): Promise<any> {
    // Always save to database
    const checksum = require('crypto')
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');
    
    const existing = await this.objectql.findOne('sys_metadata', {
      filters: [
        ['type', '=', type],
        ['name', '=', name]
      ]
    });
    
    const record = {
      type,
      name,
      data,
      source: 'api' as const,
      checksum,
      is_active: true,
    };
    
    if (existing) {
      return await this.objectql.update('sys_metadata', existing._id, {
        ...record,
        version: existing.version + 1
      });
    } else {
      return await this.objectql.insert('sys_metadata', record);
    }
  }
}

/**
 * Main migration workflow
 */
async function main() {
  console.log('🚀 Metadata Migration: Filesystem → Database\n');
  console.log('='.repeat(60));
  
  // Setup target database
  const kernel = new ObjectKernel({
    appId: 'metadata-migration',
    name: 'Metadata Migration'
  });
  
  kernel.use(new ObjectQLPlugin());
  await kernel.bootstrap();
  
  const objectql = kernel.getService('objectql');
  
  // Register database driver
  const driver = new InMemoryDriver();
  objectql.registerDriver(driver);
  objectql.setDefaultDriver('memory');
  
  // Define metadata storage schema
  defineMetadataSchema(objectql);
  
  // Load from filesystem (if directory exists)
  const rootDir = process.env.METADATA_DIR || process.cwd();
  console.log(`\nSource directory: ${rootDir}`);
  
  let metadata: Map<string, any[]>;
  try {
    metadata = await loadFromFilesystem(rootDir);
  } catch (error) {
    console.log('\n⚠️  No filesystem metadata found, using sample data');
    
    // Create sample metadata for demonstration
    metadata = new Map();
    metadata.set('view', [
      {
        name: 'sample_list',
        list: {
          type: 'grid',
          columns: ['name', 'status'],
          filter: []
        }
      }
    ]);
  }
  
  // Save to database
  await saveToDatabase(objectql, metadata);
  
  // Test hybrid service
  console.log('\n' + '='.repeat(60));
  console.log('\n🔄 Testing Hybrid Metadata Service\n');
  
  const fileService = { 
    load: async () => null, 
    loadMany: async () => [] 
  };
  
  const hybridService = new HybridMetadataService(objectql, fileService);
  
  // Test loading
  const views = await hybridService.loadMany<View>('view');
  console.log(`\n✅ Hybrid service loaded ${views.length} views`);
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Migration complete!\n');
  console.log('💡 Benefits of database-driven metadata:');
  console.log('   - Multi-tenant isolation');
  console.log('   - Real-time updates without deployment');
  console.log('   - Full audit trail with history tracking');
  console.log('   - Advanced querying and filtering');
  console.log('   - Programmatic metadata generation\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

export {
  defineMetadataSchema,
  loadFromFilesystem,
  saveToDatabase,
  HybridMetadataService
};

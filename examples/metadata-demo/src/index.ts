import { MetadataManager } from '@objectstack/metadata';
import * as path from 'node:path';
// import { fileURLToPath } from 'node:url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../metadata');

async function main() {
  console.log('🚀 Starting Metadata Demo...');
  console.log(`📂 Root Directory: ${rootDir}`);

  // 1. Initialize Manager
  const manager = new MetadataManager({
    rootDir,
    formats: ['json', 'yaml', 'typescript'],
    watch: false
  });

  // 2. List initial items
  console.log('\n2. Listing "object" items:');
  const objects = await manager.list('object');
  console.log('   Found:', objects);

  // 3. Load an item
  console.log('\n3. Loading "demo_object":');
  const demoObject = await manager.load('object', 'demo_object');
  console.log('   Loaded:', demoObject?.label);

  if (demoObject) {
    // 4. Modify and Save (Update)
    console.log('\n4. Updating "demo_object" (adding description)...');
    demoObject.description = `Updated at ${new Date().toISOString()}`;
    
    // Explicitly using filesystem loader, using atomic writes
    const saveResult = await manager.save('object', 'demo_object', demoObject, {
      loader: 'filesystem',
      atomic: true,
      backup: true // Create .bak file
    });
    console.log('   Save Result:', saveResult.success ? 'Success' : 'Failed');
    console.log('   Path:', saveResult.path);
  }

  // 5. Create a NEW item programmatically
  console.log('\n5. Creating new "generated_object"...');
  const newObject = {
    name: 'generated_object',
    label: 'Generated Object',
    type: 'object',
    fields: {
      auto_field: { type: 'text' }
    }
  };

  const createResult = await manager.save('object', 'generated_object', newObject, {
    format: 'yaml', // Save as YAML
    create: true
  });
  console.log('   Created Result:', createResult.success ? 'Success' : 'Failed');
  console.log('   Path:', createResult.path);

  // 6. Verify List again
  console.log('\n6. Final List:');
  const finalObjects = await manager.list('object');
  console.log('   Found:', finalObjects);
}

main().catch(console.error);

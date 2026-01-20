import { ObjectStackClient } from '@objectstack/client-sdk';

async function main() {
  console.log('🚀 Starting Client SDK Test...');

  // 1. Initialize Client
  const client = new ObjectStackClient({
    baseUrl: 'http://localhost:3004'
  });

  try {
    // 2. Connect (Auto-Discovery)
    console.log('🔌 Connecting to server...');
    await client.connect();
    console.log('✅ Connected! Discovery complete.');

    // 3. Get Metadata
    console.log('🔍 Fetching Object Metadata for "todo_task"...');
    const objectMeta = await client.meta.getObject('todo_task');
    console.log(`📋 Object Label: ${objectMeta.label}`);

    // 4. Query Data
    console.log('💾 Querying Data...');
    const result = await client.data.find('todo_task', {});
    
    console.log(`🎉 Found ${result.data.length} tasks:`);
    result.data.forEach((task: any) => {
      console.log(` - [${task.status}] ${task.title}`);
    });

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

main();

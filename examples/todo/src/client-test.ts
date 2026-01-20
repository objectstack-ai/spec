import { ObjectStackClient } from '@objectstack/client-sdk';

async function main() {
  console.log('🚀 Starting Client SDK Test...');

  // 1. Initialize Client
  const client = new ObjectStackClient({
    baseUrl: 'http://127.0.0.1:3004'
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
    const result = await client.data.find('todo_task', {
       top: 10,
       sort: 'status'
    });
    
    console.log(`🎉 Found ${result.count} tasks:`);
    result.value.forEach((task: any) => {
      console.log(` - [${task.is_completed ? 'x' : ' '}] ${task.subject} (Priority: ${task.priority})`);
    });

    // 5. CRUD Operations
    console.log('\n✨ Creating new task...');
    const newTask = await client.data.create('todo_task', {
      subject: 'Test SDK Create',
      is_completed: false,
      priority: 3
    });
    console.log('✅ Created:', newTask);

    // Update
    if (newTask && (newTask as any).id) {
       console.log('🔄 Updating task...');
       const updated = await client.data.update('todo_task', (newTask as any).id, {
         subject: 'Test SDK Create (Updated)',
         is_completed: true
       });
       console.log('✅ Updated:', updated);

       // Delete
       console.log('🗑️ Deleting task...');
       const deleted = await client.data.delete('todo_task', (newTask as any).id);
       console.log('✅ Deleted:', deleted);
    }


  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

main();

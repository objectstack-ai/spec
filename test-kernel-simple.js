const { ObjectKernel, ObjectQLPlugin } = require('./packages/runtime/dist/index.js');

async function test() {
    console.log('🧪 Testing MiniKernel...\n');
    
    const kernel = new ObjectKernel();
    kernel.use(new ObjectQLPlugin());
    
    console.log('Bootstrapping kernel...');
    await kernel.bootstrap();
    
    console.log('Getting ObjectQL service...');
    const objectql = kernel.getService('objectql');
    console.log('✅ ObjectQL service available:', !!objectql);
    
    console.log('Shutting down kernel...');
    await kernel.shutdown();
    
    console.log('\n✅ Test passed!\n');
}

test().catch(console.error);

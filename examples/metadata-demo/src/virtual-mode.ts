import { MetadataManager, MemoryLoader } from '@objectstack/metadata';
import * as path from 'node:path';

// 模拟项目的元数据目录
const PROJECT_ROOT = path.resolve(process.cwd(), 'examples/metadata-demo/metadata');

async function main() {
  console.log('🤖 启动内存虚拟模式演示 (Virtual Save)');
  console.log('💡 所有更改仅在内存中生效，重启服务或脚本即失效。\n');

  // 1. 初始化管理器
  const manager = new MetadataManager({
    rootDir: PROJECT_ROOT,
    formats: ['json', 'yaml']
  });

  // 2. 核心步骤：注册 MemoryLoader，并设置为"优先"
  // 注意：MetadataManager 遍历 loader 的顺序决定了读取优先级
  // 所以我们需要把 memory loader 放在前面，或者利用 save({ loader: 'memory' })
  
  // 在当前实现中，manager.loaders 是 Map，保持插入顺序。
  // FilesystemLoader 在构造函数中已被添加。我们添加 MemoryLoader 到末尾。
  // 但是，我们可以手动指定 loader 来保存。
  
  // 更好的方式：创建一个新的 manager实例，手动控制 loader 注册顺序（如果 MetadataManager API 支持清空或自定义的话）
  // 这里我们直接注册，并在保存时显式指定 'memory'。
  // 读取时，MetadataManager 会遍历所有 loader，如果 MemoryLoader 在 Map 中（即使在后），
  // 只要它的 `load` 方法返回数据，通常我们会接受。
  // *注意*：当前 MetadataManager.load 实现是 "iterate and return first found"。
  // 如果 Filesystem 里有同名文件，它可能会因为 FilesystemLoader 先注册而被先读取。
  // 为了实现 "Memory Override" (Shadowing)，我们需要 MemoryLoader 排在 FilesystemLoader 之前。
  
  // HACK: 为了演示效果，我们重新注册 loaders 来调整顺序
  // (在实际生产代码中，应该在构造 MetadataManager 时通过配置传入 loaders 列表，目前 API 可能还不完全支持)
  // 我们手动创建一个 MemoryLoader
  const memoryLoader = new MemoryLoader();
  
  // 我们可以通过这种方式 hack 顺序 (不推荐但在演示中有效，或者修改 MetadataManager 支持 prepend)
  // 这里我们演示 "显式指定 storage" 的方式
  manager.registerLoader(memoryLoader); 

  // 3. 读取一个已存在的文件系统对象
  console.log('📚 读取文件系统中的 "demo_object"...');
  const fsObject = await manager.load('object', 'demo_object');
  console.log(`   原始 Label: ${fsObject?.label}`);

  // 4. 进行 "虚拟修改"
  if (fsObject) {
    console.log('\n✏️  正在进行虚拟修改 (修改 Label 为 "VIRTUAL OBJECT")...');
    const virtualObject = { ...fsObject, label: 'VIRTUAL OBJECT (Memory Only)' };

    // 保存到内存
    await manager.save('object', 'demo_object', virtualObject, {
      loader: 'memory' // <--- 关键：指定保存到内存
    });
    console.log('   ✅ 已保存到内存缓存');
  }

  // 5. 验证：尝试读取
  // 注意：因为 MetadataManager 默认按注册顺序读取，Filesystem 先注册。
  // 如果我们想读取内存版本，要么指定 loader，要么 MemoryLoader 需要在 Filesystem 之前。
  // 当前 API load() 没有 loader 参数。
  // 让我们测试一下 load() 是否能读到。如果不能，说明需要调整 Loader 顺序策略。
  
  console.log('\n🔍 尝试读取 "demo_object"...');
  console.log('   (注意：如果 MetadataManager 优先读取了文件系统，这里可能看不到变化)');
  const loaded = await manager.load('object', 'demo_object');
  console.log(`   当前 Label: ${loaded?.label}`);

  // 6. 专门从内存读取验证
  const memLoader = (manager as any).loaders.get('memory');
  const memObj = await memLoader.load('object', 'demo_object');
  console.log(`\n🕵️  直接从 MemoryLoader 读取:`);
  console.log(`   Label: ${memObj.data?.label}`);

  // 7. 新建一个只有内存里有的对象
  console.log('\n✨ 创建纯内存对象 "ghost_view"...');
  await manager.save('view', 'ghost_view', { label: 'Ghost View' }, { loader: 'memory' });
  
  const ghostList = await manager.list('view');
  console.log(`   全局 List (View): ${ghostList.includes('ghost_view') ? '包含 ghost_view' : '未找到'}`);

  console.log('\n🛑 演示结束。脚本退出后，这些内存数据将消失。');
}

main().catch(console.error);

import { NodeMetadataManager } from '@objectstack/metadata/node';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

// 模拟用户的项目根目录
const PROJECT_ROOT = path.resolve(process.cwd(), 'examples/metadata-demo/my-app');

async function main() {
  console.log('🏁 启动本地文件系统模式演示');
  console.log(`📂 项目目录: ${PROJECT_ROOT}`);

  // 1. 初始化管理器，指向项目根目录
  // NodeMetadataManager 会自动在这个目录下寻找 `objects`, `views`, `apps` 等子目录
  const manager = new NodeMetadataManager({
    rootDir: path.join(PROJECT_ROOT, 'src'), // 假设元数据在 src 下
    formats: ['yaml', 'json'],               // 优先使用 YAML
    watch: true                              // 开启监听
  });

  // 2. 模拟用户在 UI 上创建了一个新的 "客户列表视图"
  const newView = {
    name: 'all_customers',
    label: 'All Customers',
    type: 'view',
    object: 'customer',
    filter: [['status', '=', 'active']],
    columns: ['name', 'company', 'email', 'phone']
  };

  console.log('\n💾 正在保存视图 "all_customers"...');
  
  // 3. 调用 save 方法
  // 不需要指定路径，Manager 会根据 type='view' 自动路由到 `src/views/` 目录
  const result = await manager.save('view', 'all_customers', newView, {
    format: 'yaml', // 强制保存为 YAML，更易读
    create: true
  });

  if (result.success) {
    console.log(`✅ 保存成功!`);
    console.log(`📍 文件路径: ${result.path}`);
    
    // 验证文件内容
    const content = await fs.readFile(result.path!, 'utf-8');
    console.log('\n📄 文件内容 preview:');
    console.log('-------------------');
    console.log(content);
    console.log('-------------------');
  }

  // 4. 读取验证
  const loaded = await manager.load('view', 'all_customers');
  console.log(`\n🔍 从硬盘重新读取: [${loaded.label}] (过滤条件: ${loaded.filter})`);

  // 清理演示文件
  await manager.stopWatching();
}

main().catch(console.error);

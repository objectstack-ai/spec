import { describe, it, expect, vi } from 'vitest';
import { DevPlugin } from './dev-plugin';

describe('DevPlugin', () => {
  it('should have correct metadata', () => {
    const plugin = new DevPlugin();
    expect(plugin.name).toBe('com.objectstack.plugin.dev');
    expect(plugin.type).toBe('standard');
    expect(plugin.version).toBe('1.0.0');
  });

  it('should accept default options', () => {
    const plugin = new DevPlugin();
    expect(plugin).toBeDefined();
  });

  it('should accept custom options including stack', () => {
    const plugin = new DevPlugin({
      port: 4000,
      seedAdminUser: false,
      verbose: false,
      services: { auth: false, dispatcher: false, security: false },
      stack: { manifest: { id: 'test', name: 'test', version: '1.0.0', type: 'app' } },
    });
    expect(plugin).toBeDefined();
  });

  it('should init with mocked context and handle missing deps gracefully', async () => {
    const ctx: any = {
      logger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
      getService: vi.fn().mockImplementation(() => { throw new Error('not found'); }),
      getServices: vi.fn().mockReturnValue(new Map()),
      registerService: vi.fn(),
      hook: vi.fn(),
      trigger: vi.fn(),
      getKernel: vi.fn(),
    };

    // DevPlugin should not throw even if peer dependencies are missing
    const plugin = new DevPlugin({ seedAdminUser: false });
    await expect(plugin.init(ctx)).resolves.not.toThrow();
  });

  it('should register contract-compliant dev stubs for all core services', async () => {
    const registeredServices = new Map<string, any>();
    const ctx: any = {
      logger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
      getService: vi.fn().mockImplementation((name: string) => {
        if (registeredServices.has(name)) return registeredServices.get(name);
        throw new Error('not found');
      }),
      getServices: vi.fn().mockReturnValue(new Map()),
      registerService: vi.fn().mockImplementation((name: string, svc: any) => {
        registeredServices.set(name, svc);
      }),
      hook: vi.fn(),
      trigger: vi.fn(),
      getKernel: vi.fn(),
    };

    // Disable real plugins (which need real packages) but allow stubs
    const plugin = new DevPlugin({
      seedAdminUser: false,
      services: {
        objectql: false,
        driver: false,
        auth: false,
        security: false,
        server: false,
        rest: false,
        dispatcher: false,
      },
    });

    await plugin.init(ctx);

    // Should have registered stubs for all core + security services
    const stubLog = ctx.logger.info.mock.calls.find(
      (call: any[]) => typeof call[0] === 'string' && call[0].includes('dev stubs registered'),
    );
    expect(stubLog).toBeDefined();

    // ── Verify ICacheService contract ──
    const cache = registeredServices.get('cache');
    expect(cache._dev).toBe(true);
    await cache.set('k1', 'v1');
    expect(await cache.get('k1')).toBe('v1');
    expect(await cache.has('k1')).toBe(true);
    expect(await cache.delete('k1')).toBe(true);
    expect(await cache.has('k1')).toBe(false);
    const stats = await cache.stats();
    expect(typeof stats.hits).toBe('number');
    expect(typeof stats.misses).toBe('number');
    expect(typeof stats.keyCount).toBe('number');

    // ── Verify IQueueService contract ──
    const queue = registeredServices.get('queue');
    const msgId = await queue.publish('test-q', { hello: 'world' });
    expect(typeof msgId).toBe('string');
    expect(await queue.getQueueSize('test-q')).toBe(0);

    // ── Verify IJobService contract ──
    const job = registeredServices.get('job');
    const jobs = await job.listJobs();
    expect(Array.isArray(jobs)).toBe(true);

    // ── Verify IStorageService contract ──
    const storage = registeredServices.get('file-storage');
    await storage.upload('test.txt', Buffer.from('hello'));
    expect(await storage.exists('test.txt')).toBe(true);
    const info = await storage.getInfo('test.txt');
    expect(info.key).toBe('test.txt');
    expect(info.size).toBeGreaterThan(0);
    const downloaded = await storage.download('test.txt');
    expect(downloaded.toString()).toBe('hello');

    // ── Verify ISearchService contract ──
    const search = registeredServices.get('search');
    await search.index('users', '1', { name: 'Alice' });
    const searchResult = await search.search('users', 'alice');
    expect(searchResult.hits).toHaveLength(1);
    expect(typeof searchResult.totalHits).toBe('number');

    // ── Verify IAutomationService contract ──
    const automation = registeredServices.get('automation');
    const execResult = await automation.execute('test_flow');
    expect(execResult.success).toBe(true);
    expect(Array.isArray(await automation.listFlows())).toBe(true);

    // ── Verify IGraphQLService contract ──
    const gql = registeredServices.get('graphql');
    const gqlResult = await gql.execute({ query: '{ _dev }' });
    expect('data' in gqlResult || 'errors' in gqlResult).toBe(true);
    expect(typeof gql.getSchema()).toBe('string');

    // ── Verify IAnalyticsService contract ──
    const analytics = registeredServices.get('analytics');
    const analyticsResult = await analytics.query({ cube: 'test' });
    expect(Array.isArray(analyticsResult.rows)).toBe(true);
    expect(Array.isArray(analyticsResult.fields)).toBe(true);
    expect(Array.isArray(await analytics.getMeta())).toBe(true);

    // ── Verify IRealtimeService contract ──
    const realtime = registeredServices.get('realtime');
    const subId = await realtime.subscribe('ch', () => {});
    expect(typeof subId).toBe('string');

    // ── Verify INotificationService contract ──
    const notif = registeredServices.get('notification');
    const notifResult = await notif.send({ channel: 'email', to: 'test@dev', body: 'hello' });
    expect(notifResult.success).toBe(true);
    expect(typeof notifResult.messageId).toBe('string');

    // ── Verify IAIService contract ──
    const ai = registeredServices.get('ai');
    const chatResult = await ai.chat([{ role: 'user', content: 'hi' }]);
    expect(typeof chatResult.content).toBe('string');
    expect(typeof chatResult.model).toBe('string');
    expect(Array.isArray(await ai.listModels())).toBe(true);

    // ── Verify II18nService contract ──
    const i18n = registeredServices.get('i18n');
    i18n.loadTranslations('en', { 'hello': 'Hello {{name}}' });
    expect(i18n.t('hello', 'en', { name: 'World' })).toBe('Hello World');
    expect(i18n.t('missing', 'en')).toBe('missing');
    expect(Array.isArray(i18n.getLocales())).toBe(true);

    // ── Verify IUIService contract ──
    const ui = registeredServices.get('ui');
    ui.registerView('test_view', { name: 'test_view', object: 'account' });
    expect(ui.getView('test_view')).toBeDefined();
    expect(Array.isArray(ui.listViews())).toBe(true);
    expect(ui.listViews('account')).toHaveLength(1);

    // ── Verify IWorkflowService contract ──
    const workflow = registeredServices.get('workflow');
    const transResult = await workflow.transition({ recordId: 'r1', object: 'order', targetState: 'approved' });
    expect(transResult.success).toBe(true);
    expect(transResult.currentState).toBe('approved');
    const status = await workflow.getStatus('order', 'r1');
    expect(status.currentState).toBe('approved');
    expect(Array.isArray(status.availableTransitions)).toBe(true);

    // ── Verify IMetadataService contract (stub fallback) ──
    const metadata = registeredServices.get('metadata');
    await metadata.register('object', { name: 'account' });
    expect(await metadata.get('object', 'account')).toBeDefined();
    expect(Array.isArray(await metadata.list('object'))).toBe(true);
    expect(Array.isArray(await metadata.listObjects())).toBe(true);

    // Security sub-services are registered by either the real SecurityPlugin
    // or dev stubs (when security is disabled, they're skipped entirely).
    // The stubs follow the same contracts as the real implementations.
  });

  it('should skip disabled services', async () => {
    const ctx: any = {
      logger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
      getService: vi.fn().mockImplementation(() => { throw new Error('not found'); }),
      getServices: vi.fn().mockReturnValue(new Map()),
      registerService: vi.fn(),
      hook: vi.fn(),
      trigger: vi.fn(),
      getKernel: vi.fn(),
    };

    const plugin = new DevPlugin({
      seedAdminUser: false,
      services: {
        objectql: false,
        driver: false,
        auth: false,
        server: false,
        rest: false,
        dispatcher: false,
        security: false,
        // Disable all core services too
        metadata: false,
        data: false,
        cache: false,
        queue: false,
        job: false,
        'file-storage': false,
        search: false,
        automation: false,
        graphql: false,
        analytics: false,
        realtime: false,
        notification: false,
        ai: false,
        i18n: false,
        ui: false,
        workflow: false,
      },
    });

    await plugin.init(ctx);

    // No child plugins AND no stubs should be registered
    const initLog = ctx.logger.info.mock.calls.find(
      (call: any[]) => typeof call[0] === 'string' && call[0].includes('initialized'),
    );
    expect(initLog).toBeDefined();
    expect(initLog[0]).toContain('0 plugin');
    expect(initLog[0]).toContain('0 dev stub');
  });

  it('should destroy without errors', async () => {
    const plugin = new DevPlugin();
    await expect(plugin.destroy()).resolves.not.toThrow();
  });

  // ── Driver-backed stub tests ────────────────────────────────────────────

  /**
   * Helper: create a DevPlugin with only dev stubs (no real plugins),
   * init it, and return the registered services map.
   */
  async function initDevStubs() {
    const registeredServices = new Map<string, any>();
    const ctx: any = {
      logger: {
        info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn(),
      },
      getService: vi.fn().mockImplementation((name: string) => {
        if (registeredServices.has(name)) return registeredServices.get(name);
        throw new Error('not found');
      }),
      getServices: vi.fn().mockReturnValue(new Map()),
      registerService: vi.fn().mockImplementation((name: string, svc: any) => {
        registeredServices.set(name, svc);
      }),
      hook: vi.fn(), trigger: vi.fn(), getKernel: vi.fn(),
    };

    const plugin = new DevPlugin({
      seedAdminUser: false,
      services: {
        objectql: false, driver: false, auth: false, security: false,
        server: false, rest: false, dispatcher: false,
      },
    });

    await plugin.init(ctx);
    return { registeredServices, plugin, ctx };
  }

  describe('IMetadataService (driver-backed)', () => {
    it('should CRUD metadata with full query support', async () => {
      const { registeredServices, plugin } = await initDevStubs();
      const meta = registeredServices.get('metadata');

      // Register multiple objects
      await meta.register('object', { name: 'account', label: 'Account', fields: [] });
      await meta.register('object', { name: 'contact', label: 'Contact', fields: [] });
      await meta.register('object', { name: 'opportunity', label: 'Opportunity', fields: [] });

      // Get single
      const account = await meta.get('object', 'account');
      expect(account).toBeDefined();
      expect(account.name).toBe('account');
      expect(account.label).toBe('Account');

      // List all
      const all = await meta.list('object');
      expect(all).toHaveLength(3);

      // List with pagination
      const page = await meta.list('object', { limit: 2 });
      expect(page).toHaveLength(2);

      // Update
      const updated = await meta.update('object', 'account', { label: 'Account (Updated)' });
      expect(updated).toBeDefined();
      expect(updated.label).toBe('Account (Updated)');
      expect(updated.name).toBe('account'); // name preserved

      // Verify update persisted
      const refetched = await meta.get('object', 'account');
      expect(refetched.label).toBe('Account (Updated)');

      // Count
      const count = await meta.count('object');
      expect(count).toBe(3);

      // Unregister
      await meta.unregister('object', 'contact');
      const afterDelete = await meta.list('object');
      expect(afterDelete).toHaveLength(2);
      expect(await meta.get('object', 'contact')).toBeNull();

      // Count after delete
      expect(await meta.count('object')).toBe(2);

      await plugin.destroy();
    });

    it('should handle multiple metadata types independently', async () => {
      const { registeredServices, plugin } = await initDevStubs();
      const meta = registeredServices.get('metadata');

      await meta.register('object', { name: 'account' });
      await meta.register('view', { name: 'account_list', object: 'account', type: 'list' });
      await meta.register('flow', { name: 'approval_flow', trigger: 'record_create' });

      expect(await meta.list('object')).toHaveLength(1);
      expect(await meta.list('view')).toHaveLength(1);
      expect(await meta.list('flow')).toHaveLength(1);

      // getObject convenience
      const obj = await meta.getObject('account');
      expect(obj).toBeDefined();
      expect(obj.name).toBe('account');

      // listObjects convenience
      const objs = await meta.listObjects();
      expect(objs).toHaveLength(1);

      await plugin.destroy();
    });

    it('should upsert on re-register', async () => {
      const { registeredServices, plugin } = await initDevStubs();
      const meta = registeredServices.get('metadata');

      await meta.register('object', { name: 'account', label: 'V1' });
      await meta.register('object', { name: 'account', label: 'V2' });

      const all = await meta.list('object');
      expect(all).toHaveLength(1);
      expect(all[0].label).toBe('V2');

      await plugin.destroy();
    });

    it('should return null for update on non-existent item', async () => {
      const { registeredServices, plugin } = await initDevStubs();
      const meta = registeredServices.get('metadata');

      const result = await meta.update('object', 'nonexistent', { label: 'Test' });
      expect(result).toBeNull();

      await plugin.destroy();
    });
  });

  describe('IDataEngine (driver-backed)', () => {
    it('should perform full CRUD operations', async () => {
      const { registeredServices, plugin } = await initDevStubs();
      const data = registeredServices.get('data');

      // Insert
      const record = await data.insert('user', { data: { name: 'Alice', email: 'alice@test.com', role: 'admin' } });
      expect(record).toBeDefined();
      expect(record.id).toBeDefined();
      expect(record.name).toBe('Alice');

      // Find
      const found = await data.find('user');
      expect(found).toHaveLength(1);
      expect(found[0].name).toBe('Alice');

      // FindOne
      const one = await data.findOne('user', { filter: { name: 'Alice' } });
      expect(one).toBeDefined();
      expect(one.email).toBe('alice@test.com');

      // Update
      const updated = await data.update('user', record.id, { data: { role: 'superadmin' } });
      expect(updated.role).toBe('superadmin');
      expect(updated.name).toBe('Alice'); // original fields preserved

      // Count
      expect(await data.count('user')).toBe(1);

      // Delete
      const deleted = await data.delete('user', record.id);
      expect(deleted).toBe(true);
      expect(await data.count('user')).toBe(0);

      await plugin.destroy();
    });

    it('should support query filtering and sorting', async () => {
      const { registeredServices, plugin } = await initDevStubs();
      const data = registeredServices.get('data');

      // Insert multiple records
      await data.insert('product', { data: { name: 'Widget', price: 10 } });
      await data.insert('product', { data: { name: 'Gadget', price: 25 } });
      await data.insert('product', { data: { name: 'Doohickey', price: 5 } });

      // Filter
      const expensive = await data.find('product', { filter: { price: { $gt: 8 } } });
      expect(expensive).toHaveLength(2);

      // Sort (ascending)
      const sorted = await data.find('product', {
        orderBy: [{ field: 'price', order: 'asc' }],
      });
      expect(sorted[0].name).toBe('Doohickey');
      expect(sorted[2].name).toBe('Gadget');

      // Pagination
      const page = await data.find('product', { limit: 2 });
      expect(page).toHaveLength(2);

      await plugin.destroy();
    });

    it('should support bulk insert', async () => {
      const { registeredServices, plugin } = await initDevStubs();
      const data = registeredServices.get('data');

      const result = await data.insert('item', [
        { name: 'A' }, { name: 'B' }, { name: 'C' },
      ]);
      expect(result).toHaveLength(3);
      expect(await data.count('item')).toBe(3);

      await plugin.destroy();
    });

    it('should support aggregation', async () => {
      const { registeredServices, plugin } = await initDevStubs();
      const data = registeredServices.get('data');

      await data.insert('order', { data: { customer: 'Alice', amount: 100 } });
      await data.insert('order', { data: { customer: 'Bob', amount: 200 } });
      await data.insert('order', { data: { customer: 'Alice', amount: 50 } });

      const result = await data.aggregate('order', [
        { $group: { _id: '$customer', total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]);
      expect(result).toHaveLength(2);
      expect(result[0]._id).toBe('Alice');
      expect(result[0].total).toBe(150);
      expect(result[1]._id).toBe('Bob');
      expect(result[1].total).toBe(200);

      await plugin.destroy();
    });
  });

  describe('ISearchService (driver-backed)', () => {
    it('should index, search and remove documents', async () => {
      const { registeredServices, plugin } = await initDevStubs();
      const search = registeredServices.get('search');

      // Index documents
      await search.index('products', 'p1', { title: 'Widget Pro', category: 'electronics' });
      await search.index('products', 'p2', { title: 'Gadget Max', category: 'electronics' });
      await search.index('products', 'p3', { title: 'Book of Knowledge', category: 'books' });

      // Search by text
      const result = await search.search('products', 'widget');
      expect(result.hits).toHaveLength(1);
      expect(result.hits[0].id).toBe('p1');
      expect(result.totalHits).toBe(1);

      // Search broader
      const electronics = await search.search('products', 'electronics');
      expect(electronics.hits).toHaveLength(2);

      // Remove and verify
      await search.remove('products', 'p1');
      const afterRemove = await search.search('products', 'widget');
      expect(afterRemove.hits).toHaveLength(0);

      await plugin.destroy();
    });

    it('should support bulk indexing', async () => {
      const { registeredServices, plugin } = await initDevStubs();
      const search = registeredServices.get('search');

      await search.bulkIndex('users', [
        { id: 'u1', document: { name: 'Alice Johnson' } },
        { id: 'u2', document: { name: 'Bob Smith' } },
        { id: 'u3', document: { name: 'Charlie Johnson' } },
      ]);

      const result = await search.search('users', 'johnson');
      expect(result.hits).toHaveLength(2);

      // Delete entire index
      await search.deleteIndex('users');
      const afterDelete = await search.search('users', 'johnson');
      expect(afterDelete.hits).toHaveLength(0);

      await plugin.destroy();
    });
  });

  describe('shared InMemoryDriver', () => {
    it('data and metadata use the same driver (isolated tables)', async () => {
      const { registeredServices, plugin } = await initDevStubs();
      const data = registeredServices.get('data');
      const meta = registeredServices.get('metadata');

      // Insert business data
      await data.insert('account', { data: { name: 'Acme Corp' } });

      // Register metadata
      await meta.register('object', { name: 'account', label: 'Account' });

      // Data and metadata are in separate tables
      const accounts = await data.find('account');
      expect(accounts).toHaveLength(1);
      expect(accounts[0].name).toBe('Acme Corp');

      const objects = await meta.listObjects();
      expect(objects).toHaveLength(1);
      expect(objects[0].name).toBe('account');
      expect(objects[0].label).toBe('Account');

      await plugin.destroy();
    });
  });
});

// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Plugin, PluginContext } from '@objectstack/core';
import { InMemoryDriver } from '@objectstack/driver-memory';

/**
 * All 17 core kernel service names as defined in CoreServiceName.
 * @see packages/spec/src/system/core-services.zod.ts
 */
const CORE_SERVICE_NAMES = [
  'metadata', 'data', 'auth',
  'file-storage', 'search', 'cache', 'queue',
  'automation', 'graphql', 'analytics', 'realtime',
  'job', 'notification', 'ai', 'i18n', 'ui', 'workflow',
] as const;

/**
 * Security sub-services registered by the SecurityPlugin.
 */
const SECURITY_SERVICE_NAMES = [
  'security.permissions', 'security.rls', 'security.fieldMasker',
] as const;

/**
 * Contract-compliant dev stub implementations.
 *
 * Each stub implements the interface defined in `packages/spec/src/contracts/`
 * (e.g. ICacheService, IQueueService, IAutomationService, …) so that
 * downstream code calling these services in dev mode receives the correct
 * return types — not just `undefined`.
 *
 * Where an interface method is optional (marked with `?`), the stub only
 * implements the required methods plus any optional ones that have
 * a trivially useful implementation.
 */

/** ICacheService — in-memory Map-backed stub */
function createCacheStub() {
  const store = new Map<string, { value: unknown; expires?: number }>();
  let hits = 0;
  let misses = 0;
  return {
    _dev: true, _serviceName: 'cache',
    async get<T = unknown>(key: string): Promise<T | undefined> {
      const entry = store.get(key);
      if (!entry || (entry.expires && Date.now() > entry.expires)) {
        store.delete(key);
        misses++;
        return undefined;
      }
      hits++;
      return entry.value as T;
    },
    async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
      store.set(key, { value, expires: ttl ? Date.now() + ttl * 1000 : undefined });
    },
    async delete(key: string): Promise<boolean> { return store.delete(key); },
    async has(key: string): Promise<boolean> { return store.has(key); },
    async clear(): Promise<void> { store.clear(); },
    async stats() { return { hits, misses, keyCount: store.size }; },
  };
}

/** IQueueService — in-memory publish/subscribe stub */
function createQueueStub() {
  const handlers = new Map<string, Function[]>();
  let msgId = 0;
  return {
    _dev: true, _serviceName: 'queue',
    async publish<T = unknown>(queue: string, data: T): Promise<string> {
      const id = `dev-msg-${++msgId}`;
      const fns = handlers.get(queue) ?? [];
      for (const fn of fns) fn({ id, data, attempts: 1, timestamp: Date.now() });
      return id;
    },
    async subscribe(queue: string, handler: (msg: any) => Promise<void>): Promise<void> {
      handlers.set(queue, [...(handlers.get(queue) ?? []), handler]);
    },
    async unsubscribe(queue: string): Promise<void> { handlers.delete(queue); },
    async getQueueSize(): Promise<number> { return 0; },
    async purge(queue: string): Promise<void> { handlers.delete(queue); },
  };
}

/** IJobService — no-op job scheduler stub */
function createJobStub() {
  const jobs = new Map<string, any>();
  return {
    _dev: true, _serviceName: 'job',
    async schedule(name: string, schedule: any, handler: any): Promise<void> { jobs.set(name, { schedule, handler }); },
    async cancel(name: string): Promise<void> { jobs.delete(name); },
    async trigger(name: string, data?: unknown): Promise<void> {
      const job = jobs.get(name);
      if (job?.handler) await job.handler({ jobId: name, data });
    },
    async getExecutions(): Promise<any[]> { return []; },
    async listJobs(): Promise<string[]> { return [...jobs.keys()]; },
  };
}

/** IStorageService — in-memory file storage stub */
function createStorageStub() {
  const files = new Map<string, { data: Buffer; meta: any }>();
  return {
    _dev: true, _serviceName: 'file-storage',
    async upload(key: string, data: any, options?: any): Promise<void> {
      files.set(key, { data: Buffer.from(data), meta: { contentType: options?.contentType, metadata: options?.metadata } });
    },
    async download(key: string): Promise<Buffer> { return files.get(key)?.data ?? Buffer.alloc(0); },
    async delete(key: string): Promise<void> { files.delete(key); },
    async exists(key: string): Promise<boolean> { return files.has(key); },
    async getInfo(key: string) {
      const f = files.get(key);
      return { key, size: f?.data?.length ?? 0, contentType: f?.meta?.contentType, lastModified: new Date(), metadata: f?.meta?.metadata };
    },
    async list(prefix: string) {
      return [...files.entries()].filter(([k]) => k.startsWith(prefix)).map(([key, f]) =>
        ({ key, size: f.data.length, contentType: f.meta?.contentType, lastModified: new Date() }));
    },
  };
}

/** ISearchService — InMemoryDriver-backed full-text search stub.
 *
 * Uses InMemoryDriver for persistent document storage and queries.
 * Text search uses Mingo's $regex for case-insensitive matching,
 * providing more realistic search behavior than a simple Map.
 */
function createSearchStub(driver: InMemoryDriver) {
  const indexTable = (object: string) => `_search_${object}`;
  return {
    _dev: true, _serviceName: 'search',
    async index(object: string, id: string, document: Record<string, unknown>): Promise<void> {
      await driver.upsert(indexTable(object), {
        ...document,
        _docId: id,
        _searchText: JSON.stringify(document).toLowerCase(),
      }, ['_docId']);
    },
    async remove(object: string, id: string): Promise<void> {
      const tbl = indexTable(object);
      const existing = await driver.findOne(tbl, { object: tbl, where: { _docId: id } });
      if (existing?.id) await driver.delete(tbl, existing.id);
    },
    async search(object: string, query: string) {
      const tbl = indexTable(object);
      const q = query.toLowerCase();
      const all = await driver.find(tbl, {
        object: tbl,
        where: { _searchText: { $regex: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
      });
      const hits = all.map((doc: any) => {
        const { id: _id, _docId, _searchText, created_at, updated_at, ...document } = doc;
        return { id: _docId, score: 1, document };
      });
      return { hits, totalHits: hits.length, processingTimeMs: 0 };
    },
    async bulkIndex(object: string, documents: Array<{ id: string; document: Record<string, unknown> }>): Promise<void> {
      for (const d of documents) {
        await driver.upsert(indexTable(object), {
          ...d.document,
          _docId: d.id,
          _searchText: JSON.stringify(d.document).toLowerCase(),
        }, ['_docId']);
      }
    },
    async deleteIndex(object: string): Promise<void> {
      await driver.dropTable(indexTable(object));
    },
  };
}

/** IAutomationService — no-op flow execution stub */
function createAutomationStub() {
  const flows = new Map<string, unknown>();
  return {
    _dev: true, _serviceName: 'automation',
    async execute(_flowName: string) { return { success: true, output: undefined, durationMs: 0 }; },
    async listFlows(): Promise<string[]> { return [...flows.keys()]; },
    registerFlow(name: string, definition: unknown) { flows.set(name, definition); },
    unregisterFlow(name: string) { flows.delete(name); },
  };
}

/** IGraphQLService — dev stub returning empty data */
function createGraphQLStub() {
  return {
    _dev: true, _serviceName: 'graphql',
    async execute() { return { data: null, errors: [{ message: 'GraphQL not available in dev stub mode' }] }; },
    getSchema() { return 'type Query { _dev: Boolean }'; },
  };
}

/** IAnalyticsService — dev stub returning empty results */
function createAnalyticsStub() {
  return {
    _dev: true, _serviceName: 'analytics',
    async query() { return { rows: [], fields: [] }; },
    async getMeta() { return []; },
    async generateSql() { return { sql: '', params: [] }; },
  };
}

/** IRealtimeService — in-memory pub/sub stub */
function createRealtimeStub() {
  const subs = new Map<string, Function>();
  let subId = 0;
  return {
    _dev: true, _serviceName: 'realtime',
    async publish(event: any): Promise<void> { for (const fn of subs.values()) fn(event); },
    async subscribe(_channel: string, handler: Function): Promise<string> {
      const id = `dev-sub-${++subId}`; subs.set(id, handler); return id;
    },
    async unsubscribe(subscriptionId: string): Promise<void> { subs.delete(subscriptionId); },
  };
}

/** INotificationService — in-memory log stub */
function createNotificationStub() {
  const sent: any[] = [];
  return {
    _dev: true, _serviceName: 'notification',
    async send(message: any) { sent.push(message); return { success: true, messageId: `dev-notif-${sent.length}` }; },
    async sendBatch(messages: any[]) { return messages.map(m => { sent.push(m); return { success: true, messageId: `dev-notif-${sent.length}` }; }); },
    getChannels() { return ['email', 'in-app'] as const; },
  };
}

/** IAIService — dev stub returning placeholder responses */
function createAIStub() {
  return {
    _dev: true, _serviceName: 'ai',
    async chat() { return { content: '[dev-stub] AI not available in development mode', model: 'dev-stub' }; },
    async complete() { return { content: '[dev-stub] AI not available in development mode', model: 'dev-stub' }; },
    async embed() { return [[0]]; },
    async listModels() { return ['dev-stub']; },
  };
}

/** II18nService — in-memory translation stub */
function createI18nStub() {
  const translations = new Map<string, Record<string, unknown>>();
  let defaultLocale = 'en';
  return {
    _dev: true, _serviceName: 'i18n',
    t(key: string, locale: string, params?: Record<string, unknown>): string {
      const t = translations.get(locale);
      const val = t?.[key];
      if (typeof val === 'string') {
        return params ? val.replace(/\{\{(\w+)\}\}/g, (_, k) => String(params[k] ?? `{{${k}}}`)) : val;
      }
      return key;
    },
    getTranslations(locale: string): Record<string, unknown> { return translations.get(locale) ?? {}; },
    loadTranslations(locale: string, data: Record<string, unknown>) { translations.set(locale, { ...translations.get(locale), ...data }); },
    getLocales() { return [...translations.keys()]; },
    getDefaultLocale() { return defaultLocale; },
    setDefaultLocale(locale: string) { defaultLocale = locale; },
  };
}

/** IUIService — in-memory UI metadata stub */
function createUIStub() {
  const views = new Map<string, any>();
  const dashboards = new Map<string, any>();
  return {
    _dev: true, _serviceName: 'ui',
    getView(name: string) { return views.get(name); },
    listViews(object?: string) {
      const all = [...views.values()];
      return object ? all.filter(v => v.object === object) : all;
    },
    getDashboard(name: string) { return dashboards.get(name); },
    listDashboards() { return [...dashboards.values()]; },
    registerView(name: string, definition: unknown) { views.set(name, definition); },
    registerDashboard(name: string, definition: unknown) { dashboards.set(name, definition); },
  };
}

/** IWorkflowService — in-memory workflow state stub */
function createWorkflowStub() {
  const states = new Map<string, string>(); // recordKey → currentState
  const key = (obj: string, id: string) => `${obj}:${id}`;
  return {
    _dev: true, _serviceName: 'workflow',
    async transition(t: any) {
      states.set(key(t.object, t.recordId), t.targetState);
      return { success: true, currentState: t.targetState };
    },
    async getStatus(object: string, recordId: string) {
      return { recordId, object, currentState: states.get(key(object, recordId)) ?? 'draft', availableTransitions: [] };
    },
    async getHistory() { return []; },
  };
}

/**
 * IMetadataService — InMemoryDriver-backed metadata registry.
 *
 * Uses InMemoryDriver for full CRUD with query/filter/sort support.
 * Metadata items are stored per-type in a shared driver instance,
 * enabling MongoDB-style queries, pagination, and aggregation on metadata.
 */
function createMetadataStub(driver: InMemoryDriver) {
  const tablePrefix = '_meta_';
  const tableName = (type: string) => `${tablePrefix}${type}`;

  return {
    _dev: true, _serviceName: 'metadata',

    /** Register (upsert) a metadata definition */
    async register(type: string, definition: any) {
      const name = definition.name ?? '';
      await driver.upsert(tableName(type), { ...definition, name }, ['name']);
    },

    /** Get a single metadata item by type and name */
    async get(type: string, name: string) {
      const tbl = tableName(type);
      return driver.findOne(tbl, { object: tbl, where: { name } });
    },

    /** List all metadata items of a given type, with optional filter/sort/pagination */
    async list(type: string, query?: { filter?: any; orderBy?: any; limit?: number; offset?: number }) {
      const tbl = tableName(type);
      return driver.find(tbl, {
        object: tbl,
        where: query?.filter,
        orderBy: query?.orderBy,
        limit: query?.limit,
        offset: query?.offset,
      });
    },

    /** Remove a metadata item by type and name */
    async unregister(type: string, name: string) {
      const tbl = tableName(type);
      const existing = await driver.findOne(tbl, { object: tbl, where: { name } });
      if (existing?.id) await driver.delete(tbl, existing.id);
    },

    /** Convenience: get an object definition by name */
    async getObject(name: string) {
      const tbl = tableName('object');
      return driver.findOne(tbl, { object: tbl, where: { name } });
    },

    /** Convenience: list all object definitions */
    async listObjects() {
      const tbl = tableName('object');
      return driver.find(tbl, { object: tbl });
    },

    /** Update a metadata item (partial merge) */
    async update(type: string, name: string, data: any) {
      const tbl = tableName(type);
      const existing = await driver.findOne(tbl, { object: tbl, where: { name } });
      if (!existing?.id) return null;
      return driver.update(tbl, existing.id, { ...data, name });
    },

    /** Count metadata items of a given type */
    async count(type: string, filter?: any) {
      const tbl = tableName(type);
      return driver.count(tbl, filter ? { object: tbl, where: filter } : undefined);
    },

    /** Unregister all metadata items from a package */
    async unregisterPackage(packageName: string) {
      const types = Object.keys((driver as any).db || {})
        .filter(t => t.startsWith(tablePrefix));
      for (const t of types) {
        await driver.deleteMany(t, { object: t, where: { package: packageName } });
      }
    },
  };
}

/** IAuthService — dev auth stub returning success for all */
function createAuthStub() {
  return {
    _dev: true, _serviceName: 'auth',
    async handleRequest() { return new Response(JSON.stringify({ success: true }), { status: 200 }); },
    async verify() { return { success: true, user: { id: 'dev-admin', email: 'admin@dev.local', name: 'Admin', roles: ['admin'] } }; },
    async logout() {},
    async getCurrentUser() { return { id: 'dev-admin', email: 'admin@dev.local', name: 'Admin', roles: ['admin'] }; },
  };
}

/**
 * IDataEngine — InMemoryDriver-backed data engine.
 *
 * Uses InMemoryDriver for realistic CRUD operations with full
 * query/filter/sort/pagination/aggregation support (via Mingo).
 * This makes the dev data service behave like a real database,
 * enabling integration testing and dev workflows without external DBs.
 */
function createDataStub(driver: InMemoryDriver) {
  return {
    _dev: true, _serviceName: 'data',
    async find(object: string, params?: any) {
      return driver.find(object, {
        object,
        where: params?.filter,
        orderBy: params?.orderBy ?? params?.sort,
        limit: params?.limit,
        offset: params?.offset,
        fields: params?.fields ?? params?.select,
      });
    },
    async findOne(object: string, params?: any) {
      return driver.findOne(object, {
        object,
        where: params?.filter ?? params?.where,
      });
    },
    async insert(object: string, params: any) {
      const data = params?.data ?? params;
      if (Array.isArray(data)) return driver.bulkCreate(object, data);
      return driver.create(object, data);
    },
    async update(object: string, id: string, params?: any) {
      const data = params?.data ?? params ?? {};
      return driver.update(object, id, data);
    },
    async delete(object: string, id: string) {
      return driver.delete(object, id);
    },
    async count(object: string, params?: any) {
      return driver.count(object, params?.filter ? { object, where: params.filter } : undefined);
    },
    async aggregate(object: string, pipeline?: any[]) {
      return driver.aggregate(object, pipeline ?? []);
    },
  };
}

/** Security sub-service stubs (PermissionEvaluator, RLSCompiler, FieldMasker) */
function createSecurityPermissionsStub() {
  return {
    _dev: true, _serviceName: 'security.permissions',
    resolvePermissionSets() { return []; },
    checkObjectPermission() { return true; },
    getFieldPermissions() { return {}; },
  };
}
function createSecurityRLSStub() {
  return {
    _dev: true, _serviceName: 'security.rls',
    compileFilter() { return null; },
    getApplicablePolicies() { return []; },
  };
}
function createSecurityFieldMaskerStub() {
  return {
    _dev: true, _serviceName: 'security.fieldMasker',
    maskResults(results: any) { return results; },
  };
}

/**
 * Map of service names → contract-compliant stub factory functions.
 * Each factory creates a new instance implementing the protocol interface
 * from `packages/spec/src/contracts/`.
 */
const DEV_STUB_FACTORIES: Record<string, () => Record<string, any>> = {
  'cache':       createCacheStub,
  'queue':       createQueueStub,
  'job':         createJobStub,
  'file-storage': createStorageStub,
  'automation':  createAutomationStub,
  'graphql':     createGraphQLStub,
  'analytics':   createAnalyticsStub,
  'realtime':    createRealtimeStub,
  'notification': createNotificationStub,
  'ai':          createAIStub,
  'i18n':        createI18nStub,
  'ui':          createUIStub,
  'workflow':    createWorkflowStub,
  'auth':        createAuthStub,
  // Security sub-services
  'security.permissions': createSecurityPermissionsStub,
  'security.rls':         createSecurityRLSStub,
  'security.fieldMasker': createSecurityFieldMaskerStub,
};

/**
 * Services that require an InMemoryDriver instance for realistic behavior.
 * These factories receive the shared driver and return contract-compliant stubs
 * with full query/filter/sort/pagination/aggregation support.
 */
const DRIVER_BACKED_FACTORIES: Record<string, (driver: InMemoryDriver) => Record<string, any>> = {
  'metadata':    createMetadataStub,
  'data':        createDataStub,
  'search':      createSearchStub,
};

/**
 * Dev Plugin Options
 *
 * Configuration for the development-mode plugin.
 * All options have sensible defaults — zero-config works out of the box.
 */
export interface DevPluginOptions {
  /**
   * Port for the HTTP server.
   * @default 3000
   */
  port?: number;

  /**
   * Whether to seed a default admin user for development.
   * Creates `admin@dev.local` / `admin` so devs can skip login.
   * @default true
   */
  seedAdminUser?: boolean;

  /**
   * Auth secret for development sessions.
   * @default 'objectstack-dev-secret-DO-NOT-USE-IN-PRODUCTION!!'
   */
  authSecret?: string;

  /**
   * Auth base URL.
   * @default 'http://localhost:{port}'
   */
  authBaseUrl?: string;

  /**
   * Whether to enable verbose logging.
   * @default true
   */
  verbose?: boolean;

  /**
   * Override which services to enable. By default all core services are enabled.
   * Set a service name to `false` to skip it.
   *
   * Available services: 'objectql', 'driver', 'auth', 'server', 'rest',
   * 'dispatcher', 'security', plus any of the 17 CoreServiceName values
   * (e.g. 'cache', 'queue', 'job', 'ui', 'automation', 'workflow', …).
   */
  services?: Partial<Record<string, boolean>>;

  /**
   * Additional plugins to load alongside the auto-configured ones.
   * Useful for adding custom project plugins while still getting the dev defaults.
   */
  extraPlugins?: Plugin[];

  /**
   * Stack definition to load as a project.
   * When provided, the DevPlugin wraps it in an AppPlugin so that all
   * metadata (objects, views, apps, dashboards, etc.) is registered with
   * the kernel and exposed through the REST/metadata APIs.
   *
   * This is what makes `new DevPlugin({ stack: config })` equivalent to
   * a full `os serve --dev` environment: views can be read, modified, and
   * saved through the API.
   *
   * @example
   * ```ts
   * import config from './objectstack.config';
   * plugins: [new DevPlugin({ stack: config })]
   * ```
   */
  stack?: Record<string, any>;
}

/**
 * Development Mode Plugin for ObjectStack
 *
 * A convenience plugin that auto-configures the **entire** platform stack
 * for local development, simulating **all 17+ kernel services** so developers
 * can work in a full-featured API environment without external dependencies.
 *
 * Instead of manually wiring:
 *
 * ```ts
 * plugins: [
 *   new ObjectQLPlugin(),
 *   new DriverPlugin(new InMemoryDriver()),
 *   new AuthPlugin({ secret: '...', baseUrl: '...' }),
 *   new HonoServerPlugin({ port: 3000 }),
 *   createRestApiPlugin(),
 *   createDispatcherPlugin(),
 *   new SecurityPlugin(),
 *   new AppPlugin(config),
 * ]
 * ```
 *
 * You can simply use:
 *
 * ```ts
 * plugins: [new DevPlugin()]
 * ```
 *
 * ## Core services (real implementations)
 *
 * | Service      | Package                           | Description                               |
 * |--------------|-----------------------------------|-------------------------------------------|
 * | ObjectQL     | `@objectstack/objectql`           | Data engine (query, CRUD, hooks)          |
 * | Driver       | `@objectstack/driver-memory`      | In-memory database (no DB install)        |
 * | Auth         | `@objectstack/plugin-auth`        | Authentication with dev credentials       |
 * | Security     | `@objectstack/plugin-security`    | RBAC, RLS, field-level masking            |
 * | HTTP Server  | `@objectstack/plugin-hono-server` | HTTP server on configured port            |
 * | REST API     | `@objectstack/rest`               | Auto-generated CRUD + metadata endpoints  |
 * | Dispatcher   | `@objectstack/runtime`            | Auth, GraphQL, analytics, packages, etc.  |
 * | App/Metadata | `@objectstack/runtime`            | Project metadata (objects, views, apps)   |
 *
 * ## Stub services (contract-compliant in-memory implementations)
 *
 * Any core service not provided by a real plugin is automatically registered
 * as a contract-compliant dev stub that implements the interface from
 * `packages/spec/src/contracts/`. Each stub returns correct types:
 *
 * **Driver-backed** (powered by InMemoryDriver with Mingo query engine):
 * `metadata` (full CRUD with query/filter/sort), `data` (realistic DB operations),
 * `search` (indexed document storage with text matching)
 *
 * **Map-backed**: `cache`, `queue` (pub/sub), `job` (scheduler),
 * `file-storage`, `automation` (flows), `graphql` (placeholder),
 * `analytics` (empty results), `realtime` (pub/sub), `notification` (log),
 * `ai` (placeholder), `i18n` (translations), `ui` (views/dashboards),
 * `workflow` (state machine)
 *
 * All services can be individually disabled via `options.services`.
 * Peer packages are loaded via dynamic import and silently skipped if missing.
 */
export class DevPlugin implements Plugin {
  name = 'com.objectstack.plugin.dev';
  type = 'standard';
  version = '1.0.0';

  /**
   * Shared InMemoryDriver instance used by driver-backed dev stubs
   * (metadata, data, search). Provides full query/aggregation support
   * via Mingo, making dev stubs behave like a real database.
   */
  private devDriver: InMemoryDriver;

  private options: Required<
    Pick<DevPluginOptions, 'port' | 'seedAdminUser' | 'authSecret' | 'verbose'>
  > & DevPluginOptions;

  private childPlugins: Plugin[] = [];

  constructor(options: DevPluginOptions = {}) {
    this.options = {
      port: 3000,
      seedAdminUser: true,
      authSecret: 'objectstack-dev-secret-DO-NOT-USE-IN-PRODUCTION!!',
      verbose: true,
      ...options,
      authBaseUrl: options.authBaseUrl ?? `http://localhost:${options.port ?? 3000}`,
    };
    this.devDriver = new InMemoryDriver();
  }

  /**
   * Init Phase
   *
   * Dynamically imports and instantiates all core plugins.
   * Uses dynamic imports so that peer dependencies remain optional —
   * if a package isn't installed the service is silently skipped.
   */
  async init(ctx: PluginContext): Promise<void> {
    ctx.logger.info('🚀 DevPlugin initializing — auto-configuring all services for development');

    const enabled = (name: string) => this.options.services?.[name] !== false;

    // 1. ObjectQL Engine (data layer + metadata service)
    if (enabled('objectql')) {
      try {
        const { ObjectQLPlugin } = await import('@objectstack/objectql');
        const qlPlugin = new ObjectQLPlugin();
        this.childPlugins.push(qlPlugin);
        ctx.logger.info('  ✔ ObjectQL engine enabled (data + metadata)');
      } catch {
        ctx.logger.warn('  ✘ @objectstack/objectql not installed — skipping data engine');
      }
    }

    // 2. In-Memory Driver
    if (enabled('driver')) {
      try {
        const { DriverPlugin } = await import('@objectstack/runtime') as any;
        const { InMemoryDriver } = await import('@objectstack/driver-memory') as any;
        const driver = new InMemoryDriver();
        const driverPlugin = new DriverPlugin(driver, 'memory');
        this.childPlugins.push(driverPlugin);
        ctx.logger.info('  ✔ InMemoryDriver enabled');
      } catch {
        ctx.logger.warn('  ✘ @objectstack/runtime or @objectstack/driver-memory not installed — skipping driver');
      }
    }

    // 3. App Plugin — registers project metadata (objects, views, apps, dashboards, etc.)
    //    This is the key piece that enables full API development:
    //    once metadata is registered, REST endpoints can read/write views, etc.
    if (this.options.stack) {
      try {
        const { AppPlugin } = await import('@objectstack/runtime') as any;
        const appPlugin = new AppPlugin(this.options.stack);
        this.childPlugins.push(appPlugin);
        ctx.logger.info('  ✔ App metadata loaded from stack definition');
      } catch {
        ctx.logger.warn('  ✘ @objectstack/runtime not installed — skipping app metadata');
      }
    }

    // 4. Auth Plugin
    if (enabled('auth')) {
      try {
        const { AuthPlugin } = await import('@objectstack/plugin-auth') as any;
        const authPlugin = new AuthPlugin({
          secret: this.options.authSecret,
          baseUrl: this.options.authBaseUrl,
        });
        this.childPlugins.push(authPlugin);
        ctx.logger.info('  ✔ Auth plugin enabled (dev credentials)');
      } catch {
        ctx.logger.warn('  ✘ @objectstack/plugin-auth not installed — skipping auth');
      }
    }

    // 5. Security Plugin (RBAC, RLS, field-level masking)
    if (enabled('security')) {
      try {
        const { SecurityPlugin } = await import('@objectstack/plugin-security') as any;
        const securityPlugin = new SecurityPlugin();
        this.childPlugins.push(securityPlugin);
        ctx.logger.info('  ✔ Security plugin enabled (RBAC, RLS, field masking)');
      } catch {
        ctx.logger.debug('  ℹ @objectstack/plugin-security not installed — skipping security');
      }
    }

    // 6. Hono HTTP Server
    if (enabled('server')) {
      try {
        const { HonoServerPlugin } = await import('@objectstack/plugin-hono-server') as any;
        const serverPlugin = new HonoServerPlugin({
          port: this.options.port,
        });
        this.childPlugins.push(serverPlugin);
        ctx.logger.info(`  ✔ Hono HTTP server enabled on port ${this.options.port}`);
      } catch {
        ctx.logger.warn('  ✘ @objectstack/plugin-hono-server not installed — skipping HTTP server');
      }
    }

    // 7. REST API endpoints (CRUD + metadata read/write)
    if (enabled('rest')) {
      try {
        const { createRestApiPlugin } = await import('@objectstack/rest') as any;
        const restPlugin = createRestApiPlugin();
        this.childPlugins.push(restPlugin);
        ctx.logger.info('  ✔ REST API endpoints enabled (CRUD + metadata)');
      } catch {
        ctx.logger.debug('  ℹ @objectstack/rest not installed — skipping REST endpoints');
      }
    }

    // 8. Dispatcher (auth routes, GraphQL, analytics, packages, storage, automation)
    if (enabled('dispatcher')) {
      try {
        const { createDispatcherPlugin } = await import('@objectstack/runtime') as any;
        const dispatcherPlugin = createDispatcherPlugin();
        this.childPlugins.push(dispatcherPlugin);
        ctx.logger.info('  ✔ Dispatcher enabled (auth, GraphQL, analytics, packages, storage)');
      } catch {
        ctx.logger.debug('  ℹ Dispatcher not available — skipping extended API routes');
      }
    }

    // Extra user-provided plugins
    if (this.options.extraPlugins) {
      this.childPlugins.push(...this.options.extraPlugins);
    }

    // Init all child plugins
    for (const plugin of this.childPlugins) {
      try {
        await plugin.init(ctx);
      } catch (err: any) {
        ctx.logger.error(`Failed to init child plugin ${plugin.name}: ${err.message}`);
      }
    }

    // ── Register contract-compliant dev stubs for remaining services ────
    // The kernel defines 17 core services + 3 security services.
    // Real plugins (ObjectQL, Auth, Security, etc.) already registered some.
    // For any service NOT yet registered, we create a contract-compliant
    // dev stub (implementing the interface from packages/spec/src/contracts/)
    // so that the full kernel service map is populated and downstream code
    // receives correct return types (arrays, booleans, objects — not undefined).
    //
    // Driver-backed stubs (metadata, data, search) use the shared InMemoryDriver
    // for full CRUD with Mingo-powered query/filter/sort/aggregation support.

    await this.devDriver.connect();

    const stubNames: string[] = [];

    for (const svc of CORE_SERVICE_NAMES) {
      if (!enabled(svc)) continue;
      try {
        ctx.getService(svc);
        // Already registered by a real plugin — skip
      } catch {
        const driverFactory = DRIVER_BACKED_FACTORIES[svc];
        if (driverFactory) {
          ctx.registerService(svc, driverFactory(this.devDriver));
        } else {
          const factory = DEV_STUB_FACTORIES[svc];
          ctx.registerService(svc, factory ? factory() : { _dev: true, _serviceName: svc });
        }
        stubNames.push(svc);
      }
    }

    // Security sub-services (if SecurityPlugin wasn't loaded)
    if (enabled('security')) {
      for (const svc of SECURITY_SERVICE_NAMES) {
        try {
          ctx.getService(svc);
        } catch {
          const factory = DEV_STUB_FACTORIES[svc];
          ctx.registerService(svc, factory ? factory() : { _dev: true, _serviceName: svc });
          stubNames.push(svc);
        }
      }
    }

    if (stubNames.length > 0) {
      ctx.logger.info(`  ✔ Contract-compliant dev stubs registered for: ${stubNames.join(', ')}`);
    }

    ctx.logger.info(`DevPlugin initialized ${this.childPlugins.length} plugin(s) + ${stubNames.length} dev stub(s)`);
  }

  /**
   * Start Phase
   *
   * Starts all child plugins and optionally seeds the dev admin user.
   */
  async start(ctx: PluginContext): Promise<void> {
    // Start all child plugins
    for (const plugin of this.childPlugins) {
      if (plugin.start) {
        try {
          await plugin.start(ctx);
        } catch (err: any) {
          ctx.logger.error(`Failed to start child plugin ${plugin.name}: ${err.message}`);
        }
      }
    }

    // Seed default admin user
    if (this.options.seedAdminUser) {
      await this.seedAdmin(ctx);
    }

    ctx.logger.info('─────────────────────────────────────────');
    ctx.logger.info('🟢 ObjectStack Dev Server ready');
    ctx.logger.info(`   http://localhost:${this.options.port}`);
    ctx.logger.info('');
    ctx.logger.info('   API:       /api/v1/data/:object');
    ctx.logger.info('   Metadata:  /api/v1/meta/:type/:name');
    ctx.logger.info('   Discovery: /.well-known/objectstack');
    ctx.logger.info('─────────────────────────────────────────');
  }

  /**
   * Destroy Phase
   *
   * Cleans up all child plugins in reverse order.
   */
  async destroy(): Promise<void> {
    for (const plugin of [...this.childPlugins].reverse()) {
      if (plugin.destroy) {
        try {
          await plugin.destroy();
        } catch {
          // Ignore cleanup errors during dev shutdown
        }
      }
    }
    // Disconnect the shared dev driver
    await this.devDriver.disconnect().catch(() => {});
  }

  /**
   * Seed a default admin user for development.
   */
  private async seedAdmin(ctx: PluginContext): Promise<void> {
    try {
      const dataEngine = ctx.getService<any>('data');
      if (!dataEngine) return;

      // Check if admin already exists
      const existing = await dataEngine.find('user', {
        filter: { email: 'admin@dev.local' },
        limit: 1,
      }).catch(() => null);

      if (existing?.length) {
        ctx.logger.debug('Dev admin user already exists');
        return;
      }

      await dataEngine.insert('user', {
        data: {
          name: 'Admin',
          email: 'admin@dev.local',
          username: 'admin',
          role: 'admin',
        },
      }).catch(() => {
        // Table might not exist yet — that's fine for dev
      });

      ctx.logger.info('🔑 Dev admin user seeded: admin@dev.local');
    } catch {
      // Non-fatal — user seeding is best-effort
      ctx.logger.debug('Could not seed admin user (data engine may not be ready)');
    }
  }
}

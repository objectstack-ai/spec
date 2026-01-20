import { ServiceObject, App, ObjectStackManifest } from '@objectstack/spec';

/**
 * Global Schema Registry
 * Unified storage for all metadata types (Objects, Apps, Flows, Layouts, etc.)
 */
export class SchemaRegistry {
  // Nested Map: Type -> Name/ID -> MetadataItem
  private static metadata = new Map<string, Map<string, any>>();
  private static _id = Math.random().toString(36).substring(7);

  /**
   * Universal Register Method
   * @param type The category of metadata (e.g., 'object', 'app', 'plugin')
   * @param item The metadata item itself
   * @param keyField The property to use as the unique key (default: 'name')
   */
  static registerItem<T>(type: string, item: T, keyField: keyof T = 'name' as keyof T) {
    if (!this.metadata.has(type)) {
      this.metadata.set(type, new Map());
    }
    const collection = this.metadata.get(type)!;
    const key = String(item[keyField]);

    if (collection.has(key)) {
      console.warn(`[Registry:${this._id}] Overwriting ${type}: ${key}`);
    }
    collection.set(key, item);
    console.log(`[Registry:${this._id}] Registered ${type}: ${key}`);
  }

  /**
   * Universal Get Method
   */
  static getItem<T>(type: string, name: string): T | undefined {
    const item = this.metadata.get(type)?.get(name) as T;
    if (!item) {
        console.log(`[Registry:${this._id}] MISSING ${type}: ${name}. Available: ${Array.from(this.metadata.get(type)?.keys() || [])}`);
    } else {
        console.log(`[Registry:${this._id}] FOUND ${type}: ${name}`);
    }
    return item;
  }

  /**
   * Universal List Method
   */
  static listItems<T>(type: string): T[] {
    return Array.from(this.metadata.get(type)?.values() || []) as T[];
  }

  /**
   * Get all registered metadata types (Kinds)
   */
  static getRegisteredTypes(): string[] {
    return Array.from(this.metadata.keys());
  }

  // ==========================================
  // Typed Helper Methods (Shortcuts)
  // ==========================================

  /**
   * Object Helpers
   */
  static registerObject(schema: ServiceObject) {
    this.registerItem('object', schema, 'name');
  }

  static getObject(name: string): ServiceObject | undefined {
    return this.getItem<ServiceObject>('object', name);
  }

  static getAllObjects(): ServiceObject[] {
    return this.listItems<ServiceObject>('object');
  }

  /**
   * App Helpers
   */
  static registerApp(app: App) {
    this.registerItem('app', app, 'name');
  }

  static getApp(name: string): App | undefined {
    return this.getItem<App>('app', name);
  }

  static getAllApps(): App[] {
    return this.listItems<App>('app');
  }

  /**
   * Plugin Helpers
   */
  static registerPlugin(manifest: ObjectStackManifest) {
    this.registerItem('plugin', manifest, 'id');
  }

  static getAllPlugins(): ObjectStackManifest[] {
    return this.listItems<ObjectStackManifest>('plugin');
  }

  /**
   * Kind (Metadata Type) Helpers
   */
  static registerKind(kind: { id: string, globs: string[] }) {
    this.registerItem('kind', kind, 'id');
  }
  
  static getAllKinds(): { id: string, globs: string[] }[] {
    return this.listItems('kind');
  }
}

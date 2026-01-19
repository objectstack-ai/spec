import { ServiceObject, App } from '@objectstack/spec';

/**
 * Global Schema Registry
 * Unified storage for all metadata types (Objects, Apps, Flows, Layouts, etc.)
 */
export class SchemaRegistry {
  // Nested Map: Type -> Name -> MetadataItem
  private static metadata = new Map<string, Map<string, any>>();

  /**
   * Universal Register Method
   */
  static registerItem<T extends { name: string }>(type: string, item: T) {
    if (!this.metadata.has(type)) {
      this.metadata.set(type, new Map());
    }
    const collection = this.metadata.get(type)!;

    if (collection.has(item.name)) {
      console.warn(`[Registry] Overwriting ${type}: ${item.name}`);
    }
    collection.set(item.name, item);
    console.log(`[Registry] Registered ${type}: ${item.name}`);
  }

  /**
   * Universal Get Method
   */
  static getItem<T>(type: string, name: string): T | undefined {
    return this.metadata.get(type)?.get(name) as T;
  }

  /**
   * Universal List Method
   */
  static listItems<T>(type: string): T[] {
    return Array.from(this.metadata.get(type)?.values() || []) as T[];
  }

  // ==========================================
  // Typed Helper Methods (Shortcuts)
  // ==========================================

  /**
   * Object Helpers
   */
  static registerObject(schema: ServiceObject) {
    this.registerItem('object', schema);
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
    this.registerItem('app', app);
  }

  static getApp(name: string): App | undefined {
    return this.getItem<App>('app', name);
  }

  static getAllApps(): App[] {
    return this.listItems<App>('app');
  }
}

import { ServiceObject } from '@objectstack/spec/data';
import { ObjectStackManifest } from '@objectstack/spec/kernel';

/**
 * Global Schema Registry
 * Unified storage for all metadata types (Objects, Apps, Flows, Layouts, etc.)
 */
export class SchemaRegistry {
  // Nested Map: Type -> Name/ID -> MetadataItem
  private static metadata = new Map<string, Map<string, any>>();

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
      console.warn(`[Registry] Overwriting ${type}: ${key}`);
    }
    collection.set(key, item);
    console.log(`[Registry] Registered ${type}: ${key}`);
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

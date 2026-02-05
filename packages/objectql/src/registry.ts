import { ServiceObject, ObjectSchema } from '@objectstack/spec/data';
import { ObjectStackManifest, ManifestSchema } from '@objectstack/spec/kernel';
import { AppSchema } from '@objectstack/spec/ui';

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

    // Validation Hook
    try {
        this.validate(type, item);
    } catch (e: any) {
        console.error(`[Registry] Validation failed for ${type} ${key}: ${e.message}`);
        // For now, warn but don't crash, allowing partial/legacy loads
        // throw e; 
    }

    if (collection.has(key)) {
      console.warn(`[Registry] Overwriting ${type}: ${key}`);
    }
    collection.set(key, item);
    console.log(`[Registry] Registered ${type}: ${key}`);
  }

  /**
   * Validate Metadata against Spec Zod Schemas
   */
  static validate(type: string, item: any) {
      if (type === 'object') {
          return ObjectSchema.parse(item);
      }
      if (type === 'app') {
          // AppSchema might rely on Zod, imported via UI protocol
          return AppSchema.parse(item);
      }
      if (type === 'plugin') {
          return ManifestSchema.parse(item);
      }
      // Add more validations as needed
      return true;
  }

  /**
   * Universal Unregister Method
   */
  static unregisterItem(type: string, name: string) {
    const collection = this.metadata.get(type);
    if (collection && collection.has(name)) {
      collection.delete(name);
      console.log(`[Registry] Unregistered ${type}: ${name}`);
    } else {
      console.warn(`[Registry] Attempted to unregister non-existent ${type}: ${name}`);
    }
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
   * App Helpers
   */
  static registerApp(app: any) {
    this.registerItem('app', app, 'name');
  }

  static getApp(name: string): any {
    return this.getItem('app', name);
  }

  static getAllApps(): any[] {
    return this.listItems('app');
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

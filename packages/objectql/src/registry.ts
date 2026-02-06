import { ServiceObject, ObjectSchema } from '@objectstack/spec/data';
import { ObjectStackManifest, ManifestSchema, InstalledPackage, InstalledPackageSchema } from '@objectstack/spec/kernel';
import { AppSchema } from '@objectstack/spec/ui';

/**
 * Global Schema Registry
 * Unified storage for all metadata types (Objects, Apps, Flows, Layouts, etc.)
 * 
 * ## Package vs App Distinction
 * - **Package**: The unit of installation, stored under type 'package'.
 *   Each InstalledPackage wraps a ManifestSchema with lifecycle state.
 * - **App**: A UI navigation shell (AppSchema), registered under type 'apps'.
 *   Apps are extracted from packages during registration.
 * - A package may contain 0, 1, or many apps.
 */
export class SchemaRegistry {
  // Nested Map: Type -> Name/ID -> MetadataItem
  private static metadata = new Map<string, Map<string, any>>();

  /**
   * Universal Register Method
   * @param type The category of metadata (e.g., 'object', 'package', 'apps')
   * @param item The metadata item itself
   * @param keyField The property to use as the unique key (default: 'name')
   * @param packageId Optional: the owning package ID for scoped queries
   */
  static registerItem<T>(type: string, item: T, keyField: keyof T = 'name' as keyof T, packageId?: string) {
    if (!this.metadata.has(type)) {
      this.metadata.set(type, new Map());
    }
    const collection = this.metadata.get(type)!;
    const baseName = String(item[keyField]);
    // Tag item with owning package for scoped queries
    if (packageId) {
      (item as any)._packageId = packageId;
    }

    // Validation Hook
    try {
        this.validate(type, item);
    } catch (e: any) {
        console.error(`[Registry] Validation failed for ${type} ${baseName}: ${e.message}`);
        // For now, warn but don't crash, allowing partial/legacy loads
        // throw e; 
    }

    // Use composite key (packageId:name) when packageId is provided,
    // so same-named items from different packages can coexist.
    const storageKey = packageId ? `${packageId}:${baseName}` : baseName;

    if (collection.has(storageKey)) {
      console.warn(`[Registry] Overwriting ${type}: ${storageKey}`);
    }
    collection.set(storageKey, item);
    console.log(`[Registry] Registered ${type}: ${storageKey}`);
  }

  /**
   * Validate Metadata against Spec Zod Schemas
   */
  static validate(type: string, item: any) {
      if (type === 'object') {
          return ObjectSchema.parse(item);
      }
      if (type === 'apps') {
          return AppSchema.parse(item);
      }
      if (type === 'package') {
          return InstalledPackageSchema.parse(item);
      }
      if (type === 'plugin') {
          return ManifestSchema.parse(item);
      }
      // Add more validations as needed
      return true;
  }

  /**
   * Universal Unregister Method
   * Supports both simple and composite keys.
   */
  static unregisterItem(type: string, name: string) {
    const collection = this.metadata.get(type);
    if (!collection) {
      console.warn(`[Registry] Attempted to unregister non-existent ${type}: ${name}`);
      return;
    }
    // Direct key
    if (collection.has(name)) {
      collection.delete(name);
      console.log(`[Registry] Unregistered ${type}: ${name}`);
      return;
    }
    // Scan composite keys
    for (const key of collection.keys()) {
      if (key.endsWith(`:${name}`)) {
        collection.delete(key);
        console.log(`[Registry] Unregistered ${type}: ${key}`);
        return;
      }
    }
    console.warn(`[Registry] Attempted to unregister non-existent ${type}: ${name}`);
  }

  /**
   * Universal Get Method
   * Looks up by exact key first, then falls back to scanning by item name
   * to handle composite keys (packageId:name).
   */
  static getItem<T>(type: string, name: string): T | undefined {
    const collection = this.metadata.get(type);
    if (!collection) return undefined;
    // Direct lookup (works for items registered without packageId)
    const direct = collection.get(name);
    if (direct) return direct as T;
    // Scan for composite keys ending with :name
    for (const [key, item] of collection) {
      if (key.endsWith(`:${name}`)) return item as T;
    }
    return undefined;
  }

  /**
   * Universal List Method
   * @param type The metadata type to list
   * @param packageId Optional: filter items belonging to a specific package
   */
  static listItems<T>(type: string, packageId?: string): T[] {
    const items = Array.from(this.metadata.get(type)?.values() || []) as T[];
    if (packageId) {
      return items.filter((item: any) => item._packageId === packageId);
    }
    return items;
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
  static registerObject(schema: ServiceObject, packageId?: string) {
    this.registerItem('object', schema, 'name', packageId);
  }

  static getObject(name: string): ServiceObject | undefined {
    return this.getItem<ServiceObject>('object', name);
  }

  static getAllObjects(packageId?: string): ServiceObject[] {
    return this.listItems<ServiceObject>('object', packageId);
  }

  /**
   * Package Helpers — The unit of installation
   * Packages are keyed by manifest.id
   */
  static registerPackage(pkg: InstalledPackage) {
    this.registerItem('package', pkg, 'manifest' as any);
    // Actually we need to key by manifest.id, so use a wrapper
  }

  static installPackage(manifest: ObjectStackManifest, settings?: Record<string, any>): InstalledPackage {
    const now = new Date().toISOString();
    const pkg: InstalledPackage = {
      manifest,
      status: 'installed',
      enabled: true,
      installedAt: now,
      updatedAt: now,
      settings,
    };
    // Store keyed by manifest.id
    if (!this.metadata.has('package')) {
      this.metadata.set('package', new Map());
    }
    const collection = this.metadata.get('package')!;
    if (collection.has(manifest.id)) {
      console.warn(`[Registry] Overwriting package: ${manifest.id}`);
    }
    collection.set(manifest.id, pkg);
    console.log(`[Registry] Installed package: ${manifest.id} (${manifest.name})`);
    return pkg;
  }

  static uninstallPackage(id: string): boolean {
    const collection = this.metadata.get('package');
    if (collection && collection.has(id)) {
      collection.delete(id);
      console.log(`[Registry] Uninstalled package: ${id}`);
      return true;
    }
    console.warn(`[Registry] Package not found for uninstall: ${id}`);
    return false;
  }

  static getPackage(id: string): InstalledPackage | undefined {
    return this.metadata.get('package')?.get(id) as InstalledPackage | undefined;
  }

  static getAllPackages(): InstalledPackage[] {
    return this.listItems<InstalledPackage>('package');
  }

  static enablePackage(id: string): InstalledPackage | undefined {
    const pkg = this.getPackage(id);
    if (pkg) {
      pkg.enabled = true;
      pkg.status = 'installed';
      pkg.statusChangedAt = new Date().toISOString();
      pkg.updatedAt = new Date().toISOString();
      console.log(`[Registry] Enabled package: ${id}`);
    }
    return pkg;
  }

  static disablePackage(id: string): InstalledPackage | undefined {
    const pkg = this.getPackage(id);
    if (pkg) {
      pkg.enabled = false;
      pkg.status = 'disabled';
      pkg.statusChangedAt = new Date().toISOString();
      pkg.updatedAt = new Date().toISOString();
      console.log(`[Registry] Disabled package: ${id}`);
    }
    return pkg;
  }

  /**
   * App Helpers — UI navigation shells extracted from packages
   * @deprecated Use registerItem('apps', app, 'name') instead of registerApp for clarity
   */
  static registerApp(app: any, packageId?: string) {
    this.registerItem('apps', app, 'name', packageId);
  }

  static getApp(name: string): any {
    return this.getItem('apps', name);
  }

  static getAllApps(): any[] {
    return this.listItems('apps');
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

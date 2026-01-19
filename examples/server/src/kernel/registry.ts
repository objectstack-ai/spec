import { ServiceObject, App } from '@objectstack/spec';

/**
 * Global Schema Registry
 */
export class SchemaRegistry {
  private static objects = new Map<string, ServiceObject>();
  private static apps = new Map<string, App>();

  /**
   * Register a new object schema
   */
  static register(schema: ServiceObject) {
    if (this.objects.has(schema.name)) {
      console.warn(`[Registry] Overwriting object: ${schema.name}`);
    }
    this.objects.set(schema.name, schema);
    console.log(`[Registry] Registered object: ${schema.name}`);
  }

  static get(name: string): ServiceObject | undefined {
    return this.objects.get(name);
  }

  static getAll(): ServiceObject[] {
    return Array.from(this.objects.values());
  }

  /**
   * Register a new app schema
   */
  static registerApp(app: App) {
    if (this.apps.has(app.name)) {
      console.warn(`[Registry] Overwriting app: ${app.name}`);
    }
    this.apps.set(app.name, app);
    console.log(`[Registry] Registered app: ${app.name}`);
  }

  static getApp(name: string): App | undefined {
    return this.apps.get(name);
  }

  static getAllApps(): App[] {
    return Array.from(this.apps.values());
  }
}

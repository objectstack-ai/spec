import { ServiceObject } from '@objectstack/spec';

/**
 * Global Schema Registry
 */
export class SchemaRegistry {
  private static objects = new Map<string, ServiceObject>();

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
}

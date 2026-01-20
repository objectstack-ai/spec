import { DriverInterface, DriverOptions, QueryAST } from '@objectstack/spec';

/**
 * ObjectQL Engine
 * 
 * The core orchestration layer that sits between the API/UI and the Data Driver.
 * It handles:
 * 1. Request Validation (using Schemas)
 * 2. Security Enforcement (ACLs, Sharing Rules)
 * 3. Workflow Triggers
 * 4. Driver Delegation
 */
export class ObjectQL {
  private drivers = new Map<string, DriverInterface>();
  private defaultDriver: string | null = null;

  constructor() {
    console.log(`[ObjectQL] Engine Instance Created`);
  }

  /**
   * Register a new storage driver
   */
  registerDriver(driver: DriverInterface, isDefault: boolean = false) {
    if (this.drivers.has(driver.name)) {
      console.warn(`[ObjectQL] Driver ${driver.name} is already registered. Skipping.`);
      return;
    }

    this.drivers.set(driver.name, driver);
    console.log(`[ObjectQL] Registered driver: ${driver.name} v${driver.version}`);

    if (isDefault || this.drivers.size === 1) {
      this.defaultDriver = driver.name;
    }
  }

  /**
   * Helper to get the target driver
   */
  private getDriver(object: string): DriverInterface {
    // TODO: Look up Object definition to see if it specifies a specific datasource/driver
    // For now, always return default
    if (!this.defaultDriver) {
      throw new Error('[ObjectQL] No drivers registered!');
    }
    return this.drivers.get(this.defaultDriver)!;
  }

  /**
   * Initialize the engine and all registered drivers
   */
  async init() {
    console.log('[ObjectQL] Initializing drivers...');
    for (const [name, driver] of this.drivers) {
      try {
        await driver.connect();
      } catch (e) {
        console.error(`[ObjectQL] Failed to connect driver ${name}`, e);
      }
    }
    // In a real app, we would sync schemas here
  }

  async destroy() {
    for (const driver of this.drivers.values()) {
      await driver.disconnect();
    }
  }

  // ============================================
  // Data Access Methods
  // ============================================

  async find(object: string, filters: any = {}, options?: DriverOptions) {
    const driver = this.getDriver(object);
    console.log(`[ObjectQL] Finding ${object} on ${driver.name}...`);
    
    // Transform simplified filters to QueryAST
    // This is a simplified "Mock" transform. 
    // Real implementation would parse complex JSON or FilterBuilders.
    const ast: QueryAST = {
       // Pass through if it looks like AST, otherwise empty
       // In this demo, we assume the caller passes a simplified object or raw AST
       filters: filters.filters || undefined,
       top: filters.top || 100,
       sort: filters.sort || []
    };

    return driver.find(object, ast, options);
  }

  async insert(object: string, data: Record<string, any>, options?: DriverOptions) {
    const driver = this.getDriver(object);
    console.log(`[ObjectQL] Creating ${object} on ${driver.name}...`);
    // 1. Validate Schema
    // 2. Run "Before Insert" Triggers
    
    const result = await driver.create(object, data, options);
    
    // 3. Run "After Insert" Triggers
    return result;
  }

  async update(object: string, id: string, data: Record<string, any>, options?: DriverOptions) {
    const driver = this.getDriver(object);
    console.log(`[ObjectQL] Updating ${object} ${id}...`);
    return driver.update(object, id, data, options);
  }

  async delete(object: string, id: string, options?: DriverOptions) {
    const driver = this.getDriver(object);
    console.log(`[ObjectQL] Deleting ${object} ${id}...`);
    return driver.delete(object, id, options);
  }
}

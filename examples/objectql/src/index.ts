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
  constructor(private driver: DriverInterface) {
    console.log(`[ObjectQL] Initialized with driver: ${driver.name} v${driver.version}`);
  }

  /**
   * Initialize the engine
   */
  async init() {
    await this.driver.connect();
    // In a real app, we would sync schemas here
  }

  async destroy() {
    await this.driver.disconnect();
  }

  // ============================================
  // Data Access Methods
  // ============================================

  async find(object: string, filters: any = {}, options?: DriverOptions) {
    console.log(`[ObjectQL] Finding ${object}...`);
    
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

    return this.driver.find(object, ast, options);
  }

  async insert(object: string, data: Record<string, any>, options?: DriverOptions) {
    console.log(`[ObjectQL] Creating ${object}...`);
    // 1. Validate Schema
    // 2. Run "Before Insert" Triggers
    
    const result = await this.driver.create(object, data, options);
    
    // 3. Run "After Insert" Triggers
    return result;
  }

  async update(object: string, id: string, data: Record<string, any>, options?: DriverOptions) {
    console.log(`[ObjectQL] Updating ${object} ${id}...`);
    return this.driver.update(object, id, data, options);
  }

  async delete(object: string, id: string, options?: DriverOptions) {
    console.log(`[ObjectQL] Deleting ${object} ${id}...`);
    return this.driver.delete(object, id, options);
  }
}

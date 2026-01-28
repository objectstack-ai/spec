import { ObjectQL } from './index';
import { ObjectStackProtocolImplementation } from './protocol';
// IObjectStackProtocol is used for type checking implicitly via ObjectStackProtocolImplementation contract

// Minimal Context interface to avoid circular dependency on @objectstack/runtime
export interface PluginContext {
    registerService(name: string, service: any): void;
    getService<T>(name: string): T;
    hook(name: string, handler: any): void;
    trigger(name: string, ...args: any[]): Promise<void>;
    logger: Console;
    [key: string]: any;
}

export interface Plugin {
    name: string;
    version?: string;
    dependencies?: string[];
    init?: (ctx: PluginContext) => Promise<void> | void;
    start?: (ctx: PluginContext) => Promise<void> | void;
    destroy?: () => Promise<void> | void;
}

export class ObjectQLPlugin {
  name = 'com.objectstack.engine.objectql';
  type = 'objectql' as const;
  version = '1.0.0';
  
  private ql: ObjectQL | undefined;
  private hostContext?: Record<string, any>;

  constructor(ql?: ObjectQL, hostContext?: Record<string, any>) {
    if (ql) {
        this.ql = ql;
    } else {
        this.hostContext = hostContext;
        // Lazily created in init
    }
  }

  async init(ctx: PluginContext) {
    if (!this.ql) {
        this.ql = new ObjectQL(this.hostContext);
    }
    
    ctx.registerService('objectql', this.ql);
    if(ctx.logger) ctx.logger.log(`[ObjectQLPlugin] ObjectQL engine registered as service`);

    // Register Protocol Implementation
    if (!this.ql) {
        throw new Error('ObjectQL engine not initialized');
    }
    const protocolShim = new ObjectStackProtocolImplementation(this.ql);

    ctx.registerService('protocol', protocolShim);
    if(ctx.logger) ctx.logger.log(`[ObjectQLPlugin] Protocol service registered`);
  }

  async start(ctx: PluginContext) {
    if(ctx.logger) ctx.logger.log(`[ObjectQLPlugin] ObjectQL engine initialized`);
  }
}

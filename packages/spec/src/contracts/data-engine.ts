import { 
  DataEngineQueryOptions, 
  DataEngineInsertOptions, 
  DataEngineUpdateOptions, 
  DataEngineDeleteOptions,
  DataEngineAggregateOptions, 
  DataEngineCountOptions,
  DataEngineRequest,
  QueryAST,
  DriverOptions
} from '../data/index.js';

/**
 * IDataEngine - Standard Data Engine Interface
 * 
 * Abstract interface for data persistence capabilities.
 * Following the Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete database implementations.
 * 
 * Aligned with 'src/data/data-engine.zod.ts' in @objectstack/spec.
 */

export interface IDataEngine {
  find(objectName: string, query?: DataEngineQueryOptions): Promise<any[]>;
  findOne(objectName: string, query?: DataEngineQueryOptions): Promise<any>;
  insert(objectName: string, data: any | any[], options?: DataEngineInsertOptions): Promise<any>;
  update(objectName: string, data: any, options?: DataEngineUpdateOptions): Promise<any>;
  delete(objectName: string, options?: DataEngineDeleteOptions): Promise<any>;
  count(objectName: string, query?: DataEngineCountOptions): Promise<number>;
  aggregate(objectName: string, query: DataEngineAggregateOptions): Promise<any[]>;
  
  /**
   * Vector Search (AI/RAG)
   */
  vectorFind?(objectName: string, vector: number[], options?: { filter?: any, limit?: number, select?: string[], threshold?: number }): Promise<any[]>;

  /**
   * Batch Operations (Transactional)
   */
  batch?(requests: DataEngineRequest[], options?: { transaction?: boolean }): Promise<any[]>;

  /**
   * Execute raw command (Escape hatch)
   */
  execute?(command: any, options?: Record<string, any>): Promise<any>;
}

export interface DriverInterface {
  name: string;
  version: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  find(object: string, query: QueryAST, options?: DriverOptions): Promise<any[]>;
  findOne(object: string, query: QueryAST, options?: DriverOptions): Promise<any>;
  create(object: string, data: any, options?: DriverOptions): Promise<any>;
  update(object: string, id: any, data: any, options?: DriverOptions): Promise<any>;
  delete(object: string, id: any, options?: DriverOptions): Promise<any>;
  
  /**
   * Bulk & Batch Operations
   */
  bulkCreate?(object: string, data: any[], options?: DriverOptions): Promise<any>;
  updateMany?(object: string, query: QueryAST, data: any, options?: DriverOptions): Promise<any>;
  deleteMany?(object: string, query: QueryAST, options?: DriverOptions): Promise<any>;

  count?(object: string, query: QueryAST, options?: DriverOptions): Promise<number>;
  
  /**
   * Raw Execution
   */
  execute?(command: any, params?: any, options?: DriverOptions): Promise<any>;
}

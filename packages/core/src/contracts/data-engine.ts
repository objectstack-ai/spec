import { QueryAST } from '@objectstack/spec/data';
import { DriverOptions } from '@objectstack/spec/system';

/**
 * IDataEngine - Standard Data Engine Interface
 * 
 * Abstract interface for data persistence capabilities.
 * Following the Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete database implementations.
 */

export interface DataEngineFilter {
  [key: string]: any;
}

export interface DataEngineQueryOptions {
  /** Filter conditions */
  filter?: DataEngineFilter;
  /** Fields to select */
  select?: string[];
  /** Sort order */
  sort?: Record<string, 1 | -1 | 'asc' | 'desc'>;
  /** Limit number of results */
  limit?: number;
  /** Skip number of results */
  skip?: number;
  /** Maximum number of results */
  top?: number;
}

export interface IDataEngine {
  insert(objectName: string, data: any): Promise<any>;
  find(objectName: string, query?: DataEngineQueryOptions): Promise<any[]>;
  update(objectName: string, id: any, data: any): Promise<any>;
  delete(objectName: string, id: any): Promise<boolean>;
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
  
  count?(object: string, query: QueryAST, options?: DriverOptions): Promise<number>;
}


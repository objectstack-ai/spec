// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { ObjectSchema } from '../data/object.zod.js';
import { FieldSchema } from '../data/field.zod.js';

type DataField = z.infer<typeof FieldSchema>;
type DataObject = z.infer<typeof ObjectSchema>;

/**
 * Interface for Data Definition Language (DDL) operations.
 * Drivers should implement this to support automatic migrations.
 */
export interface ISchemaDriver {
  createCollection(objectName: string, schema?: DataObject): Promise<void>;
  dropCollection(objectName: string): Promise<void>;
  
  addColumn(objectName: string, fieldName: string, field: DataField): Promise<void>;
  modifyColumn(objectName: string, fieldName: string, field: DataField): Promise<void>;
  dropColumn(objectName: string, fieldName: string): Promise<void>;
  
  createIndex(objectName: string, indexName: string, fields: string[]): Promise<void>;
  dropIndex(objectName: string, indexName: string): Promise<void>;
  
  executeRaw(statement: string): Promise<any>;
}

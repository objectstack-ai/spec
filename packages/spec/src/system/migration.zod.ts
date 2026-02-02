import { z } from 'zod';
import { FieldSchema } from '../data/field.zod';
import { ObjectSchema } from '../data/object.zod';

// --- Atomic Operations ---

export const AddFieldOperation = z.object({
  type: z.literal('add_field'),
  objectName: z.string(),
  fieldName: z.string(),
  field: FieldSchema
});

export const ModifyFieldOperation = z.object({
  type: z.literal('modify_field'),
  objectName: z.string(),
  fieldName: z.string(),
  changes: z.record(z.string(), z.unknown()) // Partial field definition updates
});

export const RemoveFieldOperation = z.object({
  type: z.literal('remove_field'),
  objectName: z.string(),
  fieldName: z.string()
});

export const CreateObjectOperation = z.object({
  type: z.literal('create_object'),
  object: ObjectSchema
});

export const RenameObjectOperation = z.object({
  type: z.literal('rename_object'),
  oldName: z.string(),
  newName: z.string()
});

export const DeleteObjectOperation = z.object({
  type: z.literal('delete_object'),
  objectName: z.string()
});

export const ExecuteSqlOperation = z.object({
  type: z.literal('execute_sql'),
  sql: z.string(),
  description: z.string().optional()
});

// Union of all possible operations
export const MigrationOperationSchema = z.discriminatedUnion('type', [
  AddFieldOperation,
  ModifyFieldOperation,
  RemoveFieldOperation,
  CreateObjectOperation,
  RenameObjectOperation,
  DeleteObjectOperation,
  ExecuteSqlOperation
]);

// --- Migration & ChangeSet ---

export const MigrationDependencySchema = z.object({
  migrationId: z.string(),
  package: z.string().optional()
});

export const ChangeSetSchema = z.object({
  id: z.string().uuid().describe('Unique identifier for this change set'),
  name: z.string().describe('Human readable name for the migration'),
  description: z.string().optional(),
  author: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  
  // Dependencies ensure migrations run in order
  dependencies: z.array(MigrationDependencySchema).optional(),
  
  // The actual atomic operations
  operations: z.array(MigrationOperationSchema),
  
  // Rollback operations (AI should generate these too)
  rollback: z.array(MigrationOperationSchema).optional()
});

export type ChangeSet = z.infer<typeof ChangeSetSchema>;
export type MigrationOperation = z.infer<typeof MigrationOperationSchema>;

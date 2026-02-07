import { z } from 'zod';
import { FieldSchema } from '../data/field.zod';
import { ObjectSchema } from '../data/object.zod';

// --- Atomic Operations ---

export const AddFieldOperation = z.object({
  type: z.literal('add_field'),
  objectName: z.string().describe('Target object name'),
  fieldName: z.string().describe('Name of the field to add'),
  field: FieldSchema
});

export const ModifyFieldOperation = z.object({
  type: z.literal('modify_field'),
  objectName: z.string().describe('Target object name'),
  fieldName: z.string().describe('Name of the field to modify'),
  changes: z.record(z.string(), z.unknown()).describe('Partial field definition updates')
});

export const RemoveFieldOperation = z.object({
  type: z.literal('remove_field'),
  objectName: z.string().describe('Target object name'),
  fieldName: z.string().describe('Name of the field to remove')
});

export const CreateObjectOperation = z.object({
  type: z.literal('create_object'),
  object: ObjectSchema.describe('Full object definition to create')
});

export const RenameObjectOperation = z.object({
  type: z.literal('rename_object'),
  oldName: z.string().describe('Current object name'),
  newName: z.string().describe('New object name')
});

export const DeleteObjectOperation = z.object({
  type: z.literal('delete_object'),
  objectName: z.string().describe('Name of the object to delete')
});

export const ExecuteSqlOperation = z.object({
  type: z.literal('execute_sql'),
  sql: z.string().describe('Raw SQL statement to execute'),
  description: z.string().optional().describe('Human-readable description of the SQL')
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
  migrationId: z.string().describe('ID of the migration this depends on'),
  package: z.string().optional().describe('Package that owns the dependency migration')
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

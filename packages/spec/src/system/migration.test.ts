import { describe, it, expect } from 'vitest';
import {
  AddFieldOperation,
  ModifyFieldOperation,
  RemoveFieldOperation,
  CreateObjectOperation,
  RenameObjectOperation,
  DeleteObjectOperation,
  ExecuteSqlOperation,
  MigrationOperationSchema,
  MigrationDependencySchema,
  ChangeSetSchema,
} from './migration.zod';

describe('AddFieldOperation', () => {
  it('should accept valid add_field operation', () => {
    const op = AddFieldOperation.parse({
      type: 'add_field',
      objectName: 'account',
      fieldName: 'email',
      field: { type: 'email' },
    });

    expect(op.type).toBe('add_field');
    expect(op.objectName).toBe('account');
    expect(op.fieldName).toBe('email');
  });

  it('should reject missing required fields', () => {
    expect(() => AddFieldOperation.parse({ type: 'add_field' })).toThrow();
    expect(() =>
      AddFieldOperation.parse({ type: 'add_field', objectName: 'x', fieldName: 'y' }),
    ).toThrow();
  });

  it('should reject wrong type literal', () => {
    expect(() =>
      AddFieldOperation.parse({
        type: 'remove_field',
        objectName: 'x',
        fieldName: 'y',
        field: { type: 'text' },
      }),
    ).toThrow();
  });
});

describe('ModifyFieldOperation', () => {
  it('should accept valid modify_field operation', () => {
    const op = ModifyFieldOperation.parse({
      type: 'modify_field',
      objectName: 'account',
      fieldName: 'email',
      changes: { required: true },
    });

    expect(op.type).toBe('modify_field');
    expect(op.changes).toEqual({ required: true });
  });

  it('should reject missing changes', () => {
    expect(() =>
      ModifyFieldOperation.parse({
        type: 'modify_field',
        objectName: 'account',
        fieldName: 'email',
      }),
    ).toThrow();
  });
});

describe('RemoveFieldOperation', () => {
  it('should accept valid remove_field operation', () => {
    const op = RemoveFieldOperation.parse({
      type: 'remove_field',
      objectName: 'account',
      fieldName: 'legacy_field',
    });

    expect(op.type).toBe('remove_field');
    expect(op.fieldName).toBe('legacy_field');
  });

  it('should reject missing fieldName', () => {
    expect(() =>
      RemoveFieldOperation.parse({ type: 'remove_field', objectName: 'account' }),
    ).toThrow();
  });
});

describe('CreateObjectOperation', () => {
  it('should accept valid create_object operation', () => {
    const op = CreateObjectOperation.parse({
      type: 'create_object',
      object: {
        name: 'project_task',
        fields: { name: { type: 'text' } },
      },
    });

    expect(op.type).toBe('create_object');
    expect(op.object.name).toBe('project_task');
  });

  it('should reject missing object', () => {
    expect(() => CreateObjectOperation.parse({ type: 'create_object' })).toThrow();
  });
});

describe('RenameObjectOperation', () => {
  it('should accept valid rename_object operation', () => {
    const op = RenameObjectOperation.parse({
      type: 'rename_object',
      oldName: 'task',
      newName: 'project_task',
    });

    expect(op.type).toBe('rename_object');
    expect(op.oldName).toBe('task');
    expect(op.newName).toBe('project_task');
  });

  it('should reject missing names', () => {
    expect(() => RenameObjectOperation.parse({ type: 'rename_object' })).toThrow();
    expect(() =>
      RenameObjectOperation.parse({ type: 'rename_object', oldName: 'x' }),
    ).toThrow();
  });
});

describe('DeleteObjectOperation', () => {
  it('should accept valid delete_object operation', () => {
    const op = DeleteObjectOperation.parse({
      type: 'delete_object',
      objectName: 'legacy_object',
    });

    expect(op.type).toBe('delete_object');
    expect(op.objectName).toBe('legacy_object');
  });

  it('should reject missing objectName', () => {
    expect(() => DeleteObjectOperation.parse({ type: 'delete_object' })).toThrow();
  });
});

describe('ExecuteSqlOperation', () => {
  it('should accept valid execute_sql operation', () => {
    const op = ExecuteSqlOperation.parse({
      type: 'execute_sql',
      sql: 'ALTER TABLE accounts ADD COLUMN phone TEXT',
    });

    expect(op.type).toBe('execute_sql');
    expect(op.sql).toContain('ALTER TABLE');
  });

  it('should accept optional description', () => {
    const op = ExecuteSqlOperation.parse({
      type: 'execute_sql',
      sql: 'CREATE INDEX idx_email ON accounts(email)',
      description: 'Add email index',
    });

    expect(op.description).toBe('Add email index');
  });

  it('should reject missing sql', () => {
    expect(() => ExecuteSqlOperation.parse({ type: 'execute_sql' })).toThrow();
  });
});

describe('MigrationOperationSchema', () => {
  it('should accept all operation types via discriminated union', () => {
    const ops = [
      { type: 'add_field', objectName: 'x', fieldName: 'y', field: { type: 'text' } },
      { type: 'modify_field', objectName: 'x', fieldName: 'y', changes: {} },
      { type: 'remove_field', objectName: 'x', fieldName: 'y' },
      { type: 'create_object', object: { name: 'test_obj', fields: { a: { type: 'text' } } } },
      { type: 'rename_object', oldName: 'a', newName: 'b' },
      { type: 'delete_object', objectName: 'x' },
      { type: 'execute_sql', sql: 'SELECT 1' },
    ];

    ops.forEach((op) => {
      expect(() => MigrationOperationSchema.parse(op)).not.toThrow();
    });
  });

  it('should reject unknown operation type', () => {
    expect(() =>
      MigrationOperationSchema.parse({ type: 'drop_table', tableName: 'x' }),
    ).toThrow();
  });
});

describe('MigrationDependencySchema', () => {
  it('should accept valid dependency', () => {
    const dep = MigrationDependencySchema.parse({
      migrationId: 'migration-001',
    });

    expect(dep.migrationId).toBe('migration-001');
    expect(dep.package).toBeUndefined();
  });

  it('should accept dependency with package', () => {
    const dep = MigrationDependencySchema.parse({
      migrationId: 'migration-002',
      package: 'crm-core',
    });

    expect(dep.package).toBe('crm-core');
  });

  it('should reject missing migrationId', () => {
    expect(() => MigrationDependencySchema.parse({})).toThrow();
  });
});

describe('ChangeSetSchema', () => {
  it('should accept minimal changeset', () => {
    const cs = ChangeSetSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Add email to accounts',
      operations: [
        { type: 'add_field', objectName: 'account', fieldName: 'email', field: { type: 'email' } },
      ],
    });

    expect(cs.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(cs.name).toBe('Add email to accounts');
    expect(cs.operations).toHaveLength(1);
  });

  it('should accept full changeset', () => {
    const cs = ChangeSetSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Restructure accounts',
      description: 'Rename and add fields to accounts',
      author: 'admin',
      createdAt: '2025-01-01T00:00:00Z',
      dependencies: [{ migrationId: 'migration-001', package: 'core' }],
      operations: [
        { type: 'add_field', objectName: 'account', fieldName: 'phone', field: { type: 'text' } },
        { type: 'remove_field', objectName: 'account', fieldName: 'fax' },
      ],
      rollback: [
        { type: 'add_field', objectName: 'account', fieldName: 'fax', field: { type: 'text' } },
        { type: 'remove_field', objectName: 'account', fieldName: 'phone' },
      ],
    });

    expect(cs.operations).toHaveLength(2);
    expect(cs.rollback).toHaveLength(2);
    expect(cs.dependencies).toHaveLength(1);
  });

  it('should reject invalid UUID for id', () => {
    expect(() =>
      ChangeSetSchema.parse({
        id: 'not-a-uuid',
        name: 'test',
        operations: [{ type: 'execute_sql', sql: 'SELECT 1' }],
      }),
    ).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => ChangeSetSchema.parse({})).toThrow();
    expect(() =>
      ChangeSetSchema.parse({ id: '550e8400-e29b-41d4-a716-446655440000', name: 'test' }),
    ).toThrow();
  });
});

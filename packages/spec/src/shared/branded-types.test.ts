import { describe, it, expect } from 'vitest';
import {
  ObjectNameSchema,
  FieldNameSchema,
  ViewNameSchema,
  AppNameSchema,
  FlowNameSchema,
  RoleNameSchema,
  type ObjectName,
  type FieldName,
  type ViewName,
  type AppName,
  type FlowName,
  type RoleName,
} from './branded-types.zod';

describe('ObjectNameSchema', () => {
  it('should accept valid snake_case object names', () => {
    const validNames = ['account', 'project_task', 'crm_lead', 'user_profile'];
    validNames.forEach((name) => {
      expect(() => ObjectNameSchema.parse(name)).not.toThrow();
    });
  });

  it('should reject dots (not allowed in object names)', () => {
    expect(() => ObjectNameSchema.parse('user.created')).toThrow();
  });

  it('should reject uppercase', () => {
    expect(() => ObjectNameSchema.parse('Account')).toThrow();
    expect(() => ObjectNameSchema.parse('projectTask')).toThrow();
  });

  it('should reject too short names', () => {
    expect(() => ObjectNameSchema.parse('a')).toThrow();
  });

  it('should produce branded type at runtime', () => {
    const name: ObjectName = ObjectNameSchema.parse('my_object');
    expect(name).toBe('my_object');
  });
});

describe('FieldNameSchema', () => {
  it('should accept valid snake_case field names', () => {
    const validNames = ['first_name', 'created_at', 'total_amount', 'is_active'];
    validNames.forEach((name) => {
      expect(() => FieldNameSchema.parse(name)).not.toThrow();
    });
  });

  it('should reject dots', () => {
    expect(() => FieldNameSchema.parse('user.name')).toThrow();
  });

  it('should reject camelCase', () => {
    expect(() => FieldNameSchema.parse('firstName')).toThrow();
  });

  it('should produce branded type at runtime', () => {
    const name: FieldName = FieldNameSchema.parse('task_name');
    expect(name).toBe('task_name');
  });
});

describe('ViewNameSchema', () => {
  it('should accept valid system identifiers', () => {
    const validNames = ['all_tasks', 'my_open_deals', 'contact.recent'];
    validNames.forEach((name) => {
      expect(() => ViewNameSchema.parse(name)).not.toThrow();
    });
  });

  it('should allow dots (namespacing)', () => {
    const name: ViewName = ViewNameSchema.parse('contact.recent');
    expect(name).toBe('contact.recent');
  });

  it('should reject uppercase', () => {
    expect(() => ViewNameSchema.parse('AllTasks')).toThrow();
  });
});

describe('AppNameSchema', () => {
  it('should accept valid app names', () => {
    const validNames = ['crm', 'helpdesk', 'project_management'];
    validNames.forEach((name) => {
      expect(() => AppNameSchema.parse(name)).not.toThrow();
    });
  });

  it('should produce branded type at runtime', () => {
    const name: AppName = AppNameSchema.parse('crm');
    expect(name).toBe('crm');
  });
});

describe('FlowNameSchema', () => {
  it('should accept valid flow names', () => {
    const validNames = ['approval_flow', 'onboarding_wizard', 'lead_qualification'];
    validNames.forEach((name) => {
      expect(() => FlowNameSchema.parse(name)).not.toThrow();
    });
  });

  it('should produce branded type at runtime', () => {
    const name: FlowName = FlowNameSchema.parse('approval_flow');
    expect(name).toBe('approval_flow');
  });
});

describe('RoleNameSchema', () => {
  it('should accept valid role names', () => {
    const validNames = ['admin', 'sales_manager', 'read_only'];
    validNames.forEach((name) => {
      expect(() => RoleNameSchema.parse(name)).not.toThrow();
    });
  });

  it('should produce branded type at runtime', () => {
    const name: RoleName = RoleNameSchema.parse('admin');
    expect(name).toBe('admin');
  });
});

describe('Branded type safety', () => {
  it('branded types parse the same underlying strings', () => {
    const objectName = ObjectNameSchema.parse('my_entity');
    const fieldName = FieldNameSchema.parse('my_entity');
    // At runtime both are 'my_entity' strings but TS types differ
    expect(objectName).toBe('my_entity');
    expect(fieldName).toBe('my_entity');
  });
});

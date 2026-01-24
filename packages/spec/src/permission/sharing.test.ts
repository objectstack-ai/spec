import { describe, it, expect } from 'vitest';
import {
  SharingRuleSchema,
  SharingRuleType,
  SharingLevel,
  OWDModel,
  type SharingRule,
} from './sharing.zod';

describe('SharingRuleType', () => {
  it('should accept valid sharing rule types', () => {
    const validTypes = ['owner', 'criteria', 'manual', 'guest'];

    validTypes.forEach(type => {
      expect(() => SharingRuleType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid sharing rule types', () => {
    expect(() => SharingRuleType.parse('automatic')).toThrow();
    expect(() => SharingRuleType.parse('public')).toThrow();
    expect(() => SharingRuleType.parse('')).toThrow();
  });
});

describe('SharingLevel', () => {
  it('should accept valid sharing levels', () => {
    const validLevels = ['read', 'edit'];

    validLevels.forEach(level => {
      expect(() => SharingLevel.parse(level)).not.toThrow();
    });
  });

  it('should reject invalid sharing levels', () => {
    expect(() => SharingLevel.parse('write')).toThrow();
    expect(() => SharingLevel.parse('delete')).toThrow();
    expect(() => SharingLevel.parse('full')).toThrow();
  });
});

describe('OWDModel', () => {
  it('should accept valid OWD models', () => {
    const validModels = ['private', 'public_read', 'public_read_write'];

    validModels.forEach(model => {
      expect(() => OWDModel.parse(model)).not.toThrow();
    });
  });

  it('should reject invalid OWD models', () => {
    expect(() => OWDModel.parse('public')).toThrow();
    expect(() => OWDModel.parse('public_write')).toThrow();
    expect(() => OWDModel.parse('')).toThrow();
  });
});

describe('SharingRuleSchema', () => {
  it('should accept valid minimal sharing rule', () => {
    const rule: SharingRule = {
      name: 'sales_team_access',
      object: 'opportunity',
      sharedWith: 'group_sales_team',
    };

    expect(() => SharingRuleSchema.parse(rule)).not.toThrow();
  });

  it('should validate rule name format (snake_case)', () => {
    expect(() => SharingRuleSchema.parse({
      name: 'valid_rule_name',
      object: 'account',
      sharedWith: 'group_id',
    })).not.toThrow();

    expect(() => SharingRuleSchema.parse({
      name: 'InvalidRule',
      object: 'account',
      sharedWith: 'group_id',
    })).toThrow();

    expect(() => SharingRuleSchema.parse({
      name: 'invalid-rule',
      object: 'account',
      sharedWith: 'group_id',
    })).toThrow();
  });

  it('should apply default values', () => {
    const rule = SharingRuleSchema.parse({
      name: 'test_rule',
      object: 'account',
      sharedWith: 'group_id',
    });

    expect(rule.active).toBe(true);
    expect(rule.type).toBe('criteria');
    expect(rule.accessLevel).toBe('read');
  });

  it('should accept sharing rule with all fields', () => {
    const rule = SharingRuleSchema.parse({
      name: 'full_sharing_rule',
      label: 'Full Sharing Rule',
      active: true,
      object: 'opportunity',
      type: 'criteria',
      criteria: "stage = 'Closed Won' AND amount > 100000",
      accessLevel: 'edit',
      sharedWith: 'group_executive_team',
    });

    expect(rule.label).toBe('Full Sharing Rule');
    expect(rule.criteria).toContain('Closed Won');
  });

  it('should accept different sharing rule types', () => {
    const types: Array<SharingRule['type']> = ['owner', 'criteria', 'manual', 'guest'];

    types.forEach(type => {
      const rule = SharingRuleSchema.parse({
        name: 'test_rule',
        object: 'account',
        type,
        sharedWith: 'group_id',
      });
      expect(rule.type).toBe(type);
    });
  });

  it('should accept different access levels', () => {
    const levels: Array<SharingRule['accessLevel']> = ['read', 'edit'];

    levels.forEach(level => {
      const rule = SharingRuleSchema.parse({
        name: 'test_rule',
        object: 'account',
        accessLevel: level,
        sharedWith: 'group_id',
      });
      expect(rule.accessLevel).toBe(level);
    });
  });

  it('should accept owner-based sharing rule', () => {
    const rule = SharingRuleSchema.parse({
      name: 'owner_hierarchy_rule',
      object: 'account',
      type: 'owner',
      accessLevel: 'read',
      sharedWith: 'role_sales_manager',
    });

    expect(rule.type).toBe('owner');
  });

  it('should accept criteria-based sharing rule', () => {
    const rule = SharingRuleSchema.parse({
      name: 'high_value_accounts',
      object: 'account',
      type: 'criteria',
      criteria: "annual_revenue > 1000000 AND status = 'Active'",
      accessLevel: 'read',
      sharedWith: 'group_executive_team',
    });

    expect(rule.type).toBe('criteria');
    expect(rule.criteria).toBeDefined();
  });

  it('should accept manual sharing rule', () => {
    const rule = SharingRuleSchema.parse({
      name: 'manual_share',
      object: 'opportunity',
      type: 'manual',
      accessLevel: 'edit',
      sharedWith: 'user_john_doe',
    });

    expect(rule.type).toBe('manual');
  });

  it('should accept guest sharing rule', () => {
    const rule = SharingRuleSchema.parse({
      name: 'public_access',
      object: 'knowledge_article',
      type: 'guest',
      accessLevel: 'read',
      sharedWith: 'guest_users',
    });

    expect(rule.type).toBe('guest');
  });

  it('should accept inactive sharing rule', () => {
    const rule = SharingRuleSchema.parse({
      name: 'disabled_rule',
      object: 'account',
      active: false,
      sharedWith: 'group_id',
    });

    expect(rule.active).toBe(false);
  });

  it('should handle sales territory sharing', () => {
    const rule = SharingRuleSchema.parse({
      name: 'west_coast_territory',
      label: 'West Coast Territory Access',
      object: 'account',
      type: 'criteria',
      criteria: "billing_state IN ('CA', 'OR', 'WA')",
      accessLevel: 'edit',
      sharedWith: 'group_west_coast_sales',
    });

    expect(rule.criteria).toContain('CA');
  });

  it('should handle department-based sharing', () => {
    const rule = SharingRuleSchema.parse({
      name: 'finance_department_access',
      object: 'invoice',
      type: 'criteria',
      criteria: "department = 'Finance'",
      accessLevel: 'edit',
      sharedWith: 'group_finance_team',
    });

    expect(rule.object).toBe('invoice');
  });

  it('should handle read-only sharing', () => {
    const rule = SharingRuleSchema.parse({
      name: 'readonly_access',
      object: 'contract',
      type: 'criteria',
      criteria: "status = 'Executed'",
      accessLevel: 'read',
      sharedWith: 'group_all_users',
    });

    expect(rule.accessLevel).toBe('read');
  });

  it('should handle edit access sharing', () => {
    const rule = SharingRuleSchema.parse({
      name: 'edit_access',
      object: 'opportunity',
      type: 'criteria',
      criteria: "stage != 'Closed Won'",
      accessLevel: 'edit',
      sharedWith: 'group_sales_reps',
    });

    expect(rule.accessLevel).toBe('edit');
  });

  it('should reject sharing rule without required fields', () => {
    expect(() => SharingRuleSchema.parse({
      object: 'account',
      sharedWith: 'group_id',
    })).toThrow();

    expect(() => SharingRuleSchema.parse({
      name: 'test_rule',
      sharedWith: 'group_id',
    })).toThrow();

    expect(() => SharingRuleSchema.parse({
      name: 'test_rule',
      object: 'account',
    })).toThrow();
  });

  it('should reject invalid sharing rule type', () => {
    expect(() => SharingRuleSchema.parse({
      name: 'test_rule',
      object: 'account',
      type: 'invalid_type',
      sharedWith: 'group_id',
    })).toThrow();
  });

  it('should reject invalid access level', () => {
    expect(() => SharingRuleSchema.parse({
      name: 'test_rule',
      object: 'account',
      accessLevel: 'delete',
      sharedWith: 'group_id',
    })).toThrow();
  });
});

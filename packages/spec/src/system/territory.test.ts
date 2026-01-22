import { describe, it, expect } from 'vitest';
import {
  TerritorySchema,
  TerritoryModelSchema,
  TerritoryType,
  type Territory,
  type TerritoryModel,
} from './territory.zod';

describe('TerritoryType', () => {
  it('should accept valid territory types', () => {
    const validTypes = ['geography', 'industry', 'named_account', 'product_line'];

    validTypes.forEach(type => {
      expect(() => TerritoryType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid territory types', () => {
    expect(() => TerritoryType.parse('customer')).toThrow();
    expect(() => TerritoryType.parse('region')).toThrow();
    expect(() => TerritoryType.parse('')).toThrow();
  });
});

describe('TerritoryModelSchema', () => {
  it('should accept valid minimal territory model', () => {
    const model: TerritoryModel = {
      name: 'FY2024 Planning',
    };

    expect(() => TerritoryModelSchema.parse(model)).not.toThrow();
  });

  it('should apply default state', () => {
    const model = TerritoryModelSchema.parse({
      name: 'FY2024',
    });

    expect(model.state).toBe('planning');
  });

  it('should accept model with all fields', () => {
    const model = TerritoryModelSchema.parse({
      name: 'FY2024 Planning',
      state: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });

    expect(model.state).toBe('active');
    expect(model.startDate).toBe('2024-01-01');
    expect(model.endDate).toBe('2024-12-31');
  });

  it('should accept different states', () => {
    const states: Array<TerritoryModel['state']> = ['planning', 'active', 'archived'];

    states.forEach(state => {
      const model = TerritoryModelSchema.parse({
        name: 'Test Model',
        state,
      });
      expect(model.state).toBe(state);
    });
  });

  it('should reject invalid state', () => {
    expect(() => TerritoryModelSchema.parse({
      name: 'Test Model',
      state: 'inactive',
    })).toThrow();
  });

  it('should handle fiscal year planning model', () => {
    const model = TerritoryModelSchema.parse({
      name: 'FY2024 Planning',
      state: 'planning',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });

    expect(model.name).toBe('FY2024 Planning');
  });

  it('should handle active territory model', () => {
    const model = TerritoryModelSchema.parse({
      name: 'Current Territory',
      state: 'active',
    });

    expect(model.state).toBe('active');
  });
});

describe('TerritorySchema', () => {
  it('should accept valid minimal territory', () => {
    const territory: Territory = {
      name: 'west_coast',
      label: 'West Coast',
      modelId: 'fy2024',
    };

    expect(() => TerritorySchema.parse(territory)).not.toThrow();
  });

  it('should validate territory name format (snake_case)', () => {
    expect(() => TerritorySchema.parse({
      name: 'valid_territory_name',
      label: 'Valid Territory',
      modelId: 'model1',
    })).not.toThrow();

    expect(() => TerritorySchema.parse({
      name: 'InvalidTerritory',
      label: 'Invalid',
      modelId: 'model1',
    })).toThrow();

    expect(() => TerritorySchema.parse({
      name: 'invalid-territory',
      label: 'Invalid',
      modelId: 'model1',
    })).toThrow();
  });

  it('should apply default values', () => {
    const territory = TerritorySchema.parse({
      name: 'test_territory',
      label: 'Test Territory',
      modelId: 'model1',
    });

    expect(territory.type).toBe('geography');
    expect(territory.accountAccess).toBe('read');
    expect(territory.opportunityAccess).toBe('read');
    expect(territory.caseAccess).toBe('read');
  });

  it('should accept parent territory', () => {
    const territory = TerritorySchema.parse({
      name: 'northern_california',
      label: 'Northern California',
      modelId: 'fy2024',
      parent: 'west_coast',
    });

    expect(territory.parent).toBe('west_coast');
  });

  it('should accept different territory types', () => {
    const types: Array<Territory['type']> = ['geography', 'industry', 'named_account', 'product_line'];

    types.forEach(type => {
      const territory = TerritorySchema.parse({
        name: 'test_territory',
        label: 'Test',
        modelId: 'model1',
        type,
      });
      expect(territory.type).toBe(type);
    });
  });

  it('should accept assignment rule', () => {
    const territory = TerritorySchema.parse({
      name: 'california',
      label: 'California',
      modelId: 'fy2024',
      assignmentRule: "BillingCountry = 'US' AND BillingState = 'CA'",
    });

    expect(territory.assignmentRule).toBe("BillingCountry = 'US' AND BillingState = 'CA'");
  });

  it('should accept assigned users', () => {
    const territory = TerritorySchema.parse({
      name: 'west_coast',
      label: 'West Coast',
      modelId: 'fy2024',
      assignedUsers: ['user1', 'user2', 'user3'],
    });

    expect(territory.assignedUsers).toEqual(['user1', 'user2', 'user3']);
  });

  it('should accept access levels', () => {
    const territory = TerritorySchema.parse({
      name: 'emea',
      label: 'EMEA',
      modelId: 'fy2024',
      accountAccess: 'edit',
      opportunityAccess: 'edit',
      caseAccess: 'read',
    });

    expect(territory.accountAccess).toBe('edit');
    expect(territory.opportunityAccess).toBe('edit');
    expect(territory.caseAccess).toBe('read');
  });

  it('should reject invalid access levels', () => {
    expect(() => TerritorySchema.parse({
      name: 'test',
      label: 'Test',
      modelId: 'model1',
      accountAccess: 'write',
    })).toThrow();
  });

  it('should handle geographic territory', () => {
    const territory = TerritorySchema.parse({
      name: 'north_america',
      label: 'North America',
      modelId: 'fy2024',
      type: 'geography',
      assignmentRule: "BillingCountry IN ('US', 'CA', 'MX')",
      assignedUsers: ['sales_manager_1'],
    });

    expect(territory.type).toBe('geography');
  });

  it('should handle industry vertical territory', () => {
    const territory = TerritorySchema.parse({
      name: 'healthcare',
      label: 'Healthcare',
      modelId: 'fy2024',
      type: 'industry',
      assignmentRule: "Industry = 'Healthcare'",
      assignedUsers: ['industry_specialist_1', 'industry_specialist_2'],
    });

    expect(territory.type).toBe('industry');
  });

  it('should handle named account territory', () => {
    const territory = TerritorySchema.parse({
      name: 'strategic_accounts',
      label: 'Strategic Accounts',
      modelId: 'fy2024',
      type: 'named_account',
      assignmentRule: "AccountType = 'Strategic'",
      assignedUsers: ['strategic_account_manager'],
      accountAccess: 'edit',
      opportunityAccess: 'edit',
    });

    expect(territory.type).toBe('named_account');
    expect(territory.accountAccess).toBe('edit');
  });

  it('should handle product line territory', () => {
    const territory = TerritorySchema.parse({
      name: 'cloud_products',
      label: 'Cloud Products',
      modelId: 'fy2024',
      type: 'product_line',
      assignedUsers: ['product_specialist_1'],
    });

    expect(territory.type).toBe('product_line');
  });

  it('should handle hierarchical territories', () => {
    const parent = TerritorySchema.parse({
      name: 'americas',
      label: 'Americas',
      modelId: 'fy2024',
    });

    const child = TerritorySchema.parse({
      name: 'north_america',
      label: 'North America',
      modelId: 'fy2024',
      parent: 'americas',
    });

    expect(child.parent).toBe('americas');
  });

  it('should handle territory with multiple users', () => {
    const territory = TerritorySchema.parse({
      name: 'enterprise_accounts',
      label: 'Enterprise Accounts',
      modelId: 'fy2024',
      assignedUsers: ['rep1', 'rep2', 'rep3', 'manager1'],
    });

    expect(territory.assignedUsers).toHaveLength(4);
  });

  it('should reject territory without required fields', () => {
    expect(() => TerritorySchema.parse({
      label: 'Test',
      modelId: 'model1',
    })).toThrow();

    expect(() => TerritorySchema.parse({
      name: 'test',
      modelId: 'model1',
    })).toThrow();

    expect(() => TerritorySchema.parse({
      name: 'test',
      label: 'Test',
    })).toThrow();
  });
});

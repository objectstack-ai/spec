import { describe, it, expect } from 'vitest';
import {
  MaskingStrategySchema,
  MaskingRuleSchema,
  MaskingConfigSchema,
} from './masking.zod';

describe('MaskingStrategySchema', () => {
  it('should accept valid strategies', () => {
    const strategies = ['redact', 'partial', 'hash', 'tokenize', 'randomize', 'nullify', 'substitute'];

    strategies.forEach((strategy) => {
      expect(() => MaskingStrategySchema.parse(strategy)).not.toThrow();
    });
  });

  it('should reject invalid strategies', () => {
    expect(() => MaskingStrategySchema.parse('invalid')).toThrow();
    expect(() => MaskingStrategySchema.parse('encrypt')).toThrow();
  });
});

describe('MaskingRuleSchema', () => {
  it('should accept valid rule with defaults', () => {
    const rule = MaskingRuleSchema.parse({
      field: 'ssn',
      strategy: 'redact',
    });

    expect(rule.field).toBe('ssn');
    expect(rule.strategy).toBe('redact');
    expect(rule.preserveFormat).toBe(true);
    expect(rule.preserveLength).toBe(true);
  });

  it('should accept full rule configuration', () => {
    const rule = MaskingRuleSchema.parse({
      field: 'phone_number',
      strategy: 'partial',
      pattern: '^(\\d{3}).*$',
      preserveFormat: false,
      preserveLength: false,
      roles: ['viewer', 'analyst'],
      exemptRoles: ['admin', 'compliance_officer'],
    });

    expect(rule.field).toBe('phone_number');
    expect(rule.strategy).toBe('partial');
    expect(rule.pattern).toBe('^(\\d{3}).*$');
    expect(rule.preserveFormat).toBe(false);
    expect(rule.preserveLength).toBe(false);
    expect(rule.roles).toEqual(['viewer', 'analyst']);
    expect(rule.exemptRoles).toEqual(['admin', 'compliance_officer']);
  });

  it('should reject missing required fields', () => {
    expect(() => MaskingRuleSchema.parse({})).toThrow();
    expect(() => MaskingRuleSchema.parse({ field: 'ssn' })).toThrow();
  });

  it('should reject invalid strategy', () => {
    expect(() => MaskingRuleSchema.parse({ field: 'ssn', strategy: 'invalid' })).toThrow();
  });
});

describe('MaskingConfigSchema', () => {
  it('should accept valid config with defaults', () => {
    const config = MaskingConfigSchema.parse({
      rules: [{ field: 'email', strategy: 'redact' }],
    });

    expect(config.enabled).toBe(false);
    expect(config.auditUnmasking).toBe(true);
    expect(config.rules).toHaveLength(1);
  });

  it('should accept full configuration', () => {
    const config = MaskingConfigSchema.parse({
      enabled: true,
      rules: [
        { field: 'ssn', strategy: 'redact' },
        { field: 'phone', strategy: 'partial', pattern: '^(\\d{3})' },
        { field: 'email', strategy: 'hash' },
      ],
      auditUnmasking: false,
    });

    expect(config.enabled).toBe(true);
    expect(config.rules).toHaveLength(3);
    expect(config.auditUnmasking).toBe(false);
  });

  it('should reject missing required rules', () => {
    expect(() => MaskingConfigSchema.parse({})).toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import {
  OpsFilePathSchema,
  OpsDomainModuleSchema,
  OpsPluginStructureSchema,
} from './plugin-structure.zod';

describe('OpsFilePathSchema', () => {
  it('should accept valid OPS file paths', () => {
    const validPaths = [
      'src/crm/lead.object.ts',
      'src/finance/invoice_payment.trigger.ts',
      'src/index.ts',
      'src/crm/index.ts',
      'src/hr/employee.view.ts',
      'src/billing/charge.function.ts',
    ];

    validPaths.forEach(path => {
      expect(() => OpsFilePathSchema.parse(path)).not.toThrow();
    });
  });

  it('should accept non-src paths without validation', () => {
    expect(() => OpsFilePathSchema.parse('package.json')).not.toThrow();
    expect(() => OpsFilePathSchema.parse('objectstack.config.ts')).not.toThrow();
    expect(() => OpsFilePathSchema.parse('README.md')).not.toThrow();
  });

  it('should reject PascalCase domain directories', () => {
    const result = OpsFilePathSchema.safeParse('src/CRM/lead.object.ts');
    expect(result.success).toBe(false);
  });

  it('should reject PascalCase file base names', () => {
    const result = OpsFilePathSchema.safeParse('src/crm/LeadObject.object.ts');
    expect(result.success).toBe(false);
  });

  it('should accept main.ts as a skip file', () => {
    expect(() => OpsFilePathSchema.parse('src/main.ts')).not.toThrow();
  });

  it('should accept deeply nested valid paths', () => {
    expect(() => OpsFilePathSchema.parse('src/crm/contacts/person.object.ts')).not.toThrow();
  });
});

describe('OpsDomainModuleSchema', () => {
  it('should accept valid domain module', () => {
    const module = {
      name: 'crm',
      files: ['index.ts', 'lead.object.ts', 'contact.view.ts'],
    };
    expect(() => OpsDomainModuleSchema.parse(module)).not.toThrow();
  });

  it('should reject module missing index.ts', () => {
    const module = {
      name: 'crm',
      files: ['lead.object.ts'],
    };
    const result = OpsDomainModuleSchema.safeParse(module);
    expect(result.success).toBe(false);
  });

  it('should reject non-snake_case module name', () => {
    expect(() => OpsDomainModuleSchema.parse({
      name: 'MyModule',
      files: ['index.ts'],
    })).toThrow();
  });

  it('should accept module with metadata', () => {
    const module = {
      name: 'billing',
      files: ['index.ts', 'invoice.object.ts'],
      metadata: { version: '1.0', custom: true },
    };
    const parsed = OpsDomainModuleSchema.parse(module);
    expect(parsed.metadata?.version).toBe('1.0');
  });

  it('should reject empty name', () => {
    expect(() => OpsDomainModuleSchema.parse({
      name: '',
      files: ['index.ts'],
    })).toThrow();
  });
});

describe('OpsPluginStructureSchema', () => {
  it('should accept valid plugin structure', () => {
    const structure = {
      root: '/workspace/my-plugin',
      files: [
        'objectstack.config.ts',
        'src/index.ts',
        'src/crm/lead.object.ts',
        'src/crm/index.ts',
      ],
    };
    expect(() => OpsPluginStructureSchema.parse(structure)).not.toThrow();
  });

  it('should reject plugin missing objectstack.config.ts', () => {
    const structure = {
      root: '/workspace/my-plugin',
      files: ['src/index.ts', 'src/crm/lead.object.ts'],
    };
    const result = OpsPluginStructureSchema.safeParse(structure);
    expect(result.success).toBe(false);
  });

  it('should reject plugin with invalid src file paths', () => {
    const structure = {
      root: '/workspace/my-plugin',
      files: [
        'objectstack.config.ts',
        'src/CRM/Lead.object.ts',
      ],
    };
    const result = OpsPluginStructureSchema.safeParse(structure);
    expect(result.success).toBe(false);
  });

  it('should accept plugin with metadata', () => {
    const structure = {
      root: '/workspace/my-plugin',
      files: ['objectstack.config.ts', 'src/index.ts'],
      metadata: { scanned: true },
    };
    const parsed = OpsPluginStructureSchema.parse(structure);
    expect(parsed.metadata?.scanned).toBe(true);
  });

  it('should accept valid non-src files alongside config', () => {
    const structure = {
      root: '/workspace/my-plugin',
      files: [
        'objectstack.config.ts',
        'package.json',
        'README.md',
        'src/index.ts',
      ],
    };
    expect(() => OpsPluginStructureSchema.parse(structure)).not.toThrow();
  });

  it('should reject missing root', () => {
    expect(() => OpsPluginStructureSchema.parse({
      files: ['objectstack.config.ts'],
    })).toThrow();
  });

  it('should reject missing files', () => {
    expect(() => OpsPluginStructureSchema.parse({
      root: '/workspace',
    })).toThrow();
  });
});

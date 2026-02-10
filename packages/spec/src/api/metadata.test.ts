import { describe, it, expect } from 'vitest';
import {
  ObjectDefinitionResponseSchema,
  AppDefinitionResponseSchema,
  ConceptListResponseSchema,
} from './metadata.zod';

describe('ObjectDefinitionResponseSchema', () => {
  it('should accept valid object definition response', () => {
    const result = ObjectDefinitionResponseSchema.parse({
      success: true,
      data: {
        name: 'project_task',
        fields: {
          title: { type: 'text', label: 'Title' },
        },
      },
    });
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('project_task');
  });

  it('should reject missing data', () => {
    expect(() =>
      ObjectDefinitionResponseSchema.parse({ success: true })
    ).toThrow();
  });

  it('should reject invalid object name in data', () => {
    expect(() =>
      ObjectDefinitionResponseSchema.parse({
        success: true,
        data: {
          name: 'InvalidName',
          fields: {},
        },
      })
    ).toThrow();
  });

  it('should accept optional meta and error fields', () => {
    const result = ObjectDefinitionResponseSchema.parse({
      success: false,
      error: { code: 'not_found', message: 'Object not found' },
      meta: { timestamp: '2025-01-01T00:00:00Z' },
      data: {
        name: 'account',
        fields: {},
      },
    });
    expect(result.error?.code).toBe('not_found');
    expect(result.meta?.timestamp).toBe('2025-01-01T00:00:00Z');
  });
});

describe('AppDefinitionResponseSchema', () => {
  it('should accept valid app definition response', () => {
    const result = AppDefinitionResponseSchema.parse({
      success: true,
      data: {
        name: 'crm_app',
        label: 'CRM App',
      },
    });
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('crm_app');
    expect(result.data.label).toBe('CRM App');
  });

  it('should reject missing data', () => {
    expect(() =>
      AppDefinitionResponseSchema.parse({ success: true })
    ).toThrow();
  });

  it('should reject invalid app name', () => {
    expect(() =>
      AppDefinitionResponseSchema.parse({
        success: true,
        data: {
          name: 'CRM',
          label: 'CRM',
        },
      })
    ).toThrow();
  });

  it('should accept app with navigation', () => {
    const result = AppDefinitionResponseSchema.parse({
      success: true,
      data: {
        name: 'sales_app',
        label: 'Sales',
        navigation: [
          {
            type: 'object',
            id: 'nav_leads',
            label: 'Leads',
            objectName: 'leads',
          },
        ],
      },
    });
    expect(result.data.navigation).toHaveLength(1);
  });
});

describe('ConceptListResponseSchema', () => {
  it('should accept valid concept list response', () => {
    const result = ConceptListResponseSchema.parse({
      success: true,
      data: [
        { name: 'account', label: 'Account' },
        { name: 'contact', label: 'Contact', icon: 'user', description: 'Contacts' },
      ],
    });
    expect(result.data).toHaveLength(2);
    expect(result.data[0].name).toBe('account');
  });

  it('should accept empty concept list', () => {
    const result = ConceptListResponseSchema.parse({
      success: true,
      data: [],
    });
    expect(result.data).toHaveLength(0);
  });

  it('should reject concept items missing required fields', () => {
    expect(() =>
      ConceptListResponseSchema.parse({
        success: true,
        data: [{ name: 'account' }],
      })
    ).toThrow();
  });

  it('should accept concept items with optional icon and description', () => {
    const result = ConceptListResponseSchema.parse({
      success: true,
      data: [{ name: 'flow', label: 'Flow', icon: 'zap' }],
    });
    expect(result.data[0].icon).toBe('zap');
    expect(result.data[0].description).toBeUndefined();
  });
});

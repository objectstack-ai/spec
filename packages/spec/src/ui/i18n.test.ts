import { describe, it, expect } from 'vitest';
import {
  I18nObjectSchema,
  I18nLabelSchema,
  AriaPropsSchema,
  type I18nObject,
  type I18nLabel,
  type AriaProps,
} from './i18n.zod';

describe('I18nObjectSchema', () => {
  it('should accept valid i18n object with key only', () => {
    const obj: I18nObject = {
      key: 'views.task_list.label',
    };

    const result = I18nObjectSchema.parse(obj);
    expect(result.key).toBe('views.task_list.label');
    expect(result.defaultValue).toBeUndefined();
    expect(result.params).toBeUndefined();
  });

  it('should accept i18n object with all fields', () => {
    const obj: I18nObject = {
      key: 'apps.crm.description',
      defaultValue: 'Sales CRM Application',
      params: { count: 5, name: 'John' },
    };

    const result = I18nObjectSchema.parse(obj);
    expect(result.key).toBe('apps.crm.description');
    expect(result.defaultValue).toBe('Sales CRM Application');
    expect(result.params).toEqual({ count: 5, name: 'John' });
  });

  it('should reject i18n object without key', () => {
    expect(() => I18nObjectSchema.parse({})).toThrow();
    expect(() => I18nObjectSchema.parse({ defaultValue: 'Test' })).toThrow();
  });
});

describe('I18nLabelSchema', () => {
  it('should accept plain string (backward compatible)', () => {
    const result = I18nLabelSchema.parse('All Active');
    expect(result).toBe('All Active');
  });

  it('should accept empty string', () => {
    const result = I18nLabelSchema.parse('');
    expect(result).toBe('');
  });

  it('should accept i18n object', () => {
    const label: I18nLabel = {
      key: 'views.task_list.label',
      defaultValue: 'Task List',
    };

    const result = I18nLabelSchema.parse(label);
    expect(typeof result).toBe('object');
    expect((result as I18nObject).key).toBe('views.task_list.label');
  });

  it('should accept i18n object with params', () => {
    const label = {
      key: 'common.item_count',
      defaultValue: '{count} items',
      params: { count: 42 },
    };

    const result = I18nLabelSchema.parse(label);
    expect((result as I18nObject).params).toEqual({ count: 42 });
  });

  it('should reject non-string, non-object values', () => {
    expect(() => I18nLabelSchema.parse(123)).toThrow();
    expect(() => I18nLabelSchema.parse(true)).toThrow();
    expect(() => I18nLabelSchema.parse(null)).toThrow();
    expect(() => I18nLabelSchema.parse(undefined)).toThrow();
  });
});

describe('AriaPropsSchema', () => {
  it('should accept empty ARIA props', () => {
    const result = AriaPropsSchema.parse({});
    expect(result.ariaLabel).toBeUndefined();
    expect(result.ariaDescribedBy).toBeUndefined();
    expect(result.role).toBeUndefined();
  });

  it('should accept ariaLabel as plain string', () => {
    const props: AriaProps = {
      ariaLabel: 'Close dialog',
    };

    const result = AriaPropsSchema.parse(props);
    expect(result.ariaLabel).toBe('Close dialog');
  });

  it('should accept ariaLabel as i18n object', () => {
    const props = {
      ariaLabel: {
        key: 'common.close_dialog',
        defaultValue: 'Close dialog',
      },
    };

    const result = AriaPropsSchema.parse(props);
    expect(typeof result.ariaLabel).toBe('object');
    expect((result.ariaLabel as I18nObject).key).toBe('common.close_dialog');
  });

  it('should accept all ARIA properties', () => {
    const props: AriaProps = {
      ariaLabel: 'Navigation menu',
      ariaDescribedBy: 'nav-description',
      role: 'navigation',
    };

    const result = AriaPropsSchema.parse(props);
    expect(result.ariaLabel).toBe('Navigation menu');
    expect(result.ariaDescribedBy).toBe('nav-description');
    expect(result.role).toBe('navigation');
  });

  it('should accept common ARIA roles', () => {
    const roles = ['dialog', 'navigation', 'alert', 'button', 'form', 'main', 'complementary'];

    roles.forEach(role => {
      expect(() => AriaPropsSchema.parse({ role })).not.toThrow();
    });
  });
});

describe('I18n Integration (backward compatibility)', () => {
  it('should seamlessly support both string and object in same context', () => {
    // Simulates a record with mixed label types (migration scenario)
    const labels: I18nLabel[] = [
      'Plain String Label',
      { key: 'labels.translated', defaultValue: 'Translated Label' },
      'Another Plain String',
      { key: 'labels.with_params', params: { count: 10 } },
    ];

    labels.forEach(label => {
      expect(() => I18nLabelSchema.parse(label)).not.toThrow();
    });
  });
});

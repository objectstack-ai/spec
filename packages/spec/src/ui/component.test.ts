import { describe, it, expect } from 'vitest';
import {
  PageHeaderProps,
  PageTabsProps,
  PageCardProps,
  RecordDetailsProps,
  RecordRelatedListProps,
  RecordHighlightsProps,
  ComponentPropsMap,
} from './component.zod';

describe('PageHeaderProps', () => {
  it('should accept minimal header', () => {
    const result = PageHeaderProps.parse({ title: 'My Page' });
    expect(result.title).toBe('My Page');
    expect(result.breadcrumb).toBe(true);
    expect(result.subtitle).toBeUndefined();
    expect(result.icon).toBeUndefined();
    expect(result.actions).toBeUndefined();
  });

  it('should accept full header with all fields', () => {
    const header = {
      title: 'Dashboard',
      subtitle: 'Overview',
      icon: 'home',
      breadcrumb: false,
      actions: ['action-1', 'action-2'],
    };
    const result = PageHeaderProps.parse(header);
    expect(result.breadcrumb).toBe(false);
    expect(result.actions).toHaveLength(2);
  });

  it('should reject header without title', () => {
    expect(() => PageHeaderProps.parse({})).toThrow();
  });
});

describe('PageTabsProps', () => {
  it('should accept valid tabs with defaults', () => {
    const tabs = {
      items: [{ label: 'Tab 1', children: [] }],
    };
    const result = PageTabsProps.parse(tabs);
    expect(result.type).toBe('line');
    expect(result.position).toBe('top');
    expect(result.items).toHaveLength(1);
  });

  it('should accept tabs with all options', () => {
    const tabs = {
      type: 'card' as const,
      position: 'left' as const,
      items: [{ label: 'Tab 1', icon: 'settings', children: ['child1'] }],
    };
    expect(() => PageTabsProps.parse(tabs)).not.toThrow();
  });

  it('should reject invalid type enum', () => {
    expect(() => PageTabsProps.parse({ type: 'invalid', items: [] })).toThrow();
  });

  it('should reject tabs without items', () => {
    expect(() => PageTabsProps.parse({})).toThrow();
  });
});

describe('PageCardProps', () => {
  it('should accept empty card with defaults', () => {
    const result = PageCardProps.parse({});
    expect(result.bordered).toBe(true);
    expect(result.title).toBeUndefined();
    expect(result.actions).toBeUndefined();
    expect(result.body).toBeUndefined();
    expect(result.footer).toBeUndefined();
  });

  it('should accept full card', () => {
    const card = {
      title: 'Info Card',
      bordered: false,
      actions: ['edit', 'delete'],
      body: ['component1'],
      footer: ['footer-component'],
    };
    const result = PageCardProps.parse(card);
    expect(result.title).toBe('Info Card');
    expect(result.bordered).toBe(false);
  });
});

describe('RecordDetailsProps', () => {
  it('should accept empty with defaults', () => {
    const result = RecordDetailsProps.parse({});
    expect(result.columns).toBe('2');
    expect(result.layout).toBe('auto');
    expect(result.sections).toBeUndefined();
  });

  it('should accept custom layout with sections', () => {
    const details = { columns: '3' as const, layout: 'custom' as const, sections: ['sec-1', 'sec-2'] };
    expect(() => RecordDetailsProps.parse(details)).not.toThrow();
  });

  it('should reject invalid column value', () => {
    expect(() => RecordDetailsProps.parse({ columns: '5' })).toThrow();
  });
});

describe('RecordRelatedListProps', () => {
  it('should accept valid related list', () => {
    const props = {
      objectName: 'contact',
      relationshipField: 'account_id',
      columns: ['name', 'email'],
    };
    const result = RecordRelatedListProps.parse(props);
    expect(result.limit).toBe(5);
    expect(result.sort).toBeUndefined();
  });

  it('should accept full related list with optional fields', () => {
    const props = {
      objectName: 'opportunity',
      relationshipField: 'account_id',
      columns: ['name', 'amount'],
      sort: 'created_at',
      limit: 10,
    };
    expect(() => RecordRelatedListProps.parse(props)).not.toThrow();
  });

  it('should reject without required fields', () => {
    expect(() => RecordRelatedListProps.parse({})).toThrow();
    expect(() => RecordRelatedListProps.parse({ objectName: 'x' })).toThrow();
  });
});

describe('RecordHighlightsProps', () => {
  it('should accept valid highlights', () => {
    const props = { fields: ['name', 'status', 'amount'] };
    const result = RecordHighlightsProps.parse(props);
    expect(result.fields).toHaveLength(3);
  });

  it('should reject empty fields array (min 1)', () => {
    expect(() => RecordHighlightsProps.parse({ fields: [] })).toThrow();
  });

  it('should reject more than 7 fields', () => {
    expect(() => RecordHighlightsProps.parse({ fields: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] })).toThrow();
  });

  it('should reject missing fields', () => {
    expect(() => RecordHighlightsProps.parse({})).toThrow();
  });
});

describe('ComponentPropsMap', () => {
  it('should contain structure components', () => {
    expect(ComponentPropsMap['page:header']).toBeDefined();
    expect(ComponentPropsMap['page:tabs']).toBeDefined();
    expect(ComponentPropsMap['page:card']).toBeDefined();
    expect(ComponentPropsMap['page:footer']).toBeDefined();
    expect(ComponentPropsMap['page:sidebar']).toBeDefined();
    expect(ComponentPropsMap['page:accordion']).toBeDefined();
    expect(ComponentPropsMap['page:section']).toBeDefined();
  });

  it('should contain record components', () => {
    expect(ComponentPropsMap['record:details']).toBeDefined();
    expect(ComponentPropsMap['record:related_list']).toBeDefined();
    expect(ComponentPropsMap['record:highlights']).toBeDefined();
    expect(ComponentPropsMap['record:activity']).toBeDefined();
    expect(ComponentPropsMap['record:chatter']).toBeDefined();
    expect(ComponentPropsMap['record:path']).toBeDefined();
  });

  it('should contain AI components', () => {
    expect(ComponentPropsMap['ai:chat_window']).toBeDefined();
    expect(ComponentPropsMap['ai:suggestion']).toBeDefined();
  });

  it('should parse ai:chat_window with default', () => {
    const result = ComponentPropsMap['ai:chat_window'].parse({});
    expect(result.mode).toBe('float');
  });

  it('should parse ai:suggestion with optional context', () => {
    const result = ComponentPropsMap['ai:suggestion'].parse({});
    expect(result.context).toBeUndefined();
  });

  it('should parse empty props schemas for utility components', () => {
    expect(() => ComponentPropsMap['page:footer'].parse({})).not.toThrow();
    expect(() => ComponentPropsMap['global:search'].parse({})).not.toThrow();
    expect(() => ComponentPropsMap['user:profile'].parse({})).not.toThrow();
  });
});

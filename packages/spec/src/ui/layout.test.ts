import { describe, it, expect } from 'vitest';
import {
  CardPropsSchema,
  GridPropsSchema,
  TabsPropsSchema,
  ModalPropsSchema,
  DrawerPropsSchema,
  PaginationPropsSchema,
} from './layout.zod';

describe('CardPropsSchema', () => {
  it('should accept card with defaults', () => {
    const props = {};
    const result = CardPropsSchema.parse(props);
    expect(result.bordered).toBe(true);
    expect(result.shadow).toBe('sm');
    expect(result.padding).toBe('md');
  });

  it('should accept full card config', () => {
    const props = {
      title: 'User Profile',
      subtitle: 'Manage your account',
      bordered: true,
      shadow: 'lg',
      hoverable: true,
      collapsible: true,
      loading: false,
    };
    const result = CardPropsSchema.parse(props);
    expect(result.title).toBe('User Profile');
    expect(result.hoverable).toBe(true);
  });
});

describe('GridPropsSchema', () => {
  it('should accept grid with defaults', () => {
    const props = {};
    const result = GridPropsSchema.parse(props);
    expect(result.columns).toBe(12);
    expect(result.gap).toBe('md');
  });

  it('should accept responsive grid columns', () => {
    const props = {
      columns: {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
      },
      gap: 'lg',
      justify: 'center',
      align: 'start',
    };
    const result = GridPropsSchema.parse(props);
    expect(result.columns).toHaveProperty('md', 3);
    expect(result.gap).toBe('lg');
  });

  it('should accept single column value', () => {
    const props = {
      columns: 6,
    };
    const result = GridPropsSchema.parse(props);
    expect(result.columns).toBe(6);
  });
});

describe('TabsPropsSchema', () => {
  it('should accept tabs with items', () => {
    const props = {
      items: [
        { key: '1', label: 'Tab 1' },
        { key: '2', label: 'Tab 2', icon: 'star' },
        { key: '3', label: 'Tab 3', disabled: true },
      ],
    };
    const result = TabsPropsSchema.parse(props);
    expect(result.items).toHaveLength(3);
    expect(result.type).toBe('line');
    expect(result.position).toBe('top');
  });

  it('should accept card tabs', () => {
    const props = {
      items: [
        { key: 'overview', label: 'Overview', closable: true },
        { key: 'details', label: 'Details' },
      ],
      type: 'card',
      size: 'large',
      centered: true,
    };
    const result = TabsPropsSchema.parse(props);
    expect(result.type).toBe('card');
    expect(result.centered).toBe(true);
  });
});

describe('ModalPropsSchema', () => {
  it('should accept modal with defaults', () => {
    const props = {};
    const result = ModalPropsSchema.parse(props);
    expect(result.size).toBe('md');
    expect(result.closable).toBe(true);
    expect(result.maskClosable).toBe(true);
    expect(result.keyboard).toBe(true);
  });

  it('should accept custom modal config', () => {
    const props = {
      title: 'Confirm Action',
      size: 'sm',
      centered: true,
      okText: 'Confirm',
      cancelText: 'Cancel',
      loading: false,
      fullscreen: false,
    };
    const result = ModalPropsSchema.parse(props);
    expect(result.title).toBe('Confirm Action');
    expect(result.okText).toBe('Confirm');
  });
});

describe('DrawerPropsSchema', () => {
  it('should accept drawer with defaults', () => {
    const props = {};
    const result = DrawerPropsSchema.parse(props);
    expect(result.placement).toBe('right');
    expect(result.size).toBe('md');
    expect(result.closable).toBe(true);
  });

  it('should accept left drawer', () => {
    const props = {
      title: 'Menu',
      placement: 'left',
      size: 'sm',
      push: true,
    };
    const result = DrawerPropsSchema.parse(props);
    expect(result.placement).toBe('left');
    expect(result.push).toBe(true);
  });

  it('should accept bottom drawer', () => {
    const props = {
      placement: 'bottom',
      size: 300,
    };
    const result = DrawerPropsSchema.parse(props);
    expect(result.placement).toBe('bottom');
    expect(result.size).toBe(300);
  });
});

describe('PaginationPropsSchema', () => {
  it('should accept pagination with total', () => {
    const props = {
      total: 100,
    };
    const result = PaginationPropsSchema.parse(props);
    expect(result.total).toBe(100);
    expect(result.pageSize).toBe(10);
    expect(result.currentPage).toBe(1);
  });

  it('should accept full pagination config', () => {
    const props = {
      total: 500,
      pageSize: 50,
      currentPage: 3,
      pageSizeOptions: [25, 50, 100],
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: true,
    };
    const result = PaginationPropsSchema.parse(props);
    expect(result.pageSize).toBe(50);
    expect(result.currentPage).toBe(3);
  });

  it('should accept simple pagination', () => {
    const props = {
      total: 50,
      simple: true,
      size: 'small',
    };
    const result = PaginationPropsSchema.parse(props);
    expect(result.simple).toBe(true);
  });
});

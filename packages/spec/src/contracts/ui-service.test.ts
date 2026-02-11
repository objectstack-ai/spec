import { describe, it, expect } from 'vitest';
import type { IUIService } from './ui-service';

describe('UI Service Contract', () => {
  it('should allow a minimal IUIService implementation with required methods', () => {
    const service: IUIService = {
      getView: (_name) => undefined,
      listViews: (_object?) => [],
    };

    expect(typeof service.getView).toBe('function');
    expect(typeof service.listViews).toBe('function');
  });

  it('should allow a full implementation with optional methods', () => {
    const service: IUIService = {
      getView: () => undefined,
      listViews: () => [],
      getDashboard: (_name) => undefined,
      listDashboards: () => [],
      registerView: (_name, _definition) => {},
      registerDashboard: (_name, _definition) => {},
    };

    expect(service.getDashboard).toBeDefined();
    expect(service.listDashboards).toBeDefined();
    expect(service.registerView).toBeDefined();
    expect(service.registerDashboard).toBeDefined();
  });

  it('should register and retrieve views', () => {
    const views = new Map<string, unknown>();

    const service: IUIService = {
      getView: (name) => views.get(name),
      listViews: (object?) => {
        const all = Array.from(views.values());
        if (object) return all.filter((v: any) => v.object === object);
        return all;
      },
      registerView: (name, definition) => { views.set(name, definition); },
    };

    const viewDef = { name: 'account_list', object: 'account', type: 'grid', columns: ['name', 'email'] };
    service.registerView!('account_list', viewDef);

    expect(service.getView('account_list')).toEqual(viewDef);
    expect(service.listViews()).toHaveLength(1);
    expect(service.listViews('account')).toHaveLength(1);
    expect(service.listViews('contact')).toHaveLength(0);
  });

  it('should manage dashboards', () => {
    const dashboards = new Map<string, unknown>();

    const service: IUIService = {
      getView: () => undefined,
      listViews: () => [],
      getDashboard: (name) => dashboards.get(name),
      listDashboards: () => Array.from(dashboards.values()),
      registerDashboard: (name, definition) => { dashboards.set(name, definition); },
    };

    service.registerDashboard!('sales_overview', {
      name: 'sales_overview',
      label: 'Sales Overview',
      widgets: [{ type: 'chart', title: 'Revenue' }],
    });

    expect(service.getDashboard!('sales_overview')).toBeDefined();
    expect(service.listDashboards!()).toHaveLength(1);
    expect(service.getDashboard!('missing')).toBeUndefined();
  });

  it('should return undefined for non-existent views', () => {
    const service: IUIService = {
      getView: () => undefined,
      listViews: () => [],
    };

    expect(service.getView('nonexistent')).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';
import {
  ViewType,
  ViewVisibility,
  ViewColumnSchema,
  ViewLayoutSchema,
  SavedViewSchema,
  CreateViewRequestSchema,
  UpdateViewRequestSchema,
  ListViewsRequestSchema,
  ViewResponseSchema,
  ListViewsResponseSchema,
  ViewStorageApiContracts,
  type SavedView,
  type CreateViewRequest,
} from './view-storage.zod';

describe('ViewType', () => {
  it('should accept all view types', () => {
    const types = ['list', 'kanban', 'calendar', 'gantt', 'timeline', 'chart', 'pivot', 'custom'];
    
    types.forEach(type => {
      expect(() => ViewType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid view type', () => {
    expect(() => ViewType.parse('invalid')).toThrow();
  });
});

describe('ViewVisibility', () => {
  it('should accept all visibility levels', () => {
    const levels = ['private', 'shared', 'public', 'organization'];
    
    levels.forEach(level => {
      expect(() => ViewVisibility.parse(level)).not.toThrow();
    });
  });

  it('should reject invalid visibility', () => {
    expect(() => ViewVisibility.parse('invalid')).toThrow();
  });
});

describe('ViewColumnSchema', () => {
  it('should accept basic column config', () => {
    const column = ViewColumnSchema.parse({
      field: 'email',
    });

    expect(column.field).toBe('email');
    expect(column.sortable).toBe(true); // default
    expect(column.filterable).toBe(true); // default
    expect(column.visible).toBe(true); // default
  });

  it('should accept column with custom label', () => {
    const column = ViewColumnSchema.parse({
      field: 'first_name',
      label: 'First Name',
    });

    expect(column.label).toBe('First Name');
  });

  it('should accept column with width', () => {
    const column = ViewColumnSchema.parse({
      field: 'email',
      width: 200,
    });

    expect(column.width).toBe(200);
  });

  it('should accept column with options', () => {
    const column = ViewColumnSchema.parse({
      field: 'status',
      label: 'Status',
      width: 150,
      sortable: true,
      filterable: true,
      visible: true,
    });

    expect(column.sortable).toBe(true);
    expect(column.filterable).toBe(true);
    expect(column.visible).toBe(true);
  });

  it('should accept pinned column', () => {
    const column = ViewColumnSchema.parse({
      field: 'name',
      pinned: 'left',
    });

    expect(column.pinned).toBe('left');
  });

  it('should accept column with formatter', () => {
    const column = ViewColumnSchema.parse({
      field: 'created_at',
      formatter: 'date',
    });

    expect(column.formatter).toBe('date');
  });

  it('should accept column with aggregation', () => {
    const column = ViewColumnSchema.parse({
      field: 'revenue',
      aggregation: 'sum',
    });

    expect(column.aggregation).toBe('sum');
  });
});

describe('ViewLayoutSchema', () => {
  describe('List View Layout', () => {
    it('should accept columns config', () => {
      const layout = ViewLayoutSchema.parse({
        columns: [
          { field: 'name', width: 200 },
          { field: 'email', width: 250 },
          { field: 'status', width: 100 },
        ],
      });

      expect(layout.columns).toHaveLength(3);
    });

    it('should accept row height', () => {
      const layout = ViewLayoutSchema.parse({
        rowHeight: 40,
      });

      expect(layout.rowHeight).toBe(40);
    });
  });

  describe('Kanban View Layout', () => {
    it('should accept kanban config', () => {
      const layout = ViewLayoutSchema.parse({
        groupByField: 'status',
        cardFields: ['name', 'assignee', 'due_date'],
      });

      expect(layout.groupByField).toBe('status');
      expect(layout.cardFields).toHaveLength(3);
    });
  });

  describe('Calendar View Layout', () => {
    it('should accept calendar config', () => {
      const layout = ViewLayoutSchema.parse({
        dateField: 'event_date',
        titleField: 'subject',
      });

      expect(layout.dateField).toBe('event_date');
      expect(layout.titleField).toBe('subject');
    });

    it('should accept date range config', () => {
      const layout = ViewLayoutSchema.parse({
        startDateField: 'start_date',
        endDateField: 'end_date',
        titleField: 'event_name',
      });

      expect(layout.startDateField).toBe('start_date');
      expect(layout.endDateField).toBe('end_date');
    });
  });

  describe('Chart View Layout', () => {
    it('should accept chart config', () => {
      const layout = ViewLayoutSchema.parse({
        chartType: 'bar',
        xAxis: 'month',
        yAxis: 'revenue',
      });

      expect(layout.chartType).toBe('bar');
      expect(layout.xAxis).toBe('month');
      expect(layout.yAxis).toBe('revenue');
    });

    it('should accept multi-series chart', () => {
      const layout = ViewLayoutSchema.parse({
        chartType: 'line',
        xAxis: 'date',
        series: ['revenue', 'expenses', 'profit'],
      });

      expect(layout.series).toHaveLength(3);
    });
  });
});

describe('SavedViewSchema', () => {
  it('should accept minimal saved view', () => {
    const view = SavedViewSchema.parse({
      id: 'view_123',
      name: 'active_contacts',
      label: 'Active Contacts',
      object: 'contact',
      type: 'list',
      visibility: 'public',
      query: {
        object: 'contact',
        where: { status: 'active' },
      },
      createdBy: 'user_456',
      createdAt: '2026-01-29T12:00:00Z',
    });

    expect(view.id).toBe('view_123');
    expect(view.name).toBe('active_contacts');
    expect(view.type).toBe('list');
  });

  it('should apply default isDefault', () => {
    const view = SavedViewSchema.parse({
      id: 'view_123',
      name: 'my_view',
      label: 'My View',
      object: 'account',
      type: 'list',
      visibility: 'private',
      query: { object: 'account' },
      createdBy: 'user_123',
      createdAt: '2026-01-29T12:00:00Z',
    });

    expect(view.isDefault).toBe(false);
    expect(view.isSystem).toBe(false);
  });

  it('should enforce snake_case for view name', () => {
    expect(() => SavedViewSchema.parse({
      id: 'view_123',
      name: 'MyView',
      label: 'My View',
      object: 'account',
      type: 'list',
      visibility: 'private',
      query: { object: 'account' },
      createdBy: 'user_123',
      createdAt: '2026-01-29T12:00:00Z',
    })).toThrow();
  });

  it('should accept complete list view', () => {
    const view: SavedView = {
      id: 'view_123',
      name: 'active_contacts',
      label: 'Active Contacts',
      description: 'All active customer contacts',
      object: 'contact',
      type: 'list',
      visibility: 'public',
      query: {
        object: 'contact',
        where: { status: 'active' },
        orderBy: [{ field: 'last_name', order: 'asc' }],
        limit: 50,
      },
      layout: {
        columns: [
          { field: 'first_name', label: 'First Name', width: 150 },
          { field: 'last_name', label: 'Last Name', width: 150 },
          { field: 'email', label: 'Email', width: 200 },
          { field: 'phone', label: 'Phone', width: 150 },
        ],
        rowHeight: 40,
      },
      isDefault: false,
      isSystem: false,
      createdBy: 'user_456',
      createdAt: '2026-01-29T12:00:00Z',
      updatedBy: 'user_456',
      updatedAt: '2026-01-30T10:00:00Z',
    };

    expect(() => SavedViewSchema.parse(view)).not.toThrow();
  });

  it('should accept kanban view', () => {
    const view = SavedViewSchema.parse({
      id: 'view_kanban_1',
      name: 'task_kanban',
      label: 'Task Board',
      object: 'task',
      type: 'kanban',
      visibility: 'public',
      query: {
        object: 'task',
        where: { project_id: 'proj_123' },
      },
      layout: {
        groupByField: 'status',
        cardFields: ['name', 'assignee', 'due_date'],
      },
      createdBy: 'user_123',
      createdAt: '2026-01-29T12:00:00Z',
    });

    expect(view.type).toBe('kanban');
    expect(view.layout?.groupByField).toBe('status');
  });

  it('should accept shared view', () => {
    const view = SavedViewSchema.parse({
      id: 'view_shared_1',
      name: 'team_view',
      label: 'Team View',
      object: 'opportunity',
      type: 'list',
      visibility: 'shared',
      query: { object: 'opportunity' },
      sharedWith: ['team_sales', 'user_manager'],
      createdBy: 'user_123',
      createdAt: '2026-01-29T12:00:00Z',
    });

    expect(view.visibility).toBe('shared');
    expect(view.sharedWith).toHaveLength(2);
  });

  it('should accept view with settings', () => {
    const view = SavedViewSchema.parse({
      id: 'view_custom_1',
      name: 'custom_view',
      label: 'Custom View',
      object: 'account',
      type: 'list',
      visibility: 'private',
      query: { object: 'account' },
      settings: {
        autoRefresh: true,
        refreshInterval: 30,
        highlightRules: [
          { field: 'revenue', operator: 'gt', value: 1000000, color: 'green' },
        ],
      },
      createdBy: 'user_123',
      createdAt: '2026-01-29T12:00:00Z',
    });

    expect(view.settings).toBeDefined();
    expect(view.settings?.autoRefresh).toBe(true);
  });
});

describe('CreateViewRequestSchema', () => {
  it('should accept minimal create request', () => {
    const request = CreateViewRequestSchema.parse({
      name: 'my_view',
      label: 'My View',
      object: 'account',
      type: 'list',
      visibility: 'private',
      query: { object: 'account' },
    });

    expect(request.name).toBe('my_view');
    expect(request.type).toBe('list');
  });

  it('should accept complete create request', () => {
    const request: CreateViewRequest = {
      name: 'active_accounts',
      label: 'Active Accounts',
      description: 'All active accounts',
      object: 'account',
      type: 'list',
      visibility: 'public',
      query: {
        object: 'account',
        where: { status: 'active' },
        orderBy: [{ field: 'name', order: 'asc' }],
      },
      layout: {
        columns: [
          { field: 'name', width: 200 },
          { field: 'industry', width: 150 },
        ],
      },
      sharedWith: ['team_sales'],
      isDefault: true,
      settings: { autoRefresh: true },
    };

    expect(() => CreateViewRequestSchema.parse(request)).not.toThrow();
  });

  it('should apply default isDefault', () => {
    const request = CreateViewRequestSchema.parse({
      name: 'test_view',
      label: 'Test View',
      object: 'contact',
      type: 'list',
      visibility: 'private',
      query: { object: 'contact' },
    });

    expect(request.isDefault).toBe(false);
  });
});

describe('UpdateViewRequestSchema', () => {
  it('should accept partial update', () => {
    const request = UpdateViewRequestSchema.parse({
      id: 'view_123',
      label: 'Updated Label',
    });

    expect(request.id).toBe('view_123');
    expect(request.label).toBe('Updated Label');
  });

  it('should accept complete update', () => {
    const request = UpdateViewRequestSchema.parse({
      id: 'view_123',
      name: 'updated_view',
      label: 'Updated View',
      description: 'Updated description',
      query: {
        object: 'account',
        where: { status: 'active' },
      },
      layout: {
        columns: [{ field: 'name', width: 250 }],
      },
    });

    expect(request.id).toBe('view_123');
  });
});

describe('ListViewsRequestSchema', () => {
  it('should accept empty request', () => {
    const request = ListViewsRequestSchema.parse({});

    expect(request.limit).toBe(50); // default
    expect(request.offset).toBe(0); // default
  });

  it('should accept filter by object', () => {
    const request = ListViewsRequestSchema.parse({
      object: 'account',
    });

    expect(request.object).toBe('account');
  });

  it('should accept filter by type', () => {
    const request = ListViewsRequestSchema.parse({
      type: 'kanban',
    });

    expect(request.type).toBe('kanban');
  });

  it('should accept filter by visibility', () => {
    const request = ListViewsRequestSchema.parse({
      visibility: 'public',
    });

    expect(request.visibility).toBe('public');
  });

  it('should accept filter by creator', () => {
    const request = ListViewsRequestSchema.parse({
      createdBy: 'user_123',
    });

    expect(request.createdBy).toBe('user_123');
  });

  it('should accept pagination params', () => {
    const request = ListViewsRequestSchema.parse({
      limit: 25,
      offset: 50,
    });

    expect(request.limit).toBe(25);
    expect(request.offset).toBe(50);
  });

  it('should accept filter for default views', () => {
    const request = ListViewsRequestSchema.parse({
      isDefault: true,
    });

    expect(request.isDefault).toBe(true);
  });
});

describe('ViewResponseSchema', () => {
  it('should accept successful response', () => {
    const response = ViewResponseSchema.parse({
      success: true,
      data: {
        id: 'view_123',
        name: 'my_view',
        label: 'My View',
        object: 'account',
        type: 'list',
        visibility: 'private',
        query: { object: 'account' },
        createdBy: 'user_123',
        createdAt: '2026-01-29T12:00:00Z',
      },
    });

    expect(response.success).toBe(true);
    expect(response.data?.id).toBe('view_123');
  });

  it('should accept error response', () => {
    const response = ViewResponseSchema.parse({
      success: false,
      error: {
        code: 'not_found',
        message: 'View not found',
      },
    });

    expect(response.success).toBe(false);
    expect(response.error?.code).toBe('not_found');
  });
});

describe('ListViewsResponseSchema', () => {
  it('should accept list response', () => {
    const response = ListViewsResponseSchema.parse({
      success: true,
      data: [
        {
          id: 'view_1',
          name: 'view_1',
          label: 'View 1',
          object: 'account',
          type: 'list',
          visibility: 'public',
          query: { object: 'account' },
          createdBy: 'user_123',
          createdAt: '2026-01-29T12:00:00Z',
        },
        {
          id: 'view_2',
          name: 'view_2',
          label: 'View 2',
          object: 'contact',
          type: 'kanban',
          visibility: 'private',
          query: { object: 'contact' },
          createdBy: 'user_456',
          createdAt: '2026-01-30T12:00:00Z',
        },
      ],
      pagination: {
        total: 100,
        limit: 50,
        offset: 0,
        hasMore: true,
      },
    });

    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(2);
    expect(response.pagination.total).toBe(100);
  });

  it('should accept empty list', () => {
    const response = ListViewsResponseSchema.parse({
      success: true,
      data: [],
      pagination: {
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false,
      },
    });

    expect(response.data).toHaveLength(0);
    expect(response.pagination.hasMore).toBe(false);
  });
});

describe('ViewStorageApiContracts', () => {
  it('should have all CRUD contracts', () => {
    expect(ViewStorageApiContracts.createView).toBeDefined();
    expect(ViewStorageApiContracts.getView).toBeDefined();
    expect(ViewStorageApiContracts.listViews).toBeDefined();
    expect(ViewStorageApiContracts.updateView).toBeDefined();
    expect(ViewStorageApiContracts.deleteView).toBeDefined();
  });

  it('should have setDefaultView contract', () => {
    expect(ViewStorageApiContracts.setDefaultView).toBeDefined();
  });

  it('should validate contract inputs and outputs', () => {
    // Create View
    const createInput = ViewStorageApiContracts.createView.input.parse({
      name: 'test_view',
      label: 'Test View',
      object: 'account',
      type: 'list',
      visibility: 'private',
      query: { object: 'account' },
    });
    expect(createInput.name).toBe('test_view');

    // List Views
    const listInput = ViewStorageApiContracts.listViews.input.parse({
      object: 'account',
    });
    expect(listInput.object).toBe('account');

    // Delete View
    const deleteInput = ViewStorageApiContracts.deleteView.input.parse({
      id: 'view_123',
    });
    expect(deleteInput.id).toBe('view_123');
  });
});

describe('Integration Tests', () => {
  it('should support complete view workflow', () => {
    // Create view
    const createRequest = CreateViewRequestSchema.parse({
      name: 'sales_pipeline',
      label: 'Sales Pipeline',
      object: 'opportunity',
      type: 'kanban',
      visibility: 'public',
      query: {
        object: 'opportunity',
        where: { stage: { $in: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won'] } },
      },
      layout: {
        groupByField: 'stage',
        cardFields: ['name', 'amount', 'close_date', 'owner'],
      },
    });

    // List views
    const listRequest = ListViewsRequestSchema.parse({
      object: 'opportunity',
      type: 'kanban',
    });

    // Update view
    const updateRequest = UpdateViewRequestSchema.parse({
      id: 'view_123',
      label: 'Updated Sales Pipeline',
      layout: {
        groupByField: 'stage',
        cardFields: ['name', 'amount', 'close_date', 'owner', 'probability'],
      },
    });

    expect(createRequest.name).toBe('sales_pipeline');
    expect(listRequest.type).toBe('kanban');
    expect(updateRequest.id).toBe('view_123');
  });
});

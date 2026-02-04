import { describe, it, expect } from 'vitest';
import {
  ViewSchema,
  ListViewSchema,
  FormViewSchema,
  FormSectionSchema,
  KanbanConfigSchema,
  CalendarConfigSchema,
  GanttConfigSchema,
  ListColumnSchema,
  FormFieldSchema,
  SelectionConfigSchema,
  PaginationConfigSchema,
  ViewDataSchema,
  HttpRequestSchema,
  HttpMethodSchema,
  type View,
  type ListView,
  type FormView,
  type ListColumn,
  type FormField,
  type ViewData,
  type HttpRequest,
} from './view.zod';

describe('HttpMethodSchema', () => {
  it('should accept valid HTTP methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
    
    methods.forEach(method => {
      expect(() => HttpMethodSchema.parse(method)).not.toThrow();
    });
  });

  it('should reject invalid HTTP methods', () => {
    expect(() => HttpMethodSchema.parse('INVALID')).toThrow();
  });
});

describe('HttpRequestSchema', () => {
  it('should accept minimal HTTP request config', () => {
    const request: HttpRequest = {
      url: '/api/data',
    };

    const result = HttpRequestSchema.parse(request);
    expect(result.method).toBe('GET');
  });

  it('should accept full HTTP request config', () => {
    const request: HttpRequest = {
      url: '/api/data',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      params: { filter: 'active' },
      body: { name: 'test' },
    };

    expect(() => HttpRequestSchema.parse(request)).not.toThrow();
  });
});

describe('ViewDataSchema', () => {
  it('should accept object provider with object name', () => {
    const data: ViewData = {
      provider: 'object',
      object: 'account',
    };

    expect(() => ViewDataSchema.parse(data)).not.toThrow();
  });

  it('should require object name for object provider', () => {
    const data = {
      provider: 'object',
    };

    expect(() => ViewDataSchema.parse(data)).toThrow();
  });

  it('should accept api provider with read configuration', () => {
    const data: ViewData = {
      provider: 'api',
      read: {
        url: '/api/accounts',
        method: 'GET',
        params: { status: 'active' },
      },
    };

    expect(() => ViewDataSchema.parse(data)).not.toThrow();
  });

  it('should accept api provider with read and write configurations', () => {
    const data: ViewData = {
      provider: 'api',
      read: {
        url: '/api/accounts',
        method: 'GET',
      },
      write: {
        url: '/api/accounts',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    };

    expect(() => ViewDataSchema.parse(data)).not.toThrow();
  });

  it('should accept value provider with static items', () => {
    const data: ViewData = {
      provider: 'value',
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
    };

    expect(() => ViewDataSchema.parse(data)).not.toThrow();
  });

  it('should require items for value provider', () => {
    const data = {
      provider: 'value',
    };

    expect(() => ViewDataSchema.parse(data)).toThrow();
  });
});

describe('KanbanConfigSchema', () => {
  it('should accept minimal kanban config', () => {
    const config = {
      groupByField: 'status',
      columns: ['name', 'owner'],
    };

    expect(() => KanbanConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept kanban config with summarize field', () => {
    const config = {
      groupByField: 'stage',
      summarizeField: 'amount',
      columns: ['name', 'amount', 'close_date'],
    };

    expect(() => KanbanConfigSchema.parse(config)).not.toThrow();
  });
});

describe('CalendarConfigSchema', () => {
  it('should accept minimal calendar config', () => {
    const config = {
      startDateField: 'start_date',
      titleField: 'subject',
    };

    expect(() => CalendarConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept full calendar config', () => {
    const config = {
      startDateField: 'start_date',
      endDateField: 'end_date',
      titleField: 'subject',
      colorField: 'priority',
    };

    expect(() => CalendarConfigSchema.parse(config)).not.toThrow();
  });
});

describe('GanttConfigSchema', () => {
  it('should accept minimal gantt config', () => {
    const config = {
      startDateField: 'start_date',
      endDateField: 'end_date',
      titleField: 'name',
    };

    expect(() => GanttConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept full gantt config', () => {
    const config = {
      startDateField: 'start_date',
      endDateField: 'end_date',
      titleField: 'project_name',
      progressField: 'completion_percent',
      dependenciesField: 'depends_on',
    };

    expect(() => GanttConfigSchema.parse(config)).not.toThrow();
  });
});

describe('ListViewSchema', () => {
  it('should accept minimal grid view', () => {
    const listView: ListView = {
      columns: ['name', 'email', 'phone'],
    };

    const result = ListViewSchema.parse(listView);
    expect(result.type).toBe('grid');
  });

  it('should accept all list view types', () => {
    const types = ['grid', 'kanban', 'calendar', 'gantt', 'map'] as const;
    
    types.forEach(type => {
      const view: ListView = {
        type,
        columns: ['name'],
      };
      expect(() => ListViewSchema.parse(view)).not.toThrow();
    });
  });

  it('should accept list view with filter and sort', () => {
    const listView: ListView = {
      type: 'grid',
      columns: ['name', 'status', 'created_at'],
      filter: [
        { field: 'status', operator: 'equals', value: 'active' },
      ],
      sort: [
        { field: 'created_at', order: 'desc' },
        { field: 'name', order: 'asc' },
      ],
    };

    expect(() => ListViewSchema.parse(listView)).not.toThrow();
  });

  it('should accept legacy string sort format', () => {
    const listView: ListView = {
      columns: ['name'],
      sort: 'created_at desc',
    };

    expect(() => ListViewSchema.parse(listView)).not.toThrow();
  });

  it('should accept list view with searchable fields', () => {
    const listView: ListView = {
      type: 'grid',
      columns: ['name', 'email', 'phone'],
      searchableFields: ['name', 'email', 'phone'],
    };

    expect(() => ListViewSchema.parse(listView)).not.toThrow();
  });

  it('should accept list view with top filter fields', () => {
    const listView: ListView = {
      type: 'grid',
      columns: ['name', 'status'],
      filterableFields: ['status', 'category', 'owner'],
    };

    expect(() => ListViewSchema.parse(listView)).not.toThrow();
  });

  it('should accept kanban view with config', () => {
    const kanbanView: ListView = {
      type: 'kanban',
      columns: ['name', 'owner', 'amount'],
      kanban: {
        groupByField: 'stage',
        summarizeField: 'amount',
        columns: ['name', 'owner', 'close_date'],
      },
    };

    expect(() => ListViewSchema.parse(kanbanView)).not.toThrow();
  });

  it('should accept calendar view with config', () => {
    const calendarView: ListView = {
      type: 'calendar',
      columns: ['subject', 'start_date', 'end_date'],
      calendar: {
        startDateField: 'start_date',
        endDateField: 'end_date',
        titleField: 'subject',
        colorField: 'priority',
      },
    };

    expect(() => ListViewSchema.parse(calendarView)).not.toThrow();
  });

  it('should accept gantt view with config', () => {
    const ganttView: ListView = {
      type: 'gantt',
      columns: ['name', 'start_date', 'end_date', 'progress'],
      gantt: {
        startDateField: 'start_date',
        endDateField: 'end_date',
        titleField: 'name',
        progressField: 'progress',
        dependenciesField: 'depends_on',
      },
    };

    expect(() => ListViewSchema.parse(ganttView)).not.toThrow();
  });

  it('should accept named list view', () => {
    const namedView: ListView = {
      name: 'active_accounts',
      label: 'Active Accounts',
      type: 'grid',
      columns: ['account_name', 'industry', 'annual_revenue'],
      filter: [{ field: 'status', operator: 'equals', value: 'active' }],
    };

    expect(() => ListViewSchema.parse(namedView)).not.toThrow();
  });

  it('should accept list view with object provider', () => {
    const listView: ListView = {
      type: 'grid',
      columns: ['name', 'email'],
      data: {
        provider: 'object',
        object: 'contact',
      },
    };

    expect(() => ListViewSchema.parse(listView)).not.toThrow();
  });

  it('should accept list view with api provider', () => {
    const listView: ListView = {
      type: 'grid',
      columns: ['name', 'email', 'phone'],
      data: {
        provider: 'api',
        read: {
          url: '/api/contacts',
          method: 'GET',
        },
      },
    };

    expect(() => ListViewSchema.parse(listView)).not.toThrow();
  });

  it('should accept list view with value provider', () => {
    const listView: ListView = {
      type: 'grid',
      columns: ['name', 'status'],
      data: {
        provider: 'value',
        items: [
          { name: 'Task 1', status: 'Open' },
          { name: 'Task 2', status: 'Closed' },
        ],
      },
    };

    expect(() => ListViewSchema.parse(listView)).not.toThrow();
  });

  it('should accept kanban view with custom api data source', () => {
    const kanbanView: ListView = {
      type: 'kanban',
      columns: ['name', 'owner', 'amount'],
      data: {
        provider: 'api',
        read: {
          url: '/api/opportunities',
          params: { view: 'pipeline' },
        },
      },
      kanban: {
        groupByField: 'stage',
        summarizeField: 'amount',
        columns: ['name', 'owner', 'close_date'],
      },
    };

    expect(() => ListViewSchema.parse(kanbanView)).not.toThrow();
  });
});

describe('FormSectionSchema', () => {
  it('should accept minimal form section', () => {
    const section = {
      fields: ['name', 'email'],
    };

    const result = FormSectionSchema.parse(section);
    expect(result.collapsible).toBe(false);
    expect(result.collapsed).toBe(false);
    expect(result.columns).toBe(2);
  });

  it('should accept form section with all properties', () => {
    const section = {
      label: 'Contact Information',
      collapsible: true,
      collapsed: false,
      columns: '3' as const,
      fields: ['first_name', 'last_name', 'email', 'phone'],
    };

    const result = FormSectionSchema.parse(section);
    expect(result.columns).toBe(3);
  });

  it('should transform column strings to numbers', () => {
    const columnOptions = ['1', '2', '3', '4'] as const;
    
    columnOptions.forEach(cols => {
      const section = {
        columns: cols,
        fields: ['field1'],
      };
      const result = FormSectionSchema.parse(section);
      expect(result.columns).toBe(parseInt(cols));
    });
  });
});

describe('FormViewSchema', () => {
  it('should accept minimal form view', () => {
    const formView: FormView = {};

    const result = FormViewSchema.parse(formView);
    expect(result.type).toBe('simple');
  });

  it('should accept all form view types', () => {
    const types = ['simple', 'tabbed', 'wizard'] as const;
    
    types.forEach(type => {
      const view: FormView = { type };
      expect(() => FormViewSchema.parse(view)).not.toThrow();
    });
  });

  it('should accept form view with sections', () => {
    const formView: FormView = {
      type: 'simple',
      sections: [
        {
          label: 'Basic Information',
          fields: ['name', 'email', 'phone'],
        },
        {
          label: 'Address',
          collapsible: true,
          fields: ['street', 'city', 'state', 'zip'],
        },
      ],
    };

    expect(() => FormViewSchema.parse(formView)).not.toThrow();
  });

  it('should accept form view with groups (legacy)', () => {
    const formView: FormView = {
      type: 'simple',
      groups: [
        {
          label: 'Account Details',
          fields: ['account_name', 'account_number'],
        },
      ],
    };

    expect(() => FormViewSchema.parse(formView)).not.toThrow();
  });

  it('should accept tabbed form view', () => {
    const tabbedView: FormView = {
      type: 'tabbed',
      sections: [
        {
          label: 'Details',
          fields: ['name', 'description'],
        },
        {
          label: 'Advanced',
          fields: ['settings', 'metadata'],
        },
      ],
    };

    expect(() => FormViewSchema.parse(tabbedView)).not.toThrow();
  });

  it('should accept wizard form view', () => {
    const wizardView: FormView = {
      type: 'wizard',
      sections: [
        {
          label: 'Step 1: Basic Info',
          fields: ['name', 'email'],
        },
        {
          label: 'Step 2: Preferences',
          fields: ['language', 'timezone'],
        },
        {
          label: 'Step 3: Review',
          fields: [],
        },
      ],
    };

    expect(() => FormViewSchema.parse(wizardView)).not.toThrow();
  });

  it('should accept form view with object provider', () => {
    const formView: FormView = {
      type: 'simple',
      data: {
        provider: 'object',
        object: 'account',
      },
      sections: [
        {
          label: 'Account Information',
          fields: ['name', 'industry', 'revenue'],
        },
      ],
    };

    expect(() => FormViewSchema.parse(formView)).not.toThrow();
  });

  it('should accept form view with api provider', () => {
    const formView: FormView = {
      type: 'simple',
      data: {
        provider: 'api',
        read: {
          url: '/api/accounts/:id',
          method: 'GET',
        },
        write: {
          url: '/api/accounts/:id',
          method: 'PUT',
        },
      },
      sections: [
        {
          fields: ['name', 'email', 'phone'],
        },
      ],
    };

    expect(() => FormViewSchema.parse(formView)).not.toThrow();
  });

  it('should accept form view with value provider', () => {
    const formView: FormView = {
      type: 'simple',
      data: {
        provider: 'value',
        items: [{ name: 'Default Account', type: 'Customer' }],
      },
      sections: [
        {
          fields: ['name', 'type'],
        },
      ],
    };

    expect(() => FormViewSchema.parse(formView)).not.toThrow();
  });
});

describe('ViewSchema', () => {
  it('should accept minimal view schema', () => {
    const view: View = {};

    expect(() => ViewSchema.parse(view)).not.toThrow();
  });

  it('should accept view with default list and form', () => {
    const view: View = {
      list: {
        columns: ['name', 'status'],
      },
      form: {
        sections: [
          { fields: ['name', 'status'] },
        ],
      },
    };

    expect(() => ViewSchema.parse(view)).not.toThrow();
  });

  it('should accept view with named list views', () => {
    const view: View = {
      list: {
        columns: ['name'],
      },
      listViews: {
        all: {
          label: 'All Records',
          columns: ['name', 'created_at'],
        },
        active: {
          label: 'Active Only',
          columns: ['name', 'status'],
          filter: [{ field: 'status', operator: 'equals', value: 'active' }],
        },
        my_records: {
          label: 'My Records',
          columns: ['name', 'owner'],
          filter: [{ field: 'owner_id', operator: 'equals', value: '$USER_ID' }],
        },
      },
    };

    expect(() => ViewSchema.parse(view)).not.toThrow();
  });

  it('should accept view with named form views', () => {
    const view: View = {
      form: {
        type: 'simple',
        sections: [{ fields: ['name'] }],
      },
      formViews: {
        detailed: {
          type: 'tabbed',
          sections: [
            { label: 'Basic', fields: ['name', 'email'] },
            { label: 'Advanced', fields: ['settings'] },
          ],
        },
        quick_create: {
          type: 'simple',
          sections: [{ fields: ['name'] }],
        },
      },
    };

    expect(() => ViewSchema.parse(view)).not.toThrow();
  });

  describe('Real-World View Examples', () => {
    it('should accept CRM opportunity views', () => {
      const opportunityViews: View = {
        list: {
          type: 'grid',
          columns: ['name', 'account_name', 'amount', 'stage', 'close_date'],
          sort: [
            { field: 'close_date', order: 'asc' },
          ],
        },
        listViews: {
          pipeline: {
            name: 'pipeline',
            label: 'Sales Pipeline',
            type: 'kanban',
            columns: ['name', 'account_name', 'amount', 'close_date'],
            kanban: {
              groupByField: 'stage',
              summarizeField: 'amount',
              columns: ['name', 'account_name', 'amount'],
            },
          },
          closing_this_quarter: {
            name: 'closing_this_quarter',
            label: 'Closing This Quarter',
            type: 'grid',
            columns: ['name', 'account_name', 'amount', 'stage', 'close_date'],
            filter: [
              { field: 'close_date', operator: 'this_quarter' },
            ],
            sort: [{ field: 'amount', order: 'desc' }],
          },
        },
        form: {
          type: 'tabbed',
          sections: [
            {
              label: 'Opportunity Details',
              columns: '2',
              fields: ['name', 'account_id', 'amount', 'stage', 'close_date', 'probability'],
            },
            {
              label: 'Contact Information',
              columns: '2',
              fields: ['primary_contact', 'email', 'phone'],
            },
            {
              label: 'Additional Information',
              collapsible: true,
              collapsed: true,
              columns: '2',
              fields: ['description', 'next_step', 'lead_source'],
            },
          ],
        },
      };

      expect(() => ViewSchema.parse(opportunityViews)).not.toThrow();
    });

    it('should accept project task views with calendar and gantt', () => {
      const taskViews: View = {
        list: {
          columns: ['subject', 'status', 'priority', 'assigned_to', 'due_date'],
        },
        listViews: {
          calendar: {
            type: 'calendar',
            columns: ['subject', 'due_date'],
            calendar: {
              startDateField: 'due_date',
              titleField: 'subject',
              colorField: 'priority',
            },
          },
          timeline: {
            type: 'gantt',
            columns: ['subject', 'start_date', 'due_date', 'progress'],
            gantt: {
              startDateField: 'start_date',
              endDateField: 'due_date',
              titleField: 'subject',
              progressField: 'progress',
              dependenciesField: 'dependencies',
            },
          },
        },
        form: {
          type: 'simple',
          sections: [
            {
              label: 'Task Information',
              fields: ['subject', 'project_id', 'status', 'priority'],
            },
            {
              label: 'Schedule',
              columns: '2',
              fields: ['start_date', 'due_date', 'estimated_hours'],
            },
            {
              label: 'Assignment',
              fields: ['assigned_to', 'team'],
            },
          ],
        },
      };

      expect(() => ViewSchema.parse(taskViews)).not.toThrow();
    });
  });
});

describe('ListColumnSchema', () => {
  it('should accept minimal column config', () => {
    const column: ListColumn = {
      field: 'account_name',
    };

    expect(() => ListColumnSchema.parse(column)).not.toThrow();
  });

  it('should accept full column config', () => {
    const column: ListColumn = {
      field: 'annual_revenue',
      label: 'Annual Revenue',
      width: 150,
      align: 'right',
      hidden: false,
      sortable: true,
      resizable: true,
      wrap: false,
      type: 'currency',
    };

    expect(() => ListColumnSchema.parse(column)).not.toThrow();
  });

  it('should accept column with alignment options', () => {
    const alignments = ['left', 'center', 'right'] as const;
    
    alignments.forEach(align => {
      const column: ListColumn = {
        field: 'test_field',
        align,
      };
      expect(() => ListColumnSchema.parse(column)).not.toThrow();
    });
  });

  it('should reject negative width', () => {
    const column = {
      field: 'test_field',
      width: -100,
    };

    expect(() => ListColumnSchema.parse(column)).toThrow();
  });

  it('should reject zero width', () => {
    const column = {
      field: 'test_field',
      width: 0,
    };

    expect(() => ListColumnSchema.parse(column)).toThrow();
  });
});

describe('SelectionConfigSchema', () => {
  it('should default to none', () => {
    const selection = {};

    const result = SelectionConfigSchema.parse(selection);
    expect(result.type).toBe('none');
  });

  it('should accept all selection types', () => {
    const types = ['none', 'single', 'multiple'] as const;
    
    types.forEach(type => {
      const selection = { type };
      expect(() => SelectionConfigSchema.parse(selection)).not.toThrow();
    });
  });
});

describe('PaginationConfigSchema', () => {
  it('should default pageSize to 25', () => {
    const pagination = {};

    const result = PaginationConfigSchema.parse(pagination);
    expect(result.pageSize).toBe(25);
  });

  it('should accept custom page size', () => {
    const pagination = {
      pageSize: 50,
    };

    const result = PaginationConfigSchema.parse(pagination);
    expect(result.pageSize).toBe(50);
  });

  it('should accept page size options', () => {
    const pagination = {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100],
    };

    expect(() => PaginationConfigSchema.parse(pagination)).not.toThrow();
  });

  it('should reject negative pageSize', () => {
    const pagination = {
      pageSize: -10,
    };

    expect(() => PaginationConfigSchema.parse(pagination)).toThrow();
  });

  it('should reject zero pageSize', () => {
    const pagination = {
      pageSize: 0,
    };

    expect(() => PaginationConfigSchema.parse(pagination)).toThrow();
  });

  it('should reject non-integer pageSize', () => {
    const pagination = {
      pageSize: 25.5,
    };

    expect(() => PaginationConfigSchema.parse(pagination)).toThrow();
  });

  it('should reject negative values in pageSizeOptions', () => {
    const pagination = {
      pageSize: 25,
      pageSizeOptions: [10, -25, 50],
    };

    expect(() => PaginationConfigSchema.parse(pagination)).toThrow();
  });

  it('should reject zero values in pageSizeOptions', () => {
    const pagination = {
      pageSize: 25,
      pageSizeOptions: [10, 0, 50],
    };

    expect(() => PaginationConfigSchema.parse(pagination)).toThrow();
  });

  it('should reject non-integer values in pageSizeOptions', () => {
    const pagination = {
      pageSize: 25,
      pageSizeOptions: [10, 25.5, 50],
    };

    expect(() => PaginationConfigSchema.parse(pagination)).toThrow();
  });
});

describe('Enhanced ListViewSchema', () => {
  it('should accept legacy string array columns', () => {
    const listView: ListView = {
      columns: ['name', 'email', 'phone'],
    };

    expect(() => ListViewSchema.parse(listView)).not.toThrow();
  });

  it('should accept enhanced column config array', () => {
    const listView: ListView = {
      columns: [
        { field: 'name', sortable: true },
        { field: 'email', width: 200 },
        { field: 'annual_revenue', align: 'right', type: 'currency' },
      ],
    };

    expect(() => ListViewSchema.parse(listView)).not.toThrow();
  });

  it('should accept grid features', () => {
    const listView: ListView = {
      columns: ['name', 'status'],
      resizable: true,
      striped: true,
      bordered: true,
    };

    expect(() => ListViewSchema.parse(listView)).not.toThrow();
  });

  it('should accept selection configuration', () => {
    const listView: ListView = {
      columns: ['name', 'status'],
      selection: {
        type: 'multiple',
      },
    };

    expect(() => ListViewSchema.parse(listView)).not.toThrow();
  });

  it('should accept pagination configuration', () => {
    const listView: ListView = {
      columns: ['name', 'status'],
      pagination: {
        pageSize: 50,
        pageSizeOptions: [25, 50, 100],
      },
    };

    expect(() => ListViewSchema.parse(listView)).not.toThrow();
  });

  it('should accept complete enhanced list view', () => {
    const listView: ListView = {
      name: 'advanced_grid',
      label: 'Advanced Data Grid',
      type: 'grid',
      columns: [
        { 
          field: 'account_name', 
          label: 'Account Name',
          sortable: true, 
          resizable: true,
          width: 200,
        },
        { 
          field: 'industry', 
          width: 150,
          sortable: true,
        },
        { 
          field: 'annual_revenue', 
          label: 'Revenue',
          align: 'right', 
          type: 'currency',
          sortable: true,
          width: 150,
        },
        { 
          field: 'status', 
          width: 100,
        },
      ],
      filter: [{ field: 'status', operator: 'equals', value: 'active' }],
      sort: [{ field: 'annual_revenue', order: 'desc' }],
      searchableFields: ['account_name', 'industry'],
      resizable: true,
      striped: true,
      bordered: false,
      selection: {
        type: 'multiple',
      },
      pagination: {
        pageSize: 50,
        pageSizeOptions: [25, 50, 100, 200],
      },
    };

    expect(() => ListViewSchema.parse(listView)).not.toThrow();
  });
});

describe('FormFieldSchema', () => {
  it('should accept minimal field config', () => {
    const field: FormField = {
      field: 'first_name',
    };

    expect(() => FormFieldSchema.parse(field)).not.toThrow();
  });

  it('should accept full field config', () => {
    const field: FormField = {
      field: 'email_address',
      label: 'Email Address',
      placeholder: 'Enter your email',
      helpText: 'We will never share your email',
      readonly: false,
      required: true,
      hidden: false,
      colSpan: 2,
      widget: 'email-input',
    };

    expect(() => FormFieldSchema.parse(field)).not.toThrow();
  });

  it('should accept field with conditional logic', () => {
    const field: FormField = {
      field: 'state',
      dependsOn: 'country',
      visibleOn: 'country === "USA"',
    };

    expect(() => FormFieldSchema.parse(field)).not.toThrow();
  });

  it('should accept field with custom widget', () => {
    const field: FormField = {
      field: 'color_preference',
      widget: 'color-picker',
    };

    expect(() => FormFieldSchema.parse(field)).not.toThrow();
  });

  it('should reject colSpan less than 1', () => {
    const field = {
      field: 'test_field',
      colSpan: 0,
    };

    expect(() => FormFieldSchema.parse(field)).toThrow();
  });

  it('should reject colSpan greater than 4', () => {
    const field = {
      field: 'test_field',
      colSpan: 5,
    };

    expect(() => FormFieldSchema.parse(field)).toThrow();
  });

  it('should reject negative colSpan', () => {
    const field = {
      field: 'test_field',
      colSpan: -1,
    };

    expect(() => FormFieldSchema.parse(field)).toThrow();
  });

  it('should reject non-integer colSpan', () => {
    const field = {
      field: 'test_field',
      colSpan: 2.5,
    };

    expect(() => FormFieldSchema.parse(field)).toThrow();
  });

  it('should accept valid colSpan values (1-4)', () => {
    const validColSpans = [1, 2, 3, 4];
    
    validColSpans.forEach(colSpan => {
      const field: FormField = {
        field: 'test_field',
        colSpan,
      };
      expect(() => FormFieldSchema.parse(field)).not.toThrow();
    });
  });
});

describe('Enhanced FormSectionSchema', () => {
  it('should accept legacy string array fields', () => {
    const section = {
      fields: ['name', 'email', 'phone'],
    };

    expect(() => FormSectionSchema.parse(section)).not.toThrow();
  });

  it('should accept enhanced field config array', () => {
    const section = {
      label: 'Contact Information',
      fields: [
        { field: 'first_name', required: true },
        { field: 'last_name', required: true },
        { field: 'email', widget: 'email-input', colSpan: 2 },
      ],
    };

    expect(() => FormSectionSchema.parse(section)).not.toThrow();
  });

  it('should accept mixed field types (string and FormFieldSchema)', () => {
    const section = {
      label: 'User Profile',
      columns: '2',
      fields: [
        'username', // Simple string
        { field: 'email', required: true, widget: 'email-input' }, // Enhanced config
        'phone', // Simple string
        { 
          field: 'bio', 
          placeholder: 'Tell us about yourself',
          colSpan: 2,
        }, // Enhanced config
      ],
    };

    expect(() => FormSectionSchema.parse(section)).not.toThrow();
  });

  it('should accept section with conditional fields', () => {
    const section = {
      label: 'Address',
      columns: '2',
      fields: [
        { field: 'country', required: true },
        { 
          field: 'state', 
          dependsOn: 'country',
          visibleOn: 'country === "USA"',
        },
        { 
          field: 'province', 
          dependsOn: 'country',
          visibleOn: 'country === "Canada"',
        },
        'city',
        'postal_code',
      ],
    };

    expect(() => FormSectionSchema.parse(section)).not.toThrow();
  });
});

describe('Enhanced FormViewSchema with Complex Fields', () => {
  it('should accept form with enhanced field configurations', () => {
    const formView: FormView = {
      type: 'simple',
      sections: [
        {
          label: 'Basic Information',
          columns: '2',
          fields: [
            { field: 'first_name', required: true, placeholder: 'First name' },
            { field: 'last_name', required: true, placeholder: 'Last name' },
            { 
              field: 'email', 
              required: true, 
              widget: 'email-input',
              helpText: 'We will send confirmation to this email',
            },
            'phone',
          ],
        },
        {
          label: 'Address',
          collapsible: true,
          columns: '2',
          fields: [
            'street',
            'city',
            { 
              field: 'country', 
              required: true,
              widget: 'country-select',
            },
            { 
              field: 'state', 
              dependsOn: 'country',
              visibleOn: 'country === "USA"',
              widget: 'state-select',
            },
          ],
        },
      ],
    };

    expect(() => FormViewSchema.parse(formView)).not.toThrow();
  });

  it('should accept tabbed form with enhanced fields', () => {
    const formView: FormView = {
      type: 'tabbed',
      sections: [
        {
          label: 'Personal',
          fields: [
            { field: 'name', required: true },
            { field: 'email', required: true, widget: 'email-input' },
          ],
        },
        {
          label: 'Preferences',
          fields: [
            { field: 'theme', widget: 'theme-selector' },
            { field: 'notifications', widget: 'toggle-group' },
          ],
        },
      ],
    };

    expect(() => FormViewSchema.parse(formView)).not.toThrow();
  });
});

describe('Real-World Enhanced View Examples', () => {
  it('should accept CRM account view with enhanced columns', () => {
    const accountViews: View = {
      list: {
        type: 'grid',
        columns: [
          { field: 'account_name', label: 'Account Name', sortable: true, width: 200 },
          { field: 'industry', sortable: true, width: 150 },
          { field: 'annual_revenue', align: 'right', type: 'currency', sortable: true },
          { field: 'employees', align: 'right', type: 'number', sortable: true },
          { field: 'status', width: 100 },
        ],
        resizable: true,
        striped: true,
        selection: {
          type: 'multiple',
        },
        pagination: {
          pageSize: 50,
          pageSizeOptions: [25, 50, 100],
        },
      },
      form: {
        type: 'tabbed',
        sections: [
          {
            label: 'Account Details',
            columns: '2',
            fields: [
              { field: 'account_name', required: true, colSpan: 2 },
              { field: 'industry', widget: 'industry-select' },
              { field: 'employees', widget: 'number-input' },
              { field: 'annual_revenue', widget: 'currency-input' },
              'website',
            ],
          },
          {
            label: 'Address',
            columns: '2',
            fields: [
              'billing_street',
              'billing_city',
              { field: 'billing_country', widget: 'country-select' },
              { 
                field: 'billing_state', 
                dependsOn: 'billing_country',
                visibleOn: 'billing_country === "USA"',
              },
            ],
          },
        ],
      },
    };

    expect(() => ViewSchema.parse(accountViews)).not.toThrow();
  });

  it('should accept project management view with all enhancements', () => {
    const projectViews: View = {
      list: {
        type: 'grid',
        columns: [
          { field: 'project_name', sortable: true, width: 250, resizable: true },
          { field: 'status', width: 120, sortable: true },
          { field: 'priority', width: 100, align: 'center' },
          { field: 'start_date', type: 'date', sortable: true, width: 120 },
          { field: 'due_date', type: 'date', sortable: true, width: 120 },
          { field: 'completion', type: 'percent', align: 'right', width: 100 },
        ],
        resizable: true,
        striped: true,
        bordered: true,
        selection: {
          type: 'single',
        },
        pagination: {
          pageSize: 25,
          pageSizeOptions: [10, 25, 50, 100],
        },
      },
      form: {
        type: 'wizard',
        sections: [
          {
            label: 'Step 1: Project Basics',
            fields: [
              { 
                field: 'project_name', 
                required: true, 
                placeholder: 'Enter project name',
                helpText: 'Choose a descriptive name for your project',
              },
              { 
                field: 'description', 
                widget: 'rich-text-editor',
                helpText: 'Detailed project description',
              },
            ],
          },
          {
            label: 'Step 2: Timeline',
            columns: '2',
            fields: [
              { field: 'start_date', required: true, widget: 'date-picker' },
              { field: 'due_date', required: true, widget: 'date-picker' },
              { field: 'estimated_hours', widget: 'number-input' },
            ],
          },
          {
            label: 'Step 3: Team',
            fields: [
              { field: 'project_manager', required: true, widget: 'user-lookup' },
              { field: 'team_members', widget: 'multi-user-lookup' },
            ],
          },
        ],
      },
    };

    expect(() => ViewSchema.parse(projectViews)).not.toThrow();
  });
});

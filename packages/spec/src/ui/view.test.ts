import { describe, it, expect } from 'vitest';
import {
  ViewSchema,
  ListViewSchema,
  FormViewSchema,
  FormSectionSchema,
  KanbanConfigSchema,
  CalendarConfigSchema,
  GanttConfigSchema,
  type View,
  type ListView,
  type FormView,
} from './view.zod';

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
      columns: 3,
      fields: ['first_name', 'last_name', 'email', 'phone'],
    };

    const result = FormSectionSchema.parse(section);
    expect(result.columns).toBe(3);
  });

  it('should accept form section with title instead of label', () => {
    const section = {
      title: 'Contact Information',
      collapsible: true,
      columns: 3,
      fields: ['first_name', 'last_name', 'email', 'phone'],
    };

    const result = FormSectionSchema.parse(section);
    expect(result.title).toBe('Contact Information');
    expect(result.columns).toBe(3);
  });

  it('should validate columns min and max constraints', () => {
    const validColumns = [1, 2, 3, 4];
    
    validColumns.forEach(cols => {
      const section = {
        columns: cols,
        fields: ['field1'],
      };
      const result = FormSectionSchema.parse(section);
      expect(result.columns).toBe(cols);
    });

    // Test invalid values
    expect(() => FormSectionSchema.parse({
      columns: 0,
      fields: ['field1'],
    })).toThrow();

    expect(() => FormSectionSchema.parse({
      columns: 5,
      fields: ['field1'],
    })).toThrow();
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
              columns: 2,
              fields: ['name', 'account_id', 'amount', 'stage', 'close_date', 'probability'],
            },
            {
              label: 'Contact Information',
              columns: 2,
              fields: ['primary_contact', 'email', 'phone'],
            },
            {
              label: 'Additional Information',
              collapsible: true,
              collapsed: true,
              columns: 2,
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
              columns: 2,
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
